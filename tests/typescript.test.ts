import tsconfig, { tsconfig as namedTsconfig } from '@relational-fabric/canon/_/typescript'

import { describe, expect, it } from 'vitest'

describe('transparent TypeScript config export', () => {
  it('exposes the default tsconfig', () => {
    expect(tsconfig).toBeTypeOf('object')
    expect(tsconfig.compilerOptions).toBeDefined()
  })

  it('provides a named tsconfig export', () => {
    expect(namedTsconfig).toStrictEqual(tsconfig)
  })
})
