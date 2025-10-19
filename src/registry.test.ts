/**
 * Tests for canon registry
 */

import type { CanonConfig } from './types/index.js'
import { describe, expect, it } from 'vitest'
import { createRegistry, Registry } from './registry.js'

describe('registry', () => {
  describe('register', () => {
    it('should register a canon', () => {
      const registry = new Registry()
      const config: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v: unknown): v is { id: string } => true,
            key: 'id',
          },
        },
      }

      registry.register('TestCanon' as any, config)

      expect(registry.has('TestCanon')).toBe(true)
      expect(registry.get('TestCanon')).toBe(config)
    })
  })

  describe('size', () => {
    it('should return number of registered canons', () => {
      const registry = new Registry()
      expect(registry.size).toBe(0)

      registry.register('Canon1' as any, { axioms: {} })
      expect(registry.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all canons', () => {
      const registry = new Registry()
      registry.register('Canon1' as any, { axioms: {} })
      expect(registry.size).toBe(1)

      registry.clear()
      expect(registry.size).toBe(0)
    })
  })
})

describe('createRegistry', () => {
  it('should create an empty registry', () => {
    const registry = createRegistry()
    expect(registry).toBeInstanceOf(Registry)
    expect(registry.size).toBe(0)
  })
})
