/**
 * A canon type models a Theory by extending it.
 */

import type { Expect, IsFalse } from '../testing.js'
import type { Canon, KeyNameAxiom, Theories } from '../types/index.js'
import { describe, it } from 'vitest'
import { invariant } from '../testing.js'
import './identity.js'

type IdentityTheory = Theories['Identity']

interface Modeled extends IdentityTheory {}

invariant<Expect<Modeled, Canon<{ Id: KeyNameAxiom }>>>()

interface NoId {}

invariant<IsFalse<Expect<NoId, Theories['Identity']>>>()

// @ts-expect-error a type without Id does not extend Identity
invariant<Expect<NoId, Theories['Identity']>>()

describe('modeling', () => {
  it('holds at the type level', () => {
    // The expects above are the assertions. This suite exists so the file is collected.
  })
})
