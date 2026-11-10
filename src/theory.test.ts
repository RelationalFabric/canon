/**
 * Tests for nameless defineTheory
 */

import { describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri } from './definitions.js'
import { metaOf } from './meta.js'
import { defineTheory } from './theory.js'

describe('defineTheory', () => {
  it('returns the same object', () => {
    const config = {}

    expect(defineTheory(config)).toBe(config)
  })

  it('does not register a theory', () => {
    definitionRegistry.clear()

    defineTheory({})

    expect(definitionRegistry.has(definitionUri('theory', 'Identity'))).toBe(false)
  })

  it('does not write a uri', () => {
    const config = {}

    defineTheory(config)

    expect(metaOf(config).uri).toBeUndefined()
  })
})
