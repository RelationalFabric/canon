import { defu } from '@relational-fabric/canon/_/defu'
import { describe, expect, it } from 'vitest'

describe('transparent defu export', () => {
  it('merges objects using defu', () => {
    expect(typeof defu).toBe('function')
    const result = defu({ foo: 1 }, { bar: 2 })
    expect(result).toEqual({ foo: 1, bar: 2 })
  })
})
