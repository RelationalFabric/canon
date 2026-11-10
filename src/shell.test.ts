/**
 * Tests for global shell
 */

import type { CanonConfig } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inferCanon } from './canon.js'
import { canonRefFor, theoryRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { declareCanon, declareTheory, registerCanons, registerTheories, resetRegistry } from './shell.js'
import { config as identityConfig } from './theories/identity.js'

declare module './types/canons.js' {
  interface Canons {
    DeclaredCanon: Record<string, never>
  }
}

declare module './types/theories.js' {
  interface Theories {
    DeclaredTheory: Record<string, never>
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

    it('resolves a theory that extends another theory in the same call', () => {
      registerTheories({
        Child: { extends: ['Parent'] },
        Parent: {},
      })

      expect(theoryRefFor('Parent').key).toBe('canon://theory/Parent')
      expect(theoryRefFor('Child').key).toBe('canon://theory/Child')
      expect(theoryRefFor('Child').value).toEqual({ extends: ['Parent'] })
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
