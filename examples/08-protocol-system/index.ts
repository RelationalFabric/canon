/**
 * @document.title Protocol System
 * @document.description Learn how Canon's protocol system enables polymorphic dispatch across different types
 * @document.keywords protocol, polymorphism, dispatch, interface, extension
 * @document.difficulty intermediate
 */

/*
The Protocol System allows you to define operations (interfaces) that multiple types can implement. This enables writing generic code that works across different data structures through polymorphic dispatch.

Think of protocols like interfaces that can be implemented by any type after the fact - you don't need to modify the original type to add protocol support.

In this example, we'll create a sequence protocol that works with arrays, strings, and even null values.
*/

// ```
import {
  defineProtocol,
  extendProtocol,
  Null,
  ObjectFallback,
  satisfiesProtocol,
  Undefined,
} from '@relational-fabric/canon'
// ```

/*
# Defining a Protocol

Protocols are defined with `defineProtocol()`. Each method gets a documentation string that describes its purpose.

The naming convention uses `P` prefix for protocol values (e.g., `PSeq` for a sequence protocol).
*/

// ```
const PSeq = defineProtocol({
  first: 'Returns the first item of the sequence',
  rest: 'Returns the rest of the sequence after the first item',
  isEmpty: 'Returns true if the sequence is empty',
})
// ```

/*
# Extending Protocols for Built-in Types

Use `extendProtocol()` to add implementations for specific types. Here we extend the sequence protocol for arrays and strings.
*/

// ```
// Arrays are natural sequences
extendProtocol(PSeq, Array, {
  first: (arr: unknown) => (arr as unknown[])[0],
  rest: (arr: unknown) => (arr as unknown[]).slice(1),
  isEmpty: (arr: unknown) => (arr as unknown[]).length === 0,
})

// Strings can also be treated as sequences of characters
extendProtocol(PSeq, String, {
  first: (str: unknown) => (str as string)[0],
  rest: (str: unknown) => (str as string).slice(1),
  isEmpty: (str: unknown) => (str as string).length === 0,
})
// ```

/*
Now we can use the protocol methods on both arrays and strings. The dispatch happens automatically based on the type of the first argument.
*/

// ```
const numbers = [1, 2, 3, 4, 5]
const firstNumber = PSeq.first(numbers)
const restNumbers = PSeq.rest(numbers)
const wasEmptyNumbers = PSeq.isEmpty(numbers)

const greeting = 'Hello'
const firstChar = PSeq.first(greeting)
const restChars = PSeq.rest(greeting)
const wasEmptyString = PSeq.isEmpty('')
// ```

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Protocol dispatch on built-in types', () => {
    it('first() returns 1 for the array [1,2,3,4,5]', () => {
      expect(firstNumber).toBe(1)
    })

    it('rest() returns [2,3,4,5] for the array [1,2,3,4,5]', () => {
      expect(restNumbers).toEqual([2, 3, 4, 5])
    })

    it('isEmpty() returns false for a non-empty array', () => {
      expect(wasEmptyNumbers).toBe(false)
    })

    it('first() returns "H" for the string "Hello"', () => {
      expect(firstChar).toBe('H')
    })

    it('rest() returns "ello" for the string "Hello"', () => {
      expect(restChars).toBe('ello')
    })

    it('isEmpty() returns true for an empty string', () => {
      expect(wasEmptyString).toBe(true)
    })
  })
}

/*
# Handling Null and Undefined

For types without natural constructors (null and undefined), Canon provides constructors: `Null` and `Undefined`. These constructors can be called to create their values: `Null()` returns `null`, `Undefined()` returns `undefined`.
*/

// ```
extendProtocol(PSeq, Null, {
  first: _ => undefined,
  rest: _ => null,
  isEmpty: _ => true,
})

extendProtocol(PSeq, Undefined, {
  first: _ => undefined,
  rest: _ => undefined,
  isEmpty: _ => true,
})

