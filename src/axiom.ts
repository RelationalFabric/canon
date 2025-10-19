/**
 * Axiom API functions
 */

import type { AxiomConfig, Axioms } from './types/index.js'
import { inferCanon } from './canon.js'

/**
 * Infer axiom configuration for a value
 *
 * Finds the canon that matches the value, then returns the specified axiom's config.
 *
 * @param axiomLabel - The axiom label to look up
 * @param value - The value to check against
 * @returns The matching axiom config or undefined
 *
 * @example
 * ```typescript
 * const idConfig = inferAxiom('Id', { id: 'test-123' })
 * const typeConfig = inferAxiom('Type', { type: 'user' })
 * ```
 */
export function inferAxiom<Label extends keyof Axioms>(
  axiomLabel: Label,
  value: unknown,
): AxiomConfig | undefined {
  const canon = inferCanon(value)

  if (!canon) {
    return undefined
  }

  return canon.axioms[axiomLabel as string]
}
