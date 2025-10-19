/**
 * Version axiom implementation
 *
 * Provides universal access to version information across different data formats.
 */

import type { KeyNameAxiom, Satisfies } from '../types/index.js'
import { inferAxiom } from '../axiom.js'

/**
 * Register Version axiom in global Axioms interface
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    /**
     * Version concept - might be 'version', '@version', '_version', etc.
     */
    Version: KeyNameAxiom
  }
}

/**
 * Extract the version value from any entity that satisfies the Version axiom
 *
 * @param x - The entity to extract version from
 * @returns The version value as a string or number
 *
 * @example
 * ```typescript
 * const data = { version: 5, name: 'Test' }
 * const version = versionOf(data) // 5
 * ```
 */
export function versionOf<T extends Satisfies<'Version'>>(x: T): string | number {
  const config = inferAxiom('Version', x)

  if (!config) {
    throw new Error('No matching canon found for Version axiom')
  }

  // For KeyNameAxiom, extract using the key field
  if ('key' in config && typeof config.key === 'string') {
    const value = (x as Record<string, unknown>)[config.key]

    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new TypeError(`Expected string or number version, got ${typeof value}`)
    }

    return value
  }

  throw new Error('Invalid Version axiom configuration')
}
