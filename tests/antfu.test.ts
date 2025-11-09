import { describe, expect, it } from 'vitest'

import antfu from '@relational-fabric/canon/_/antfu'

describe('Transparent antfu export', () => {
  it('exposes antfu configuration factory', () => {
    expect(typeof antfu).toBe('function')
    const config = antfu()
    expect(config).toBeTypeOf('object')
  })
})
