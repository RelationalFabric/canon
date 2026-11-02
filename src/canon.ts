/**
 * Canon API functions
 */

import type { CanonConfig } from './types/index.js'
import { definitionRegistry } from './definitions.js'

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
  let bestCanon: CanonConfig | undefined
  let maxMatches = 0

  for (const [, canonConfigUnknown] of definitionRegistry.entries('canon')) {
    const canonConfig = canonConfigUnknown as CanonConfig
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
