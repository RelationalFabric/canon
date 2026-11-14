/**
 * Theory API
 */

import { objectHash } from './kit.js'

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
  declare terms?: { [name: string]: string }

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
 * Ensure a theory value about to be stored has its own `terms` map (ADR-0018).
 * Call this only after the clash check has passed, and only for the value being stored.
 */
export function regularizeTheoryTerms(theory: Theory): void {
  if (theory.terms === undefined) {
    theory.terms = {}
  }
}

/**
 * Hash a value for a definition clash check.
 * A missing `terms` is read as `{}` and the input is not written to.
 */
export function clashHash(value: unknown): string {
  const views = new WeakMap<Theory, Theory>()
  const viewOf = (theory: Theory): Theory => {
    if (theory.terms !== undefined) {
      return theory
    }
    const existing = views.get(theory)
    if (existing !== undefined) {
      return existing
    }
    const view = new Theory({
      extends: theory.extends,
      terms: {},
    })
    views.set(theory, view)
    return view
  }
  return objectHash(value, {
    replacer: current => current instanceof Theory ? viewOf(current) : current,
  })
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
      if (!(parent instanceof Theory)) {
        throw new TypeError('Unresolved theory in extends (ADR-0018)')
      }
      for (const [name, description] of Object.entries(termsOf(parent))) {
        if (!(name in merged)) {
          merged[name] = description
        }
      }
    }
  }

  const frozen = Object.freeze(merged)
  termsOfCache.set(theory, frozen)
  return frozen
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
