/**
 * Axiom type system for Canon
 *
 * Axioms are atomic building blocks that define semantic concepts
 * (like ID, type, version) that can be found in different data structures.
 */

import type { TypeGuard } from './guards.js'

/**
 * Base axiom type that merges configuration with metadata
 *
 * @template TConfig - The axiom configuration shape
 * @template TMeta - The metadata shape
 */
export type Axiom<TConfig, TMeta> = TConfig & { $meta: TMeta }

/**
 * Key-name axiom pattern for field-name-based concepts
 *
 * This represents concepts that can be found by looking for a specific
 * key name within an object (e.g., 'id', '@id', '_id').
 */
export type KeyNameAxiom = Axiom<{
  $basis: Record<string, unknown>
  key: string
}, {
    [key: string]: unknown
  }>

/**
 * Representation axiom for data with multiple representations
 *
 * This represents concepts that can be converted between different formats
 * with a canonical representation (e.g., timestamps, references).
 *
 * @template T - The input type that can be converted
 * @template C - The canonical type (defaults to unknown)
 */
export type RepresentationAxiom<T, C = unknown> = Axiom<{
  $basis: T | TypeGuard<unknown>
  isCanonical: (value: unknown) => value is C
}, {
    [key: string]: unknown
  }>

/**
 * Global registry of axioms available in Canon
 *
 * This interface is meant to be augmented by axiom implementers.
 * Each axiom represents a semantic concept that might vary in shape
 * between codebases but is otherwise equivalent.
 *
 * @example
 * ```typescript
 * declare module '@relational-fabric/canon' {
 *   interface Axioms {
 *     Id: KeyNameAxiom
 *     Type: KeyNameAxiom
 *   }
 * }
 * ```
 */
export interface Axioms {}

/**
 * Canonical reference type for entity relationships
 *
 * @template R - The reference type (usually string)
 * @template T - The value type (defaults to unknown)
 */
export interface EntityReference<R, T = unknown> {
  ref: R
  value?: T
  resolved: boolean
}

/**
 * Extract the value type from an axiom's $basis field
 *
 * @template TLabel - The axiom label (e.g., 'Id', 'Type')
 */
export type AxiomValue<TLabel extends keyof Axioms> =
  Axioms[TLabel] extends { $basis: infer TBasis }
    ? TBasis extends TypeGuard<infer T>
      ? T
      : TBasis
    : never

/**
 * Runtime configuration for an axiom
 *
 * This represents the actual runtime behavior including type guards
 * and metadata values.
 */
export interface AxiomConfig {
  $basis: TypeGuard<unknown>
  [key: string]: unknown
}

/**
 * Define an axiom runtime configuration
 *
 * Simply returns the config unchanged - useful for creating exportable axioms.
 *
 * @param config - The runtime axiom configuration
 * @returns The same config object
 */
export function defineAxiom(config: AxiomConfig): AxiomConfig {
  return config
}
