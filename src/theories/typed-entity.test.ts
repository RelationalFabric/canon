/**
 * Tests for the TypedEntity theory
 */

import type { Expect } from '../testing.js'
import type { KeyNameAxiom, Theories } from '../types/index.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { theoryRefFor } from '../definitions.js'
import { declareTheory } from '../shell.js'
import { invariant } from '../testing.js'
import { Theory } from '../theory.js'
import { config as identityConfig } from './identity.js'
import { config as taxonomyConfig } from './taxonomy.js'
import { config as typedEntityConfig } from './typed-entity.js'

type TypedEntityTheory = Theories['TypedEntity']

interface SampleCanon extends TypedEntityTheory {
  Id: KeyNameAxiom
}

type SampleCanonNarrows = SampleCanon

invariant<Expect<SampleCanonNarrows, TypedEntityTheory>>()

describe('typed entity theory', () => {
  beforeEach(() => {
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
    declareTheory('TypedEntity', typedEntityConfig)
  })

  it('registers at canon://theory/TypedEntity', () => {
    expect(theoryRefFor('TypedEntity').key).toBe('canon://theory/TypedEntity')
    const registered = theoryRefFor('TypedEntity').value as Theory
    expect(registered).toBeInstanceOf(Theory)
    expect(registered.extends).toEqual([
      theoryRefFor('Identity').value,
      theoryRefFor('Taxonomy').value,
    ])
  })

  it('registers Identity and Taxonomy when the module is evaluated on its own', async () => {
    vi.resetModules()
    const { theoryRefFor: freshRef } = await import('../definitions.js')
    await import('./typed-entity.js')

    expect(freshRef('Identity').key).toBe('canon://theory/Identity')
    expect(freshRef('Taxonomy').key).toBe('canon://theory/Taxonomy')
    expect(freshRef('TypedEntity').key).toBe('canon://theory/TypedEntity')
  })

  it('keeps extends as registered Identity and Taxonomy in order', () => {
    const registered = theoryRefFor('TypedEntity').value as Theory
    const composition = registered.extends as readonly Theory[]

    expect(composition).toHaveLength(2)
    expect(composition[0]).toBe(theoryRefFor('Identity').value)
    expect(composition[1]).toBe(theoryRefFor('Taxonomy').value)
  })
})
