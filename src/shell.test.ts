/**
 * Tests for global shell
 */

import type { CanonConfig } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { canonRefFor } from './definitions.js'
import { metaOf } from './meta.js'
import { declareCanon, registerCanons, resetRegistry } from './shell.js'

declare module './types/canons.js' {
  interface Canons {
    DeclaredCanon: Record<string, never>
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
      expect(canonRefFor('TestCanon').resolve()).toBe(config)

      resetRegistry()
      expect(canonRefFor('TestCanon').resolve()).toBeUndefined()
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

      expect(canonRefFor('TestCanon').resolve()).toBe(config)
    })

    it('returns a ref that resolves to the declared canon', () => {
      const config: CanonConfig = { axioms: {} }

      const ref = declareCanon('DeclaredCanon', config)

      expect(ref.key).toBe('canon://canon/DeclaredCanon')
      expect(ref.resolve()).toBe(config)
    })
  })

  describe('registerCanons', () => {
    it('records canon://canon/X on the registered value', () => {
      const cfg: CanonConfig = { axioms: {} }

      registerCanons({ X: cfg })

      const registered = canonRefFor('X').resolve()
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

      expect(canonRefFor('X').resolve()).toBe(original)
    })
  })
})

function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
