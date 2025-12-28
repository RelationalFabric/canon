/**
 * Protocol API for Canon
 *
 * Protocols define operations (interfaces) that multiple types can implement,
 * enabling polymorphic dispatch based on the type of the first argument.
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

/**
 * Storage for protocol implementations
 *
 * Map structure: protocolId -> typeId -> method implementations
 */
const protocolRegistry = new Map<symbol, Map<string, ProtocolImplementation<ProtocolInterface>>>()

/**
 * Counter for generating unique protocol IDs
 */
let protocolCounter = 0

/**
 * Generate a unique type identifier for dispatch lookup
 *
 * @param target - The type to identify
 * @returns A string identifier for the type
 */
function getTypeId(target: ProtocolTarget | unknown): string {
  // Handle primitive empty values
  if (target === undefined)
    return 'undefined'
  if (target === null)
    return 'null'

  // Handle primitive constructors
  if (target === String)
    return 'String'
  if (target === Boolean)
    return 'Boolean'
  if (target === Number)
    return 'Number'

  // Handle literal empty object {} as fallback matcher
  if (typeof target === 'object' && Object.keys(target).length === 0 && Object.getPrototypeOf(target) === Object.prototype) {
    return '$objectFallback'
  }

  // Handle constructor functions
  if (typeof target === 'function' && 'prototype' in target) {
    return (target as AnyConstructor).name || '$anonymous'
  }

  // For values at dispatch time, get constructor name
  if (typeof target === 'object' && target !== null) {
    const constructor = (target as object).constructor
    if (constructor && constructor.name) {
      return constructor.name
    }
    return '$objectFallback'
  }

  // Handle primitive values at dispatch time
  const typeOf = typeof target
  if (typeOf === 'string')
    return 'String'
  if (typeOf === 'boolean')
    return 'Boolean'
  if (typeOf === 'number')
    return 'Number'

  return '$unknown'
}

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
    const implementations = protocolRegistry.get(protocolId)
    if (!implementations) {
      throw new Error(`Protocol ${protocolName} has no implementations registered`)
    }

    // Try direct type lookup
    const typeId = getTypeId(target)
    const impl = implementations.get(typeId)

    if (impl && methodName in impl) {
      const method = impl[methodName]
      if (typeof method === 'function') {
        return (method as Fn)(target, ...args)
      }
    }

    // Try object fallback
    if (typeId !== '$objectFallback' && typeof target === 'object' && target !== null) {
      const fallback = implementations.get('$objectFallback')
      if (fallback && methodName in fallback) {
        const method = fallback[methodName]
        if (typeof method === 'function') {
          return (method as Fn)(target, ...args)
        }
      }
    }

    throw new Error(
      `No implementation of ${protocolName}.${methodName} found for type ${typeId}`,
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

  // Initialize registry for this protocol
  protocolRegistry.set(id, new Map())

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
 * @param protocol - The protocol to extend
 * @param target - The type to add implementations for
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
 * // Handle null
 * extendProtocol(PSeq, null, {
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
  const typeId = getTypeId(target)
  const registry = protocolRegistry.get(protocol.$id)

  if (!registry) {
    throw new Error(`Protocol ${protocol.$name} is not properly initialized`)
  }

  // Merge with existing implementations (if any)
  const existing = registry.get(typeId) || {}
  registry.set(typeId, { ...existing, ...implementations })
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
  const registry = protocolRegistry.get(protocol.$id)
  if (!registry) {
    return false
  }

  const typeId = getTypeId(value)

  // Check direct implementation
  if (registry.has(typeId)) {
    return true
  }

  // Check object fallback for objects
  if (typeof value === 'object' && value !== null) {
    return registry.has('$objectFallback')
  }

  return false
}

/**
 * Get all registered type IDs for a protocol
 *
 * Useful for debugging and introspection.
 *
 * @param protocol - The protocol to inspect
 * @returns Array of type identifiers that implement the protocol
 */
export function getProtocolImplementors<I extends ProtocolInterface>(
  protocol: Protocol<I>,
): string[] {
  const registry = protocolRegistry.get(protocol.$id)
  if (!registry) {
    return []
  }
  return Array.from(registry.keys())
}

/**
 * Clear all implementations for a protocol
 *
 * Primarily useful for testing.
 *
 * @param protocol - The protocol to clear
 */
export function clearProtocol<I extends ProtocolInterface>(
  protocol: Protocol<I>,
): void {
  const registry = protocolRegistry.get(protocol.$id)
  if (registry) {
    registry.clear()
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

      it('should extend protocol for null', () => {
        extendProtocol(PTestSeq, null, {
          first: () => undefined,
          rest: () => null,
          empty: () => true,
        })

        expect(PTestSeq.first(null)).toBe(undefined)
        expect(PTestSeq.rest(null)).toBe(null)
        expect(PTestSeq.empty(null)).toBe(true)
      })

      it('should extend protocol for undefined', () => {
        extendProtocol(PTestSeq, undefined, {
          first: () => undefined,
          rest: () => undefined,
          empty: () => true,
        })

        expect(PTestSeq.first(undefined)).toBe(undefined)
        expect(PTestSeq.rest(undefined)).toBe(undefined)
        expect(PTestSeq.empty(undefined)).toBe(true)
      })

      it('should support object fallback with {}', () => {
        extendProtocol(PTestSeq, {}, {
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

      it('should use object fallback for unregistered objects', () => {
        extendProtocol(PTestSeq, {}, {
          first: (obj: unknown) => Object.values(obj as object)[0],
        })

        expect(satisfiesProtocol({ a: 1 }, PTestSeq)).toBe(true)
      })
    })

    describe('getProtocolImplementors', () => {
      it('should return empty array for new protocol', () => {
        expect(getProtocolImplementors(PTestSeq)).toEqual([])
      })

      it('should return registered type IDs', () => {
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
  })
}
