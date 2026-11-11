/**
 * Typed Entity theory
 */

import type { Expect } from '../testing.js'
import type { Theories } from '../types/index.js'
import { declareTheory } from '../shell.js'
import { invariant } from '../testing.js'
import './identity.js'
import './taxonomy.js'

declare module '@relational-fabric/canon' {
  interface Theories {
    TypedEntity: Theories['Identity'] & Theories['Taxonomy']
  }
}

const config = {
  extends: ['Identity', 'Taxonomy'] as const,
}

declareTheory('TypedEntity', config)

export { config }

invariant<Expect<Theories['TypedEntity'], Theories['Identity']>>()
invariant<Expect<Theories['TypedEntity'], Theories['Taxonomy']>>()
invariant<Expect<keyof Theories['TypedEntity'], 'Id' | 'Type'>>()
