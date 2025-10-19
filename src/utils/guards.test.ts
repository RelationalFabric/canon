/**
 * Tests for type guard utilities
 */

import { describe, expect, it } from 'vitest'
import { typeGuard } from './guards.js'

describe('typeGuard', () => {
  it('should convert predicate to TypeGuard', () => {
    const isString = typeGuard<string>((v: unknown) => typeof v === 'string')

    expect(isString('hello')).toBe(true)
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
  })

  it('should work with complex predicates', () => {
    const hasId = typeGuard<{ id: string }>((v: unknown) =>
      typeof v === 'object'
      && v !== null
      && 'id' in v
      && typeof (v as any).id === 'string',
    )

    expect(hasId({ id: '123' })).toBe(true)
    expect(hasId({ name: 'test' })).toBe(false)
    expect(hasId(null)).toBe(false)
  })
})
