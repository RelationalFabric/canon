# Lazy Module Pattern

Learn how Canon's lazy module pattern enables capability-based implementation selection

The Lazy Module Pattern allows you to provide multiple implementations of a capability and automatically select the best one at runtime. This is useful for:

- **Architecture-based implementations**: Native vs pure JS, WASM vs JavaScript
- **Capability-based implementations**: Features that depend on runtime environment
- **Performance-based implementations**: Multiple implementations with different characteristics

Each implementation reports a "capability score" and the highest-scoring implementation is selected.

```ts
import {
CapabilityScores,
createLazyModule,
} from '@relational-fabric/canon'
```

## Creating a Lazy Module

Let's create a simple hash module that can have multiple implementations. Every lazy module requires a fallback implementation (pure JS) that always works.

```ts
type HashFn = (data: string) => string

interface HashOptions extends Record<string, unknown> {
algorithm?: 'simple' | 'djb2' | 'fnv1a'
}

const { module: hash, register: registerHash } = createLazyModule<HashFn, HashOptions>({
name: 'hash',
defaultOptions: { algorithm: 'simple' },
fallback: () => (data: string) => {
  // Simple hash - always available as fallback
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
},
})
```

The fallback implementation scores `-0.1` (defined in `CapabilityScores.FALLBACK`), meaning it will be used only if no better implementation is available.

## Using the Default Implementation

Before registering any additional implementations, the module uses the fallback.

```ts
const simpleHash = hash('hello world')
const defaultInfo = hash.getDefault()
```

**uses the fallback implementation by default:**

```ts
expect(defaultInfo.name).toBe('$fallback')
expect(defaultInfo.score).toBe(CapabilityScores.FALLBACK)
```

_Status:_ ✅ pass

**produces a hash value:**

```ts
expect(typeof simpleHash).toBe('string')
expect(simpleHash.length).toBeGreaterThan(0)
```

_Status:_ ✅ pass

## Registering Better Implementations

Register implementations with higher scores to override the fallback. The `supports` function returns a score indicating how well the implementation handles the requested options.

```ts
// DJB2 hash - a well-known string hash algorithm
registerHash({
name: 'djb2',
supports: (opts) => {
  if (opts?.algorithm === 'djb2')
    return CapabilityScores.OPTIMAL // 1.0
  return CapabilityScores.BASELINE // 0.0 - available but not preferred
},
implementation: () => (data: string) => {
  let hash = 5381
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) + data.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
},
})

// FNV-1a hash - another well-known algorithm
registerHash({
name: 'fnv1a',
supports: (opts) => {
  if (opts?.algorithm === 'fnv1a')
    return CapabilityScores.OPTIMAL // 1.0
  if (opts?.algorithm === 'simple')
    return undefined // Not supported for 'simple'
  return CapabilityScores.GOOD // 0.5 - good general choice
},
implementation: () => (data: string) => {
  let hash = 2166136261
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i)
    hash = (hash * 16777619) >>> 0
  }
  return hash.toString(16)
},
})
```

Now with better implementations registered, the module will select the highest-scoring one.

```ts
const newDefaultInfo = hash.getDefault()
```

**selects a better implementation than fallback:**

```ts
// With 'simple' as default, DJB2 returns BASELINE (0.0) which beats FALLBACK (-0.1)
expect(newDefaultInfo.score).toBeGreaterThan(CapabilityScores.FALLBACK as number)
```

_Status:_ ✅ pass

## Selecting Specific Implementations

Use `.select(opts)` to get an implementation that best matches specific options.

```ts
const djb2Hash = hash.select({ algorithm: 'djb2' })
const fnv1aHash = hash.select({ algorithm: 'fnv1a' })

const djb2Result = djb2Hash('hello world')
const fnv1aResult = fnv1aHash('hello world')
```

**selects DJB2 when algorithm is djb2:**

```ts
expect(typeof djb2Result).toBe('string')
expect(djb2Result.length).toBeGreaterThan(0)
```

_Status:_ ✅ pass

**selects FNV-1a when algorithm is fnv1a:**

```ts
expect(typeof fnv1aResult).toBe('string')
expect(fnv1aResult.length).toBeGreaterThan(0)
```

_Status:_ ✅ pass

**produces different hashes for different algorithms:**

```ts
expect(djb2Result).not.toBe(fnv1aResult)
```

_Status:_ ✅ pass

## Understanding Capability Scores

The scoring system determines implementation priority:

| Score | Meaning |
|-------|---------|
| `undefined` | Not supported - excluded from selection |
| `-1.0` (RISKY) | Works but may be unstable |
| `-0.1` (FALLBACK) | Pure JS default - functional but suboptimal |
| `0.0` (BASELINE) | Thoughtful implementation, unmeasured |
| `0.5` (GOOD) | Measured and performs well |
| `1.0` (OPTIMAL) | Best possible for this use case |

```ts
const allScores = {
unsupported: CapabilityScores.UNSUPPORTED,
risky: CapabilityScores.RISKY,
fallback: CapabilityScores.FALLBACK,
baseline: CapabilityScores.BASELINE,
good: CapabilityScores.GOOD,
optimal: CapabilityScores.OPTIMAL,
}
```

**UNSUPPORTED is undefined:**

```ts
expect(allScores.unsupported).toBe(undefined)
```

_Status:_ ✅ pass

**scores are ordered from RISKY to OPTIMAL:**

```ts
expect(allScores.risky).toBeLessThan(allScores.fallback as number)
expect(allScores.fallback).toBeLessThan(allScores.baseline as number)
expect(allScores.baseline).toBeLessThan(allScores.good as number)
expect(allScores.good).toBeLessThan(allScores.optimal as number)
```

_Status:_ ✅ pass

## Listing Implementations

Use `.getImplementations()` to see all registered implementations and their support functions.

```ts
const implementations = hash.getImplementations()
const implNames = implementations.map(i => i.name)
```

**lists all registered implementations:**

```ts
expect(implNames).toContain('$fallback')
expect(implNames).toContain('djb2')
expect(implNames).toContain('fnv1a')
```

_Status:_ ✅ pass

**includes the fallback implementation:**

```ts
const fallback = implementations.find(i => i.name === '$fallback')
expect(fallback).toBeDefined()
```

_Status:_ ✅ pass

## Key Takeaways

- **Always provide a fallback** - Every lazy module needs a pure JS implementation that always works
- **Use capability scores** - Return appropriate scores from `supports()` to indicate fitness
- **Selection is memoized** - Once selected, results are cached per unique options
- **Implementations are additive** - Register new implementations without modifying existing code
- **Use for cross-platform code** - Select native bindings when available, fall back to JS otherwise

---

## References

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/09-lazy-module-pattern/index.ts)

## Metadata

**Keywords:** lazy module, capability, selection, implementation, fallback
**Difficulty:** intermediate
