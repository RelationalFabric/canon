# Protocol System

Learn how Canon's protocol system enables polymorphic dispatch across different types

The Protocol System allows you to define operations (interfaces) that multiple types can implement. This enables writing generic code that works across different data structures through polymorphic dispatch.

Think of protocols like interfaces that can be implemented by any type after the fact - you don't need to modify the original type to add protocol support.

In this example, we'll create a sequence protocol that works with arrays, strings, and even null values.

```ts
import {
defineProtocol,
extendProtocol,
Null,
ObjectFallback,
satisfiesProtocol,
Undefined,
} from '@relational-fabric/canon'
```

## Defining a Protocol

Protocols are defined with `defineProtocol()`. Each method gets a documentation string that describes its purpose.

The naming convention uses `P` prefix for protocol values (e.g., `PSeq` for a sequence protocol).

```ts
const PSeq = defineProtocol('PSeq', {
first: 'Returns the first item of the sequence',
rest: 'Returns the rest of the sequence after the first item',
empty: 'Returns true if the sequence is empty',
})
```

## Extending Protocols for Built-in Types

Use `extendProtocol()` to add implementations for specific types. Here we extend the sequence protocol for arrays and strings.

```ts
// Arrays are natural sequences
extendProtocol(PSeq, Array, {
first: (arr: unknown) => (arr as unknown[])[0],
rest: (arr: unknown) => (arr as unknown[]).slice(1),
empty: (arr: unknown) => (arr as unknown[]).length === 0,
})

// Strings can also be treated as sequences of characters
extendProtocol(PSeq, String, {
first: (str: unknown) => (str as string)[0],
rest: (str: unknown) => (str as string).slice(1),
empty: (str: unknown) => (str as string).length === 0,
})
```

Now we can use the protocol methods on both arrays and strings. The dispatch happens automatically based on the type of the first argument.

```ts
const numbers = [1, 2, 3, 4, 5]
const firstNumber = PSeq.first(numbers)
const restNumbers = PSeq.rest(numbers)
const isEmptyNumbers = PSeq.empty(numbers)

const greeting = 'Hello'
const firstChar = PSeq.first(greeting)
const restChars = PSeq.rest(greeting)
const isEmptyString = PSeq.empty('')
```

**first() returns 1 for the array [1,2,3,4,5]:**

```ts
expect(firstNumber).toBe(1)
```

_Status:_ ✅ pass

**rest() returns [2,3,4,5] for the array [1,2,3,4,5]:**

```ts
expect(restNumbers).toEqual([2, 3, 4, 5])
```

_Status:_ ✅ pass

**empty() returns false for a non-empty array:**

```ts
expect(isEmptyNumbers).toBe(false)
```

_Status:_ ✅ pass

**first() returns "H" for the string "Hello":**

```ts
expect(firstChar).toBe('H')
```

_Status:_ ✅ pass

**rest() returns "ello" for the string "Hello":**

```ts
expect(restChars).toBe('ello')
```

_Status:_ ✅ pass

**empty() returns true for an empty string:**

```ts
expect(isEmptyString).toBe(true)
```

_Status:_ ✅ pass

## Handling Null and Undefined

For types without natural constructors (null and undefined), Canon provides pseudo-constructors: `Null` and `Undefined`.

```ts
extendProtocol(PSeq, Null, {
first: () => undefined,
rest: () => null,
empty: () => true,
})

extendProtocol(PSeq, Undefined, {
first: () => undefined,
rest: () => undefined,
empty: () => true,
})

const nullFirst = PSeq.first(null)
const nullEmpty = PSeq.empty(null)
const undefinedEmpty = PSeq.empty(undefined)
```

**first() returns undefined for null:**

```ts
expect(nullFirst).toBe(undefined)
```

_Status:_ ✅ pass

**empty() returns true for null:**

```ts
expect(nullEmpty).toBe(true)
```

_Status:_ ✅ pass

**empty() returns true for undefined:**

```ts
expect(undefinedEmpty).toBe(true)
```

_Status:_ ✅ pass

## Object Fallback

Use `ObjectFallback` to provide a default implementation for any plain object that doesn't have a more specific implementation.

```ts
extendProtocol(PSeq, ObjectFallback, {
first: (obj: unknown) => Object.values(obj as object)[0],
rest: (obj: unknown) => {
  const entries = Object.entries(obj as object).slice(1)
  return Object.fromEntries(entries)
},
empty: (obj: unknown) => Object.keys(obj as object).length === 0,
})

const record = { a: 1, b: 2, c: 3 }
const firstValue = PSeq.first(record)
const restRecord = PSeq.rest(record)
const isEmptyRecord = PSeq.empty({})
```

**first() returns the first value of an object:**

```ts
expect(firstValue).toBe(1)
```

_Status:_ ✅ pass

**rest() returns the remaining key-value pairs:**

```ts
expect(restRecord).toEqual({ b: 2, c: 3 })
```

_Status:_ ✅ pass

**empty() returns true for an empty object:**

```ts
expect(isEmptyRecord).toBe(true)
```

_Status:_ ✅ pass

## Checking Protocol Support

Use `satisfiesProtocol()` to check if a value's type implements a protocol before calling its methods.

```ts
const arraySupported = satisfiesProtocol([1, 2, 3], PSeq)
const mapSupported = satisfiesProtocol(new Map(), PSeq) // Map uses ObjectFallback
```

**returns true for arrays (directly registered):**

```ts
expect(arraySupported).toBe(true)
```

_Status:_ ✅ pass

**returns true for Map (via ObjectFallback):**

```ts
expect(mapSupported).toBe(true)
```

_Status:_ ✅ pass

## Writing Generic Functions

Protocols enable truly generic functions that work with any type that implements the protocol.

```ts
function take<T>(seq: T, n: number): unknown[] {
const result: unknown[] = []
let current: unknown = seq

for (let i = 0; i < n && !PSeq.empty(current); i++) {
  result.push(PSeq.first(current))
  current = PSeq.rest(current)
}

return result
}

const firstThreeNumbers = take([1, 2, 3, 4, 5], 3)
const firstThreeChars = take('Hello', 3)
const firstThreeFromObject = take({ a: 1, b: 2, c: 3, d: 4 }, 3)
```

**takes first 3 elements from an array:**

```ts
expect(firstThreeNumbers).toEqual([1, 2, 3])
```

_Status:_ ✅ pass

**takes first 3 characters from a string:**

```ts
expect(firstThreeChars).toEqual(['H', 'e', 'l'])
```

_Status:_ ✅ pass

**takes first 3 values from an object:**

```ts
expect(firstThreeFromObject).toEqual([1, 2, 3])
```

_Status:_ ✅ pass

## Key Takeaways

- **Define protocols** with `defineProtocol()` to create polymorphic interfaces
- **Extend protocols** with `extendProtocol()` to add implementations for any type
- **Use pseudo-constructors** (`Null`, `Undefined`, `ObjectFallback`) for types without natural constructors
- **Check support** with `satisfiesProtocol()` before calling protocol methods
- **Write generic functions** that work with any type implementing the protocol
- Dispatch is **O(1)** - implementations are stored directly on constructor objects

---

## References

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/08-protocol-system/index.ts)

## Metadata

**Keywords:** protocol, polymorphism, dispatch, interface, extension
**Difficulty:** intermediate
