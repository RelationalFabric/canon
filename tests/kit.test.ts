import {
  Consola,
  defu,
  Files,
  Hygen,
  Immutable,
  Jsonc,
  objectHash,
  Oclif,
  Parse,
  parseYaml,
} from '@relational-fabric/canon'
import createEslintConfig from '@relational-fabric/canon/eslint'
import { describe, expect, it } from 'vitest'

describe('canon kit exports', () => {
  it('exposes createEslintConfig via eslint entry', () => {
    expect(typeof createEslintConfig).toBe('function')
    const config = createEslintConfig()
    expect(config).toBeTypeOf('object')
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

  it('provides grouped Oclif helpers', () => {
    expect(typeof Oclif.run).toBe('function')
    expect(typeof Oclif.flush).toBe('function')
  })

  it('exposes Hygen utilities', () => {
    expect(typeof Hygen.runner).toBe('function')
    expect(typeof Hygen.Logger).toBe('function')
  })

  it('exposes filesystem helpers', () => {
    expect(typeof Files.pathExists).toBe('function')
  })

  it('groups parse helpers', () => {
    expect(typeof Parse.yaml).toBe('function')
    expect(typeof Jsonc.parse).toBe('function')
    expect(typeof Jsonc.modify).toBe('function')
  })

  it('exposes Consola logger', () => {
    expect(typeof Consola.log).toBe('function')
    expect(typeof Consola.info).toBe('function')
  })
})
