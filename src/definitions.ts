/**
 * Definition URIs and the shared definition registry (ADR-0017).
 */

import type { DefinitionKind, DefinitionUri, KeyRef, LexiconTermUri, Metadata } from './types/index.js'
import { objectHash } from './kit.js'
import { metaOf, updateMeta } from './meta.js'

let stampLog: Array<{ target: object, prior: Metadata | undefined }> | undefined

const unrestoredEntries = new WeakSet<object>()

const incompleteRollbacks = new WeakSet<AggregateError>()

let savepointStart = 0

let restoreEntries: (
  registry: DefinitionRegistry,
  snapshot: Map<DefinitionUri | LexiconTermUri, unknown>,
) => void

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
  readonly #definitions = new Map<DefinitionUri | LexiconTermUri, unknown>()

  static {
    restoreEntries = (registry, snapshot) => {
      registry.#definitions.clear()
      for (const [uri, value] of snapshot) {
        registry.#definitions.set(uri, value)
      }
    }
  }

  /**
   * Register a value at a definition or lexicon URI.
   * A registered value carries that URI in its metadata.
   * Re-registering the same URI is idempotent when the values hash equal, and throws otherwise.
   * A value already registered at a different live URI also throws (ADR-0017).
   * A `uri` left on a value after `clear` is stale and is replaced.
   */
  register(uri: DefinitionUri | LexiconTermUri, value: unknown): void {
    const alreadyRegistered = this.#definitions.has(uri)
    if (alreadyRegistered && objectHash(this.#definitions.get(uri)) !== objectHash(value)) {
      throw new Error(`Definition already registered: ${uri} (ADR-0017)`)
    }
    if (isMetaCarrier(value)) {
      const existing = metaOf(value).uri
      if (
        typeof existing === 'string'
        && existing !== uri
        && isDefinitionKey(existing)
        && this.#definitions.has(existing)
      ) {
        throw new Error(`Definition already registered: ${existing}`)
      }
    }
    if (!alreadyRegistered) {
      this.#definitions.set(uri, value)
    }
    if (isMetaCarrier(value)) {
      if (stampLog !== undefined && !stampLog.slice(savepointStart).some(entry => entry.target === value)) {
        let prior: Metadata | undefined
        updateMeta(value, (current) => {
          prior = current
          return current
        })
        stampLog.push({ target: value, prior })
      }
      updateMeta(value, metadata => ({
        ...metadata,
        uri,
      }))
    }
  }

  /**
   * Return the value registered at a URI, or undefined when it is absent (ADR-0017).
   */
  value(uri: DefinitionUri | LexiconTermUri): unknown | undefined {
    return this.#definitions.get(uri)
  }

  /**
   * Whether a URI is registered (ADR-0017).
   */
  has(uri: DefinitionUri | LexiconTermUri): boolean {
    return this.#definitions.has(uri)
  }

  /**
   * Number of registered definitions (ADR-0017).
   */
  get size(): number {
    return this.#definitions.size
  }

  /**
   * Remove every registered definition and the uri stamp on each value (ADR-0017).
   */
  clear(): void {
    for (const [, value] of this.#definitions) {
      if ((typeof value === 'object' || typeof value === 'function') && value !== null && typeof metaOf(value).uri === 'string') {
        if (stampLog !== undefined && !stampLog.slice(savepointStart).some(entry => entry.target === value)) {
          let prior: Metadata | undefined
          updateMeta(value, (current) => {
            prior = current
            return current
          })
          stampLog.push({ target: value, prior })
        }
        updateMeta(value, (metadata) => {
          if (metadata === undefined) {
            return undefined
          }
          const next = { ...metadata }
          delete next.uri
          return Reflect.ownKeys(next).length === 0 ? undefined : next
        })
      }
    }
    this.#definitions.clear()
  }

  /**
   * Yield registered `[uri, value]` pairs. When `kind` is given, only URIs of that definition kind (ADR-0017).
   */
  * entries(kind?: DefinitionKind): Generator<[DefinitionUri | LexiconTermUri, unknown]> {
    const prefix = kind === undefined ? undefined : `canon://${kind}/`
    for (const entry of this.#definitions) {
      if (prefix === undefined || entry[0].startsWith(prefix)) {
        yield entry
      }
    }
  }

  /**
   * Resolve a name-to-value map, or a list of names, key refs, and uri-carrying values.
   * Only the last list item may be a map of values to register (ADR-0017).
   */
  resolve(
    kind: DefinitionKind,
    refs: Record<string, unknown> | readonly unknown[],
  ): Array<{ uri: string, value: unknown }> {
    if (Array.isArray(refs)) {
      return this.#resolveList(kind, refs)
    }
    if (!isPlainRecord(refs)) {
      throw new Error('Definition refs must be a map or a list (ADR-0017)')
    }
    return this.#registerRecord(kind, refs)
  }

  /**
   * Register each map entry under `kind` and return the stored definitions in key order (ADR-0017).
   */
  #registerRecord(
    kind: DefinitionKind,
    refs: Record<string, unknown>,
  ): Array<{ uri: string, value: unknown }> {
    const resolved: Array<{ uri: string, value: unknown }> = []
    for (const [name, value] of Object.entries(refs)) {
      const uri = definitionUri(kind, name)
      this.register(uri, value)
      resolved.push({ uri, value: this.value(uri) })
    }
    return resolved
  }

  /**
   * Resolve list-form refs in input order (ADR-0017).
   */
  #resolveList(
    kind: DefinitionKind,
    refs: readonly unknown[],
  ): Array<{ uri: string, value: unknown }> {
    const resolved: Array<{ uri: string, value: unknown }> = []
    for (let index = 0; index < refs.length; index++) {
      const item = refs[index]
      const isLast = index === refs.length - 1
      if (typeof item === 'string') {
        const uri = definitionUri(kind, item)
        resolved.push({ uri, value: this.value(uri) })
        continue
      }
      const uri = carriedUri(item)
      if (uri !== undefined) {
        resolved.push({ uri, value: item })
        continue
      }
      const key = definitionKeyOf(item)
      if (key !== undefined) {
        resolved.push({ uri: key, value: this.value(key) })
        continue
      }
      if (isPlainRecord(item)) {
        if (!isLast) {
          throw new Error('A definition ref map is only allowed as the last item (ADR-0017)')
        }
        for (const entry of this.#registerRecord(kind, item)) {
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

/**
 * Shared definition registry used by ref constructors and the shell.
 * Internal export: not re-exported from the package entry.
 */
export const definitionRegistry = new DefinitionRegistry()

/**
 * Each call, nested or not, rolls back its own writes and uri stamps on failure (ADR-0017).
 * A failed restore is reported as an AggregateError whose first error and cause are the original error.
 * A call does not commit while a caught inner rollback left stamps unrestored; it retries them first and fails if they still can't be restored.
 */
export function allOrNothing<T>(write: () => T): T {
  const outermost = stampLog === undefined
  if (outermost) {
    stampLog = []
  }
  const log = stampLog!
  const logStart = log.length
  const before = new Map(definitionRegistry.entries())
  const previousStart = savepointStart
  savepointStart = logStart
  try {
    const result = write()
    const retryErrors: unknown[] = []
    for (let index = log.length - 1; index >= logStart; index--) {
      const entry = log[index]
      if (entry === undefined || !unrestoredEntries.has(entry)) {
        continue
      }
      const supersededLater = log.slice(index + 1).some(later => later.target === entry.target)
      if (supersededLater) {
        retryErrors.push(new Error('allOrNothing cannot retry a restore that a later stamp superseded'))
        continue
      }
      try {
        updateMeta(entry.target, () => entry.prior)
        unrestoredEntries.delete(entry)
      } catch (retryError) {
        retryErrors.push(retryError)
      }
    }
    if (retryErrors.length > 0) {
      throw new AggregateError(retryErrors, 'allOrNothing cannot commit: an earlier rollback left unrestored stamps')
    }
    return result
  } catch (error) {
    const restoreErrors: unknown[] = []
    const unrestored: typeof log = []
    for (let index = log.length - 1; index >= logStart; index--) {
      const entry = log[index]
      if (entry === undefined) {
        continue
      }
      try {
        updateMeta(entry.target, () => entry.prior)
        unrestoredEntries.delete(entry)
      } catch (restoreError) {
        restoreErrors.push(restoreError)
        unrestored.unshift(entry)
        unrestoredEntries.add(entry)
      }
    }
    try {
      restoreEntries(definitionRegistry, before)
    } catch (restoreError) {
      restoreErrors.push(restoreError)
    }
    log.length = logStart
    log.push(...unrestored)
    if (restoreErrors.length > 0) {
      const incomplete = new AggregateError(
        [error, ...restoreErrors],
        'allOrNothing rollback incomplete: the registry may be inconsistent',
        { cause: error },
      )
      incompleteRollbacks.add(incomplete)
      throw incomplete
    }
    if (
      error instanceof AggregateError
      && incompleteRollbacks.has(error)
      && error.cause !== undefined
    ) {
      throw error.cause
    }
    throw error
  } finally {
    savepointStart = previousStart
    if (outermost) {
      stampLog = undefined
    }
  }
}

/**
 * Lazy reference whose `value` reads the shared definition registry (ADR-0017).
 */
function refFor<K extends DefinitionKind, N extends string>(kind: K, name: N): KeyRef<DefinitionUri<K, N>, unknown> {
  const key = definitionUri(kind, name)
  return {
    key,
    get value(): unknown | undefined {
      return definitionRegistry.value(key)
    },
  }
}

/**
 * Lazy reference to a canon definition (ADR-0017).
 */
export function canonRefFor<N extends string>(name: N): KeyRef<DefinitionUri<'canon', N>, unknown> {
  return refFor('canon', name)
}

/**
 * Lazy reference to an axiom definition (ADR-0017).
 */
export function axiomRefFor<N extends string>(name: N): KeyRef<DefinitionUri<'axiom', N>, unknown> {
  return refFor('axiom', name)
}

/**
 * Lazy reference to a theory definition (ADR-0017).
 */
export function theoryRefFor<N extends string>(name: N): KeyRef<DefinitionUri<'theory', N>, unknown> {
  return refFor('theory', name)
}

/**
 * Lazy reference to a morphism. Its name is `<source>/<target>` (ADR-0017).
 */
export function morphismRefFor<S extends string, T extends string>(
  source: S,
  target: T,
): KeyRef<DefinitionUri<'morphism', `${S}/${T}`>, unknown> {
  return refFor('morphism', `${source}/${target}`)
}

/**
 * The key of a list item that is a KeyRef, when that key is a definition URI.
 */
function definitionKeyOf(value: unknown): DefinitionUri | LexiconTermUri | undefined {
  if (typeof value !== 'object' || value === null)
    return undefined
  if (!('key' in value) || !('value' in value))
    return undefined
  if (typeof Object.getOwnPropertyDescriptor(value, 'value')?.get !== 'function' || !isDefinitionKey(value.key))
    return undefined
  return value.key
}

/**
 * Whether a string is a definition or lexicon term URI.
 */
export function isDefinitionKey(value: unknown): value is DefinitionUri | LexiconTermUri {
  return typeof value === 'string' && (
    value.startsWith('canon://canon/')
    || value.startsWith('canon://axiom/')
    || value.startsWith('canon://theory/')
    || value.startsWith('canon://morphism/')
    || value.startsWith('canon://lexicon/')
  )
}
