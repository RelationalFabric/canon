/**
 * Tests for definition URIs and the shared definition registry
 */

import { describe, expect, it } from 'vitest'
import { DefinitionRegistry, definitionUri, lexiconTermUri } from './definitions.js'
import { metaOf } from './meta.js'

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

  it('keeps the original value when a structurally equal object is registered again', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')
    const original = { name: 'Identity' }
    const duplicate = { name: 'Identity' }

    registry.register(uri, original)
    registry.register(uri, duplicate)

    expect(registry.get(uri)).toBe(original)
    expect(metaOf(duplicate).uri).toBe(uri)
  })

  it('throws when a different object is registered at the same uri', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')
    registry.register(uri, { name: 'Identity' })

    expect(() => registry.register(uri, { name: 'Other' })).toThrow(
      `Definition already registered: ${uri} (ADR-0017)`,
    )
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

  it('records the registered uri on the value', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')
    const value = { name: 'Identity' }

    registry.register(uri, value)

    expect(metaOf(value).uri).toBe(uri)
  })

  it('leaves an unregistered value without a uri in metadata', () => {
    const value = { name: 'Identity' }

    expect(metaOf(value).uri).toBeUndefined()
  })

  it('throws when the same value is registered under a second uri', () => {
    const registry = new DefinitionRegistry()
    const value = { name: 'Identity' }
    const first = definitionUri('theory', 'Identity')
    const second = definitionUri('theory', 'Other')

    registry.register(first, value)

    expect(() => registry.register(second, value)).toThrow(`Definition already registered: ${first}`)
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
