/**
 * Theory API
 */

/**
 * Runtime theory value. `extends` lists the theories this one composes.
 * The type stays in this module.
 */
export interface TheoryConfig {
  extends?: Record<string, unknown> | readonly unknown[]
  terms?: { [name: string]: string }
}

const termsOfCache = new WeakMap<Theory, Readonly<Record<string, string>>>()

/**
 * Constructor for theory runtime values.
 */
export class Theory implements TheoryConfig {
  extends?: Record<string, unknown> | readonly unknown[]
  terms?: { [name: string]: string }

  constructor(config: TheoryConfig) {
    if (config.extends !== undefined) {
      this.extends = config.extends
    }
    if (config.terms !== undefined) {
      this.terms = config.terms
    }
  }
}

/**
 * Ensure a theory value about to be registered has its own `terms` map (ADR-0018).
 */
export function regularizeTheoryTerms(theory: Theory): void {
  if (theory.terms === undefined) {
    theory.terms = {}
  }
}

/**
 * Inherited and own term descriptions for a theory (ADR-0018). Own terms override
 * inherited names with the same key. The result is cached on the instance.
 */
export function termsOf(theory: Theory): Readonly<Record<string, string>> {
  const cached = termsOfCache.get(theory)
  if (cached !== undefined) {
    return cached
  }

  const merged: Record<string, string> = { ...theory.terms }

  const composition = theory.extends
  if (composition !== undefined) {
    const parents = Array.isArray(composition) ? composition : Object.values(composition)
    for (const parent of parents) {
      if (parent instanceof Theory) {
        for (const [name, description] of Object.entries(termsOf(parent))) {
          if (!(name in merged)) {
            merged[name] = description
          }
        }
      }
    }
  }

  termsOfCache.set(theory, merged)
  return merged
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
