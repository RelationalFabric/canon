import Immutable from '@relational-fabric/canon/_/immutable'
import { describe, expect, it } from 'vitest'

describe('transparent immutable export', () => {
  it('provides persistent data structure constructors', () => {
    expect(typeof Immutable.Map).toBe('function')
    const map = Immutable.Map({ foo: 'bar' })
    expect(map.get('foo')).toBe('bar')
  })

  it('exposes List factory', () => {
    expect(typeof Immutable.List).toBe('function')
    const list = Immutable.List([1, 2, 3])
    expect(list.size).toBe(3)
  })
})
