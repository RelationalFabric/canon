/**
 * Taxonomy theory
 */

import type { Expect } from '../testing.js'
import type { KeyNameAxiom, Theories } from '../types/index.js'
import { declareTheory } from '../shell.js'
import { invariant } from '../testing.js'

declare module '@relational-fabric/canon' {
  interface Theories {
    Taxonomy: {
      Type: KeyNameAxiom
    }
  }
}

const config: Record<string, never> = {}

declareTheory('Taxonomy', config)

export { config }

invariant<Expect<Theories['Taxonomy']['Type'], KeyNameAxiom>>()
