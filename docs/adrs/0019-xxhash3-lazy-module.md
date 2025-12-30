# ADR-0019: xxHash3 Lazy Module

- Status: proposed
- Date: 2025-01-30

## Context and Problem Statement

Howard's fast object hashing system (ADR 0006) requires high-performance hashing primitives. The underlying hash function (xxHash3) must automatically select optimal implementations (native Node-API, WASM, pure JavaScript) based on runtime capabilities, ensuring peak performance while maintaining universal compatibility.

The "Logical Tax" (the computational cost of proving claims at runtime) is a major barrier to adoption. To eliminate this tax, we need the fastest possible implementations: native C++ for Node.js, WASM for browsers. However, we must also guarantee that something always works, regardless of environment.

**Dependencies:**
- ADR-0016: Lazy Module Pattern (defines lazy module infrastructure)
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine

## Decision Drivers

- **Performance**: Enable optimal hashing implementations (native/WASM) when available
- **Universal Compatibility**: Must work across all environments (Node.js, browsers, edge runtimes)
- **Automatic Selection**: Implementation selection should be transparent to users
- **Reliability**: Must always have a working implementation (pure JS fallback)
- **Flexibility**: Support multiple hash widths (64, 128, 256 bits) and configuration options

## Decision Outcome

**Chosen approach: xxHash3 Lazy Module with Capability-Based Selection**

A lazy module for xxHash3 hashing that automatically selects the best available implementation based on runtime capabilities and requested options.

### Module Structure

```typescript
// @relational-fabric/canon/hash/xxhash3
import { defineLazyModule } from '@relational-fabric/canon'

interface XXHash3Opts {
  width?: 64 | 128 | 256 // Hash width in bits
  seed?: number // Optional seed value
}

type XXHash3Fn = (data: Uint8Array | string, opts?: XXHash3Opts) => Uint8Array

export default defineLazyModule<XXHash3Fn, XXHash3Opts>({
  name: 'xxhash3',
  defaultOptions: { width: 128 },
  fallback: () => {
    // Pure JavaScript xxHash3 implementation
    // Score: -0.1 (functional but suboptimal)
    return pureJsXXHash3
  },
})
```

### Required Implementations

1. **Pure JavaScript Fallback** (score: `-0.1`)
   - Always available
   - Functional but slower than native implementations
   - Must support all hash widths (64, 128, 256 bits)
   - Must support string and Uint8Array input

2. **Native Node-API Binding** (score: `1.0` for supported widths)
   - Optimal performance for Node.js environments
   - Returns `undefined` if not available (e.g., wrong architecture, missing bindings)
   - Supports 64, 128, and 256-bit widths
   - Platform-specific (x86, ARM, etc.)

3. **WASM Implementation** (score: `0.8` for supported widths)
   - Good performance in browser and edge runtimes
   - Returns `undefined` if WASM not supported
   - Supports 64, 128, and 256-bit widths
   - Cross-platform (works in any WASM-capable environment)

### Selection Behavior

**Selection Algorithm:**
1. Query all registered implementations with requested options
2. Filter out `undefined` (not supported)
3. Sort by score (highest first)
4. Pick top scorer
5. Memoize result per unique options combination

**Selection Rules:**
- Native bindings win when available (score `1.0`)
- WASM selected when native unavailable (score `0.8`)
- Pure JS fallback always available (score `-0.1`)
- Selection cached per unique options combination

### Usage

```typescript
import xxhash3 from '@relational-fabric/canon/hash/xxhash3'

// Default: uses pre-selected implementation (cached)
const hash = xxhash3(data)

// Runtime selection: forces selection based on opts, memoized per opts
const hash64 = xxhash3.select({ width: 64 })(data)
const hash128 = xxhash3.select({ width: 128 })(data)

// Can also get the selected function
const selectedHash = xxhash3.select({ width: 64 })
const result = selectedHash(data)
```

### Implementation Registration

```typescript
// Native Node-API binding
xxhash3.register({
  name: 'native-xxhash3',
  supports: (opts) => {
    if (hasNativeBindings() && opts.width === 128) {
      return 1.0 // Optimal
    }
    if (hasNativeBindings() && (opts.width === 64 || opts.width === 256)) {
      return 0.9 // Very good
    }
    return undefined // Not supported
  },
  implementation: async () => {
    const { hash } = await import('xxhash3-native')
    return hash
  },
})

// WASM implementation
xxhash3.register({
  name: 'wasm-xxhash3',
  supports: (opts) => {
    if (typeof WebAssembly !== 'undefined' && opts.width === 128) {
      return 0.8 // Good
    }
    return undefined // Not supported
  },
  implementation: async () => {
    const { hash } = await import('xxhash3-wasm')
    return hash
  },
})
```

## Rationale

1. **Performance Optimization**: The lazy module ensures optimal hashing performance (native/WASM) when available while maintaining universal compatibility through pure JS fallback. This directly addresses the "Logical Tax" by making proof generation near-zero cost.

2. **Environment Independence**: Automatic selection based on runtime capabilities eliminates "it works on my machine" problems. The system adapts to the environment without manual configuration.

3. **Reliability**: Pure JS fallback guarantees functionality everywhere, even when native bindings or WASM are unavailable.

4. **Flexibility**: Support for multiple hash widths and configuration options enables use cases beyond Howard's specific needs (128-bit hashing).

5. **Integration**: Uses Canon's lazy module pattern (ADR-0016) for consistent implementation selection across the ecosystem.

## Positive Consequences

- **Optimal Performance**: Automatic selection of best available hashing implementation
- **Universal Compatibility**: Pure JS fallback ensures functionality everywhere
- **Environment Independence**: No manual configuration required
- **Flexibility**: Support for multiple hash widths and options
- **Transparent Selection**: Users don't need to know which implementation is selected

## Negative Consequences

- **Lazy Module Complexity**: Selection logic and registration mechanism add complexity
- **Implementation Overhead**: Must implement and maintain multiple implementations
- **Scoring Subjectivity**: Implementers must accurately score their capabilities
- **Memoization Overhead**: Need to track options values for memoization

## Implementation Requirements

**Required Implementations:**
1. Pure JavaScript fallback (always available, score: `-0.1`) - **Required**
2. Native Node-API binding (if available, score: `1.0`) - **Optional but recommended**
3. WASM implementation (if available, score: `0.8`) - **Optional but recommended**

**Implementation Notes:**
- Pure JS fallback must support all hash widths (64, 128, 256 bits)
- Native and WASM implementations should support at least 128-bit width
- All implementations must support both `Uint8Array` and `string` input
- Selection must be memoized per unique options combination

## Open Questions

1. **Hash Width Selection**: Should hash width be configurable per-invocation or only at module initialization?

2. **Input Types**: Should we support additional input types (e.g., `ArrayBuffer`, `Buffer`)?

3. **Streaming**: Should we support streaming hashing for large data sets?

4. **Error Handling**: What happens when no implementation supports the requested options? Should we fall back to pure JS or throw?

5. **Performance Metrics**: Should we expose performance metrics (which implementation was selected, selection time, etc.) for debugging?

## References

- ADR-0016: Lazy Module Pattern
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine
- "The Logic of Claims" article (Logical Tax concept)
- [xxHash3 reference implementation](https://cyan4973.github.io/xxHash/)
