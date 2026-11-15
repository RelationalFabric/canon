/**
 * Bootstrap seed (ADR-0018). Theory and Morphism are themselves Theories.
 * Their axiom kinds are not decided; the runtime terms are.
 */

declare module '@relational-fabric/canon' {
  interface Theories {
    Morphism: {
      maps: unknown
      source: unknown
      target: unknown
    }
    Theory: {
      extends: unknown
      terms: unknown
    }
  }
}

/**
 * `terms` maps each term name to a description of that term (`src/theory.ts:14`, the type).
 * `extends` is the Theories this one composes (`src/theory.ts:9`).
 */
export const theorySeed = {
  terms: {
    terms: 'A map from each term name to a description of that term.',
    extends: 'The Theories this one composes.',
  },
}

/**
 * `source` and `target` hold Theory values, not labels (saga unit 1, `planning/saga/README.md:87`).
 * `maps` sends each source term to a target term (`src/morphism.ts:9`).
 */
export const morphismSeed = {
  terms: {
    source: 'Holds the source Theory value, not a label.',
    target: 'Holds the target Theory value, not a label.',
    maps: 'Sends each source term to a target term.',
  },
}
