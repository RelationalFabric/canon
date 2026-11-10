/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { MorphismConfig } from './morphism.js'
import type { TheoryConfig } from './theory.js'
import type { CanonConfig, Canons, Theories } from './types/index.js'
import { defineCanon } from './canon.js'
import { canonRefFor, definitionRegistry, definitionUri, morphismRefFor, theoryRefFor } from './definitions.js'
import { objectHash } from './kit.js'
import { metaOf } from './meta.js'
import { defineMorphism } from './morphism.js'
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
  resolveAxiomModels(defined)
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
  const defined = Object.entries(canons).map(([label, config]) => [label, defineCanon(config)] as const)
  for (const [, config] of defined) {
    resolveAxiomModels(config)
  }
  for (const [label, config] of defined) {
    resolveModels(config)
    definitionRegistry.register(definitionUri('canon', label), config)
  }
}

/**
 * Resolve `models` on each axiom config as kind `theory`.
 * A missing label throws before the canon is stored.
 */
function resolveAxiomModels(config: CanonConfig): void {
  for (const axiom of Object.values(config.axioms)) {
    const models = theoryModels(axiom.models)
    if (models === undefined) {
      continue
    }
    resolveExtends({ extends: models })
  }
}

function theoryModels(value: unknown): TheoryConfig['extends'] | undefined {
  if (value === undefined) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value
  }
  if (value !== null && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  throw new Error('Definition refs must be a map or a list (ADR-0017)')
}

