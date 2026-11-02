/**
 * Definition URIs and the shared definition registry (ADR-0017).
 */

import type { DefinitionKind, DefinitionUri, LexiconTermUri } from './types/index.js'
import { objectHash } from './kit.js'
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
   * A registered value carries that URI in its metadata.
   * Re-registering the same URI is idempotent when the values hash equal, and throws otherwise.
   * A value already registered at a different URI also throws (ADR-0017).
   */
  register(uri: DefinitionUri | LexiconTermUri, value: unknown): void {
    const alreadyRegistered = this.definitions.has(uri)
    if (alreadyRegistered && objectHash(this.definitions.get(uri)) !== objectHash(value)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    if (isMetaCarrier(value)) {
      const existing = metaOf(value).uri
      if (typeof existing === 'string' && existing !== uri) {
        throw new Error(`Definition already registered: ${existing}`)
      }
    }
    if (!alreadyRegistered) {
      this.definitions.set(uri, value)
    }
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

  /**
   * Resolve a name-to-value map, or a list of names and uri-carrying values.
   * Only the last list item may be a map of values to register (ADR-0017).
   */
  resolve(
    kind: DefinitionKind,
    refs: Record<string, unknown> | readonly unknown[],
  ): Array<{ uri: string, value: unknown }> {
    if (Array.isArray(refs)) {
      return this.resolveList(kind, refs)
    }
    return this.registerRecord(kind, refs)
  }

  /**
   * Register each map entry under `kind` and return the stored definitions in key order (ADR-0017).
   */
  private registerRecord(
    kind: DefinitionKind,
    refs: Record<string, unknown>,
  ): Array<{ uri: string, value: unknown }> {
    const resolved: Array<{ uri: string, value: unknown }> = []
    for (const [name, value] of Object.entries(refs)) {
      const uri = definitionUri(kind, name)
      this.register(uri, value)
      resolved.push({ uri, value: this.get(uri) })
    }
    return resolved
  }

  /**
   * Resolve list-form refs in input order (ADR-0017).
   */
  private resolveList(
    kind: DefinitionKind,
    refs: readonly unknown[],
  ): Array<{ uri: string, value: unknown }> {
    const resolved: Array<{ uri: string, value: unknown }> = []
    for (let index = 0; index < refs.length; index++) {
      const item = refs[index]
      const isLast = index === refs.length - 1
      if (typeof item === 'string') {
        const uri = definitionUri(kind, item)
        resolved.push({ uri, value: this.get(uri) })
        continue
      }
      const uri = carriedUri(item)
      if (uri !== undefined) {
        resolved.push({ uri, value: item })
        continue
      }
      if (isPlainRecord(item)) {
        if (!isLast) {
          throw new Error('A definition ref map is only allowed as the last item (ADR-0017)')
        }
        for (const entry of this.registerRecord(kind, item)) {
          resolved.push(entry)
        }
        continue
      }
      throw new Error('A definition ref must be a name or a value carrying a uri (ADR-0017)')
    }
    return resolved
  }
}

/**
 * Metadata can be attached to objects and functions. Primitives cannot carry a `uri`.
 */
function isMetaCarrier(value: unknown): value is object {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

/**
 * A plain object map. Arrays and class instances are not maps.
 */
function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/**
 * The definition URI already stored on a value, when it has one.
 */
function carriedUri(value: unknown): string | undefined {
  if (!isMetaCarrier(value)) {
    return undefined
  }
  const uri = metaOf(value).uri
  return typeof uri === 'string' && uri !== '' ? uri : undefined
}
