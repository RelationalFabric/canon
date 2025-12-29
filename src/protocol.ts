/**
 * Protocol API for Canon
 *
 * Protocols define operations (interfaces) that multiple types can implement,
 * enabling polymorphic dispatch based on the type of the first argument.
 *
 * Implementations are stored directly on constructor objects, providing O(1)
 * dispatch lookup. For types without natural constructors (null, undefined,
 * plain objects), constructors are provided.
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
// Constructors for types without natural constructors
// ---------------------------------------------------------------------------

/**
 * Constructor for null values
 *
 * Use this when extending protocols to handle null values.
 * Calling `new Null()` or `Null()` returns `null`.
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, Null, {
 *   first: (_) => undefined,
 *   empty: (_) => true
 * })
 * ```
 */
function NullImpl(this: void): null {
  return null
}

/**
 * Constructor for undefined values
 *
 * Use this when extending protocols to handle undefined values.
 * Calling `new Undefined()` or `Undefined()` returns `undefined`.
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, Undefined, {
 *   first: (_) => undefined,
 *   empty: (_) => true
 * })
 * ```
 */
function UndefinedImpl(this: void): undefined {
  return undefined
}

/**
 * Constructor for plain object fallback
 *
 * Use this when extending protocols to handle any plain object
 * that doesn't have a more specific implementation.
 * Calling `new ObjectFallback()` or `ObjectFallback()` returns `{}` (empty object).
 *
 * @example
 * ```typescript
 * extendProtocol(PSeq, ObjectFallback, {
 *   first: obj => Object.values(obj)[0],
 *   empty: obj => Object.keys(obj).length === 0
 * })
 * ```
 */
function ObjectFallbackImpl(this: void): Record<string, never> {
  return {}
}

// Export as constructors that can be used both as functions and constructors
export const Null = NullImpl as AnyConstructor & (() => null)
export const Undefined = UndefinedImpl as AnyConstructor & (() => undefined)
export const ObjectFallback = ObjectFallbackImpl as AnyConstructor & (() => Record<string, never>)

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
 * @returns The constructor for the value
 */
function getConstructorOf(value: unknown): AnyConstructor | undefined {
  // Handle null and undefined with constructors
  if (value === null)
    return Null as AnyConstructor
  if (value === undefined)
    return Undefined as AnyConstructor

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
    return ObjectFallback as AnyConstructor
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
      if (typeof target === 'object' && target !== null && ctor !== (ObjectFallback as AnyConstructor)) {
        const fallbackMap = getImplMap(ObjectFallback as AnyConstructor)
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
 * The protocol identifier is the source of truth for the protocol's identity.
 * The type parameter `I` is required and defines the protocol interface.
 *
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
 * const PSeq = defineProtocol<Seq<unknown>>({
 *   first: 'Returns the first item of the sequence',
 *   rest: 'Returns the rest of the sequence',
 *   empty: 'Is the sequence empty'
 * })
 * ```
 */
export function defineProtocol<I extends ProtocolInterface>(
  methods: MethodDefinition<I>,
): Protocol<I> {
  const id = Symbol(`canon:protocol:${++protocolCounter}`)
  const protocolName = `Protocol${protocolCounter}`

  // Build the protocol object with dispatching methods
  const protocol = {
    $id: id,
    $name: protocolName,
    $docs: Object.freeze({ ...methods }),
  } as Protocol<I>

  // Add dispatching methods
  for (const methodName of Object.keys(methods)) {
    (protocol as Record<string, unknown>)[methodName] = createDispatcher(id, protocolName, methodName)
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
 * // Handle null using Null constructor
 * extendProtocol(PSeq, Null, {
 *   first: (_) => undefined,
 *   rest: (_) => null,
 *   empty: (_) => true
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
  if (typeof value === 'object' && value !== null && ctor !== (ObjectFallback as AnyConstructor)) {
    const fallbackMap = getImplMap(ObjectFallback as AnyConstructor)
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
