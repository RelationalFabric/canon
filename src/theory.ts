/**
 * Theory API
 */

/**
 * Runtime theory value. `extends` lists the theories this one composes.
 * The type stays in this module.
 */
interface TheoryConfig {
  extends?: Record<string, unknown> | readonly unknown[]
}

/**
 * Define a theory runtime value.
 *
 * Returns the config unchanged. The name is not read here. Nothing is registered
 * and no metadata is written. Pass `{}` when the theory composes nothing.
 *
 * @param config - The theory value
 * @returns The same config object
 */
export function defineTheory<T extends TheoryConfig>(config: T): T {
  return config
}
