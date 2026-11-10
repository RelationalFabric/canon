/**
 * Theory API
 */

/**
 * Define a theory runtime value.
 *
 * Returns the config unchanged. The name is not read here. Nothing is registered
 * and no metadata is written. The config has no known fields yet.
 *
 * @param config - The theory value. Pass `{}` when the theory composes nothing.
 * @returns The same config object
 */
export function defineTheory(config: Record<string, never>): Record<string, never> {
  return config
}
