/**
 * Tests for global shell
 */

import type { CanonConfig, Metadata } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { inferCanon } from './canon.js'
import { allOrNothing, canonRefFor, definitionRegistry, morphismRefFor, theoryRefFor } from './definitions.js'
import { metaOf, updateMeta } from './meta.js'
import { Morphism } from './morphism.js'
import { declareCanon, declareMorphism, declareTheory, registerCanons, registerMorphisms, registerTheories, resetRegistry } from './shell.js'
import { config as identityConfig } from './theories/identity.js'
import { config as taxonomyConfig } from './theories/taxonomy.js'
import { defineTheory, Theory } from './theory.js'

const rollbackArm = vi.hoisted(() => ({ value: false, errors: undefined as string[] | undefined, index: 0 }))

vi.mock('./meta.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./meta.js')>()
  return {
    ...actual,
    updateMeta: <T extends object, M extends Metadata = Metadata>(
      obj: T,
      updater: (metadata?: M) => M | undefined,
    ): T => {
      if (rollbackArm.value) {
        if (rollbackArm.errors !== undefined) {
          const message = rollbackArm.errors[rollbackArm.index]
          if (message !== undefined) {
            rollbackArm.index += 1
            if (rollbackArm.index >= rollbackArm.errors.length) {
              rollbackArm.value = false
            }
            throw new Error(message)
          }
        }
        rollbackArm.value = false
        throw new Error('restore failed')
      }
      return actual.updateMeta(obj, updater)
    },
  }
})

declare module '@relational-fabric/canon' {
  interface Canons {
    DeclaredCanon: Record<never, never>
  }
}

interface RegisteredCanon {
  axioms?: {
    Owner?: {
      models?: unknown
    }
  }
}

declare module '@relational-fabric/canon' {
  interface Theories {
    DeclaredTheory: Record<string, never>
    Fresh: Record<string, never>
    One: Record<string, never>
    A: Record<string, never>
    B: Record<string, never>
    C: Record<string, never>
    Other: Record<string, never>
    T: Record<string, never>
    TheoryConflict: Record<string, never>
    Two: Record<string, never>
  }
}

