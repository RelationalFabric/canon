/**
 * Tests for nameless defineTheory
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { canonRefFor, definitionRegistry, definitionUri, theoryRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { declareCanon, declareMorphism, declareTheory, resetRegistry } from './shell.js'
import { config as identityConfig } from './theories/identity.js'
import { config as taxonomyConfig } from './theories/taxonomy.js'
import { defineTheory, termsOf, Theory } from './theory.js'

declare module '@relational-fabric/canon' {
  interface Canons {
    Aliased: Record<never, never>
  }
}

declare module '@relational-fabric/canon' {
  interface Theories {
    Base: { Shared: never }
    Cached: { A: never }
    Child: { Shared: never }
    Composed: Record<string, never>
    FillIn: Record<string, never>
    Fresh: Record<string, never>
    Mid: { Mid: never }
    Other: Record<string, never>
    Top: { Top: never }
  }
}

describe('defineTheory', () => {
  it('returns a Theory instance with fields copied from the config', () => {
    const config = { extends: ['Identity'] as const }
    const theory = defineTheory(config)

    expect(theory).toBeInstanceOf(Theory)
    expect(theory.extends).toEqual(config.extends)
    expect(theory).not.toBe(config)
  })

  it('does not register a theory', () => {
    definitionRegistry.clear()

    defineTheory({})

    expect(definitionRegistry.has(definitionUri('theory', 'Identity'))).toBe(false)
  })

  it('does not write a uri', () => {
    const theory = defineTheory({})

    expect(metaOf(theory).uri).toBeUndefined()
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

    expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
    expect(definitionRegistry.size).toBe(before + 1)
  })

  it('resolves a KeyRef', () => {
    declareTheory('Composed', { extends: [theoryRefFor('Identity')] })

    expect(theoryRefFor('Composed').value).toBeDefined()
    expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
  })

  it('resolves a value that already carries a uri', () => {
    const registered = theoryRefFor('Identity').value

    declareTheory('Composed', { extends: [registered] })

    expect(theoryRefFor('Identity').value).toBe(registered)
  })

  it('registers a map entry at canon://theory/Fresh with only uri', () => {
    declareTheory('Composed', { extends: { Fresh: defineTheory({}) } })

    const fresh = theoryRefFor('Fresh').value
    expect(theoryRefFor('Fresh').key).toBe('canon://theory/Fresh')
    expect(fresh).toBeDefined()
    expect(fresh).toBeInstanceOf(Theory)
    if (isMetaCarrier(fresh)) {
      expect(metaOf(fresh)).toEqual({ uri: 'canon://theory/Fresh' })
    }
  })

  it('registers map-form theories as Theory instances usable in morphisms', () => {
    declareTheory('Identity', identityConfig)
    declareTheory('Composed', { extends: { Fresh: {} } })

    expect(theoryRefFor('Fresh').value).toBeInstanceOf(Theory)

    expect(() => declareMorphism('Fresh', 'Identity', { maps: {} })).not.toThrow()
  })

  it('keeps registered map entries on the parent composition', () => {
    declareTheory('Composed', { extends: { Fresh: {} } })

    const composed = theoryRefFor('Composed').value as Theory
    const fresh = theoryRefFor('Fresh').value

    expect((composed.extends as Record<string, unknown>).Fresh).toBe(fresh)
  })

  it('does not wrap a definition that already carries a uri', () => {
    declareTheory('Identity', identityConfig)
    declareCanon('Aliased', { axioms: {} })
    const canon = canonRefFor('Aliased').value

    expect(() => declareTheory('Composed', { extends: { Other: canon } }))
      .toThrow('Definition already registered: canon://canon/Aliased')
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

describe('runtime terms', () => {
  beforeEach(() => {
    resetRegistry()
  })

  it('reads missing terms as {} after registration', () => {
    declareTheory('Fresh', {})

    const registered = theoryRefFor('Fresh').value as Theory
    expect(registered.terms).toEqual({})
  })

  it('compares a theory without terms to one with terms: {} without clash', () => {
    declareTheory('FillIn', {})
    expect(() => declareTheory('FillIn', { terms: {} })).not.toThrow()
  })

  it('returns a frozen termsOf result', () => {
    const theory = defineTheory({ terms: { Id: 'identifier' } })
    const terms = termsOf(theory)

    expect(Object.isFrozen(terms)).toBe(true)
    expect(() => {
      (terms as { Id: string }).Id = 'changed'
    }).toThrow(TypeError)
    expect(terms.Id).toBe('identifier')
    expect(termsOf(theory)).toBe(terms)
  })

  it('throws on an unresolved extends parent and does not cache a partial result', () => {
    const theory = defineTheory({
      extends: ['Missing'],
      terms: { Own: 'own' },
    })

    const unresolved = new TypeError('Unresolved theory in extends (ADR-0018)')
    expect(() => termsOf(theory)).toThrow(unresolved)
    expect(() => termsOf(theory)).toThrow(unresolved)
  })

  it('unions inherited terms through extends across two levels', () => {
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
    declareTheory('Mid', {
      extends: ['Identity'],
      terms: { Mid: 'middle term' },
    })
    declareTheory('Top', {
      extends: ['Mid', 'Taxonomy'],
      terms: { Top: 'top term' },
    })

    expect(termsOf(theoryRefFor('Top').value as Theory)).toEqual({
      Top: 'top term',
      Mid: 'middle term',
      Id: 'Holds the stable identifier for an entity.',
      Type: 'Holds the kind or classification of an entity.',
    })
  })

  it('reuses the cached termsOf result on a second call', () => {
    declareTheory('Identity', identityConfig)
    const registered = theoryRefFor('Identity').value as Theory

    const first = termsOf(registered)
    const second = termsOf(registered)

    expect(second).toBe(first)
  })

  it('does not clash when re-registering after termsOf populated the cache', () => {
    declareTheory('Cached', { terms: { A: 'a' } })
    const registered = theoryRefFor('Cached').value as Theory
    termsOf(registered)

    expect(() => declareTheory('Cached', { terms: { A: 'a' } })).not.toThrow()
  })

  it('lets own terms override inherited names with different descriptions', () => {
    declareTheory('Base', { terms: { Shared: 'from base' } })
    declareTheory('Child', {
      extends: ['Base'],
      terms: { Shared: 'from child' },
    })

    expect(termsOf(theoryRefFor('Child').value as Theory).Shared).toBe('from child')
  })
})

describe('built-in theory terms', () => {
  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
  })

  it('gives Identity the Id term', () => {
    expect(termsOf(theoryRefFor('Identity').value as Theory)).toHaveProperty('Id')
  })

  it('gives Taxonomy the Type term', () => {
    expect(termsOf(theoryRefFor('Taxonomy').value as Theory)).toHaveProperty('Type')
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
