/**
 * Tests for definition URIs and the shared definition registry
 */

import { describe, expect, it } from 'vitest'
import { DefinitionRegistry, definitionUri, lexiconTermUri } from './definitions.js'

describe('definitionUri', () => {
  it('builds canon://theory/Identity', () => {
    expect(definitionUri('theory', 'Identity')).toBe('canon://theory/Identity')
  })

  it('throws when the name is empty', () => {
    expect(() => definitionUri('theory', '')).toThrow(Error)
  })
})

describe('lexiconTermUri', () => {
  it('builds canon://lexicon/default/User', () => {
    expect(lexiconTermUri('User')).toBe('canon://lexicon/default/User')
  })

  it('builds a term in a named lexicon', () => {
    expect(lexiconTermUri('other', 'User')).toBe('canon://lexicon/other/User')
  })
})

describe('definition registry', () => {
  it('registers a value and reports it through get, has, and size', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')

    registry.register(uri, { name: 'Identity' })

    expect(registry.has(uri)).toBe(true)
    expect(registry.get(uri)).toEqual({ name: 'Identity' })
    expect(registry.size).toBe(1)
  })

  it('throws when the same URI is registered twice and the message includes the URI', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('axiom', 'Id')
    registry.register(uri, 1)

    expect(() => registry.register(uri, 2)).toThrow(uri)
  })

  it('entries(\'theory\') returns only theory entries', () => {
    const registry = new DefinitionRegistry()
    const theory = definitionUri('theory', 'Identity')
    const axiom = definitionUri('axiom', 'Id')
    registry.register(theory, 'theory')
    registry.register(axiom, 'axiom')

    expect([...registry.entries('theory')]).toEqual([[theory, 'theory']])
  })

  it('entries() returns all entries', () => {
    const registry = new DefinitionRegistry()
    const theory = definitionUri('theory', 'Identity')
    const term = lexiconTermUri('User')
    registry.register(theory, 'theory')
    registry.register(term, 'user')

    expect([...registry.entries()]).toEqual([
      [theory, 'theory'],
      [term, 'user'],
    ])
  })

  it('clear empties the registry', () => {
    const registry = new DefinitionRegistry()
    registry.register(definitionUri('canon', 'Core'), {})
    expect(registry.size).toBe(1)

    registry.clear()

    expect(registry.size).toBe(0)
    expect([...registry.entries()]).toEqual([])
  })
})
