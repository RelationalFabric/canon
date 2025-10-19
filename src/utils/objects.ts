/**
 * Object utilities for Canon
 *
 * Minimal helpers for working with plain JavaScript objects.
 */

import type { Pojo } from '../types/objects.js'

/**
 * Re-export Pojo type for convenience
 */
export type { Pojo }

/**
 * Type guard to check if a value is a plain JavaScript object
 *
 * @param value - The value to check
 * @returns True if the value is a Pojo, false otherwise
 *
 * @example
 * ```typescript
 * isPojo({ id: '123' }) // true
 * isPojo([1, 2, 3]) // false
 * isPojo(null) // false
 * isPojo('string') // false
 * ```
 */
export function isPojo(value: unknown): value is Pojo {
  return (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype
  )
}

// In-source tests
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('isPojo', () => {
    it('should return true for plain objects', () => {
      expect(isPojo({})).toBe(true)
      expect(isPojo({ id: '123' })).toBe(true)
      expect(isPojo({ nested: { value: 1 } })).toBe(true)
    })

    it('should return false for arrays', () => {
      expect(isPojo([])).toBe(false)
      expect(isPojo([1, 2, 3])).toBe(false)
    })

    it('should return false for null', () => {
      expect(isPojo(null)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isPojo('string')).toBe(false)
      expect(isPojo(123)).toBe(false)
      expect(isPojo(true)).toBe(false)
      expect(isPojo(undefined)).toBe(false)
    })

    it('should return false for class instances', () => {
      class MyClass {}
      expect(isPojo(new MyClass())).toBe(false)
      expect(isPojo(new Date())).toBe(false)
      expect(isPojo(new Map())).toBe(false)
    })

    it('should return false for objects with custom prototypes', () => {
      const customProto = Object.create({ custom: true })
      expect(isPojo(customProto)).toBe(false)
    })
  })
}
