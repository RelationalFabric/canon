/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { Registry } from './registry.js'
import type { CanonConfig, Canons } from './types/index.js'
import { defineCanon } from './canon.js'
import { DefinitionRegistry, definitionUri } from './definitions.js'
import { createRegistry } from './registry.js'

/**
 * Global singleton registry
 */
const globalRegistry: Registry = createRegistry()

/**
 * Definition registry for canons declared through the shell.
 * Not exported. Cleared by resetRegistry so shell tests stay isolated.
 */
const definitionRegistry = new DefinitionRegistry()

/**
 * Get the current global registry
 */
export function getRegistry(): Registry {
  return globalRegistry
}

/**
 * Reset the global registry to empty
 */
export function resetRegistry(): void {
  globalRegistry.clear()
  definitionRegistry.clear()
}

/**
 * Declare a canon in the global registry
 *
 * @param label - The canon label
 * @param config - The canon configuration
 */
export function declareCanon<Label extends keyof Canons>(label: Label, config: CanonConfig): void {
  const defined = defineCanon(config)
  globalRegistry.register(label, defined)
  definitionRegistry.register(definitionUri('canon', label), defined)
}

/**
 * Register multiple canons at once (for module-style registration)
 *
 * @param canons - Object mapping canon labels to their configurations
 */
export function registerCanons(canons: Record<string, CanonConfig>): void {
  for (const [label, config] of Object.entries(canons)) {
    const defined = defineCanon(config)
    globalRegistry.register(label as keyof Canons, defined)
    definitionRegistry.register(definitionUri('canon', label), defined)
  }
}
