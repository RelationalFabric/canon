import { createEslintConfig, defu, Immutable, objectHash, parseYaml } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'

describe('canon kit exports', () => {
  it('exposes createEslintConfig as a function', async () => {
    expect(typeof createEslintConfig).toBe('function')
    const config = await createEslintConfig()
    expect(Array.isArray(config)).toBe(true)
    expect(config.length).toBeGreaterThan(0)
  })

  it('re-exports defu as a function', () => {
    expect(typeof defu).toBe('function')
    const merged = defu({ foo: 1 }, { foo: 2 })
    expect(merged.foo).toBe(1)
  })

  it('re-exports objectHash default export', () => {
    expect(typeof objectHash).toBe('function')
    const hash = objectHash({ foo: 'bar' })
    expect(hash).toBeTypeOf('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('exposes Immutable namespace', () => {
    expect(typeof Immutable).toBe('object')
    expect(typeof Immutable.Map).toBe('function')
    const map = Immutable.Map({ foo: 'bar' })
    expect(map.get('foo')).toBe('bar')
  })

  it('aliases yaml.parse as parseYaml', () => {
    expect(typeof parseYaml).toBe('function')
    const result = parseYaml('foo: bar')
    expect(result).toEqual({ foo: 'bar' })
  })
})
