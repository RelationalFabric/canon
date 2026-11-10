/**
 * Tests for definition URIs and the shared definition registry
 */

import { describe, expect, it } from 'vitest'
import { DefinitionRegistry, definitionRegistry, definitionUri, lexiconTermUri, morphismRefFor, theoryRefFor } from './definitions.js'
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

describe('refs', () => {
  it('resolves undefined before registration and the value after', () => {
    definitionRegistry.clear()
    try {
      const ref = theoryRefFor('Identity')
      const value = { name: 'Identity' }

      expect(ref.value).toBeUndefined()
      definitionRegistry.register(ref.key, value)
      expect(ref.value).toBe(value)
    } finally {
      definitionRegistry.clear()
    }
  })

  it('builds canon://morphism/A/B', () => {
    expect(morphismRefFor('A', 'B').key).toBe('canon://morphism/A/B')
  })
})

describe('definition registry', () => {
  it('registers a value and reports it through value, has, and size', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')

    registry.register(uri, { name: 'Identity' })

    expect(registry.has(uri)).toBe(true)
    expect(registry.value(uri)).toEqual({ name: 'Identity' })
    expect(registry.size).toBe(1)
  })

  it('keeps the original value when a structurally equal object is registered again', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')
    const original = { name: 'Identity' }
    const duplicate = { name: 'Identity' }

    registry.register(uri, original)
    registry.register(uri, duplicate)

    expect(registry.value(uri)).toBe(original)
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

  it('registers the same object under a new name after clear', () => {
    const registry = new DefinitionRegistry()
    const value = { name: 'Identity' }
    const first = definitionUri('theory', 'Identity')
    const second = definitionUri('theory', 'Other')

    registry.register(first, value)
    registry.clear()
    registry.register(second, value)

    expect(registry.has(first)).toBe(false)
    expect(registry.value(second)).toBe(value)
    expect(metaOf(value).uri).toBe(second)
  })

  it('lets a different object take a uri freed by clear', () => {
    const registry = new DefinitionRegistry()
    const uri = definitionUri('theory', 'Identity')
    const original = { name: 'Identity' }
    const replacement = { name: 'Replacement' }

    registry.register(uri, original)
    registry.clear()
    registry.register(uri, replacement)

    expect(registry.value(uri)).toBe(replacement)
    expect(metaOf(replacement).uri).toBe(uri)
    expect(metaOf(original).uri).toBe(uri)
  })

  describe('resolve', () => {
    it('registers and returns a map of definitions in key order', () => {
      const registry = new DefinitionRegistry()
      const identity = { name: 'Identity' }
      const taxonomy = { name: 'Taxonomy' }

      expect(registry.resolve('theory', { Identity: identity, Taxonomy: taxonomy })).toEqual([
        { uri: 'canon://theory/Identity', value: identity },
        { uri: 'canon://theory/Taxonomy', value: taxonomy },
      ])
    })

    it('resolves a list of names to registered values', () => {
      const registry = new DefinitionRegistry()
      const identity = { name: 'Identity' }
      const taxonomy = { name: 'Taxonomy' }
      registry.register(definitionUri('theory', 'Identity'), identity)
      registry.register(definitionUri('theory', 'Taxonomy'), taxonomy)

      expect(registry.resolve('theory', ['Identity', 'Taxonomy'])).toEqual([
        { uri: 'canon://theory/Identity', value: identity },
        { uri: 'canon://theory/Taxonomy', value: taxonomy },
      ])
    })

    it('resolves a list of names and registered values', () => {
      const registry = new DefinitionRegistry()
      const identity = { name: 'Identity' }
      const id = { name: 'Id' }
      registry.register(definitionUri('theory', 'Identity'), identity)
      registry.register(definitionUri('axiom', 'Id'), id)

      expect(registry.resolve('theory', ['Identity', id])).toEqual([
        { uri: 'canon://theory/Identity', value: identity },
        { uri: 'canon://axiom/Id', value: id },
      ])
    })

    it('registers a trailing map after names', () => {
      const registry = new DefinitionRegistry()
      const identity = { name: 'Identity' }
      const taxonomy = { name: 'Taxonomy' }
      registry.register(definitionUri('theory', 'Identity'), identity)

      expect(registry.resolve('theory', ['Identity', { Taxonomy: taxonomy }])).toEqual([
        { uri: 'canon://theory/Identity', value: identity },
        { uri: 'canon://theory/Taxonomy', value: taxonomy },
      ])
    })

    it('throws when a map is not the last list item', () => {
      const registry = new DefinitionRegistry()

      expect(() => registry.resolve('theory', [{ Identity: { name: 'Identity' } }, 'Taxonomy'])).toThrow(
        'A definition ref map is only allowed as the last item (ADR-0017)',
      )
    })

    it('resolves key refs in a list by key', () => {
      const registry = new DefinitionRegistry()
      const identity = { name: 'Identity' }
      const key = definitionUri('theory', 'Identity')
      registry.register(key, identity)
      const ref = {
        key,
        get value(): undefined {
          return undefined
        },
      }

      expect(registry.resolve('theory', [ref])).toEqual([
        { uri: key, value: identity },
      ])
    })

    it('returns an undefined value for an unregistered name', () => {
      const registry = new DefinitionRegistry()

      expect(registry.resolve('theory', ['Missing'])).toEqual([
        { uri: 'canon://theory/Missing', value: undefined },
      ])
    })
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
