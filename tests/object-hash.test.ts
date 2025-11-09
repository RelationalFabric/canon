import { describe, expect, it } from 'vitest'

import objectHash, { sha1 as objectHashSha1 } from '@relational-fabric/canon/_/object-hash'

describe('Transparent object-hash export', () => {
  it('exposes default hash function', () => {
    expect(typeof objectHash).toBe('function')
    const hash = objectHash({ foo: 'bar' })
    expect(hash).toBeTypeOf('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('exposes named exports like sha1', () => {
    expect(typeof objectHashSha1).toBe('function')
    const hash = objectHashSha1('canon')
    expect(hash).toBeTypeOf('string')
  })
})
