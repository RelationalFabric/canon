import type { SelectionOptions } from './types/lazy-module.js'
import { describe, expect, it } from 'vitest'
import { CapabilityScores, createLazyModule } from './lazy-module.js'

type SimpleFn = (x: number) => number
interface SimpleOpts extends SelectionOptions { mode?: 'fast' | 'slow' }

describe('lazy Module Pattern', () => {
  describe('createLazyModule', () => {
    it('should create a module with fallback', () => {
      const { module } = createLazyModule<SimpleFn>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      expect(module(5)).toBe(10)
    })

    it('should select fallback by default', () => {
      const { module } = createLazyModule<SimpleFn>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      const selection = module.getDefault()
      expect(selection.name).toBe('$fallback')
      expect(selection.score).toBe(CapabilityScores.FALLBACK)
    })

    it('should prefer higher-scoring implementations', () => {
      const { module, register } = createLazyModule<SimpleFn>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      register({
        name: 'better',
        supports: () => 0.5,
        implementation: () => x => x * 3,
      })

      expect(module(5)).toBe(15)
      expect(module.getDefault().name).toBe('better')
      expect(module.getDefault().score).toBe(0.5)
    })

    it('should support option-based selection', () => {
      const { module, register } = createLazyModule<SimpleFn, SimpleOpts>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      register({
        name: 'fast',
        supports: opts => opts?.mode === 'fast' ? 1.0 : undefined,
        implementation: () => x => x * 10,
      })

      register({
        name: 'slow',
        supports: opts => opts?.mode === 'slow' ? 1.0 : undefined,
        implementation: () => x => x * 1,
      })

      // Default uses fallback (no mode specified)
      expect(module(5)).toBe(10)

      // Select specific mode
      const fastFn = module.select({ mode: 'fast' })
      expect(fastFn(5)).toBe(50)

      const slowFn = module.select({ mode: 'slow' })
      expect(slowFn(5)).toBe(5)
    })

    it('should memoize selections', () => {
      const { module, register } = createLazyModule<SimpleFn, SimpleOpts>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      let callCount = 0
      register({
        name: 'counted',
        supports: () => 1.0,
        implementation: () => {
          callCount++
          return x => x * 3
        },
      })

      // First call loads implementation
      module(5)
      expect(callCount).toBe(1)

      // Second call uses cached
      module(5)
      expect(callCount).toBe(1)
    })

    it('should list implementations', () => {
      const { module, register } = createLazyModule<SimpleFn>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      register({
        name: 'impl1',
        supports: () => 0.5,
        implementation: () => x => x,
      })

      const impls = module.getImplementations()
      expect(impls.map(i => i.name)).toContain('$fallback')
      expect(impls.map(i => i.name)).toContain('impl1')
    })

    it('should clear cache when new implementation registered', () => {
      const { module, register } = createLazyModule<SimpleFn>({
        name: 'test',
        fallback: () => x => x * 2,
      })

      // Initial call uses fallback
      expect(module(5)).toBe(10)
      expect(module.getDefault().name).toBe('$fallback')

      // Register better implementation
      register({
        name: 'better',
        supports: () => 0.5,
        implementation: () => x => x * 5,
      })

      // Now uses better implementation
      expect(module(5)).toBe(25)
      expect(module.getDefault().name).toBe('better')
    })
  })

  describe('capabilityScores', () => {
    it('should have correct score values', () => {
      expect(CapabilityScores.UNSUPPORTED).toBe(undefined)
      expect(CapabilityScores.RISKY).toBe(-1.0)
      expect(CapabilityScores.FALLBACK).toBe(-0.1)
      expect(CapabilityScores.BASELINE).toBe(0.0)
      expect(CapabilityScores.GOOD).toBe(0.5)
      expect(CapabilityScores.OPTIMAL).toBe(1.0)
    })

    it('should order correctly for selection', () => {
      // Explicit array of numeric scores (excludes UNSUPPORTED which is undefined)
      const scores: number[] = [
        CapabilityScores.RISKY as number,
        CapabilityScores.FALLBACK as number,
        CapabilityScores.BASELINE as number,
        CapabilityScores.GOOD as number,
        CapabilityScores.OPTIMAL as number,
      ]

      // Verify scores are in ascending order
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeGreaterThan(scores[i - 1])
      }
    })
  })
})
