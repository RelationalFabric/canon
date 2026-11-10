/**
 * Tests for the TypedEntity theory
 */

import type { KeyNameAxiom, Theories } from '../types/index.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { definitionRegistry, theoryRefFor } from '../definitions.js'
import { declareTheory } from '../shell.js'
import { identityConfig } from './identity.js'
import { taxonomyConfig } from './taxonomy.js'
import { typedEntityConfig } from './typed-entity.js'

type TypedEntityTheory = Theories['TypedEntity']

interface SampleCanon extends TypedEntityTheory {
  Id: KeyNameAxiom
}

type _SampleCanonNarrows = SampleCanon

describe('typed entity theory', () => {
  beforeEach(() => {
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
    declareTheory('TypedEntity', typedEntityConfig)
  })

  it('registers at canon://theory/TypedEntity', () => {
    expect(theoryRefFor('TypedEntity').key).toBe('canon://theory/TypedEntity')
    expect(theoryRefFor('TypedEntity').value).toBe(typedEntityConfig)
  })

  it('resolves extends to Identity and Taxonomy in order', () => {
    const config = theoryRefFor('TypedEntity').value as { extends: readonly string[] }
    const resolved = definitionRegistry.resolve('theory', config.extends)

    expect(resolved).toHaveLength(2)
    expect(resolved[0]?.value).toBe(identityConfig)
    expect(resolved[1]?.value).toBe(taxonomyConfig)
  })
})
