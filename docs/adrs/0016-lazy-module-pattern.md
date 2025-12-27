# ADR-0016: Lazy Module Pattern

- Status: proposed
- Date: 2025-01-28

## Context and Problem Statement

Canon needs a pattern for providing capabilities (like hashing, crypto, etc.) that can have multiple implementations with different characteristics:

- **Architecture-based implementations**: Native bindings (WASM, x86, ARM) that are only available on specific platforms
- **Capability-based implementations**: Features that depend on runtime environment (sensors, platform APIs)
- **Performance-based implementations**: Multiple implementations with different performance characteristics (native vs pure JS)

The challenge is selecting the best available implementation while:
1. Guaranteeing there's always at least one implementation available (pure JS fallback)
2. Allowing implementations to be registered without modifying the core module
3. Minimizing selection overhead (ideally selecting once and caching)
4. Supporting per-invocation selection overrides when needed
5. Providing a simple developer experience

## Decision Drivers

- **Reliability**: Must always have a working implementation (pure JS fallback)
- **Extensibility**: Implementations should register themselves without modifying core code
- **Performance**: Selection should happen once and be cached, not on every call
- **Flexibility**: Support runtime selection overrides when needed
- **Simplicity**: Developer experience should be `import { hash } from '@relational-fabric/canon/hash'`
- **Portability**: Must work across different environments (Node.js, browsers, edge runtimes)

## Decision Outcome

Chosen approach: **Lazy Module Pattern with Capability-Based Selection**

### Core Requirements

1. **Always a pure JS default**: Every lazy module must provide a pure JavaScript implementation that scores `-0.1` (functional fallback, loses to any thoughtful `0` or positive score)

2. **Registration without modification**: Implementations register themselves via a registration mechanism, allowing extensibility without modifying the lazy module definition

3. **Transparent selection, cached**: Selection happens once (at module init or first call) and is memoized. Subsequent calls use the cached selection.

4. **Per-invocation override**: Support `moduleFn.select(opts)(...args)` for runtime selection based on options, with results memoized per unique opts value

### Selection Timings

Three orthogonal selection mechanisms operate at different times:

1. **Architecture-based (build time/pre-runtime)**:
   - Native bindings, WASM, platform-specific modules
   - If it loads, use it
   - Selection happens before runtime or at module init

2. **Capability-based (runtime start/first invocation)**:
   - Platform features, sensors, runtime environment detection
   - Detect once, cache selection
   - Selection happens at module init or first call

3. **Runtime requirements (on demand)**:
   - Configuration-driven, per-invocation needs
   - Selection happens via `.select(opts)` API
   - Results memoized per unique opts value

### API Design

```typescript
// Default: uses pre-selected implementation (cached)
import { hash } from '@relational-fabric/canon/hash'

const h = hash(data)

// Runtime selection: forces selection based on opts, memoized per opts
const h64 = hash.select({ width: 64 })(data)
const h128 = hash.select({ width: 128 })(data)

// Can also get the selected function
const selectedHash = hash.select({ width: 64 })
const result = selectedHash(data)
```

### Capability Scoring System

Implementations register a `supports(opts)` function that returns `number | undefined`:

- `undefined` → not supported (excluded from selection)
- `-1.0` → works but risky/unstable (last resort, may explode)
- `-0.1` → pure JS default (functional fallback, loses to thoughtful implementations)
- `0.0` → baseline (thoughtful implementations that haven't measured)
- `> 0` → better (up to `1.0` = optimal)

**Semantic meaning of negative scores:**
- `-0.1 to -0.01`: "Will work, but if you have anything else it's probably better"
- `-1.0`: "Will work but may explode" (last resort only)

**Selection algorithm:**
1. Query all registered implementations with opts
2. Filter out `undefined` (not supported)
3. Sort by score (highest first)
4. Pick top scorer
5. Memoize result per opts value

### Implementation Registration

Implementations register themselves with:

```typescript
registerImplementation({
  name: 'xxhash',
  supports: (opts) => {
    if (opts.width === 128)
      return 1.0 // optimal
    if (opts.width === 64)
      return 0.8 // very good
    return undefined // not supported
  },
  implementation: async () => {
    // Load and return the actual implementation
    const { hash } = await import('xxhash-addon')
    return hash
  }
})
```

## Positive Consequences

- **Always works**: Pure JS fallback guarantees functionality
- **Extensible**: New implementations can be added without modifying core
- **Performant**: Selection cached, minimal overhead
- **Flexible**: Runtime selection when needed
- **Simple API**: Clean developer experience
- **Portable**: Works across environments

## Negative Consequences

- **Complexity**: Selection logic and registration mechanism add complexity
- **Memoization overhead**: Need to track opts values for memoization
- **Registration discipline**: Implementations must properly register and score themselves
- **Scoring subjectivity**: Implementers must accurately score their capabilities

## Implementation Details

### Module Structure

```
@relational-fabric/canon/hash/
  index.ts              # Main export, selection logic
  implementations/
    pure-js.ts          # Always-available fallback (score: -0.1)
    xxhash.ts           # Native implementation (if available)
    murmurhash.ts       # Pure JS alternative (if available)
  registry.ts           # Implementation registration
  selection.ts          # Selection algorithm
```

### Selection Flow

1. **Module init**:
   - Register pure JS default (score: -0.1)
   - Attempt to load architecture/capability-based implementations
   - Select best available, cache result

2. **First call to `hash(...)`**:
   - Use cached selection
   - If no cache, run selection, cache, then use

3. **Call to `hash.select(opts)(...)`**:
   - Check memoization cache for this opts value
   - If cached, use cached selection
   - If not, run selection with opts, cache result, use

### Memoization Strategy

- Default selection: cached at module level (single value)
- `.select(opts)` selections: cached in Map keyed by normalized opts (POJO)
- Normalization: opts must be POJO for stable comparison
- Cache key: JSON.stringify(normalized opts) or structural equality

### Pure JS Default

The pure JS default:
- Always available (no external dependencies)
- Scores `-0.1` (functional but suboptimal)
- Loses to any implementation that returns `0` or positive
- Only wins if nothing else supports the requested opts

## Open Questions

- How do implementations discover and register themselves? Package.json exports? File system convention? Explicit registration API?
- Should selection happen at module init or lazy on first call?
- How do we handle environment mismatches (generated in one environment, runs in another)?
- Should `.select(opts)` cache per unique opts, or always reselect?
- How do we ensure opts are POJO-compatible for memoization?

## Links

- Related: ADR-0006 (Howard Fast Object Hashing) - use case for this pattern
- Related: Plugin system patterns in other ecosystems
