/**
 * Tests for global shell
 */

import type { CanonConfig } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { metaOf } from './meta.js'
import { Registry } from './registry.js'
import { declareCanon, getRegistry, registerCanons, resetRegistry } from './shell.js'

describe('shell', () => {
  beforeEach(() => {
    resetRegistry()
  })

  afterEach(() => {
    // Just clear - isolated tests don't need full restoration
    resetRegistry()
  })

  describe('getRegistry', () => {
    it('should return the global registry', () => {
      const registry = getRegistry()
      expect(registry).toBeInstanceOf(Registry)
    })
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
      expect(getRegistry().size).toBe(1)

      resetRegistry()
      expect(getRegistry().size).toBe(0)
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

      expect(getRegistry().has('TestCanon')).toBe(true)
      expect(getRegistry().get('TestCanon')).toBe(config)
    })
  })

  describe('registerCanons', () => {
    it('records canon://canon/X on the registered value', () => {
      const cfg: CanonConfig = { axioms: {} }

      registerCanons({ X: cfg })

      const registered = getRegistry().get('X')
      expect(registered).toBeDefined()
      if (registered) {
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

      expect(getRegistry().get('X')).toBe(original)
    })
  })
})
