/**
 * Type axiom implementation
 *
 * Provides universal access to entity classification across different data formats.
 */

import type { KeyNameAxiom, Satisfies } from '../types/index.js'
import { inferAxiom } from '../axiom.js'

/**
 * Register Type axiom in global Axioms interface
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    /**
     * Type concept - might be 'type', '@type', '_type', etc.
     */
    Type: KeyNameAxiom
  }
}

/**
 * Extract the type value from any entity that satisfies the Type axiom
 *
 * @param x - The entity to extract type from
 * @returns The type value as a string
 *
 * @example
 * ```typescript
 * const data = { type: 'user', name: 'Test' }
 * const type = typeOf(data) // "user"
 * ```
 */
export function typeOf<T extends Satisfies<'Type'>>(x: T): string {
  const config = inferAxiom('Type', x)

  if (!config) {
    throw new Error('No matching canon found for Type axiom')
  }

  // For KeyNameAxiom, extract using the key field
  if ('key' in config && typeof config.key === 'string') {
    const value = (x as Record<string, unknown>)[config.key]

    if (typeof value !== 'string') {
      throw new TypeError(`Expected string type, got ${typeof value}`)
    }

    return value
  }

  throw new Error('Invalid Type axiom configuration')
}
