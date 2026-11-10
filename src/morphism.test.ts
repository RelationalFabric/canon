/**
 * Tests for nameless defineMorphism
 */

import type { MorphismConfig } from './morphism.js'
import type { Expect } from './testing.js'
import type { Theories } from './types/index.js'
import { beforeEach, describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri, morphismRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { applyMorphism, composeMorphisms, defineMorphism } from './morphism.js'
import { declareMorphism, declareTheory, resetRegistry } from './shell.js'
import { invariant } from './testing.js'
import { config as identityConfig } from './theories/identity.js'
import { config as taxonomyConfig } from './theories/taxonomy.js'

type IdentityToTaxonomy = {
  [Source in keyof Theories['Identity']]: keyof Theories['Taxonomy']
}

invariant<Expect<{ Id: 'Type' }, IdentityToTaxonomy>>()

// @ts-expect-error a complete morphism maps every Identity key
// eslint-disable-next-line ts/no-empty-object-type -- incomplete morphism map
invariant<Expect<{}, IdentityToTaxonomy>>()

// @ts-expect-error Id must map to a Taxonomy key
invariant<Expect<{ Id: 'Nope' }, IdentityToTaxonomy>>()

describe('defineMorphism', () => {
  it('returns the same object', () => {
    const config = { maps: { Id: 'Id' } }

    expect(defineMorphism(config)).toBe(config)
  })

  it('does not register a morphism', () => {
    definitionRegistry.clear()

    defineMorphism({ maps: { Id: 'Id' } })

    expect(definitionRegistry.has(definitionUri('morphism', 'Identity/Taxonomy'))).toBe(false)
  })

  it('does not write a uri', () => {
    const config = { maps: { Id: 'Id' } }

    defineMorphism(config)

    expect(metaOf(config).uri).toBeUndefined()
  })
})

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
