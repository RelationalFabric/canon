/**
 * Tests for nameless defineTheory
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri, theoryRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { declareTheory, resetRegistry } from './shell.js'
import { identityConfig } from './theories/identity.js'
import { defineTheory } from './theory.js'

declare module './types/theories.js' {
  interface Theories {
    Composed: Record<string, never>
  }
}

describe('defineTheory', () => {
  it('returns the same object', () => {
    const config = {}

    expect(defineTheory(config)).toBe(config)
  })

  it('does not register a theory', () => {
    definitionRegistry.clear()

    defineTheory({})

    expect(definitionRegistry.has(definitionUri('theory', 'Identity'))).toBe(false)
  })

  it('does not write a uri', () => {
    const config = {}

    defineTheory(config)

    expect(metaOf(config).uri).toBeUndefined()
  })
})

describe('declareTheory extends', () => {
  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
  })

  it('resolves a registered label without a second registration', () => {
    const before = definitionRegistry.size

    declareTheory('Composed', { extends: ['Identity'] })

    expect(theoryRefFor('Identity').value).toBe(identityConfig)
    expect(definitionRegistry.size).toBe(before + 1)
  })

  it('resolves a KeyRef', () => {
    declareTheory('Composed', { extends: [theoryRefFor('Identity')] })

    expect(theoryRefFor('Composed').value).toBeDefined()
    expect(theoryRefFor('Identity').value).toBe(identityConfig)
  })

  it('resolves a value that already carries a uri', () => {
    const registered = theoryRefFor('Identity').value

    declareTheory('Composed', { extends: [registered] })

    expect(theoryRefFor('Identity').value).toBe(identityConfig)
  })

  it('registers a map entry at canon://theory/Fresh with only uri', () => {
    declareTheory('Composed', { extends: { Fresh: defineTheory({}) } })

    const fresh = theoryRefFor('Fresh').value
    expect(theoryRefFor('Fresh').key).toBe('canon://theory/Fresh')
    expect(fresh).toBeDefined()
    if (isMetaCarrier(fresh)) {
      expect(metaOf(fresh)).toEqual({ uri: 'canon://theory/Fresh' })
    }
  })

  it('throws when a map is not the last list item', () => {
    expect(() => declareTheory('Composed', {
      extends: [{ Fresh: defineTheory({}) }, 'Identity'],
    })).toThrow('A definition ref map is only allowed as the last item (ADR-0017)')
  })

  it('throws on an unknown label and does not register that name', () => {
    expect(() => declareTheory('Composed', { extends: ['Missing'] }))
      .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

    expect(definitionRegistry.has(definitionUri('theory', 'Missing'))).toBe(false)
  })

  it('throws the resolve error for a value with no uri and no KeyRef', () => {
    expect(() => declareTheory('Composed', { extends: [null] }))
      .toThrow('A definition ref must be a name or a value carrying a uri (ADR-0017)')
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
