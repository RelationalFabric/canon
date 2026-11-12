/**
 * Tests for nameless defineMorphism
 */

import type { MorphismConfig } from './morphism.js'
import type { Expect } from './testing.js'
import type { Theories } from './types/index.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri, morphismRefFor, theoryRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { applyMorphism, composeMorphisms, defineMorphism, Morphism } from './morphism.js'
import { declareMorphism, declareTheory, registerMorphisms, resetRegistry } from './shell.js'
import { invariant } from './testing.js'
import { config as identityConfig } from './theories/identity.js'
import { config as taxonomyConfig } from './theories/taxonomy.js'
import { defineTheory, Theory } from './theory.js'

type IdentityToTaxonomy = {
  [Source in keyof Theories['Identity']]: keyof Theories['Taxonomy']
}

invariant<Expect<{ Id: 'Type' }, IdentityToTaxonomy>>()

// @ts-expect-error a complete morphism maps every Identity key
// eslint-disable-next-line ts/no-empty-object-type -- incomplete morphism map
invariant<Expect<{}, IdentityToTaxonomy>>()

// @ts-expect-error Id must map to a Taxonomy key
invariant<Expect<{ Id: 'Nope' }, IdentityToTaxonomy>>()

function completenessFixtures(): void {
  // @ts-expect-error incomplete maps
  declareMorphism('Identity', 'Taxonomy', { maps: {} })

  // @ts-expect-error wrong target term
  declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Nope' } })

  // @ts-expect-error incomplete maps
  registerMorphisms({ 'Identity/Taxonomy': { maps: {} } })

  // @ts-expect-error wrong target term
  registerMorphisms({ 'Identity/Taxonomy': { maps: { Id: 'Nope' } } })

  registerMorphisms({ 'Identity/Taxonomy': { maps: { Id: 'Type' } } })
}

void completenessFixtures

describe('defineMorphism', () => {
  it('returns a Morphism instance with maps copied from the config', () => {
    const config = { maps: { Id: 'Id' } }
    const morphism = defineMorphism(config)

    expect(morphism).toBeInstanceOf(Morphism)
    expect(morphism.maps).toEqual(config.maps)
    expect(morphism).not.toBe(config)
  })

  it('does not register a morphism', () => {
    definitionRegistry.clear()

    defineMorphism({ maps: { Id: 'Id' } })

    expect(definitionRegistry.has(definitionUri('morphism', 'Identity/Taxonomy'))).toBe(false)
  })

  it('does not write a uri', () => {
    const morphism = defineMorphism({ maps: { Id: 'Id' } })

    expect(metaOf(morphism).uri).toBeUndefined()
  })
})

describe('declareMorphism registration', () => {
  const morphismConfig = { maps: { Id: 'Type' } } as const

  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
  })

  it('stamps canon://morphism/<Source>/<Target> on the registered Morphism', () => {
    declareMorphism('Identity', 'Taxonomy', morphismConfig)

    const registered = morphismRefFor('Identity', 'Taxonomy').value
    expect(registered).toBeInstanceOf(Morphism)
    if (isMetaCarrier(registered)) {
      expect(metaOf(registered).uri).toBe('canon://morphism/Identity/Taxonomy')
    }
  })

  it('sets source and target to the registered Theory values', () => {
    declareMorphism('Identity', 'Taxonomy', morphismConfig)

    const registered = morphismRefFor('Identity', 'Taxonomy').value as Morphism
    expect(registered.source).toBe(theoryRefFor('Identity').value)
    expect(registered.target).toBe(theoryRefFor('Taxonomy').value)
    expect(registered.source).toBeInstanceOf(Theory)
    expect(registered.target).toBeInstanceOf(Theory)
  })
})

