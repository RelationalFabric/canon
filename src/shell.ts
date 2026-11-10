/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { TheoryConfig } from './theory.js'
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
 * Resolve a canon's `models` the way a theory's `extends` is resolved.
 * A missing label throws before the canon is stored.
 */
function resolveModels(config: CanonConfig): void {
  if (config.models === undefined) {
    return
  }
  resolveExtends({ extends: config.models })
}

/**
 * Declare a canon in the global registry
 *
 * @param label - The canon label
 * @param config - The canon configuration
 * @param config.models - Theories this canon models, as a map or a list
 */
export function declareCanon<Label extends keyof Canons>(label: Label, config: CanonConfig) {
  const defined = defineCanon(config)
  resolveModels(defined)
  definitionRegistry.register(definitionUri('canon', label), defined)
  return canonRefFor(label)
}

/**
 * Register multiple canons at once (for module-style registration)
 *
 * @param canons - Object mapping canon labels to their configurations
 * @param canons.models - Theories each canon models, as a map or a list
 */
export function registerCanons(canons: Record<string, CanonConfig>): void {
  for (const [label, config] of Object.entries(canons)) {
    const defined = defineCanon(config)
    resolveModels(defined)
    definitionRegistry.register(definitionUri('canon', label), defined)
  }
}

/**
 * Resolve `extends` the way `declareTheory` does. A missing label throws
 * before the theory being registered is stored.
 */
function resolveExtends(config: TheoryConfig): void {
  if (config.extends === undefined) {
    return
  }
  const resolved = definitionRegistry.resolve('theory', config.extends)
  for (const entry of resolved) {
    if (entry.value === undefined) {
      throw new Error(`Unresolved theory: ${entry.uri} (ADR-0017)`)
    }
  }
}

/**
 * Declare a theory in the global registry
 *
 * @param label - The theory label
 * @param config - The theory value
 * @param config.extends - Theories this one composes, as a map or a list
 */
export function declareTheory<Label extends keyof Theories>(label: Label, config: TheoryConfig) {
  const defined = defineTheory(config)
  resolveExtends(defined)
  definitionRegistry.register(definitionUri('theory', label), defined)
  return theoryRefFor(label)
}

/**
 * Register multiple theories at once (for module-style registration)
 *
 * @param theories - Object mapping theory labels to their configurations
 * @param theories.extends - Theories each entry composes, as a map or a list
 */
export function registerTheories(theories: Record<string, TheoryConfig>): void {
  const entries = Object.entries(theories)
  const defined = new Map<string, TheoryConfig>()

  for (const [label, config] of entries) {
    const value = defineTheory(config)
    defined.set(label, value)
    definitionRegistry.register(definitionUri('theory', label), value)
  }

  for (const [label] of entries) {
    const value = defined.get(label)
    if (value !== undefined) {
      resolveExtends(value)
    }
  }
}
