/**
 * Protocol API for Canon
 *
 * Protocols define operations (interfaces) that multiple types can implement,
 * enabling polymorphic dispatch based on the type of the first argument.
 *
 * Implementations are stored directly on constructor objects, providing O(1)
 * dispatch lookup. For types without natural constructors (null, undefined,
 * plain objects), pseudo-constructors are provided.
 *
 * @see ADR-0015: Protocol System
 */

import type {
  AnyConstructor,
  Fn,
  MethodDefinition,
  Protocol,
  ProtocolImplementation,
  ProtocolInterface,
  ProtocolTarget,
} from './types/index.js'

// ---------------------------------------------------------------------------
// Pseudo-constructors for types without natural constructors
// ---------------------------------------------------------------------------

/**
 * Symbol used to mark pseudo-constructors
 */
const PSEUDO_CONSTRUCTOR = Symbol.for('canon:protocol:pseudo-constructor')

/**
 * Create a pseudo-constructor with a fixed name
 */
function createPseudoConstructor(name: string): AnyConstructor {
  const ctor = function () {} as unknown as AnyConstructor
  Object.defineProperty(ctor, 'name', { value: name, writable: false })
  Object.defineProperty(ctor, PSEUDO_CONSTRUCTOR, { value: name, writable: false })
  return ctor
}

/**
 * Pseudo-constructor for null values
 *
 * Use this when extending protocols to handle null values.
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, Null, {
 *   first: () => undefined,
 *   empty: () => true
 * })
 * ```
 */
export const Null: AnyConstructor = createPseudoConstructor('Null')

/**
 * Pseudo-constructor for undefined values
 *
 * Use this when extending protocols to handle undefined values.
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, Undefined, {
 *   first: () => undefined,
 *   empty: () => true
 * })
 * ```
 */
export const Undefined: AnyConstructor = createPseudoConstructor('Undefined')

/**
 * Pseudo-constructor for plain object fallback
 *
 * Use this when extending protocols to handle any plain object
 * that doesn't have a more specific implementation.
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, ObjectFallback, {
 *   first: obj => Object.values(obj)[0],
 *   empty: obj => Object.keys(obj).length === 0
 * })
 * ```
 */
export const ObjectFallback: AnyConstructor = createPseudoConstructor('ObjectFallback')

// ---------------------------------------------------------------------------
// Protocol implementation storage
// ---------------------------------------------------------------------------

/**
 * Symbol key used to store protocol implementations on constructors
 */
const PROTOCOL_IMPLS = Symbol.for('canon:protocol:implementations')

/**
 * Type for the implementations map stored on constructors
 */
type ConstructorImplMap = Map<symbol, ProtocolImplementation<ProtocolInterface>>

/**
 * Registry to track which constructors implement each protocol
 * (for introspection purposes)
 */
const protocolImplementorRegistry = new Map<symbol, Set<AnyConstructor>>()

/**
 * Get or create the implementations map for a constructor
 */
function getImplMap(ctor: AnyConstructor): ConstructorImplMap {
  const ctorWithImpls = ctor as AnyConstructor & { [PROTOCOL_IMPLS]?: ConstructorImplMap }
  if (!ctorWithImpls[PROTOCOL_IMPLS]) {
    ctorWithImpls[PROTOCOL_IMPLS] = new Map()
  }
  return ctorWithImpls[PROTOCOL_IMPLS]
}

/**
 * Get the constructor for a value (for dispatch lookup)
 *
 * @param value - The value to get the constructor for
 * @returns The constructor or pseudo-constructor for the value
 */
function getConstructorOf(value: unknown): AnyConstructor | undefined {
  // Handle null and undefined with pseudo-constructors
  if (value === null)
    return Null
  if (value === undefined)
    return Undefined

  // Handle primitive values - get their wrapper constructors
  const typeOf = typeof value
  if (typeOf === 'string')
    return String as unknown as AnyConstructor
  if (typeOf === 'number')
    return Number as unknown as AnyConstructor
  if (typeOf === 'boolean')
    return Boolean as unknown as AnyConstructor
  if (typeOf === 'symbol')
    return Symbol as unknown as AnyConstructor
  if (typeOf === 'bigint')
    return BigInt as unknown as AnyConstructor

  // Handle objects - get their constructor
  if (typeOf === 'object' || typeOf === 'function') {
    const ctor = (value as object).constructor as AnyConstructor | undefined
    if (ctor) {
      return ctor
    }
    // Object with no constructor (Object.create(null)) - use fallback
    return ObjectFallback
  }

  return undefined
}

