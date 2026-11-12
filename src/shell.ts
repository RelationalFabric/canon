/**
 * Canon Shell
 *
 * Singleton registry instance with convenience API.
 */

import type { MorphismConfig } from './morphism.js'
import type { TheoryConfig } from './theory.js'
import type { CanonConfig, Canons, Theories } from './types/index.js'
import { defineCanon } from './canon.js'
import { allOrNothing, canonRefFor, definitionRegistry, definitionUri, isDefinitionKey, morphismRefFor, theoryRefFor } from './definitions.js'
import { objectHash } from './kit.js'
import { metaOf } from './meta.js'
import { defineMorphism, Morphism } from './morphism.js'
import { defineTheory, Theory } from './theory.js'

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
  return allOrNothing(() => {
    const defined = defineCanon(config)
    preflightCanonModels(defined, new Map())
    resolveModels(defined)
    resolveAxiomModels(defined)
    definitionRegistry.register(definitionUri('canon', label), defined)
    return canonRefFor(label)
  })
}

/**
 * Register multiple canons at once (for module-style registration)
 *
 * @param canons - Object mapping canon labels to their configurations
 * @param canons.models - Theories each canon models, as a map or a list
 */
export function registerCanons(canons: Record<string, CanonConfig>): void {
  allOrNothing(() => {
    const defined = Object.entries(canons).map(([label, config]) => [label, defineCanon(config)] as const)
    const provided = new Map<string, unknown>()
    for (const [label, config] of defined) {
      const uri = definitionUri('canon', label)
      const existing = canonRefFor(label).value
      if (existing !== undefined && objectHash(existing) !== objectHash(config)) {
        throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
      }
      preflightCanonModels(config, provided)
    }
    for (const [, config] of defined) {
      resolveAxiomModels(config)
    }
    for (const [label, config] of defined) {
      resolveModels(config)
      definitionRegistry.register(definitionUri('canon', label), config)
    }
  })
}

/**
 * Check canon-level and axiom-level `models` before any theory or canon is stored.
 */
function preflightCanonModels(config: CanonConfig, provided: Map<string, unknown>): void {
  const batchKeys = new Set<string>()
  if (config.models !== undefined) {
    validateTheoryConfig({ extends: config.models }, batchKeys, provided)
  }
  for (const axiom of Object.values(config.axioms)) {
    const models = theoryModels(axiom.models)
    if (models === undefined) {
      continue
    }
    validateTheoryConfig({ extends: models }, batchKeys, provided)
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
  const refs = extendsRefsForTheoryResolve(config.extends)
  const resolved = definitionRegistry.resolve('theory', refs)
  for (const entry of resolved) {
    if (entry.value === undefined) {
      throw new Error(`Unresolved theory: ${entry.uri} (ADR-0017)`)
    }
  }
}

/**
 * Map-form theory values are constructed before the registry stores them.
 */
function extendsRefsForTheoryResolve(
  extendsValue: NonNullable<TheoryConfig['extends']>,
): NonNullable<TheoryConfig['extends']> {
  if (Array.isArray(extendsValue)) {
    const last = extendsValue[extendsValue.length - 1]
    if (isRefMap(last)) {
      return [...extendsValue.slice(0, -1), theoryMapForResolve(last)]
    }
    return extendsValue
  }
  if (isNameMap(extendsValue)) {
    return theoryMapForResolve(extendsValue)
  }
  return extendsValue
}

function theoryMapForResolve(composition: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(composition)) {
    mapped[name] = asTheoryInstance(value)
  }
  return mapped
}

function carriedDefinitionUri(value: unknown): string | undefined {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return undefined
  }
  const uri = metaOf(value).uri
  return typeof uri === 'string' && uri !== '' && isDefinitionKey(uri) ? uri : undefined
}

function asTheoryInstance(value: unknown): unknown {
  if (value instanceof Theory) {
    return value
  }
  if (carriedDefinitionUri(value) !== undefined) {
    return value
  }
  if (isTheoryConfig(value)) {
    return defineTheory(value)
  }
  throw new Error('A definition ref map value must be a theory config (ADR-0017)')
}

function prepareTheoryConfigForResolve(config: TheoryConfig): TheoryConfig {
  if (config instanceof Theory) {
    if (config.extends === undefined) {
      return config
    }
    return new Theory({
      extends: extendsRefsForTheoryResolve(config.extends),
    })
  }

  // One read. A getter must not run again while the value is copied onto a Theory.
  if (!('extends' in config)) {
    return new Theory({})
  }
  const extendsValue = config.extends
  if (extendsValue === undefined) {
    return new Theory({})
  }
  return new Theory({
    extends: extendsRefsForTheoryResolve(extendsValue),
  })
}

/**
 * Declare a theory in the global registry
 *
 * @param label - The theory label
 * @param config - The theory value
 * @param config.extends - Theories this one composes, as a map or a list
 */
