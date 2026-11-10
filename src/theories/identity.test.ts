/**
 * Tests for the Identity theory
 */

import type { RepresentationAxiom, Theories } from '../types/index.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { theoryRefFor } from '../definitions.js'
import { metaOf } from '../meta.js'
import { declareTheory } from '../shell.js'
import { identityConfig } from './identity.js'
import './taxonomy.js'

type IdentityTheory = Theories['Identity']
type TaxonomyTheory = Theories['Taxonomy']

interface Clash extends IdentityTheory, TaxonomyTheory {}

interface WrongIdKind {
  Id: RepresentationAxiom<string>
}

// @ts-expect-error union/extension clash when kinds differ
interface _Incompatible extends IdentityTheory, WrongIdKind {}

type _ClashLegal = Clash

describe('identity theory', () => {
  beforeEach(() => {
    declareTheory('Identity', identityConfig)
  })

  it('registers at canon://theory/Identity with the declared config', () => {
    const ref = theoryRefFor('Identity')

    expect(ref.key).toBe('canon://theory/Identity')
    expect(ref.value).toBe(identityConfig)
  })

  it('records only uri on the registered value', () => {
    const registered = theoryRefFor('Identity').value

    expect(registered).toBeDefined()
    if (isMetaCarrier(registered)) {
      expect(metaOf(registered)).toEqual({ uri: 'canon://theory/Identity' })
    }
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
