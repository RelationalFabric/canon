/**
 * Morphism API
 */

import { metaOf } from './meta.js'

/**
 * Runtime morphism value. `maps` sends each source term to a target term.
 * The type stays in this module.
 */
export interface MorphismConfig {
  maps?: Record<string, string>
}

/**
 * Define a morphism runtime value.
 *
 * Returns the config unchanged. The name is not read here. Nothing is registered
 * and no metadata is written.
 *
 * @param config - The morphism value
 * @returns The same config object
 */
export function defineMorphism<T extends MorphismConfig>(config: T): T {
  return config
}

const MORPHISM_URI_PREFIX = 'canon://morphism/'

/**
 * Compose two registered morphisms. The left target must equal the right source.
 */
export function composeMorphisms(left: MorphismConfig, right: MorphismConfig): MorphismConfig {
  const leftUri = morphismUriOf(left)
  const rightUri = morphismUriOf(right)
  const leftEnd = morphismEndpoints(leftUri)
  const rightEnd = morphismEndpoints(rightUri)

  if (leftEnd.target !== rightEnd.source) {
    throw new Error(`Morphism composition break: ${leftUri} then ${rightUri} (ADR-0018)`)
  }

  const leftMaps = left.maps ?? {}
  const rightMaps = right.maps ?? {}
  const maps: Record<string, string> = {}

  for (const [sourceTerm, middleTerm] of Object.entries(leftMaps)) {
    const targetTerm = rightMaps[middleTerm]
    if (targetTerm !== undefined) {
      maps[sourceTerm] = targetTerm
    }
  }

  return { maps }
}

/**
 * Apply a registered morphism's `maps` to a value. Does not mutate the input.
 */
export function applyMorphism(
  morphism: MorphismConfig,
  value: Record<string, unknown>,
): Record<string, unknown> {
  const uri = morphismUriOf(morphism)
  const maps = morphism.maps ?? {}
  const result: Record<string, unknown> = {}

  for (const [sourceTerm, targetTerm] of Object.entries(maps)) {
    if (!(sourceTerm in value)) {
      throw new Error(`Incomplete value: ${uri} missing ${sourceTerm}`)
    }
    result[targetTerm] = value[sourceTerm]
  }

  return result
}

function morphismUriOf(value: MorphismConfig): string {
  const uri = metaOf(value).uri
  if (typeof uri !== 'string' || !uri.startsWith(MORPHISM_URI_PREFIX)) {
    throw new Error('Unregistered morphism (ADR-0018)')
  }
  return uri
}

function morphismEndpoints(uri: string): { source: string, target: string } {
  const rest = uri.slice(MORPHISM_URI_PREFIX.length)
  const slash = rest.indexOf('/')
  if (slash === -1) {
    throw new Error(`Unregistered morphism (ADR-0018)`)
  }
  return { source: rest.slice(0, slash), target: rest.slice(slash + 1) }
}
