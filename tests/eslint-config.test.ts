import { createEslintConfig } from '@relational-fabric/canon'
import { describe, expect, it } from 'vitest'

describe('kit eslint export', () => {
  it('creates an ESLint configuration object', async () => {
    const config = await createEslintConfig()
    expect(Array.isArray(config)).toBe(true)
    expect(config.length).toBeGreaterThan(0)
    expect(config[0]).toHaveProperty('name')
  })
})
