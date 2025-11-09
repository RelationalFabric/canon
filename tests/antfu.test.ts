import antfu from '@relational-fabric/canon/_/antfu'
import { describe, expect, it } from 'vitest'

describe('transparent antfu export', () => {
  it('exposes antfu configuration factory', () => {
    expect(typeof antfu).toBe('function')
    const config = antfu()
    expect(config).toBeTypeOf('object')
  })
})
