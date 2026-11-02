/**
 * Definition URIs and the shared definition registry (ADR-0017).
 */

import type { DefinitionKind, DefinitionUri, LexiconTermUri } from './types/index.js'
import { metaOf, updateMeta } from './meta.js'

/**
 * Build a definition URI. A definition's formal identity is `canon://${kind}/${name}` (ADR-0017).
 */
export function definitionUri<K extends DefinitionKind, N extends string>(kind: K, name: N): DefinitionUri<K, N> {
  if (name === '') {
    throw new Error('Definition name must not be empty (ADR-0017)')
  }
  return `canon://${kind}/${name}`
}

/**
 * Build a lexicon term URI in the default lexicon (ADR-0017).
 */
export function lexiconTermUri<T extends string>(term: T): LexiconTermUri<'default', T>
/**
 * Build a lexicon term URI in a named lexicon (ADR-0017).
 */
export function lexiconTermUri<L extends string, T extends string>(lexicon: L, term: T): LexiconTermUri<L, T>
export function lexiconTermUri(lexiconOrTerm: string, term?: string): LexiconTermUri<string, string> {
  if (term === undefined) {
    if (lexiconOrTerm === '') {
      throw new Error('Lexicon term must not be empty (ADR-0017)')
    }
    return `canon://lexicon/default/${lexiconOrTerm}`
  }
  if (lexiconOrTerm === '' || term === '') {
    throw new Error('Lexicon and term must not be empty (ADR-0017)')
  }
  return `canon://lexicon/${lexiconOrTerm}/${term}`
}

/**
 * Shared registry of definitions keyed by URI. Names are unique at registration (ADR-0017).
 */
export class DefinitionRegistry {
  private readonly definitions = new Map<DefinitionUri | LexiconTermUri, unknown>()

  /**
   * Register a value at a definition or lexicon URI.
   * A registered value carries that URI in its metadata. Throws if that URI is already registered,
   * or if the value is already registered at a different URI (ADR-0017).
   */
  register(uri: DefinitionUri | LexiconTermUri, value: unknown): void {
    if (this.definitions.has(uri)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    if (isMetaCarrier(value)) {
      const existing = metaOf(value).uri
      if (typeof existing === 'string' && existing !== uri) {
        throw new Error(`Definition already registered: ${existing}`)
      }
    }
    this.definitions.set(uri, value)
    if (isMetaCarrier(value)) {
      updateMeta(value, metadata => ({
        ...metadata,
        uri,
      }))
    }
  }

  /**
   * Return the value registered at a URI, or undefined when it is absent (ADR-0017).
   */
  get(uri: DefinitionUri | LexiconTermUri): unknown | undefined {
    return this.definitions.get(uri)
  }

  /**
   * Whether a URI is registered (ADR-0017).
   */
  has(uri: DefinitionUri | LexiconTermUri): boolean {
    return this.definitions.has(uri)
  }

  /**
   * Number of registered definitions (ADR-0017).
   */
  get size(): number {
    return this.definitions.size
  }

  /**
   * Remove every registered definition (ADR-0017).
   */
  clear(): void {
    this.definitions.clear()
  }

  /**
   * Yield registered `[uri, value]` pairs. When `kind` is given, only URIs of that definition kind (ADR-0017).
   */
  * entries(kind?: DefinitionKind): Generator<[DefinitionUri | LexiconTermUri, unknown]> {
    const prefix = kind === undefined ? undefined : `canon://${kind}/`
    for (const entry of this.definitions) {
      if (prefix === undefined || entry[0].startsWith(prefix)) {
        yield entry
      }
    }
  }
}

/**
 * Metadata can be attached to objects and functions. Primitives cannot carry a `uri`.
 */
function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}