describe('registration swap', () => {
  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
  })

  it('replaces distinct theory objects with the registered instances', () => {
    const source = defineTheory({ terms: identityConfig.terms })
    const target = defineTheory({ terms: taxonomyConfig.terms })
    const morphism = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target,
    })

    registerMorphisms({ 'Identity/Taxonomy': morphism as { maps: { Id: 'Type' } } })

    expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphism)
    expect(morphism.source).toBe(theoryRefFor('Identity').value)
    expect(morphism.target).toBe(theoryRefFor('Taxonomy').value)
  })

  it('replaces distinct theory objects when the morphism is declared', () => {
    const source = defineTheory({ terms: identityConfig.terms })
    const target = defineTheory({ terms: taxonomyConfig.terms })
    const morphism = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target,
    })

    declareMorphism('Identity', 'Taxonomy', morphism as unknown as { maps: { Id: 'Type' } })

    expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphism)
    expect(morphism.source).toBe(theoryRefFor('Identity').value)
    expect(morphism.target).toBe(theoryRefFor('Taxonomy').value)
  })

  it('leaves a morphism that already holds the registered instances unchanged', () => {
    const source = theoryRefFor('Identity').value as Theory
    const target = theoryRefFor('Taxonomy').value as Theory
    const morphism = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target,
    })

    registerMorphisms({ 'Identity/Taxonomy': morphism as { maps: { Id: 'Type' } } })

    expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphism)
    expect(morphism.source).toBe(source)
    expect(morphism.target).toBe(target)
  })

  it('does not clash when an identical morphism is registered again', () => {
    registerMorphisms({
      'Identity/Taxonomy': defineMorphism({
        maps: { Id: 'Type' },
        source: defineTheory({ terms: identityConfig.terms }),
        target: defineTheory({ terms: taxonomyConfig.terms }),
      }) as { maps: { Id: 'Type' } },
    })
    const first = morphismRefFor('Identity', 'Taxonomy').value
    const source = defineTheory({ terms: identityConfig.terms })
    const target = defineTheory({ terms: taxonomyConfig.terms })
    const second = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target,
    })

    expect(() => registerMorphisms({
      'Identity/Taxonomy': second as { maps: { Id: 'Type' } },
    })).not.toThrow()
    expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(first)
    expect(second.source).toBe(source)
    expect(second.target).toBe(target)
  })

  it('leaves a clashing declare with the passed-in endpoints', () => {
    declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } })
    const source = defineTheory({ terms: identityConfig.terms })
    const target = defineTheory({ terms: taxonomyConfig.terms })
    const morphism = defineMorphism({
      maps: { Id: 'Id' },
      source,
      target,
    })

    expect(() => declareMorphism('Identity', 'Taxonomy', morphism as unknown as { maps: { Id: 'Type' } }))
      .toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')
    expect(morphism.source).toBe(source)
    expect(morphism.target).toBe(target)
  })

  it('restores an earlier morphism when a later batch entry fails', () => {
    const source = defineTheory({ terms: identityConfig.terms })
    const target = defineTheory({ terms: taxonomyConfig.terms })
    const earlier = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target,
    })
    const laterSource = defineTheory({ terms: taxonomyConfig.terms })
    const laterTarget = defineTheory({ terms: identityConfig.terms })
    const later = defineMorphism({
      maps: { Type: 'Id' },
      source: laterSource,
      target: laterTarget,
    })
    Object.defineProperty(later, 'source', {
      configurable: true,
      enumerable: true,
      get: () => laterSource,
      set: () => {
        throw new Error('later fails')
      },
    })

    expect(() => registerMorphisms({
      'Identity/Taxonomy': earlier as { maps: { Id: 'Type' } },
      'Taxonomy/Identity': later as { maps: { Type: 'Id' } },
    })).toThrow('later fails')
    expect(earlier.source).toBe(source)
    expect(earlier.target).toBe(target)
    expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
  })

  it('keeps the unresolved-theory error and does not register', () => {
    resetRegistry()
    declareTheory('Taxonomy', taxonomyConfig)
    const source = defineTheory({ terms: identityConfig.terms })
    const morphism = defineMorphism({
      maps: { Id: 'Type' },
      source,
      target: theoryRefFor('Taxonomy').value as Theory,
    })

    expect(() => registerMorphisms({ 'Missing/Taxonomy': morphism }))
      .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
    expect(morphismRefFor('Missing', 'Taxonomy').value).toBeUndefined()
    expect(morphism.source).toBe(source)
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

describe('composeMorphisms', () => {
  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
  })

  it('composes chained maps without registering the result', () => {
    const left = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig
    const right = declareMorphism('Taxonomy', 'Identity', { maps: { Type: 'Id' } }).value as MorphismConfig

    expect(composeMorphisms(left, right)).toEqual({ maps: { Id: 'Id' } })
    expect(definitionRegistry.has(definitionUri('morphism', 'Identity/Identity'))).toBe(false)
    expect(morphismRefFor('Identity', 'Identity').value).toBeUndefined()
  })

  it('throws when the chain breaks and registers nothing new', () => {
    const left = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig
    const right = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig

    expect(() => composeMorphisms(left, right))
      .toThrow('Morphism composition break: canon://morphism/Identity/Taxonomy then canon://morphism/Identity/Taxonomy (ADR-0018)')
    expect(definitionRegistry.has(definitionUri('morphism', 'Identity/Identity'))).toBe(false)
  })

  it('throws when a morphism is not registered', () => {
    const registered = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig
    const unregistered = defineMorphism({ maps: { Type: 'Id' } })

    expect(() => composeMorphisms(registered, unregistered)).toThrow('Unregistered morphism (ADR-0018)')
  })
})

describe('applyMorphism', () => {
  beforeEach(() => {
    resetRegistry()
    declareTheory('Identity', identityConfig)
    declareTheory('Taxonomy', taxonomyConfig)
  })

  it('maps source keys to target keys', () => {
    const morphism = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig

    expect(applyMorphism(morphism, { Id: 'a' })).toEqual({ Type: 'a' })
  })

  it('throws when a mapped source term is missing', () => {
    const morphism = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig

    expect(() => applyMorphism(morphism, {}))
      .toThrow('Incomplete value: canon://morphism/Identity/Taxonomy missing Id')
  })

  it('does not mutate the input object', () => {
    const morphism = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as MorphismConfig
    const input = { Id: 'a' }
    const keysBefore = Object.keys(input)

    applyMorphism(morphism, input)

    expect(Object.keys(input)).toEqual(keysBefore)
    expect(input).toEqual({ Id: 'a' })
  })
})
