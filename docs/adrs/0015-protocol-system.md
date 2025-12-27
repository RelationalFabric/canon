# ADR-0015: Protocol System

- Status: accepted
- Date: 2025-01-28

## Context and Problem Statement

Canon currently provides:
- **Axioms**: Define semantic concepts (Id, Type, Timestamps, etc.) - data extraction
- **Canons**: Format-specific implementations of axioms (JSON-LD, MongoDB, etc.) - shape matching

However, there's a gap: **decoupling data structure APIs from the data structures themselves**. This is the "canons of canons" problem - we can decouple keys from data APIs, but what about data structure APIs from the data structures?

**The Problem:**
- Canons couple shape to implementation: `canon.axioms.Id.key` tells you how to extract an ID, but the API is tied to the shape
- What if we want a universal API that works across different types, not just different shapes?
- Example: `ISeq` protocol - multiple types (Array, List, String) can implement the same sequence interface

**Reference Implementation:**
The [Cosy Lang protocol system](https://raw.githubusercontent.com/getcosy/lang/refs/heads/master/src/protocol.coffee) provides a useful reference:
- Protocols define interfaces (methods)
- Types extend protocols (implement them)
- Methods dispatch based on the type of the first argument
- Uses metadata stored on prototype for efficient dispatch
- Efficient lookup: `getId(dispatcher)` generates unique ID per protocol, stored as `type.prototype[protocolId] = implementation`

**The Gap:**
- **Lazy Types (Canons)**: Many types, 1 meaning ✅ (Canon has this)
- **Lazy APIs (Protocols)**: Many types, single API ❌ (Canon doesn't have this yet)
- **Lazy Modules**: Many implementations, but only 1 can win ❌ (See ADR-0016)

## Decision Drivers

- **Decoupling**: Separate "what operations are available" from "what shape the data is"
- **Integration**: Protocols should work with existing Canon patterns (axioms, canons)
- **Type Safety**: Maintain TypeScript type safety across protocol implementations
- **Runtime Dispatch**: Support polymorphic method dispatch based on type
- **Efficiency**: Dispatch should be fast (O(1) lookup via prototype metadata)
- **Naming Consistency**: Follow Canon's naming conventions
- **TypeScript-First**: Design for TypeScript's type system, not against it

## Decision Outcome

**Chosen approach: Protocol System Integrated with Axioms**

Protocols are a special kind of axiom that defines operations rather than data extraction. They integrate seamlessly with Canon's existing axiom/canon system.

### Naming Conventions

To avoid conflicts between TypeScript interfaces and runtime protocol values:

- `Seq` - TypeScript interface (the type definition)
- `PSeq` - Protocol value (runtime implementation, used as axiom label)
- `ISeq` - Reserved/unused (avoids confusion with interface)

### Protocol Definition

```typescript
interface Seq<T> {
  first: (seq: Satisfies<Seq<T>>) => T | undefined
  rest: (seq: Satisfies<Seq<T>>) => Seq<T>
  empty?: (seq: Satisfies<Seq<T>>) => boolean
}

const PSeq = defineProtocol<Seq<unknown>>({
  first: seq => 'Returns the first item of the sequence',
  rest: seq => 'Returns the rest of the sequence',
  empty: seq => 'Is the sequence empty'
})
```

**Key points:**
- Protocol name comes from variable name (`PSeq`), not a magic string
- Type parameter ensures methods match the interface
- Method signatures use `Satisfies<Seq<T>>` for the receiver type
- Documentation strings are part of method definitions

### Integration with Axioms/Canons

Protocols are axioms themselves, used directly in canons:

```typescript
declareCanon('MyCanon', {
  axioms: {
    PSeq // protocol itself is the axiom (not Seq: PSeq)
  }
})
```

**Rationale:** Avoids ambiguity - you can't have multiple labels pointing to the same protocol. The protocol identifier IS the axiom label.

### Type System Integration

Protocols register in the `Axioms` interface:

```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    PSeq: Protocol<Seq<unknown>>
  }
}
```

This allows:
- Type-safe usage: `Satisfies<'PSeq'>` works like other axioms
- Canon integration: Protocols can be used in canon definitions
- Type checking: TypeScript knows which protocols exist

### Method Dispatch

Methods dispatch based on the type of the first argument:

```typescript
// Extend Array to implement PSeq
extendProtocol(PSeq, Array, {
  first: arr => arr[0],
  rest: arr => arr.slice(1),
  empty: arr => arr.length === 0
})

// Use protocol - dispatches to Array implementation
const first = PSeq.first([1, 2, 3]) // 1
```

**Dispatch Efficiency (from Cosy Lang reference):**
- Each protocol gets a unique ID via `getId(dispatcher)`
- Implementations stored on prototype: `type.prototype[protocolId] = implementation`
- Lookup is O(1): direct property access on prototype chain
- No iteration through implementations needed
- Falls back to error if no implementation found

### Type Definitions

```typescript
// PrimitiveEmpty values: null, undefined, or {} (literal empty object)
// Note: TypeScript can't perfectly type the literal {}, so this accepts
// the broader type in practice, but semantically means only those three values
type PrimitiveEmpty = null | undefined | Record<string, never>
type PrimitiveCtr = StringConstructor | BooleanConstructor | NumberConstructor
type Ctr = Constructor

type Protocol<I extends Record<string, Fn>> = {
  [K in keyof I]: I[K] extends (target: Satisfies<I>, ...args: infer A) => infer R
    ? (target: Satisfies<I>, ...args: A) => R
    : never
}

type MethodDef<I extends Record<string, Fn>> = {
  [K in keyof I]: I[K] extends (target: Satisfies<I>, ...args: infer A) => infer R
    ? ((target: Satisfies<I>, ...args: A) => R) & string // includes doc string
    : never
}

function defineProtocol<I extends Record<string, Fn>>(
  methods: MethodDef<I>
): Protocol<I>

// Protocol configuration in canons accepts same types as extendProtocol
type ProtocolConfig = Array<PrimitiveEmpty | PrimitiveCtr | Ctr>
```

**Key points:**
- `Protocol<I>` only includes methods where the first parameter is `Satisfies<I>`
- Methods that don't match the pattern become `never` (excluded)
- Ensures type safety: only protocol-compliant methods are enumerated
- `PrimitiveEmpty` is only `null`, `undefined`, and `{}` (literal empty object, not `[]` or `''`)

## Positive Consequences

- **Decoupling**: Separate operations from data structures
- **Polymorphism**: Write code that works across multiple types
- **Integration**: Protocols work seamlessly with axioms/canons
- **Type Safety**: TypeScript types maintained through dispatch
- **Efficiency**: O(1) dispatch via prototype metadata
- **Extensibility**: Add protocol implementations without modifying protocol definitions
- **Consistency**: Follows Canon's naming conventions and patterns

## Negative Consequences

- **Complexity**: Adds protocols as a new concept (though integrated with axioms)
- **Learning Curve**: Developers need to understand when to use protocols vs axioms vs canons
- **Type System Complexity**: `Satisfies` pattern adds type complexity
- **Runtime Overhead**: Dispatch has small overhead compared to direct calls (though minimal with prototype lookup)

## Implementation Details

### Protocol Structure

A protocol is transparent - it's just the methods that dispatch. The public API is simply `protocol.method(...)`.

See [Type Definitions](#type-definitions) for the `Protocol<I>` type definition.

Metadata and type checking are separate:

```typescript
// Type checking is separate, not a method on the protocol
function satisfies<P extends Protocol<any>>(
  value: Satisfies<P> | unknown,
  protocol: P
): value is Satisfies<P>
```

### Extend Protocol

```typescript
function extendProtocol<I extends Record<string, Fn>>(
  protocol: Protocol<I>,
  type: unknown | Constructor,
  implementations: Partial<MethodDef<I>>
): void
```

**Type identification:**
- Primitive values: `undefined`, `null` - for values without constructors
- Any object fallback: `{}` - matches any object (use with extreme caution)
- Primitive constructors: `String`, `Boolean`, `Number` - for primitive types with constructors
- Constructor functions: `Array`, `Map`, `Set`, etc. - for object types with constructors

**Examples:**
```typescript
// Values (for things without constructors)
extendProtocol(PSeq, undefined, {
  first: () => undefined,
  rest: () => undefined
})
extendProtocol(PSeq, null, {
  first: () => null,
  rest: () => null
})
// Any object fallback (use with extreme caution - matches any object)
extendProtocol(PSeq, {}, {
  first: obj => Object.values(obj)[0],
  rest: obj => Object.fromEntries(Object.entries(obj).slice(1))
})

// Primitive constructors (String, Boolean, Number)
extendProtocol(PSeq, String, {
  first: str => str[0],
  rest: str => str.slice(1)
})
extendProtocol(PSeq, Boolean, {
  first: bool => bool,
  rest: () => false
})
extendProtocol(PSeq, Number, {
  first: num => num,
  rest: () => 0
})

// Constructor functions (Array, Map, Set, etc.)
extendProtocol(PSeq, Array, {
  first: arr => arr[0],
  rest: arr => arr.slice(1)
})
extendProtocol(PSeq, Map, {
  first: map => map.values().next().value,
  rest: (map) => {
    const entries = Array.from(map.entries())
    return new Map(entries.slice(1))
  }
})
```

### Dispatch Mechanism

Protocol dispatch does **not** use canons. Dispatch logic:

1. Protocol method called: `PSeq.first(value)`
2. Get protocol ID: `getId(PSeq)` → unique string
3. Check direct implementation: `value.constructor?.prototype[protocolId]`
4. If found: call implementation with `value` as first arg
5. If not found: get primitive type via `typeof value` and look up registered value (e.g., `undefined`, `null`, or `{}` for plain objects)
6. Check for implementation registered for that value
7. If found: call implementation
8. If not found: throw error

**Key point:** Canons specify expectations (what should already work), not how to make it work. Dispatch is independent of the canon system.

### Integration with Canon System

Protocols can be used in canons to specify which expectations the canon has for that protocol:

```typescript
declareCanon('ArrayCanon', {
  axioms: {
    Id: { $basis: x => Array.isArray(x), key: 'id' },
    PSeq: [undefined, null, {}, String, Boolean, Number, Array, Map, Set]
  }
})
```

**Key points:**
- Even though protocols are also axioms they don't require a `$basis` (not all axioms need `$basis`)
- Protocols use a single array that accepts the same types as `extendProtocol`:
  - `PrimitiveEmpty`: `null`, `undefined`, `{}` (only these three, not `[]` or `''`)
  - `PrimitiveCtr`: `String`, `Boolean`, `Number`
  - `Ctr`: `Array`, `Map`, `Set`, etc. (regular constructors)
- This specifies the canon's expectations for the protocol - types it assumes already implement it

**Note:** Protocol dispatch does **not** use canons. The canon's protocol configuration is purely for documentation/expectations - it specifies what types the canon expects to already implement the protocol, but dispatch happens independently via the `extendProtocol` mechanism.

## Open Questions

1. **Type Identification**: Should we support multiple ways to identify types (constructor, type guard, $basis)? Or standardize on one?

2. **Protocol Composition**: Can protocols extend other protocols? Or compose via intersection types?

3. **Static Methods**: Should protocols support static methods, or only instance methods?

4. **Generic Protocols**: How do generic protocols work? `PSeq<T>` vs `PSeq<unknown>`?

5. **Error Handling**: What happens when protocol method called on non-implementing type? Throw immediately or check canon system first?

## Links

- [Cosy Lang Protocol Implementation](https://raw.githubusercontent.com/getcosy/lang/refs/heads/master/src/protocol.coffee) - Reference implementation with efficient dispatch
- [Clojure Protocols](https://clojure.org/reference/protocols) - Similar concept in Clojure
- ADR-0016: Lazy Module Pattern - Related pattern for implementation selection
- ADR-0006 (Howard): Fast Object Hashing - Potential use case for protocols
