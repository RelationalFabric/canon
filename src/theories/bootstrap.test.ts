/**
 * Tests for the bootstrap seed (ADR-0018).
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { definitionRegistry, theoryRefFor } from '../definitions.js'
import { declareTheory, resetRegistry } from '../shell.js'
import { defineTheory, termsOf, Theory } from '../theory.js'
import { morphismSeed, theorySeed } from './bootstrap.js'
import { config as identityConfig } from './identity.js'

describe('bootstrap seed', () => {
  beforeEach(() => {
    resetRegistry()
  })

  it('is present before any other theory', () => {
    const seeded = [...definitionRegistry.entries('theory')].map(([uri]) => uri)

    expect(seeded).toEqual([
      'canon://theory/Theory',
      'canon://theory/Morphism',
    ])

    declareTheory('Identity', identityConfig)

    expect([...definitionRegistry.entries('theory')].map(([uri]) => uri)).toEqual([
      'canon://theory/Theory',
      'canon://theory/Morphism',
      'canon://theory/Identity',
    ])
  })

  it('equals defineTheory of the seeded configs', () => {
    const theory = theoryRefFor('Theory').value
    const morphism = theoryRefFor('Morphism').value

    expect(theory).toBeInstanceOf(Theory)
    expect(morphism).toBeInstanceOf(Theory)
    expect(theory).toEqual(defineTheory(theorySeed))
    expect(morphism).toEqual(defineTheory(morphismSeed))
    expect(termsOf(theory as Theory)).toEqual(theorySeed.terms)
    expect(termsOf(morphism as Theory)).toEqual(morphismSeed.terms)
  })
})
