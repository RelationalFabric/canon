/**
 * Identity theory
 */

import type { Expect } from '../testing.js'
import type { KeyNameAxiom, Theories } from '../types/index.js'
import { declareTheory } from '../shell.js'
import { invariant } from '../testing.js'

declare module '@relational-fabric/canon' {
  interface Theories {
    Identity: {
      Id: KeyNameAxiom
    }
  }
}

const config: Record<string, never> = {}

declareTheory('Identity', config)

export { config }

invariant<Expect<Theories['Identity']['Id'], KeyNameAxiom>>()