/** Throw when a theory label is not registered. */
function resolveTheoryLabel(label: string): void {
  const resolved = definitionRegistry.resolve('theory', [label])
  for (const entry of resolved) {
    if (entry.value === undefined) {
      throw new Error(`Unresolved theory: ${entry.uri} (ADR-0017)`)
    }
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
 * Declare a morphism in the global registry
 *
 * @param source - The source theory label
 * @param target - The target theory label
 * @param config - The morphism value
 * @param config.maps - Term mappings from source to target
 */
export function declareMorphism<
  Source extends keyof Theories,
  Target extends keyof Theories,
>(source: Source, target: Target, config: MorphismConfig) {
  const defined = defineMorphism(config)
  resolveTheoryLabel(String(source))
  resolveTheoryLabel(String(target))
  definitionRegistry.register(definitionUri('morphism', `${String(source)}/${String(target)}`), defined)
  return morphismRefFor(String(source), String(target))
}

/**
 * Register multiple morphisms at once (for module-style registration)
 *
 * @param morphisms - Object mapping `<Source>/<Target>` keys to morphism configs
 * @param morphisms.maps - Term mappings from source to target
 */
export function registerMorphisms(morphisms: Record<string, MorphismConfig>): void {
  validateRegisterMorphisms(morphisms)

  for (const [key, config] of Object.entries(morphisms)) {
    const value = defineMorphism(config)
    definitionRegistry.register(definitionUri('morphism', key), value)
  }
}

/**
 * Register multiple theories at once (for module-style registration)
 *
 * @param theories - Object mapping theory labels to their configurations
 * @param theories.extends - Theories each entry composes, as a map or a list
 */
export function registerTheories(theories: Record<string, TheoryConfig>): void {
  validateRegisterTheories(theories)

  for (const label of registerTheoriesOrder(theories)) {
    const config = theories[label]
    if (config === undefined) {
      continue
    }
    const value = defineTheory(config)
    definitionRegistry.register(definitionUri('theory', label), value)
    resolveExtends(value)
  }
}

/**
 * String labels a theory composes. Map-form `extends` is a name-to-value record,
 * not a list of labels, so those keys are not returned here.
 */
function extendsLabels(config: TheoryConfig): string[] {
  if (!Array.isArray(config.extends)) {
    return []
  }
  return config.extends.filter((item): item is string => typeof item === 'string')
}

function validateRegisterTheories(theories: Record<string, TheoryConfig>): void {
  const mapKeys = new Set(Object.keys(theories))
  const provided = new Map<string, unknown>()

  for (const config of Object.values(theories)) {
    validateTheoryConfig(config, mapKeys, provided)
  }

  assertNoTheoryCycles(theories, mapKeys)
}

function validateTheoryConfig(
  config: TheoryConfig,
  batchKeys: Set<string>,
  provided: Map<string, unknown>,
): void {
  for (const label of extendsLabels(config)) {
    if (!batchKeys.has(label) && theoryRefFor(label).value === undefined) {
      throw new Error(`Unresolved theory: ${definitionUri('theory', label)} (ADR-0017)`)
    }
  }

  const composition = config.extends
  if (composition === undefined) {
    return
  }

  if (Array.isArray(composition)) {
    for (const item of composition) {
      if (isRefMap(item)) {
        validateProvidedNames(item, batchKeys, provided)
      }
    }
    return
  }

  if (isNameMap(composition)) {
    validateProvidedNames(composition, batchKeys, provided)
  }
}

function isNameMap(value: TheoryConfig['extends']): value is Record<string, unknown> {
  return value !== undefined && !Array.isArray(value)
}

function validateProvidedNames(
  composition: Record<string, unknown>,
  batchKeys: Set<string>,
  provided: Map<string, unknown>,
): void {
  for (const [name, value] of Object.entries(composition)) {
    const uri = definitionUri('theory', name)
    if (batchKeys.has(name)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    const existing = theoryRefFor(name).value
    if (existing !== undefined && objectHash(existing) !== objectHash(value)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    const prior = provided.get(name)
    if (prior !== undefined && objectHash(prior) !== objectHash(value)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    provided.set(name, value)
    if (isTheoryConfig(value)) {
      validateTheoryConfig(value, batchKeys, provided)
    }
  }
}

function isRefMap(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const prototype: unknown = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    return false
  }
  const uri = metaOf(value).uri
  if (typeof uri === 'string' && uri !== '') {
    return false
  }
  const valueDescriptor = Object.getOwnPropertyDescriptor(value, 'value')
  if ('key' in value && typeof valueDescriptor?.get === 'function') {
    return false
  }
  return true
}

function isTheoryConfig(value: unknown): value is TheoryConfig {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertNoTheoryCycles(theories: Record<string, TheoryConfig>, mapKeys: Set<string>): void {
  const visiting = new Set<string>()
  const visited = new Set<string>()

  const visit = (label: string, path: string[]): void => {
    if (visiting.has(label)) {
      const start = path.indexOf(label)
      const cycle = path.slice(start).concat(label)
      const uris = cycle.map(name => definitionUri('theory', name)).join(' -> ')
      throw new Error(`Theory cycle: ${uris} (ADR-0017)`)
    }
    if (visited.has(label)) {
      return
    }
    visiting.add(label)
    path.push(label)
    const config = theories[label]
    if (config !== undefined) {
      for (const dep of extendsLabels(config)) {
        if (mapKeys.has(dep)) {
          visit(dep, path)
        }
      }
    }
    path.pop()
    visiting.delete(label)
    visited.add(label)
  }

  for (const label of mapKeys) {
    visit(label, [])
  }
}

function registerTheoriesOrder(theories: Record<string, TheoryConfig>): string[] {
  const labels = Object.keys(theories)
  const inDegree = new Map(labels.map(label => [label, 0]))
  const children = new Map(labels.map(label => [label, [] as string[]]))

  for (const [label, config] of Object.entries(theories)) {
    for (const dep of extendsLabels(config)) {
      if (Object.prototype.hasOwnProperty.call(theories, dep)) {
        inDegree.set(label, (inDegree.get(label) ?? 0) + 1)
        children.get(dep)!.push(label)
      }
    }
  }

  const queue = labels.filter(label => inDegree.get(label) === 0)
  const order: string[] = []

  while (queue.length > 0) {
    const label = queue.shift()!
    order.push(label)
    for (const child of children.get(label) ?? []) {
      const next = (inDegree.get(child) ?? 0) - 1
      inDegree.set(child, next)
      if (next === 0) {
        queue.push(child)
      }
    }
  }

  return order
}

function parseMorphismKey(key: string): { source: string, target: string } {
  const slash = key.indexOf('/')
  if (slash === -1) {
    throw new Error(`Invalid morphism name: ${key} (ADR-0018)`)
  }
  return { source: key.slice(0, slash), target: key.slice(slash + 1) }
}

function validateRegisterMorphisms(morphisms: Record<string, MorphismConfig>): void {
  for (const [key, config] of Object.entries(morphisms)) {
    const { source, target } = parseMorphismKey(key)
    resolveTheoryLabel(source)
    resolveTheoryLabel(target)
    const uri = definitionUri('morphism', key)
    const existing = morphismRefFor(source, target).value
    if (existing !== undefined && objectHash(existing) !== objectHash(config)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
  }
}
