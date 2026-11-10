/**
 * Tests for nameless defineMorphism
 */

import type { Expect } from './testing.js'
import type { Theories } from './types/index.js'
import { describe, expect, it } from 'vitest'
import { definitionRegistry, definitionUri } from './definitions.js'
import { metaOf } from './meta.js'
import { defineMorphism } from './morphism.js'
import { invariant } from './testing.js'

type IdentityToTaxonomy = {
  [Source in keyof Theories['Identity']]: keyof Theories['Taxonomy']
}

invariant<Expect<{ Id: 'Type' }, IdentityToTaxonomy>>()

// @ts-expect-error a complete morphism maps every Identity key
invariant<Expect<Record<string, never>, IdentityToTaxonomy>>()

// @ts-expect-error Id must map to a Taxonomy key
invariant<Expect<'Nope', keyof Theories['Taxonomy']>>()

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
