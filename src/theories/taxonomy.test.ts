/**
 * Tests for the Taxonomy theory
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { theoryRefFor } from '../definitions.js'
import { metaOf } from '../meta.js'
import { declareTheory } from '../shell.js'
import { termsOf, Theory } from '../theory.js'
import { config } from './taxonomy.js'

describe('taxonomy theory', () => {
  beforeEach(() => {
    declareTheory('Taxonomy', config)
  })

  it('registers at canon://theory/Taxonomy with the declared config', () => {
    const ref = theoryRefFor('Taxonomy')

    expect(ref.key).toBe('canon://theory/Taxonomy')
    expect(ref.value).toBeInstanceOf(Theory)
  })

  it('records only uri on the registered value', () => {
    const registered = theoryRefFor('Taxonomy').value

    expect(registered).toBeDefined()
    if (isMetaCarrier(registered)) {
      expect(metaOf(registered)).toEqual({ uri: 'canon://theory/Taxonomy' })
    }
  })

  it('exposes the Type term', () => {
    const registered = theoryRefFor('Taxonomy').value as Theory
    expect(termsOf(registered)).toHaveProperty('Type')
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
