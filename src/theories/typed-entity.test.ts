/**
 * Tests for the TypedEntity theory
 */

import type { Expect } from '../testing.js'
import type { KeyNameAxiom, Theories } from '../types/index.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { definitionRegistry, theoryRefFor } from '../definitions.js'
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
    expect(registered.extends).toEqual(typedEntityConfig.extends)
  })

  it('registers Identity and Taxonomy when the module is evaluated on its own', async () => {
    vi.resetModules()
    const { theoryRefFor: freshRef } = await import('../definitions.js')
    await import('./typed-entity.js')

    expect(freshRef('Identity').key).toBe('canon://theory/Identity')
    expect(freshRef('Taxonomy').key).toBe('canon://theory/Taxonomy')
    expect(freshRef('TypedEntity').key).toBe('canon://theory/TypedEntity')
  })

  it('resolves extends to Identity and Taxonomy in order', () => {
    const config = theoryRefFor('TypedEntity').value as { extends: readonly string[] }
    const resolved = definitionRegistry.resolve('theory', config.extends)

    expect(resolved).toHaveLength(2)
    expect(resolved[0]?.value).toBe(theoryRefFor('Identity').value)
    expect(resolved[1]?.value).toBe(theoryRefFor('Taxonomy').value)
  })
})
