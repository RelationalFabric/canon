/**
 * Id axiom implementation
 *
 * Provides universal access to entity identifiers across different data formats.
 */

import type { KeyNameAxiom } from '../types/axioms.js'
import type { Satisfies } from '../types/canons.js'
import { extractAxiomValue } from '../runtime/core.js'
import { inferAxiom } from '../runtime/registry.js'

/**
 * Register Id axiom in global Axioms interface
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    /**
     * Id concept - might be 'id', '@id', '_id', etc.
     */
    Id: KeyNameAxiom
  }
}

/**
 * Extract the ID value from any entity that satisfies the Id axiom
 *
 * @param x - The entity to extract ID from
 * @returns The ID value as a string
 *
 * @example
 * ```typescript
 * const data = { id: 'test-123', name: 'Test' }
 * const id = idOf(data) // "test-123"
 * ```
 */
export function idOf<T extends Satisfies<'Id'>>(x: T): string {
  const config = inferAxiom('Id', x)

  if (!config) {
    throw new Error('No matching canon found for Id axiom')
  }

  const value = extractAxiomValue('Id', x, config)

  if (typeof value !== 'string') {
    throw new Error(`Expected string ID, got ${typeof value}`)
  }

  return value
}

