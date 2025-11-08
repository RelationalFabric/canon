/**
 * Canon type system
 *
 * Canons are universal type blueprints that implement axioms for specific
 * data formats. Multiple canons can exist simultaneously, each representing
 * different formats.
 */

import type { AxiomConfig, Axioms } from './axioms.js'
import { type Expect, invariant } from '../testing.js'

/**
 * Canon type that maps axiom labels to their type-level configurations
 *
 * @template TAxioms - Object mapping axiom labels to their configurations
 */
export type Canon<TAxioms extends Partial<Axioms>> = TAxioms

/**
 * Global registry of canons available in Canon
 *
 * This interface is meant to be augmented by canon implementers.
 *
 * @example
 * ```typescript
 * declare module '@relational-fabric/canon' {
 *   interface Canons {
 *     Internal: InternalCanon
 *     JsonLd: JsonLdCanon
 *   }
 * }
 * ```
 */
export interface Canons {}

/**
 * Runtime configuration for a canon
 *
 * Maps axiom labels to their runtime configurations including type guards.
 */
export interface CanonConfig {
  axioms: Record<string, AxiomConfig>
}

/**
 * Constraint type ensuring a value satisfies an axiom's requirements
 *
 * @template TAxiomLabel - The axiom label (e.g., 'Id', 'Type')
 * @template TCanonLabel - Optional specific canon to check against
 */
export type Satisfies<
  TAxiomLabel extends keyof Axioms,
  TCanonLabel extends keyof Canons = keyof Canons,
> = {
  [K in keyof Canons]: TAxiomLabel extends keyof Canons[K]
    ? Canons[K][TAxiomLabel] extends { $basis: infer TBasis }
      ? TBasis
      : never
    : never
}[TCanonLabel]

/**
 * Define a canon runtime configuration (for module-style exports)
 *
 * Simply returns the config unchanged - useful for creating exportable canons.
 *
 * @param config - The runtime canon configuration
 * @returns The same config object
 */
export function defineCanon(config: CanonConfig): CanonConfig {
  return config
}

// ---------------------------------------------------------------------------
// Compile-time invariants
// ---------------------------------------------------------------------------

void invariant<Expect<CanonConfig['axioms'], Record<string, AxiomConfig>>>()