/**
 * Counter for generating unique protocol IDs
 */
let protocolCounter = 0

/**
 * Create a dispatching method for a protocol
 *
 * @param protocolId - The protocol's unique ID
 * @param protocolName - The protocol's name for error messages
 * @param methodName - The name of the method
 * @returns A function that dispatches to the correct implementation
 */
function createDispatcher(protocolId: symbol, protocolName: string, methodName: string): Fn {
  return (target: unknown, ...args: unknown[]): unknown => {
    const ctor = getConstructorOf(target)

    if (ctor) {
      // Try direct constructor lookup
      const implMap = getImplMap(ctor)
      const impl = implMap.get(protocolId)

      if (impl && methodName in impl) {
        const method = impl[methodName]
        if (typeof method === 'function') {
          return (method as Fn)(target, ...args)
        }
      }

      // For objects, try ObjectFallback if direct lookup failed
      if (typeof target === 'object' && target !== null && ctor !== ObjectFallback) {
        const fallbackMap = getImplMap(ObjectFallback)
        const fallbackImpl = fallbackMap.get(protocolId)

        if (fallbackImpl && methodName in fallbackImpl) {
          const method = fallbackImpl[methodName]
          if (typeof method === 'function') {
            return (method as Fn)(target, ...args)
          }
        }
      }
    }

    const ctorName = ctor?.name || typeof target
    throw new Error(
      `No implementation of ${protocolName}.${methodName} found for type ${ctorName}`,
    )
  }
}

/**
 * Define a new protocol
 *
 * Creates a protocol with the specified method definitions. Each method
 * definition is a documentation string describing the method's purpose.
 *
 * @param name - Human-readable name for the protocol (e.g., 'PSeq')
 * @param methods - Object mapping method names to documentation strings
 * @returns A Protocol object with dispatching methods
 *
 * @example
 * ```typescript
 * interface Seq<T> {
 *   first: (seq: Seq<T>) => T | undefined
 *   rest: (seq: Seq<T>) => Seq<T>
 *   empty: (seq: Seq<T>) => boolean
 * }
 *
 * const PSeq = defineProtocol<Seq<unknown>>('PSeq', {
 *   first: 'Returns the first item of the sequence',
 *   rest: 'Returns the rest of the sequence',
 *   empty: 'Is the sequence empty'
 * })
 * ```
 */
export function defineProtocol<I extends ProtocolInterface>(
  name: string,
  methods: MethodDefinition<I>,
): Protocol<I> {
  const id = Symbol.for(`canon:protocol:${name}:${++protocolCounter}`)

  // Build the protocol object with dispatching methods
  const protocol = {
    $id: id,
    $name: name,
    $docs: Object.freeze({ ...methods }),
  } as Protocol<I>

  // Add dispatching methods
  for (const methodName of Object.keys(methods)) {
    (protocol as Record<string, unknown>)[methodName] = createDispatcher(id, name, methodName)
  }

  return protocol
}

/**
 * Extend a protocol with implementations for a specific type
 *
 * Implementations are stored directly on the constructor object for O(1) lookup.
 *
 * @param protocol - The protocol to extend
 * @param target - The constructor to add implementations for
 * @param implementations - Object mapping method names to implementations
 *
 * @example
 * ```typescript
 * // Extend Array to implement PSeq
 * extendProtocol(PSeq, Array, {
 *   first: arr => arr[0],
 *   rest: arr => arr.slice(1),
 *   empty: arr => arr.length === 0
 * })
 *
 * // Extend String to implement PSeq
 * extendProtocol(PSeq, String, {
 *   first: str => str[0],
 *   rest: str => str.slice(1),
 *   empty: str => str.length === 0
 * })
 *
 * // Handle null using Null pseudo-constructor
 * extendProtocol(PSeq, Null, {
 *   first: () => undefined,
 *   rest: () => null,
 *   empty: () => true
 * })
 * ```
 */
