/**
 * Morphism API
 */

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
