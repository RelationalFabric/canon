/**
 * Canon API functions
 */

import type { CanonConfig } from './types/index.js'
import { getRegistry } from './shell.js'

/**
 * Infer which canon matches a value
 *
 * Finds the canon with the MOST matching axioms for the value.
 * If multiple canons match the same number of axioms, returns the first.
 *
 * @param value - The value to check
 * @returns The best matching canon config or undefined
 *
 * @example
 * ```typescript
 * const canon = inferCanon({ id: 'test-123' })
 * const jsonLdCanon = inferCanon({ '@id': 'uri' })
 * ```
 */
export function inferCanon(value: unknown): CanonConfig | undefined {
  const registry = getRegistry()

  let bestCanon: CanonConfig | undefined
  let maxMatches = 0

  for (const canonConfig of registry) {
    let matches = 0

    // Count how many axioms match
    for (const axiomConfig of Object.values(canonConfig.axioms)) {
      if (axiomConfig.$basis(value)) {
        matches++
      }
    }

    // Keep the canon with the most matches
    if (matches > maxMatches) {
      maxMatches = matches
      bestCanon = canonConfig
    }
  }

  return maxMatches > 0 ? bestCanon : undefined
}
