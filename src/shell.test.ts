/**
 * Tests for global shell
 */

import type { CanonConfig } from './types/index.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Registry } from './registry.js'
import { declareCanon, getRegistry, resetRegistry } from './shell.js'

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
})
