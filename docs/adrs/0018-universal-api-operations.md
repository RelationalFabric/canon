# ADR-0018: Universal API Operations

- Status: proposed
- Date: 2025-01-30

## Context and Problem Statement

While the Associative Protocol (PAssoc) provides structure-independent property access, higher-level operations are needed for common data manipulation patterns. These operations should express data relationships rather than container manipulation, moving from imperative accessors to relational operations.

The "structure-awareness problem" extends beyond property access to data manipulation patterns. Code often needs to:
- Extract multiple properties from different container types
- Apply updates while preserving container type identity
- Work with data in a structure-independent way

**Dependencies:**
- ADR-0015: Protocol System (defines protocol infrastructure)
- ADR-0017: Associative Protocol (PAssoc) - provides structure-independent property access
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine

## Decision Drivers

- **Relational Operations**: Provide higher-level operations that express data relationships rather than container manipulation
- **Structure Independence**: Operations must work uniformly across container types
- **Type Preservation**: Operations should preserve container type identity when possible
- **Type Safety**: Maintain TypeScript type safety with proper type inference
- **Usability**: Operations should be intuitive and align with relational thinking

## Decision Outcome

**Chosen approach: Universal API Operations built on PAssoc**

Two core operations provide structure-independent data manipulation:

### 1. Select Operation (Relational Projection)

```typescript
function select<T, K extends string>(
  collection: T,
  ...keys: K[]
): Record<K, unknown>
```

**Semantics:**
- Projects specified keys from any associative collection
- Returns a "Normal Form" (plain object) suitable for destructuring
- Works polymorphically across POJOs, Maps, Immutable structures
- Uses `PAssoc.get` internally for structure-independent access

**Example:**
```typescript
const obj = { name: 'Alice', age: 30 }
const map = new Map([['name', 'Alice'], ['age', 30]])

const { name, age } = select(obj, 'name', 'age') // Works
const { name, age } = select(map, 'name', 'age') // Also works
```

**Rationale:**
The `select` operation is a relational projection that extracts specified attributes from any associative collection. It returns a Normal Form (plain object) that can be destructured, making it purpose-built for extracting data regardless of container type.

### 2. Patch Operation (Identity-Preserving Evolution)

```typescript
function patch<T>(
  collection: T,
  novelty: Record<string, unknown>
): T
```

**Semantics:**
- Applies "novelty" (key-value pairs) to a collection
- Preserves container type identity (patching a Map returns a Map)
- Uses `PAssoc.set` internally for structure-independent updates
- Maintains immutability (returns new collection)

**Example:**
```typescript
const map = new Map([['name', 'Alice']])
const updated = patch(map, { age: 30 }) // Returns new Map with both keys

const obj = { name: 'Alice' }
const updatedObj = patch(obj, { age: 30 }) // Returns new object with both keys
```

**Rationale:**
The `patch` operation applies "novelty" (new or updated key-value pairs) while preserving the original container's identity. This enables identity-preserving evolution patterns where data structures evolve without losing their type identity.

### Implementation

Both operations use `PAssoc` internally:

```typescript
// The Identity-Preserving Evolution: maintains the container type
function patch<T>(collection: T, novelty: Record<string, unknown>): T {
  return Object.entries(novelty).reduce(
    (acc, [key, value]) => PAssoc.set(acc, key, value) as T,
    collection
  )
}

// The Relational Projection: returns a Normal Form (plain object) for destructuring
function select<T, K extends string>(collection: T, ...keys: K[]): Record<K, unknown> {
  return keys.reduce(
    (acc, key) => patch(acc, { [key]: PAssoc.get(collection, key) }),
    {} as Record<K, unknown>
  )
}
```

## Rationale

1. **Relational Operations**: These operations move from imperative accessors (`get`, `set`) to relational operations that express data relationships. As noted in the protocols article: "When we use `select` and `patch`, we're describing how our data relate to each other, not reaching into containers to manipulate them."

2. **Structure Independence**: Both operations work polymorphically across container types using `PAssoc`, eliminating structure-aware conditional logic.

3. **Type Preservation**: `patch` preserves container type identity, enabling identity-preserving evolution patterns used in higher-level systems like Howard's hashing.

4. **Normal Form**: `select` returns Normal Form (plain objects), making extracted data immediately usable for destructuring and other operations.

5. **Integration**: Operations integrate seamlessly with Canon's protocol system and work with any type that implements `PAssoc`.

## Positive Consequences

- **Relational Operations**: Higher-level operations express data relationships rather than container manipulation
- **Structure Independence**: Operations work uniformly across container types
- **Type Preservation**: Container type identity preserved in `patch` operations
- **Usability**: Intuitive operations that align with relational thinking
- **Type Safety**: Full TypeScript support with proper type inference
- **Extensibility**: Automatically works with any type that implements `PAssoc`

## Negative Consequences

- **API Surface**: Additional operations to learn and maintain
- **Performance Overhead**: Small overhead from protocol dispatch (though minimal)
- **Normal Form Limitation**: `select` always returns plain objects, losing original container type

## Implementation Requirements

**Required Functions:**
- `select<T, K extends string>(collection: T, ...keys: K[]): Record<K, unknown>`
- `patch<T>(collection: T, novelty: Record<string, unknown>): T`

**Implementation Notes:**
- Both functions must use `PAssoc` internally for structure-independent access
- `select` must return a plain object (Normal Form) for destructuring
- `patch` must preserve container type identity
- Both functions should maintain immutability (return new collections)

## Open Questions

1. **Additional Operations**: Should we add more operations (e.g., `merge`, `remove`, `update`) as part of the Universal API?

2. **Nested Operations**: Should `select` and `patch` support nested key paths (e.g., `select(obj, 'user.name')`)?

3. **Type Preservation in Select**: Should `select` have an option to preserve container type, or is Normal Form always the right choice?

4. **Batch Operations**: Should we support batch operations (e.g., `selectMany`, `patchMany`) for efficiency?

5. **Error Handling**: What happens when `select` requests a key that doesn't exist? Should it return `undefined` or throw?

## References

- ADR-0015: Protocol System
- ADR-0017: Associative Protocol (PAssoc)
- Howard ADR-0006: Fast Object Hashing Composition Function
- Howard ADR-0007: Howard Structural Integrity Engine
- "The Return to Canon: Protocols and Lazy Modules" article
