/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { CanonConfig, Canons, Theories } from './types/index.js'
import { defineCanon } from './canon.js'
import { canonRefFor, definitionRegistry, definitionUri, theoryRefFor } from './definitions.js'
import { defineTheory } from './theory.js'

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

/**
 * Declare a theory in the global registry
 *
 * @param label - The theory label
 * @param config - The theory value
 */
export function declareTheory<Label extends keyof Theories>(label: Label, config: Record<string, never>) {
  const defined = defineTheory(config)
  definitionRegistry.register(definitionUri('theory', label), defined)
  return theoryRefFor(label)
}