export function extendProtocol<I extends ProtocolInterface>(
  protocol: Protocol<I>,
  target: ProtocolTarget,
  implementations: ProtocolImplementation<I>,
): void {
  // Track implementors for introspection
  let implementors = protocolImplementorRegistry.get(protocol.$id)
  if (!implementors) {
    implementors = new Set()
    protocolImplementorRegistry.set(protocol.$id, implementors)
  }
  implementors.add(target)

  // Store implementation on constructor
  const implMap = getImplMap(target)
  const existing = implMap.get(protocol.$id) || {}
  implMap.set(protocol.$id, { ...existing, ...implementations })
}

/**
 * Check if a value satisfies a protocol
 *
 * Returns true if the value's type has implementations registered for
 * the protocol's methods.
 *
 * @param value - The value to check
 * @param protocol - The protocol to check against
 * @returns True if the value can be used with the protocol
 *
 * @example
 * ```typescript
 * if (satisfiesProtocol([1, 2, 3], PSeq)) {
 *   const first = PSeq.first([1, 2, 3])
 * }
 * ```
 */
export function satisfiesProtocol<I extends ProtocolInterface>(
  value: unknown,
  protocol: Protocol<I>,
): boolean {
  const ctor = getConstructorOf(value)
  if (!ctor) {
    return false
  }

  // Check direct implementation
  const implMap = getImplMap(ctor)
  if (implMap.has(protocol.$id)) {
    return true
  }

  // Check object fallback for objects
  if (typeof value === 'object' && value !== null && ctor !== ObjectFallback) {
    const fallbackMap = getImplMap(ObjectFallback)
    return fallbackMap.has(protocol.$id)
  }

  return false
}

/**
 * Get all constructors that implement a protocol
 *
 * Useful for debugging and introspection.
 *
 * @param protocol - The protocol to inspect
 * @returns Array of constructor names that implement the protocol
 */
export function getProtocolImplementors<I extends ProtocolInterface>(
  protocol: Protocol<I>,
): string[] {
  const implementors = protocolImplementorRegistry.get(protocol.$id)
  if (!implementors) {
    return []
  }
  return Array.from(implementors).map(ctor => ctor.name || '$anonymous')
}

/**
 * Clear all implementations for a protocol from a specific constructor
 *
 * @param protocol - The protocol to clear
 * @param target - The constructor to clear implementations from
 */
export function clearProtocolFrom<I extends ProtocolInterface>(
  protocol: Protocol<I>,
  target: ProtocolTarget,
): void {
  const implMap = getImplMap(target)
  implMap.delete(protocol.$id)

  // Also remove from implementor registry
  const implementors = protocolImplementorRegistry.get(protocol.$id)
  if (implementors) {
    implementors.delete(target)
  }
}

// ---------------------------------------------------------------------------
// In-source tests
// ---------------------------------------------------------------------------