describe('shell', () => {
  beforeEach(() => {
    resetRegistry()
  })

  afterEach(() => {
    // Just clear - isolated tests don't need full restoration
    resetRegistry()
    rollbackArm.value = false
    rollbackArm.errors = undefined
    rollbackArm.index = 0
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
      expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)

      resetRegistry()
      declareTheory('Identity', identityConfig)
      declareCanon('DeclaredCanon', byRef)

      expect(canonRefFor('DeclaredCanon').value).toBe(byRef)
      expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
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

      const models = (canonRefFor('DeclaredCanon').value as RegisteredCanon | undefined)?.axioms?.Owner?.models
      expect(Array.isArray(models) ? models : []).toEqual(['Identity'])
      expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
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
      expect(ref.value).toBeInstanceOf(Theory)
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
      const first = declareTheory('TheoryConflict', {}).value

      expect(() => declareTheory('TheoryConflict', { extends: [] }))
        .toThrow('Definition already registered: canon://theory/TheoryConflict (ADR-0017)')

      expect(theoryRefFor('TheoryConflict').value).toBe(first)
    })

    it('clears declared theories when the registry is reset', () => {
      declareTheory('DeclaredTheory', {})

      expect(theoryRefFor('DeclaredTheory').value).toBeDefined()

      resetRegistry()

      expect(theoryRefFor('DeclaredTheory').value).toBeUndefined()
    })
  })

  describe('declareMorphism', () => {
    const morphismConfig = { maps: { Id: 'Type' } } as const

    beforeEach(() => {
      declareTheory('Identity', identityConfig)
      declareTheory('Taxonomy', taxonomyConfig)
    })

    it('returns a ref at canon://morphism/Identity/Taxonomy with the declared config', () => {
      const ref = declareMorphism('Identity', 'Taxonomy', morphismConfig)

      expect(ref.key).toBe('canon://morphism/Identity/Taxonomy')
      expect(ref.value).toBeInstanceOf(Morphism)
      expect((ref.value as Morphism).maps).toEqual(morphismConfig.maps)
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
      const first = declareMorphism('Identity', 'Taxonomy', morphismConfig).value

      // @ts-expect-error runtime guard test, map names a wrong target term for this pair
      expect(() => declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Id' } } as const))
        .toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(first)
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
    const morphismConfig = { maps: { Id: 'Type' } } as const

    beforeEach(() => {
      declareTheory('Identity', identityConfig)
      declareTheory('Taxonomy', taxonomyConfig)
    })

    it('records only canon://morphism/Identity/Taxonomy on the registered value', () => {
      registerMorphisms({ 'Identity/Taxonomy': morphismConfig })

      const registered = morphismRefFor('Identity', 'Taxonomy').value
      expect(registered).toBeInstanceOf(Morphism)
      expect((registered as Morphism).maps).toEqual(morphismConfig.maps)
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
      const first = morphismRefFor('Identity', 'Taxonomy').value

      // @ts-expect-error runtime guard test, map names a wrong target term for this pair
      expect(() => registerMorphisms({ 'Identity/Taxonomy': { maps: { Id: 'Id' } } as const }))
        .toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(first)
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

    it('stores nothing when one config object is used under two keys', () => {
      const shared = { maps: { Id: 'Type' } } as const

      expect(() => registerMorphisms({
        'Identity/Taxonomy': shared,
        // @ts-expect-error runtime guard test, map deliberately not complete for this pair
        'Taxonomy/Identity': shared,
      })).toThrow('Definition already registered: canon://morphism/Identity/Taxonomy')

      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeUndefined()
      expect(morphismRefFor('Taxonomy', 'Identity').value).toBeUndefined()
    })

    it('stores nothing new when a registered config is reused under another key', () => {
      const shared = declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } }).value as Morphism

      expect(() => registerMorphisms({
        // @ts-expect-error runtime guard test, map deliberately not complete for this pair
        'Taxonomy/Identity': shared,
      })).toThrow('Definition already registered: canon://morphism/Identity/Taxonomy')

      expect(morphismRefFor('Taxonomy', 'Identity').value).toBeUndefined()
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBeInstanceOf(Morphism)
    })

    it('stores nothing when a batch conflicts with an already registered morphism', () => {
      const registered = declareMorphism('Identity', 'Taxonomy', morphismConfig).value

      expect(() => registerMorphisms({
        'Taxonomy/Identity': { maps: { Type: 'Id' } } as const,
        // @ts-expect-error runtime guard test, map names a wrong target term for this pair
        'Identity/Taxonomy': { maps: { Id: 'Id' } } as const,
      })).toThrow('Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)')

      expect(morphismRefFor('Taxonomy', 'Identity').value).toBeUndefined()
      expect(morphismRefFor('Identity', 'Taxonomy').value).toBe(registered)
    })
  })

  describe('registerTheories', () => {
    it('records only canon://theory/X on the registered value', () => {
      const cfg = {}

      registerTheories({ X: cfg })

      const registered = theoryRefFor('X').value
      expect(registered).toBeInstanceOf(Theory)
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
      registerTheories({ X: {} })
      const first = theoryRefFor('X').value

      expect(() => registerTheories({ X: { extends: [] } }))
        .toThrow('Definition already registered: canon://theory/X (ADR-0017)')

      expect(theoryRefFor('X').value).toBe(first)
    })

    it('registers a map-form extends value and the theory that composes it', () => {
      registerTheories({ T: { extends: { Fresh: defineTheory({}) } } })

      expect(theoryRefFor('T').key).toBe('canon://theory/T')
      expect(theoryRefFor('Fresh').value).toBeDefined()
    })

    it('leaves a passed-in theory without terms when the batch fails', () => {
      const fresh = defineTheory({})

      expect(() => registerTheories({
        T: { extends: { Fresh: fresh } },
        Other: { extends: ['Missing'] },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(Object.hasOwn(fresh, 'terms')).toBe(false)
      expect(theoryRefFor('Fresh').value).toBeUndefined()
    })

    it('re-declares a map-form theory from the original config', () => {
      const fresh = defineTheory({})
      const config = { extends: { Fresh: fresh } }

      declareTheory('T', config)

      expect(() => declareTheory('T', config)).not.toThrow()
    })

    it('keeps the bound theory when a map key matches a registered label', () => {
      declareTheory('Identity', identityConfig)
      const bound = defineTheory({ terms: identityConfig.terms })

      declareTheory('T', { extends: { Identity: bound } })

      const registered = theoryRefFor('T').value as Theory
      const composition = registered.extends as Record<string, Theory>
      expect(composition.Identity).toBe(bound)
      expect(composition.Identity).not.toBe(theoryRefFor('Identity').value)
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
      expect(theoryRefFor('Fresh').value).toEqual(new Theory({ terms: {} }))
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
      expect(theoryRefFor('Fresh').value).toEqual(new Theory({ terms: {} }))
    })

    it('resolves a theory that extends another theory in the same call', () => {
      registerTheories({
        Child: { extends: ['Parent'] },
        Parent: {},
      })

      expect(theoryRefFor('Parent').key).toBe('canon://theory/Parent')
      expect(theoryRefFor('Child').key).toBe('canon://theory/Child')
      const parent = theoryRefFor('Parent').value
      expect(theoryRefFor('Child').value).toEqual(new Theory({ extends: [parent], terms: {} }))
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

      expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
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

      expect(theoryRefFor('Identity').value).toBeInstanceOf(Theory)
      expect(canonRefFor('X').value).toBeDefined()

      expect(() => registerCanons({ Z: { axioms: {}, models: ['Missing'] } }))
        .toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')
      expect(canonRefFor('Z').value).toBeUndefined()
    })

    it('stores nothing when a later canon conflicts with an existing registration', () => {
      registerCanons({ Later: { axioms: {} } })

      expect(() => registerCanons({
        Earlier: { axioms: {} },
        Later: {
          axioms: {
            Id: {
              $basis: (v: unknown): v is { id: string } => true,
              key: 'id',
            },
          },
        },
      })).toThrow('Definition already registered: canon://canon/Later (ADR-0017)')

      expect(canonRefFor('Earlier').value).toBeUndefined()
      expect(canonRefFor('Later').value).toEqual({ axioms: {} })
    })

    it('resolves a list-form models label supplied by a sibling map in the same batch', () => {
      const sibling = defineTheory({})

      registerCanons({
        Source: { axioms: {}, models: { Sibling: sibling } },
        User: { axioms: {}, models: ['Sibling'] },
      })

      expect(canonRefFor('Source').value).toBeDefined()
      expect(canonRefFor('User').value).toBeDefined()
      expect(theoryRefFor('Sibling').value).toBe(sibling)
    })

    it('stores nothing when a later canon has a missing models label', () => {
      expect(() => registerCanons({
        Earlier: { axioms: {}, models: { Fresh: defineTheory({}) } },
        Later: { axioms: {}, models: ['Missing'] },
      })).toThrow('Unresolved theory: canon://theory/Missing (ADR-0017)')

      expect(canonRefFor('Earlier').value).toBeUndefined()
      expect(canonRefFor('Later').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toBeUndefined()
    })

    it('stores nothing when a map-form models key conflicts with a registered value', () => {
      declareTheory('Fresh', {})

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {},
        models: { Fresh: defineTheory({ extends: [] }) },
      })).toThrow('Definition already registered: canon://theory/Fresh (ADR-0017)')

      expect(canonRefFor('DeclaredCanon').value).toBeUndefined()
      expect(theoryRefFor('Fresh').value).toEqual(new Theory({ terms: {} }))
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

  describe('all-or-nothing', () => {
    function uris(): string[] {
      return [...definitionRegistry.entries()].map(([uri]) => uri)
    }

    it('rolls back declareCanon when a different config follows a models map', () => {
      declareCanon('DeclaredCanon', { axioms: {} })
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: fresh },
      })).toThrow('Definition already registered: canon://canon/DeclaredCanon (ADR-0017)')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()
    })

    it('rolls back declareCanon when a models map reuses a value registered under another name', () => {
      const alias = defineTheory({})
      declareTheory('Other', alias)
      declareCanon('DeclaredCanon', { axioms: {} })
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: fresh, Alias: alias },
      })).toThrow('Definition already registered: canon://theory/Other')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()
      expect(metaOf(alias).uri).toBe('canon://theory/Other')
    })

    it('rolls back registerCanons when a later list has a ref map that is not last', () => {
      declareTheory('Identity', identityConfig)
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => registerCanons({
        Earlier: { axioms: {}, models: { Fresh: fresh } },
        Trailing: { axioms: {}, models: [{ Later: defineTheory({}) }, 'Identity'] },
      })).toThrow('A definition ref map is only allowed as the last item (ADR-0017)')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()
    })

    it('rolls back declareTheory when an existing label gains a map-form extends', () => {
      declareTheory('DeclaredTheory', {})
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => declareTheory('DeclaredTheory', { extends: { Fresh: fresh } }))
        .toThrow('Definition already registered: canon://theory/DeclaredTheory (ADR-0017)')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()
    })

    it('rolls back when Fresh and an already-registered Alias are provided together', () => {
      const alias = defineTheory({})
      declareTheory('Other', alias)
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => registerTheories({
        T: { extends: { Fresh: fresh, Alias: alias } },
      })).toThrow('Definition already registered: canon://theory/Other')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()

      const freshAgain = defineTheory({})
      const sizeAgain = definitionRegistry.size
      const keysAgain = uris()

      expect(() => declareTheory('T', { extends: { Fresh: freshAgain, Alias: alias } }))
        .toThrow('Definition already registered: canon://theory/Other')

      expect(definitionRegistry.size).toBe(sizeAgain)
      expect(uris()).toEqual(keysAgain)
      expect(metaOf(freshAgain).uri).toBeUndefined()
      expect(metaOf(alias).uri).toBe('canon://theory/Other')
    })

    it('rolls back registerTheories when a ref map is not the last list item', () => {
      declareTheory('Identity', identityConfig)
      const fresh = defineTheory({})
      const size = definitionRegistry.size
      const keys = uris()

      expect(() => registerTheories({
        T: { extends: [{ Fresh: fresh }, 'Identity'] },
      })).toThrow('A definition ref map is only allowed as the last item (ADR-0017)')

      expect(definitionRegistry.size).toBe(size)
      expect(uris()).toEqual(keys)
      expect(metaOf(fresh).uri).toBeUndefined()
    })

    it('leaves an equal-hash clone unstamped so it can be declared later', () => {
      const original = defineTheory({})
      declareTheory('Fresh', original)
      declareCanon('DeclaredCanon', { axioms: {} })
      const clone = defineTheory({})

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: clone },
      })).toThrow('Definition already registered: canon://canon/DeclaredCanon (ADR-0017)')

      expect(metaOf(clone).uri).toBeUndefined()
      expect(() => declareTheory('T', clone)).not.toThrow()
    })

    it('keeps one object under two URIs in the same order after a failing call', () => {
      const shared = defineTheory({})
      declareTheory('DeclaredTheory', {})
      declareTheory('One', shared)
      updateMeta(shared, (current) => {
        if (current === undefined) {
          return undefined
        }
        const next = { ...current }
        delete next.uri
        return Object.keys(next).length === 0 ? undefined : next
      })
      declareTheory('Two', shared)
      const keys = uris()

      expect(() => registerTheories({
        T: { extends: { Alias: shared } },
      })).toThrow('Definition already registered: canon://theory/Two')

      expect(uris()).toEqual(keys)
      expect(keys).toEqual([
        'canon://theory/DeclaredTheory',
        'canon://theory/One',
        'canon://theory/Two',
      ])
    })

    it('restores a uri that was not a live registry entry', () => {
      const value = defineTheory({})
      updateMeta(value, () => ({ uri: 'canon://theory/NotLive' }))
      declareCanon('DeclaredCanon', { axioms: {} })

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: value },
      })).toThrow('Definition already registered: canon://canon/DeclaredCanon (ADR-0017)')

      expect(metaOf(value).uri).toBe('canon://theory/NotLive')
    })

    it('restores a value that had no metadata to having none', () => {
      const value = defineTheory({})
      declareCanon('DeclaredCanon', { axioms: {} })
      let before: unknown
      updateMeta(value, (current) => {
        before = current
        return current
      })

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: value },
      })).toThrow('Definition already registered: canon://canon/DeclaredCanon (ADR-0017)')

      let after: unknown
      updateMeta(value, (current) => {
        after = current
        return current
      })
      expect(before).toBeUndefined()
      expect(after).toBeUndefined()
    })

    it('leaves metadata after resetRegistry unchanged by a later failing call', () => {
      const value = defineTheory({})
      declareTheory('Fresh', value)
      resetRegistry()
      expect(metaOf(value).uri).toBeUndefined()
      let afterReset: unknown
      updateMeta(value, (current) => {
        afterReset = current
        return current
      })
      declareCanon('DeclaredCanon', { axioms: {} })

      expect(() => declareCanon('DeclaredCanon', {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
        models: { Fresh: value },
      })).toThrow('Definition already registered: canon://canon/DeclaredCanon (ADR-0017)')

      let afterFail: unknown
      updateMeta(value, (current) => {
        afterFail = current
        return current
      })
      expect(afterFail).toEqual(afterReset)
    })

    it('does not keep Ghost when a caught inner declare runs from extends', () => {
      declareCanon('DeclaredCanon', { axioms: {} })
      const ghost = defineTheory({})
      const caught = {
        get extends(): undefined {
          try {
            declareCanon('DeclaredCanon', {
              axioms: {
                Id: {
                  $basis: (v: unknown): v is { id: string } => true,
                  key: 'id',
                },
              },
              models: { Ghost: ghost },
            })
          } catch {
            // The inner failure is caught inside the getter.
          }
          return undefined
        },
      }
      const failing = {
        get extends(): undefined {
          try {
            declareCanon('DeclaredCanon', {
              axioms: {
                Id: {
                  $basis: (v: unknown): v is { id: string } => true,
                  key: 'id',
                },
              },
              models: { Ghost: ghost },
            })
          } catch {
            // The inner failure is caught inside the getter.
          }
          throw new Error('outer fails')
        },
      }

      declareTheory('T', caught)
      expect(theoryRefFor('Ghost').value).toBeUndefined()
      expect(metaOf(ghost).uri).toBeUndefined()

      resetRegistry()
      declareCanon('DeclaredCanon', { axioms: {} })
      expect(() => declareTheory('T', failing)).toThrow('outer fails')
      expect(theoryRefFor('Ghost').value).toBeUndefined()
      expect(metaOf(ghost).uri).toBeUndefined()
    })

    it('commits the outer write after a caught inner failure rolls back', () => {
      declareCanon('DeclaredCanon', { axioms: {} })
      const ghost = defineTheory({})
      const outer = {
        get extends(): undefined {
          try {
            declareCanon('DeclaredCanon', {
              axioms: {
                Id: {
                  $basis: (v: unknown): v is { id: string } => true,
                  key: 'id',
                },
              },
              models: { Ghost: ghost },
            })
          } catch {
            // Caught inner failure.
          }
          return undefined
        },
      }

      declareTheory('T', outer)

      expect(theoryRefFor('Ghost').value).toBeUndefined()
      expect(metaOf(ghost).uri).toBeUndefined()
      expect(theoryRefFor('T').value).toBeInstanceOf(Theory)
      expect(metaOf(theoryRefFor('T').value as Theory).uri).toBe('canon://theory/T')
    })

    it('restores the outer stamp after an inner restamp, and the original metadata if the outer fails', () => {
      declareCanon('DeclaredCanon', { axioms: {} })
      const kept = defineTheory({})
      let keptReads = 0
      let outerStamp: Metadata | undefined
      registerTheories({
        Fresh: kept,
        Outer: {
          get extends() {
            keptReads += 1
            if (keptReads === 1) {
              return undefined
            }
            updateMeta(kept, (current) => {
              outerStamp = current
              return current
            })
            try {
              declareCanon('DeclaredCanon', {
                axioms: {
                  Id: {
                    $basis: (v: unknown): v is { id: string } => true,
                    key: 'id',
                  },
                },
                models: { Fresh: kept },
              })
            } catch {
              // Inner restamp of the outer value is rolled back.
            }
            return undefined
          },
        },
      })
      expect(metaOf(kept).uri).toBe('canon://theory/Fresh')
      let afterInner: Metadata | undefined
      updateMeta(kept, (current) => {
        afterInner = current
        return current
      })
      expect(afterInner).toBe(outerStamp)

      resetRegistry()
      declareCanon('DeclaredCanon', { axioms: {} })
      const reverted = defineTheory({})
      let revertedReads = 0
      expect(() => registerTheories({
        Fresh: reverted,
        Outer: {
          get extends() {
            revertedReads += 1
            if (revertedReads === 1) {
              return undefined
            }
            try {
              declareCanon('DeclaredCanon', {
                axioms: {
                  Id: {
                    $basis: (v: unknown): v is { id: string } => true,
                    key: 'id',
                  },
                },
                models: { Fresh: reverted },
              })
            } catch {
              // Inner restamp of the outer value is rolled back.
            }
            throw new Error('outer fails')
          },
        },
      })).toThrow('outer fails')
      let after: unknown
      updateMeta(reverted, (current) => {
        after = current
        return current
      })
      expect(after).toBeUndefined()
    })

    it('keeps symbol-only metadata when resetRegistry removes uri', () => {
      const mark = Symbol('mark')
      const value = defineTheory({})
      updateMeta(value, () => ({ [mark]: true }))
      declareTheory('Fresh', value)

      resetRegistry()

      let after: Metadata | undefined
      updateMeta(value, (current) => {
        after = current
        return current
      })
      expect(after?.[mark]).toBe(true)
      expect(after?.uri).toBeUndefined()
    })

    it('restores uri stamps stripped by a reset inside a caught nested call', () => {
      const kept = defineTheory({})
      declareTheory('Fresh', kept)
      const uri = metaOf(kept).uri
      const entriesBefore = [...definitionRegistry.entries()]
      const outer = {
        get extends(): undefined {
          try {
            allOrNothing(() => {
              resetRegistry()
              throw new Error('inner reset')
            })
          } catch {
            // The inner failure is caught inside the getter.
          }
          return undefined
        },
      }

      declareTheory('T', outer)

      for (const [key, value] of entriesBefore) {
        expect(definitionRegistry.value(key)).toBe(value)
      }
      expect(metaOf(kept).uri).toBe(uri)
      const registered = theoryRefFor('T').value
      expect(registered).toBeInstanceOf(Theory)
      expect(metaOf(registered as object).uri).toBe('canon://theory/T')
    })

    it('keeps the original error when a metadata restore throws', () => {
      const original = new Error('original failure')
      let thrown: unknown

      try {
        allOrNothing(() => {
          declareTheory('Other', defineTheory({}))
          rollbackArm.value = true
          throw original
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      const aggregate = thrown as AggregateError
      expect(aggregate.errors[0]).toBe(original)
      expect(aggregate.cause).toBe(original)
      expect(definitionRegistry.size).toBe(0)
      expect(theoryRefFor('Other').value).toBeUndefined()
      declareTheory('Other', defineTheory({}))
      expect(theoryRefFor('Other').value).toBeDefined()
    })

    it('surfaces a failed restore with the original error', () => {
      const a = defineTheory({})
      const b = defineTheory({})
      declareTheory('A', a)
      declareTheory('B', b)
      let thrown: unknown

      try {
        allOrNothing(() => {
          resetRegistry()
          rollbackArm.value = true
          throw new Error('boom')
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      const aggregate = thrown as AggregateError
      expect(aggregate.errors[0]).toMatchObject({ message: 'boom' })
      expect(aggregate.cause).toBe(aggregate.errors[0])
      expect(aggregate.errors).toHaveLength(2)
      expect(definitionRegistry.value(theoryRefFor('A').key)).toBe(a)
      expect(definitionRegistry.value(theoryRefFor('B').key)).toBe(b)
      expect(metaOf(a).uri).toBe('canon://theory/A')
      expect(metaOf(b).uri).toBeUndefined()
    })

    it('replays a failed inner restore when the outer savepoint fails', () => {
      const kept = defineTheory({})
      declareTheory('Fresh', kept)
      let innerError: unknown
      let outerError: unknown

      try {
        allOrNothing(() => {
          try {
            allOrNothing(() => {
              resetRegistry()
              rollbackArm.value = true
              throw new Error('inner')
            })
          } catch (error) {
            innerError = error
          }
          throw new Error('outer')
        })
      } catch (error) {
        outerError = error
      } finally {
        rollbackArm.value = false
      }

      expect(innerError).toBeInstanceOf(AggregateError)
      expect(outerError).toBeInstanceOf(Error)
      expect(outerError).not.toBeInstanceOf(AggregateError)
      expect(outerError).toMatchObject({ message: 'outer' })
      expect(definitionRegistry.value(theoryRefFor('Fresh').key)).toBe(kept)
      expect(metaOf(kept).uri).toBe('canon://theory/Fresh')
    })

    it('cannot commit while an inner rollback is incomplete', () => {
      const b = defineTheory({})
      declareTheory('B', b)
      let thrown: unknown

      try {
        declareTheory('T', {
          get extends() {
            try {
              allOrNothing(() => {
                resetRegistry()
                rollbackArm.value = true
                throw new Error('inner')
              })
            } catch {
              // The inner rollback failure is caught inside the getter.
            }
            return undefined
          },
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      expect(thrown).toMatchObject({ message: expect.stringContaining('cannot commit') })
      expect(theoryRefFor('T').value).toBeUndefined()
      expect(definitionRegistry.value(theoryRefFor('B').key)).toBe(b)
      expect(metaOf(b).uri).toBe('canon://theory/B')
      expect(() => declareTheory('A', b)).toThrow()
    })

    it('cannot commit reports every unrestored failure, in log order', () => {
      const b = defineTheory({})
      const c = defineTheory({})
      declareTheory('B', b)
      declareTheory('C', c)
      let thrown: unknown

      try {
        declareTheory('T', {
          get extends() {
            try {
              allOrNothing(() => {
                resetRegistry()
                rollbackArm.errors = ['e2', 'e1']
                rollbackArm.index = 0
                rollbackArm.value = true
                throw new Error('inner')
              })
            } catch {
              // The inner rollback failure is caught inside the getter.
            }
            return undefined
          },
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
        rollbackArm.errors = undefined
        rollbackArm.index = 0
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      const aggregate = thrown as AggregateError
      expect(aggregate.message).toContain('rollback incomplete')
      expect(aggregate.errors).toHaveLength(2)
      expect(aggregate.errors[0]).toMatchObject({ message: 'e1' })
      expect(aggregate.errors[1]).toMatchObject({ message: 'e2' })
      expect(aggregate.cause).toMatchObject({ message: 'e1' })
    })

    it('cannot commit when the outer write maps a fresh name to an unrestored object', () => {
      const b = defineTheory({})
      declareTheory('B', b)
      let reads = 0
      let thrown: unknown

      try {
        declareTheory('T', {
          get extends() {
            reads += 1
            if (reads === 1) {
              try {
                allOrNothing(() => {
                  resetRegistry()
                  rollbackArm.value = true
                  throw new Error('inner')
                })
              } catch {
                // The inner rollback failure is caught inside the getter.
              }
            }
            return { A: b }
          },
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      expect(thrown).toMatchObject({
        message: expect.stringContaining('cannot commit'),
        cause: { message: 'restore failed' },
      })
      expect(theoryRefFor('A').value).toBeUndefined()
      expect(theoryRefFor('T').value).toBeUndefined()
      expect(definitionRegistry.value(theoryRefFor('B').key)).toBe(b)
      expect(metaOf(b).uri).toBe('canon://theory/B')
    })

    it('cannot commit after a second reset hides an unrestored stamp', () => {
      const b = defineTheory({})
      const other = defineTheory({ extends: [] })
      declareTheory('B', b)
      let thrown: unknown

      try {
        declareTheory('T', {
          get extends() {
            try {
              allOrNothing(() => {
                resetRegistry()
                rollbackArm.value = true
                throw new Error('inner')
              })
            } catch {
              // The inner rollback failure is caught inside the getter.
            }
            resetRegistry()
            return undefined
          },
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      expect(thrown).toMatchObject({
        message: expect.stringContaining('cannot commit'),
        cause: { message: 'restore failed' },
      })
      expect(theoryRefFor('T').value).toBeUndefined()
      expect(definitionRegistry.value(theoryRefFor('B').key)).toBe(b)
      expect(metaOf(b).uri).toBe('canon://theory/B')
      expect(() => declareTheory('B', other)).toThrow()
    })

    it('a parent cannot commit when the cannot-commit replay is itself incomplete', () => {
      const b = defineTheory({})
      declareTheory('B', b)
      let thrown: unknown

      try {
        allOrNothing(() => {
          try {
            allOrNothing(() => {
              try {
                allOrNothing(() => {
                  resetRegistry()
                  rollbackArm.value = true
                  throw new Error('inner')
                })
              } catch {
                // The inner rollback failure is caught inside the middle frame.
              }
              rollbackArm.value = true
              return 'middle'
            })
          } catch {
            // The middle cannot-commit replay is incomplete.
          }
          return 'outer'
        })
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(AggregateError)
      expect(thrown).toMatchObject({ message: expect.stringContaining('cannot commit') })
      expect(definitionRegistry.value(theoryRefFor('B').key)).toBe(b)
      expect(metaOf(b).uri).toBe('canon://theory/B')
    })

    it('rethrows the original error when an outer replay repairs an incomplete rollback', () => {
      const kept = defineTheory({})
      declareTheory('Fresh', kept)
      let thrown: unknown

      try {
        allOrNothing(() => allOrNothing(() => {
          resetRegistry()
          rollbackArm.value = true
          throw new Error('inner')
        }))
      } catch (error) {
        thrown = error
      } finally {
        rollbackArm.value = false
      }

      expect(thrown).toBeInstanceOf(Error)
      expect(thrown).not.toBeInstanceOf(AggregateError)
      expect(thrown).toMatchObject({ message: 'inner' })
      expect(metaOf(kept).uri).toBe('canon://theory/Fresh')
    })
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
