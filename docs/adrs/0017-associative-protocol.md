# ADR-0017: Associative Protocol (PAssoc)

- Status: proposed
- Date: 2025-01-30

## Context and Problem Statement

Howard's fast object hashing system (ADR 0006) and Structural Integrity Engine (ADR 0007) require structure-independent property access. The hashing system must traverse object properties uniformly across different container types (POJOs, Maps, Immutable structures) without structure-aware conditional logic.

This addresses the "structure-awareness problem" where code becomes coupled to container types rather than content. When code needs to access properties, it often ends up with conditional logic like:

```typescript
if (data instanceof Map) {
  return data.get('key')
} else if (Immutable.Map.isMap(data)) {
  return data.get('key')
} else {
  return (data as Record<string, unknown>).key
}
```

This violates the principle of structure independence and makes code brittle when new container types are introduced.

**Dependencies:**
- ADR-0015: Protocol System (defines protocol infrastructure)
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine

## Decision Drivers

- **Structure Independence**: Eliminate structure-awareness by using protocols for polymorphic property access
- **Type Safety**: Maintain TypeScript type safety across protocol implementations
- **Integration**: Seamlessly integrate with existing Canon patterns (axioms, canons, protocols)
- **Extensibility**: Enable new container types to implement the protocol without modifying core code
- **Performance**: Protocol dispatch should be efficient (O(1) via prototype lookup)

## Decision Outcome

**Chosen approach: Associative Protocol (PAssoc)**

The Associative Protocol provides structure-independent key-based access operations that work uniformly across different container types.

### Protocol Definition

```typescript
interface Assoc<T = unknown> {
  get: (collection: T, key: string) => unknown
  set: (collection: T, key: string, value: unknown) => T
  has: (collection: T, key: string) => boolean
}

const PAssoc = defineProtocol<Assoc>({
  get: 'Get value by key',
  set: 'Set value by key, returning new collection',
  has: 'Check if key exists',
})

// Register as axiom
declare module '@relational-fabric/canon' {
  interface Axioms {
    PAssoc: Protocol<Assoc>
  }
}
```

### Required Implementations

The protocol must be extended for common container types:

- **Plain Objects (`Object`)**: Direct property access
- **Maps (`Map`)**: `Map.get()`, `Map.set()`, `Map.has()`
- **Immutable structures**: Implementation-specific accessors (e.g., Immutable.js `Map.get()`, `Map.set()`)
- **Arrays**: Optional support for numeric indices (though arrays are typically handled via Sequential protocol)

**Key Properties:**
- `set` operations must return a new collection (immutable semantics), preserving container type identity
- `get` operations return `unknown` to maintain type safety
- `has` operations provide existence checks without value extraction

### Implementation Pattern

```typescript
// Plain objects
extendProtocol(PAssoc, Object, {
  get: (obj, key) => (obj as Record<string, unknown>)[key],
  set: (obj, key, value) => ({ ...(obj as Record<string, unknown>), [key]: value }),
  has: (obj, key) => key in (obj as Record<string, unknown>),
})

// ES6 Map
extendProtocol(PAssoc, Map, {
  get: (map, key) => (map as Map<string, unknown>).get(key),
  set: (map, key, value) => {
    const newMap = new Map(map as Map<string, unknown>)
    newMap.set(key, value)
    return newMap
  },
  has: (map, key) => (map as Map<string, unknown>).has(key),
})
```

## Rationale

1. **Structure Independence**: `PAssoc` eliminates the structure-awareness problem, enabling polymorphic code that works across container types without conditional logic. This directly addresses Howard's requirement for structure-independent property traversal.

2. **Protocol Dispatch**: Uses Canon's protocol system (ADR-0015) for efficient O(1) dispatch via prototype lookup, avoiding runtime type checking overhead.

3. **Immutable Semantics**: `set` operations return new collections, preserving container type identity. This enables identity-preserving evolution patterns used in higher-level operations.

4. **Type Safety**: TypeScript types maintained throughout, with proper generic constraints and type inference.

5. **Extensibility**: New container types can implement `PAssoc` without modifying core code, following the protocol extension pattern.

## Positive Consequences

- **Structure Independence**: Property access works uniformly across container types
- **Type Safety**: Full TypeScript support with proper type inference
- **Extensibility**: New container types can implement `PAssoc` without modifying core code
- **Performance**: O(1) dispatch via prototype lookup
- **Integration**: Seamlessly integrates with Canon's axiom/canon system

## Negative Consequences

- **Implementation Overhead**: Must implement `PAssoc` for each container type
- **Performance Overhead**: Protocol dispatch has small overhead compared to direct property access (though minimal with prototype lookup)
- **Learning Curve**: Developers need to understand protocol extension patterns

## Implementation Requirements

**Required Extensions:**
- `Object` (plain objects) - **Required**
- `Map` (ES6 Map) - **Required**
- Immutable.js `Map` (if Immutable.js is in use) - **Optional**
- Other associative containers as needed - **Optional**

**Implementation Notes:**
- All implementations must preserve container type identity in `set` operations
- `get` operations must return `unknown` for type safety
- `has` operations should be efficient (O(1) when possible)

## Open Questions

1. **Protocol Composition**: How should `PAssoc` compose with other protocols (e.g., Sequential for arrays)?

2. **Immutable.js Integration**: Should Immutable.js support be built-in or provided as a separate package?

3. **Error Handling**: What happens when `PAssoc` methods are called on non-implementing types? Should we check canons first or throw immediately?

4. **Symbol Keys**: Should `PAssoc` support Symbol keys in addition to string keys?

5. **Nested Access**: Should `PAssoc` support nested key paths (e.g., `get(obj, 'user.name')`), or is that a higher-level operation?

## References

- ADR-0015: Protocol System
- ADR-0018: Universal API Operations (uses PAssoc)
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine
- "The Return to Canon: Protocols and Lazy Modules" article
