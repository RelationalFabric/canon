import {
  defu,
  fsExtra,
  hygenRunner,
  Immutable,
  objectHash,
  oclifRun,
  parseJsonWithComments,
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

  it('exposes oclif run helper', () => {
    expect(typeof oclifRun).toBe('function')
  })

  it('exposes hygen runner', () => {
    expect(typeof hygenRunner).toBe('function')
  })

  it('exposes fs-extra utilities', () => {
    expect(typeof fsExtra.pathExists).toBe('function')
  })

  it('exposes jsonc parser helpers', () => {
    expect(typeof parseJsonWithComments).toBe('function')
  })
})
