/**
 * Tests for nameless defineMorphism
 */

import { describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri } from './definitions.js'
import { metaOf } from './meta.js'
import { defineMorphism } from './morphism.js'

describe('defineMorphism', () => {
  it('returns the same object', () => {
    const config = { maps: { Id: 'Id' } }

    expect(defineMorphism(config)).toBe(config)
  })

  it('does not register a morphism', () => {
    definitionRegistry.clear()

    defineMorphism({ maps: { Id: 'Id' } })

    expect(definitionRegistry.has(definitionUri('morphism', 'Identity/Taxonomy'))).toBe(false)
  })

  it('does not write a uri', () => {
    const config = { maps: { Id: 'Id' } }

    defineMorphism(config)

    expect(metaOf(config).uri).toBeUndefined()
  })
})
