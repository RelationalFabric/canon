/**
 * Protocol type system for Canon
 *
 * Protocols define operations (interfaces) that multiple types can implement,
 * enabling polymorphic dispatch based on the type of the first argument.
 *
 * Naming conventions:
 * - `Seq` - TypeScript interface (the type definition)
 * - `PSeq` - Protocol value (runtime implementation, used as axiom label)
 * - `ISeq` - Reserved/unused (avoids confusion with interface)
 */

import type { AnyConstructor, Constructor } from './constructors.js'
import type { Fn } from './js.js'

/**
 * Primitive empty values: null, undefined, or literal empty object {}
 *
 * Note: TypeScript can't perfectly type the literal `{}`, so this accepts
 * the broader Record<string, never> type, but semantically means only
 * null, undefined, and {} (not [] or '').
 */
export type PrimitiveEmpty = null | undefined | Record<string, never>

/**
 * Primitive constructor types for extending protocols on primitives
 */
export type PrimitiveCtr = StringConstructor | BooleanConstructor | NumberConstructor

/**
 * Alias for any constructor in protocol contexts
 */
export type Ctr = AnyConstructor

/**
 * Method signature type for protocol methods
 *
 * Protocol methods must have a receiver (target) as the first parameter.
 * The method definition includes a documentation string.
 */
export type ProtocolMethod<TReceiver, TArgs extends unknown[], TReturn> = (
  target: TReceiver,
  ...args: TArgs
) => TReturn

/**
 * Protocol interface - defines the shape of a protocol's methods
 *
 * A protocol is a collection of methods where each method takes a receiver
 * as its first argument. Uses Record<string, Fn> to allow any interface
 * with string keys and function values.
 */
export type ProtocolInterface = Record<string, Fn>

/**
 * Extracts method definitions from a protocol interface
 *
 * Filters to only methods where the first parameter can act as a receiver.
 */
export type ProtocolMethods<I extends ProtocolInterface> = {
  [K in keyof I]: I[K] extends (target: infer _T, ...args: infer A) => infer R
    ? (target: unknown, ...args: A) => R
    : never
}

/**
 * Method definition type that includes documentation
 *
 * Used when defining a protocol - each method includes a doc string
 * that describes its purpose.
 */
export type MethodDefinition<I extends ProtocolInterface> = {
  [K in keyof I]: string
}

/**
 * Protocol metadata - internal properties for a protocol
 */
export interface ProtocolMeta<I extends ProtocolInterface> {
  /**
   * Unique identifier for this protocol (used for efficient dispatch)
   */
  readonly $id: symbol

  /**
   * Human-readable name of the protocol
   */
  readonly $name: string

  /**
   * Documentation strings for each method
   */
  readonly $docs: Readonly<MethodDefinition<I>>
}

/**
 * Protocol type - the runtime representation of a protocol
 *
 * A protocol is transparent - it's just the methods that dispatch.
 * The public API is simply `protocol.method(...)`.
 *
 * @template I - The interface that defines the protocol's methods
 */
export type Protocol<I extends ProtocolInterface> = ProtocolMeta<I> & ProtocolMethods<I>

/**
 * Protocol configuration in canons
 *
 * Specifies which types are expected to implement the protocol.
 * This is for documentation/expectations only - dispatch is independent.
 */
export type ProtocolConfig = Array<PrimitiveEmpty | PrimitiveCtr | Ctr>

/**
 * Implementation definition for extending a protocol to a type
 *
 * Provides the actual implementations of protocol methods for a specific type.
 */
export type ProtocolImplementation<I extends ProtocolInterface> = {
  [K in keyof I]?: I[K]
}

/**
 * Type that can be used as a protocol target
 *
 * Supports:
 * - Primitive values: undefined, null (for values without constructors)
 * - Any object fallback: {} (matches any object, use with extreme caution)
 * - Primitive constructors: String, Boolean, Number
 * - Constructor functions: Array, Map, Set, etc.
 */
export type ProtocolTarget = PrimitiveEmpty | PrimitiveCtr | Constructor<unknown>

/**
 * Global registry of protocols available in Canon
 *
 * This interface is meant to be augmented by protocol definers.
 *
 * @example
 * ```typescript
 * declare module '@relational-fabric/canon' {
 *   interface Protocols {
 *     PSeq: Protocol<Seq>
 *   }
 * }
 * ```
 */
export interface Protocols {}
