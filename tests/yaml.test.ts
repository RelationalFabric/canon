import { describe, expect, it } from 'vitest'

import * as yaml from '@relational-fabric/canon/_/yaml'

describe('Transparent yaml export', () => {
  it('provides parse function', () => {
    expect(typeof yaml.parse).toBe('function')
    expect(yaml.parse('foo: bar')).toEqual({ foo: 'bar' })
  })

  it('provides stringify function', () => {
    expect(typeof yaml.stringify).toBe('function')
    const output = yaml.stringify({ foo: 'bar' })
    expect(output).toContain('foo: bar')
  })
})
