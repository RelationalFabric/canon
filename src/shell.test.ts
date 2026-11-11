/**
 * Tests for global shell
 */

import type { CanonConfig } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inferCanon } from './canon.js'
import { canonRefFor, morphismRefFor, theoryRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { declareCanon, declareMorphism, declareTheory, registerCanons, registerMorphisms, registerTheories, resetRegistry } from './shell.js'
import { config as identityConfig } from './theories/identity.js'
import { config as taxonomyConfig } from './theories/taxonomy.js'
import { defineTheory } from './theory.js'

declare module './types/canons.js' {
  interface Canons {
    DeclaredCanon: Record<string, never>
  }
}

declare module './types/theories.js' {
  interface Theories {
    DeclaredTheory: Record<string, never>
    Fresh: Record<string, never>
    Other: Record<string, never>
    T: Record<string, never>
    TheoryConflict: Record<string, never>
  }
}

describe('shell', () => {
  beforeEach(() => {
    resetRegistry()
  })

  afterEach(() => {
    // Just clear - isolated tests don't need full restoration
    resetRegistry()
  })

  describe('resetRegistry', () => {
    it('should clear the global registry', () => {
      const config: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
      }

      declareCanon('TestCanon' as any, config)
      expect(canonRefFor('TestCanon').value).toBe(config)

      resetRegistry()
      expect(canonRefFor('TestCanon').value).toBeUndefined()
    })
  })

  describe('declareCanon', () => {
    it('should register canon in global registry', () => {
      const config: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
      }

      declareCanon('TestCanon' as any, config)

      expect(canonRefFor('TestCanon').value).toBe(config)
    })

    it('resolves models by label and by theory ref', () => {
      declareTheory('Identity', identityConfig)
      const byLabel: CanonConfig = { axioms: {}, models: ['Identity'] }
      const byRef: CanonConfig = { axioms: {}, models: [theoryRefFor('Identity')] }

      declareCanon('DeclaredCanon', byLabel)

      expect(canonRefFor('DeclaredCanon').value).toBe(byLabel)
      expect(theoryRefFor('Identity').value).toBe(identityConfig)

      resetRegistry()
      declareTheory('Identity', identityConfig)
      declareCanon('DeclaredCanon', byRef)

      expect(canonRefFor('DeclaredCanon').value).toBe(byRef)
      expect(theoryRefFor('Identity').value).toBe(identityConfig)
    })

    it('throws on an unknown models label and does not register the canon', () => {
      const config: CanonConfig = { axioms: {}, models: ['Missing'] }

      expect(() => declareCanon('DeclaredCanon', config))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
    })

    it('resolves an axiom models list to the Identity theory', () => {
      declareTheory('Identity', identityConfig)
      const config: CanonConfig = {
        axioms: {
          Owner: {
            $basis: (v: unknown): v is { id: string } => true,
            models: ['Identity'],
          },
        },
      }

      declareCanon('DeclaredCanon', config)

      const models = canonRefFor('DeclaredCanon').value?.axioms.Owner?.models
      expect(Array.isArray(models) ? models : []).toEqual(['Identity'])
      expect(theoryRefFor('Identity').value).toBe(identityConfig)
    })

    it('stores nothing when an axiom map is followed by a missing label', () => {
      const basis = (v: unknown): v is { id: string } => true
      const config: CanonConfig = {
        axioms: {
          Owner: { $basis: basis, models: { Fresh: defineTheory({}) } },
          Other: { $basis: basis, models: ['Missing'] },
        },
      }

      expect(() => declareCanon('DeclaredCanon', config))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toBeUndefined()
    })

    it('stores nothing when the canon models map is followed by a missing label', () => {
      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Other: {
            $basis: (v: unknown): v is { id: string } => true,
            models: ['Missing'],
          },
        },
        models: { Fresh: defineTheory({}) },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toBeUndefined()
    })

    it('throws on an unknown axiom models label and does not register the canon', () => {
      const config: CanonConfig = {
        axioms: {
          Owner: {
            $basis: (v: unknown): v is { id: string } => true,
            models: ['Missing'],
          },
        },
      }

      expect(() => declareCanon('DeclaredCanon', config))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
    })

    it('returns a ref that resolves to the declared canon', () => {
      const config: CanonConfig = { axioms: {} }

      const ref = declareCanon('DeclaredCanon', config)

      expect(ref.key).toBe('canon://canon/DeclaredCanon')
      expect(ref.value).toBe(config)
    })
  })

  describe('declareTheory', () => {
    it('returns a ref that resolves to the declared theory', () => {
      const config = {}

      const ref = declareTheory('DeclaredTheory', config)

      expect(ref.key).toBe('canon://theory/DeclaredTheory')
      expect(ref.value).toBe(config)
    })

    it('records only canon://theory/<Label> on the registered value', () => {
      const config = {}

      const ref = declareTheory('DeclaredTheory', config)

      expect(ref.value).toBeDefined()
      if (isMetaCarrier(ref.value)) {
        expect(metaOf(ref.value)).toEqual({ uri: 'canon://theory/DeclaredTheory' })
      }
    })

    it('does not throw when a structurally equal config is declared again', () => {
      declareTheory('DeclaredTheory', {})

      expect(() => declareTheory('DeclaredTheory', {})).not.toThrow()
    })

    it('throws when a different config is declared under the same label and keeps the first value', () => {
      const original = {}

      declareTheory('TheoryConflict', original)

      expect(() => declareTheory('TheoryConflict', { distinct: true } as Record<string, never>))
        .toThrow('Definition already registered: canon://theory/TheoryConflict (ADR-0017)')

      expect(theoryRefFor('TheoryConflict').value).toBe(original)
    })

    it('clears declared theories when the registry is reset', () => {
      declareTheory('DeclaredTheory', {})

      expect(theoryRefFor('DeclaredTheory').value).toBeDefined()

      resetRegistry()

      expect(theoryRefFor('DeclaredTheory').value).toBeUndefined()
    })
  })

  describe('declareMorphism', () => {
    const morphismConfig = { maps: { Id: 'Type' } }

    beforeEach(() => {
      declareTheory('Identity', identityConfig)
      declareTheory('Taxonomy', taxonomyConfig)
    })

    it('returns a ref at canon://morphism/Identity/Taxonomy with the declared config', () => {
      const ref = declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(ref.key).toBe('canon://morphism/Identity/Taxonomy')
      expect(ref.value).toBe(morphismConfig)
    })

    it('records only the morphism uri on the registered value', () => {
      const ref = declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(ref.value).toBeDefined()
      if (isMetaCarrier(ref.value)) {
        expect(metaOf(ref.value)).toEqual({ uri: 'canon://morphism/Identity/Taxonomy' })
      }
    })

    it('does not throw when a structurally equal config is declared again', () => {
      declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(() => declareMorphism('Identity', 'Taxonomy', morphismConfig)).not.toThrow()
    })

    it('throws when a different config is declared for the same pair and keeps the first value', () => {
      declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(() => declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Id' } }))
        .toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphismConfig)
    })

    it('throws on an unknown source or target and does not register the morphism', () => {
      resetRegistry()
      declareTheory('Taxonomy', taxonomyConfig)

      expect(() => declareMorphism('Missing' as 'Identity', 'Taxonomy', morphismConfig))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()

      resetRegistry()
      declareTheory('Identity', identityConfig)

      expect(() => declareMorphism('Identity', 'Missing' as 'Taxonomy', morphismConfig))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
    })

    it('clears declared morphisms when the registry is reset', () => {
      declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeDefined()

      resetRegistry()

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
    })
  })

  describe('registerMorphisms', () => {
    const morphismConfig = { maps: { Id: 'Type' } }

    beforeEach(() => {
      declareTheory('Identity', identityConfig)
      declareTheory('Taxonomy', taxonomyConfig)
    })

    it('records only canon://morphism/Identity/Taxonomy on the registered value', () => {
      registerMorphisms({ 'Identity/Taxonomy': morphismConfig })

      const registered = morphismRefFor('Identity', 'Taxonomy').value
      expect(registered).toBe(morphismConfig)
      if (isMetaCarrier(registered)) {
        expect(metaOf(registered)).toEqual({ uri: 'canon://morphism/Identity/Taxonomy' })
      }
    })

    it('does not throw when a structurally equal config is registered again', () => {
      registerMorphisms({ 'Identity/Taxonomy': morphismConfig })

      expect(() => registerMorphisms({ 'Identity/Taxonomy': morphismConfig })).not.toThrow()
    })

    it('throws when a different config is registered under the same key and keeps the original value', () => {
      registerMorphisms({ 'Identity/Taxonomy': morphismConfig })

      expect(() => registerMorphisms({ 'Identity/Taxonomy': { maps: { Id: 'Id' } } }))
        .toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphismConfig)
    })

    it('throws on a missing source theory and does not register the morphism', () => {
      resetRegistry()
      declareTheory('Taxonomy', taxonomyConfig)

      expect(() => registerMorphisms({ 'Missing/Taxonomy': morphismConfig }))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(morphismRefFor('Missing', 'Taxonomy').value).toBeUndefined()
    })

    it('throws on a key with no slash', () => {
      expect(() => registerMorphisms({ IdentityTaxonomy: morphismConfig }))
        .toThrow('Invalid morphism name: IdentityTaxonomy (ADR-0018)')
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
    })

    it('leaves the registry unchanged when a batch has one missing source and one valid entry', () => {
      expect(() => registerMorphisms({
        'Missing/Taxonomy': morphismConfig,
        'Identity/Taxonomy': morphismConfig,
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
      expect(morphismRefFor('Missing', 'Taxonomy').value).toBeUndefined()
    })

    it('stores nothing when a batch conflicts with an already registered morphism', () => {
      declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(() => registerMorphisms({
        'Taxonomy/Identity': { maps: { Type: 'Id' } },
        'Identity/Taxonomy': { maps: { Id: 'Id' } },
      })).toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Taxonomy', 'Identity').value).toBeUndefined()
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(morphismConfig)
    })
  })

  describe('registerTheories', () => {
    it('records only canon://theory/X on the registered value', () => {
      const cfg = {}

      registerTheories({ X: cfg })

      const registered = theoryRefFor('X').value
      expect(registered).toBe(cfg)
      if (isMetaCarrier(registered)) {
        expect(metaOf(registered)).toEqual({ uri: 'canon://theory/X' })
      }
    })

    it('does not throw when a structurally equal config is registered again', () => {
      registerTheories({ X: {} })

      expect(() => registerTheories({ X: {} })).not.toThrow()
    })

    it('throws when a different config is registered under the same key', () => {
      registerTheories({ X: {} })

      expect(() => registerTheories({ X: { extends: [] } }))
        .toThrow('Definition already registered: canon://theory/X (ADR-0017)')
    })

    it('keeps the original config when a conflicting registration throws', () => {
      const original = {}
      registerTheories({ X: original })

      expect(() => registerTheories({ X: { extends: [] } }))
        .toThrow('Definition already registered: canon://theory/X (ADR-0017)')

      expect(theoryRefFor('X').value).toBe(original)
    })

    it('registers a map-form extends value and the theory that composes it', () => {
      registerTheories({ T: { extends: { Fresh: defineTheory({}) } } })

      expect(theoryRefFor('T').key).toBe('canon://theory/T')
      expect(theoryRefFor('Fresh').value).toBeDefined()
    })

    it('stores nothing when a map-form entry shares a batch with a missing list label', () => {
      expect(() => registerTheories({
        T: { extends: { Fresh: defineTheory({}) } },
        Other: { extends: ['Missing'] },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(theoryRefFor('T').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toBeUndefined()
      expect(theoryRefFor('Other').value).toBeUndefined()
    })

    it('stores nothing when a list-form map conflicts with a registered value', () => {
      declareTheory('Identity', identityConfig)
      declareTheory('Fresh', {})

      expect(() => registerTheories({
        T: { extends: ['Identity', { Fresh: defineTheory({ extends: [] }) }] },
      })).toThrow('Definition already registered: canon://theory/Fresh (ADR-0017)')

      expect(theoryRefFor('T').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toEqual({})
    })

    it('registers a theory and a trailing list-form map entry', () => {
      declareTheory('Identity', identityConfig)
      const fresh = defineTheory({})

      registerTheories({
        T: { extends: ['Identity', { Fresh: fresh }] },
      })

      expect(theoryRefFor('T').key).toBe('canon://theory/T')
      expect(theoryRefFor('Fresh').value).toBe(fresh)
    })

    it('stores nothing when a map-form key conflicts with a registered value', () => {
      declareTheory('Fresh', {})

      expect(() => registerTheories({
        T: { extends: { Fresh: defineTheory({ extends: [] }) } },
      })).toThrow('Definition already registered: canon://theory/Fresh (ADR-0017)')

      expect(theoryRefFor('T').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toEqual({})
    })

    it('resolves a theory that extends another theory in the same call', () => {
      registerTheories({
        Child: { extends: ['Parent'] },
        Parent: {},
      })

      expect(theoryRefFor('Parent').key).toBe('canon://theory/Parent')
      expect(theoryRefFor('Child').key).toBe('canon://theory/Child')
      expect(theoryRefFor('Child').value).toEqual({ extends: ['Parent'] })
    })

    it('leaves the registry unchanged when a batch references a missing label', () => {
      expect(() => registerTheories({
        A: { extends: ['Missing'] },
        B: {},
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(theoryRefFor('A').value).toBeUndefined()
      expect(theoryRefFor('B').value).toBeUndefined()
    })

    it('leaves the registry unchanged when a batch has a cycle', () => {
      expect(() => registerTheories({
        A: { extends: ['B'] },
        B: { extends: ['A'] },
      })).toThrow('Theory cycle: canon://theory/A -> canon://theory/B -> canon://theory/A (ADR-0017)')

      expect(theoryRefFor('A').value).toBeUndefined()
      expect(theoryRefFor('B').value).toBeUndefined()
    })

    it('resolves extends the same way declareTheory does', () => {
      declareTheory('Identity', identityConfig)

      registerTheories({ Y: { extends: ['Identity'] } })

      expect(theoryRefFor('Identity').value).toBe(identityConfig)
      expect(theoryRefFor('Y').key).toBe('canon://theory/Y')

      expect(() => registerTheories({ Z: { extends: ['Missing'] } }))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(theoryRefFor('Missing').value).toBeUndefined()
    })
  })

  describe('registerCanons', () => {
    it('resolves models the same way declareCanon does', () => {
      declareTheory('Identity', identityConfig)

      registerCanons({ X: { axioms: {}, models: ['Identity'] } })

      expect(theoryRefFor('Identity').value).toBe(identityConfig)
      expect(canonRefFor('X').value).toBeDefined()

      expect(() => registerCanons({ Z: { axioms: {}, models: ['Missing'] } }))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('Z').value).toBeUndefined()
    })

    it('stores nothing when a later canon has a missing models label', () => {
      expect(() => registerCanons({
        canon1: { axioms: {}, models: { Fresh: defineTheory({}) } },
        canon2: { axioms: {}, models: ['Missing'] },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(canonRefFor('canon1').value).toBeUndefined()
      expect(canonRefFor('canon2').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toBeUndefined()
    })

    it('stores nothing when a map-form models key conflicts with a registered value', () => {
      declareTheory('Fresh', {})

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {},
        models: { Fresh: defineTheory({ extends: [] }) },
      })).toThrow('Definition already registered: canon://theory/Fresh (ADR-0017)')

      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toEqual({})
    })

    it('stores no canon when one axiom models label is missing', () => {
      declareTheory('Identity', identityConfig)
      const basis = (v: unknown): v is { id: string } => true

      expect(() => registerCanons({
        Good: { axioms: { Owner: { $basis: basis, models: ['Identity'] } } },
        Bad: { axioms: { Owner: { $basis: basis, models: ['Missing'] } } },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(canonRefFor('Good').value).toBeUndefined()
      expect(canonRefFor('Bad').value).toBeUndefined()
    })

    it('still infers the canon with the most matching axioms', () => {
      const idOnly: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } =>
              typeof v === 'object' && v !== null && 'id' in v,
            key: 'id',
          },
        },
      }
      const idAndType: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } =>
              typeof v === 'object' && v !== null && 'id' in v,
            key: 'id',
          },
          Type: {
            $basis: (v: unknown): v is { type: string } =>
              typeof v === 'object' && v !== null && 'type' in v,
            key: 'type',
          },
        },
      }

      registerCanons({ IdOnly: idOnly, IdAndType: idAndType })

      expect(inferCanon({ id: 'test-123', type: 'user' })).toBe(idAndType)
    })

    it('records canon://canon/X on the registered value', () => {
      const cfg: CanonConfig = { axioms: {} }

      registerCanons({ X: cfg })

      const registered = canonRefFor('X').value
      expect(registered).toBeDefined()
      if (isMetaCarrier(registered)) {
        expect(metaOf(registered).uri).toBe('canon://canon/X')
      }
    })

    it('does not throw when a structurally equal config is registered again', () => {
      registerCanons({ X: { axioms: {} } })

      expect(() => registerCanons({ X: { axioms: {} } })).not.toThrow()
    })

    it('throws when a different config is registered under the same key', () => {
      registerCanons({ X: { axioms: {} } })

      expect(() => registerCanons({
        X: {
          axioms: {
            Id: {
              $basis: (v: unknown): v is { id: string } => true,
              key: 'id',
            },
          },
        },
      })).toThrow('Definition already registered: canon://canon/X (ADR-0017)')
    })

    it('keeps the original config when a conflicting registration throws', () => {
      const original: CanonConfig = { axioms: {} }
      registerCanons({ X: original })

      expect(() => registerCanons({
        X: {
          axioms: {
            Id: {
              $basis: (v: unknown): v is { id: string } => true,
              key: 'id',
            },
          },
        },
      })).toThrow('Definition already registered: canon://canon/X (ADR-0017)')

      expect(canonRefFor('X').value).toBe(original)
    })
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