if (import.meta.vitest) {
  const { describe, it, expect, beforeEach } = import.meta.vitest

  // Define a test protocol interface with index signature for ProtocolInterface compatibility
  type TestSeq = Record<string, Fn> & {
    first: (seq: unknown) => unknown
    rest: (seq: unknown) => unknown
    empty: (seq: unknown) => boolean
  }

  describe('Protocol System', () => {
    let PTestSeq: Protocol<TestSeq>

    beforeEach(() => {
      // Create a fresh protocol for each test
      PTestSeq = defineProtocol<TestSeq>('PTestSeq', {
        first: 'Returns the first item',
        rest: 'Returns the rest',
        empty: 'Is it empty',
      })
    })

    describe('defineProtocol', () => {
      it('should create a protocol with methods', () => {
        expect(PTestSeq.$name).toBe('PTestSeq')
        expect(typeof PTestSeq.$id).toBe('symbol')
        expect(typeof PTestSeq.first).toBe('function')
        expect(typeof PTestSeq.rest).toBe('function')
        expect(typeof PTestSeq.empty).toBe('function')
      })

      it('should store documentation', () => {
        expect(PTestSeq.$docs.first).toBe('Returns the first item')
        expect(PTestSeq.$docs.rest).toBe('Returns the rest')
        expect(PTestSeq.$docs.empty).toBe('Is it empty')
      })
    })

    describe('extendProtocol', () => {
      it('should extend protocol for Array', () => {
        extendProtocol(PTestSeq, Array, {
          first: (arr: unknown) => (arr as unknown[])[0],
          rest: (arr: unknown) => (arr as unknown[]).slice(1),
          empty: (arr: unknown) => (arr as unknown[]).length === 0,
        })

        expect(PTestSeq.first([1, 2, 3])).toBe(1)
        expect(PTestSeq.rest([1, 2, 3])).toEqual([2, 3])
        expect(PTestSeq.empty([])).toBe(true)
        expect(PTestSeq.empty([1])).toBe(false)
      })

      it('should extend protocol for String', () => {
        extendProtocol(PTestSeq, String, {
          first: (str: unknown) => (str as string)[0],
          rest: (str: unknown) => (str as string).slice(1),
          empty: (str: unknown) => (str as string).length === 0,
        })

        expect(PTestSeq.first('abc')).toBe('a')
        expect(PTestSeq.rest('abc')).toBe('bc')
        expect(PTestSeq.empty('')).toBe(true)
        expect(PTestSeq.empty('a')).toBe(false)
      })

      it('should extend protocol for Null pseudo-constructor', () => {
        extendProtocol(PTestSeq, Null, {
          first: () => undefined,
          rest: () => null,
          empty: () => true,
        })

        expect(PTestSeq.first(null)).toBe(undefined)
        expect(PTestSeq.rest(null)).toBe(null)
        expect(PTestSeq.empty(null)).toBe(true)
      })

      it('should extend protocol for Undefined pseudo-constructor', () => {
        extendProtocol(PTestSeq, Undefined, {
          first: () => undefined,
          rest: () => undefined,
          empty: () => true,
        })

        expect(PTestSeq.first(undefined)).toBe(undefined)
        expect(PTestSeq.rest(undefined)).toBe(undefined)
        expect(PTestSeq.empty(undefined)).toBe(true)
      })

      it('should support ObjectFallback pseudo-constructor', () => {
        extendProtocol(PTestSeq, ObjectFallback, {
          first: (obj: unknown) => Object.values(obj as object)[0],
          rest: (obj: unknown) => {
            const entries = Object.entries(obj as object).slice(1)
            return Object.fromEntries(entries)
          },
          empty: (obj: unknown) => Object.keys(obj as object).length === 0,
        })

        expect(PTestSeq.first({ a: 1, b: 2 })).toBe(1)
        expect(PTestSeq.rest({ a: 1, b: 2 })).toEqual({ b: 2 })
        expect(PTestSeq.empty({})).toBe(true)
      })
    })

    describe('satisfiesProtocol', () => {
      it('should return false for unregistered types', () => {
        expect(satisfiesProtocol([1, 2, 3], PTestSeq)).toBe(false)
      })

      it('should return true for registered types', () => {
        extendProtocol(PTestSeq, Array, {
          first: (arr: unknown) => (arr as unknown[])[0],
        })

        expect(satisfiesProtocol([1, 2, 3], PTestSeq)).toBe(true)
      })

      it('should use ObjectFallback for unregistered objects', () => {
        extendProtocol(PTestSeq, ObjectFallback, {
          first: (obj: unknown) => Object.values(obj as object)[0],
        })

        expect(satisfiesProtocol({ a: 1 }, PTestSeq)).toBe(true)
      })
    })

    describe('getProtocolImplementors', () => {
      it('should return empty array for new protocol', () => {
        expect(getProtocolImplementors(PTestSeq)).toEqual([])
      })

      it('should return registered constructor names', () => {
        extendProtocol(PTestSeq, Array, { first: () => undefined })
        extendProtocol(PTestSeq, String, { first: () => undefined })

        const implementors = getProtocolImplementors(PTestSeq)
        expect(implementors).toContain('Array')
        expect(implementors).toContain('String')
      })
    })

    describe('dispatch errors', () => {
      it('should throw when no implementation exists', () => {
        expect(() => PTestSeq.first([1, 2, 3])).toThrow(
          /No implementation of PTestSeq.first found for type Array/,
        )
      })
    })

    describe('pseudo-constructors', () => {
      it('Null should be a constructor-like object', () => {
        expect(typeof Null).toBe('function')
        expect(Null.name).toBe('Null')
      })

      it('Undefined should be a constructor-like object', () => {
        expect(typeof Undefined).toBe('function')
        expect(Undefined.name).toBe('Undefined')
      })

      it('ObjectFallback should be a constructor-like object', () => {
        expect(typeof ObjectFallback).toBe('function')
        expect(ObjectFallback.name).toBe('ObjectFallback')
      })
    })
  })
}