export function declareTheory<Label extends keyof Theories>(label: Label, config: TheoryConfig) {
  return allOrNothing(() => {
    const defined = defineTheory(prepareTheoryConfigForResolve(config))
    resolveExtends(defined)
    definitionRegistry.register(definitionUri('theory', label), defined)
    return theoryRefFor(label)
  })
}

/**
 * Declare a morphism in the global registry.
 * Completeness is checked at the type level only, because a Theory has no runtime key inventory to check against.
 *
 * @param source - The source theory label
 * @param target - The target theory label
 * @param config - The morphism value
 * @param config.maps - Term mappings from source to target
 */
export function declareMorphism<
  Source extends keyof Theories,
  Target extends keyof Theories,
>(
  source: Source,
  target: Target,
  config: {
    maps: { [K in keyof Theories[Source] & string]: keyof Theories[Target] & string }
  },
) {
  return allOrNothing(() => {
    resolveTheoryLabel(String(source))
    resolveTheoryLabel(String(target))
    const defined = morphismForTheoryLabels(String(source), String(target), config)
    definitionRegistry.register(definitionUri('morphism', `${String(source)}/${String(target)}`), defined)
    return morphismRefFor(String(source), String(target))
  })
}

/**
 * Register multiple morphisms at once (for module-style registration).
 * Completeness is checked at the type level only, because a Theory has no runtime key inventory to check against.
 *
 * @param morphisms - Object mapping `<Source>/<Target>` keys to morphism configs
 * @param morphisms.maps - Term mappings from source to target
 */
export function registerMorphisms<M extends Record<string, MorphismConfig>>(morphisms: M & {
  [Key in keyof M & string]: Key extends `${infer Source extends keyof Theories}/${infer Target extends keyof Theories}`
    ? { maps: { [K in keyof Theories[Source] & string]: keyof Theories[Target] & string } }
    : MorphismConfig
}): void {
  allOrNothing(() => {
    validateRegisterMorphisms(morphisms)

    for (const [key, config] of Object.entries(morphisms)) {
      const { source, target } = parseMorphismKey(key)
      const value = morphismForTheoryLabels(source, target, config)
      definitionRegistry.register(definitionUri('morphism', key), value)
    }
  })
}

/**
 * Register multiple theories at once (for module-style registration)
 *
 * @param theories - Object mapping theory labels to their configurations
 * @param theories.extends - Theories each entry composes, as a map or a list
 */
export function registerTheories(theories: Record<string, TheoryConfig>): void {
  allOrNothing(() => {
    validateRegisterTheories(theories)

    for (const label of registerTheoriesOrder(theories)) {
      const config = theories[label]
      if (config === undefined) {
        continue
      }
      const value = defineTheory(prepareTheoryConfigForResolve(config))
      definitionRegistry.register(definitionUri('theory', label), value)
      resolveExtends(value)
    }
  })
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
    if (!batchKeys.has(label) && !provided.has(label) && theoryRefFor(label).value === undefined) {
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

type MorphismWithTheories = Morphism & Required<Pick<Morphism, 'source' | 'target'>>

function morphismForTheoryLabels(
  sourceLabel: string,
  targetLabel: string,
  config: MorphismConfig,
): MorphismWithTheories {
  const sourceTheory = theoryRefFor(sourceLabel).value
  if (!(sourceTheory instanceof Theory)) {
    throw new TypeError(`Unresolved theory: ${definitionUri('theory', sourceLabel)} (ADR-0017)`)
  }
  const targetTheory = theoryRefFor(targetLabel).value
  if (!(targetTheory instanceof Theory)) {
    throw new TypeError(`Unresolved theory: ${definitionUri('theory', targetLabel)} (ADR-0017)`)
  }
  return defineMorphism({
    ...config,
    source: sourceTheory,
    target: targetTheory,
  }) as MorphismWithTheories
}

function morphismForTheoryPair(source: Theory, target: Theory): Morphism | undefined {
  for (const [, value] of definitionRegistry.entries('morphism')) {
    if (value instanceof Morphism
      && value.source === source
      && value.target === target) {
      return value
    }
  }
  return undefined
}

function validateRegisterMorphisms(morphisms: Record<string, MorphismConfig>): void {
  const seen = new Map<MorphismConfig, string>()
  for (const [key, config] of Object.entries(morphisms)) {
    const { source, target } = parseMorphismKey(key)
    resolveTheoryLabel(source)
    resolveTheoryLabel(target)
    const defined = morphismForTheoryLabels(source, target, config)
    const uri = definitionUri('morphism', key)
    const prior = seen.get(config)
    if (prior !== undefined) {
      throw new Error(`Definition already registered: ${prior}`)
    }
    seen.set(config, uri)
    const carried = metaOf(config).uri
    if (isDefinitionKey(carried) && definitionRegistry.has(carried) && carried !== uri) {
      throw new Error(`Definition already registered: ${carried}`)
    }
    const existing = morphismForTheoryPair(defined.source, defined.target)
    if (existing !== undefined && objectHash(existing) !== objectHash(defined)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
  }
}
