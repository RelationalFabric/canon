/**
 * Theory API
 */

/**
 * Runtime theory value. `extends` lists the theories this one composes.
 * The type stays in this module.
 */
export interface TheoryConfig {
  extends?: Record<string, unknown> | readonly unknown[]
}

/**
 * Constructor for theory runtime values.
 */
export class Theory implements TheoryConfig {
  extends?: Record<string, unknown> | readonly unknown[]

  constructor(config: TheoryConfig) {
    if (config.extends !== undefined) {
      this.extends = config.extends
    }
  }
}

/**
 * Define a theory runtime value.
 *
 * Returns a `Theory` instance with the config fields copied onto it. The name
 * is not read here. Nothing is registered and no metadata is written.
 *
 * @param config - The theory value
 * @returns A new `Theory` instance
 */
export function defineTheory<T extends TheoryConfig>(config: T): Theory {
  if (config instanceof Theory) {
    return config
  }
  return new Theory(config)
}
