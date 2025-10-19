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
export interface KeyNameAxiom {
  $basis: Record<string, unknown>
  key: string
  $meta: Record<string, unknown>
}

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
  $basis: TypeGuard<any>
  [key: string]: unknown
}