const nullFirst = PSeq.first(null)
const nullWasEmpty = PSeq.isEmpty(null)
const undefinedWasEmpty = PSeq.isEmpty(undefined)
// ```

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Protocol dispatch on null and undefined', () => {
    it('first() returns undefined for null', () => {
      expect(nullFirst).toBe(undefined)
    })

    it('isEmpty() returns true for null', () => {
      expect(nullWasEmpty).toBe(true)
    })

    it('isEmpty() returns true for undefined', () => {
      expect(undefinedWasEmpty).toBe(true)
    })
  })
}

/*
# Object Fallback

Use `ObjectFallback` to provide a default implementation for any plain object that doesn't have a more specific implementation. `ObjectFallback()` returns `{}` (empty object).
*/

// ```
extendProtocol(PSeq, ObjectFallback, {
  first: (obj: unknown) => Object.values(obj as object)[0],
  rest: (obj: unknown) => {
    const entries = Object.entries(obj as object).slice(1)
    return Object.fromEntries(entries)
  },
  isEmpty: (obj: unknown) => Object.keys(obj as object).length === 0,
})

const record = { a: 1, b: 2, c: 3 }
const firstValue = PSeq.first(record)
const restRecord = PSeq.rest(record)
const wasEmptyRecord = PSeq.isEmpty({})
// ```

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('ObjectFallback for plain objects', () => {
    it('first() returns the first value of an object', () => {
      expect(firstValue).toBe(1)
    })

    it('rest() returns the remaining key-value pairs', () => {
      expect(restRecord).toEqual({ b: 2, c: 3 })
    })

    it('isEmpty() returns true for an empty object', () => {
      expect(wasEmptyRecord).toBe(true)
    })
  })
}

/*
# Checking Protocol Support

Use `satisfiesProtocol()` to check if a value's type implements a protocol before calling its methods.
*/

// ```
const arraySupported = satisfiesProtocol([1, 2, 3], PSeq)
const mapSupported = satisfiesProtocol(new Map(), PSeq) // Map uses ObjectFallback
// ```

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('satisfiesProtocol', () => {
    it('returns true for arrays (directly registered)', () => {
      expect(arraySupported).toBe(true)
    })

    it('returns true for Map (via ObjectFallback)', () => {
      expect(mapSupported).toBe(true)
    })
  })
}

/*
# Writing Generic Functions

Protocols enable truly generic functions that work with any type that implements the protocol.
*/

// ```
function take<T>(seq: T, n: number): unknown[] {
  const result: unknown[] = []
  let current: unknown = seq

  for (let i = 0; i < n && !PSeq.isEmpty(current); i++) {
    result.push(PSeq.first(current))
    current = PSeq.rest(current)
  }

  return result
}

const firstThreeNumbers = take([1, 2, 3, 4, 5], 3)
const firstThreeChars = take('Hello', 3)
const firstThreeFromObject = take({ a: 1, b: 2, c: 3, d: 4 }, 3)
// ```

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Generic take() function using protocols', () => {
    it('takes first 3 elements from an array', () => {
      expect(firstThreeNumbers).toEqual([1, 2, 3])
    })

    it('takes first 3 characters from a string', () => {
      expect(firstThreeChars).toEqual(['H', 'e', 'l'])
    })

    it('takes first 3 values from an object', () => {
      expect(firstThreeFromObject).toEqual([1, 2, 3])
    })
  })
}

/*
# Key Takeaways

- **Define protocols** with `defineProtocol()` to create polymorphic interfaces
- **Extend protocols** with `extendProtocol()` to add implementations for any type
- **Use constructors** (`Null`, `Undefined`, `ObjectFallback`) for types without natural constructors
- **Check support** with `satisfiesProtocol()` before calling protocol methods
- **Write generic functions** that work with any type implementing the protocol
- Dispatch is **O(1)** - implementations are stored directly on constructor objects
*/
