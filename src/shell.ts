/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { CanonConfig, Canons } from './types/index.js'
import { defineCanon } from './canon.js'
import { canonRefFor, definitionRegistry, definitionUri } from './definitions.js'

/**
 * Reset the global registry to empty
 */
export function resetRegistry(): void {
  definitionRegistry.clear()
}

/**
 * Declare a canon in the global registry
 *
 * @param label - The canon label
 * @param config - The canon configuration
 */
export function declareCanon<Label extends keyof Canons>(label: Label, config: CanonConfig) {
  const defined = defineCanon(config)
  definitionRegistry.register(definitionUri('canon', label), defined)
  return canonRefFor(label)
}

/**
 * Register multiple canons at once (for module-style registration)
 *
 * @param canons - Object mapping canon labels to their configurations
 */
export function registerCanons(canons: Record<string, CanonConfig>): void {
  for (const [label, config] of Object.entries(canons)) {
    const defined = defineCanon(config)
    definitionRegistry.register(definitionUri('canon', label), defined)
  }
}
