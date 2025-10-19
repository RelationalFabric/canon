/**
 * References axiom implementation
 *
 * Provides universal access to entity references with format conversion.
 */

import type { EntityReference, RepresentationAxiom, Satisfies } from '../types/index.js'
import { inferAxiom } from '../axiom.js'

/**
 * Register References axiom in global Axioms interface
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    /**
     * References concept - might be string, object, etc.
     */
    References: RepresentationAxiom<string | object, EntityReference<string, unknown>>
  }
}

/**
 * Check if a value is a canonical reference (EntityReference object)
 *
 * @param value - The value to check
 * @returns True if the value is an EntityReference object
 */
export function isCanonicalReference(value: string | object): value is EntityReference<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && 'ref' in value
    && 'resolved' in value
    && typeof (value as EntityReference<string, unknown>).ref === 'string'
    && typeof (value as EntityReference<string, unknown>).resolved === 'boolean'
}

/**
 * Extract and convert reference data to canonical EntityReference format
 *
 * @param x - The reference value to convert
 * @returns The reference as an EntityReference object
 *
 * @example
 * ```typescript
 * const stringRef = 'user-123'
 * const entityRef = { ref: 'user-123', resolved: false }
 *
 * console.log(referencesOf(stringRef)) // Converted to EntityReference
 * console.log(referencesOf(entityRef)) // Already canonical EntityReference
 * ```
 */
export function referencesOf<T extends Satisfies<'References'>>(x: T): EntityReference<string, unknown> {
  const config = inferAxiom('References', x)

  if (!config) {
    throw new Error('No matching canon found for References axiom')
  }

  // Check if already canonical
  if (isCanonicalReference(x)) {
    return x
  }

  // Convert to canonical format
  if (typeof x === 'string') {
    return {
      ref: x,
      resolved: false,
    }
  }

  if (typeof x === 'object' && x !== null) {
    // Try to extract reference from object
    const obj = x as Record<string, unknown>

    // Look for common reference field names
    const refFields = ['ref', 'id', 'reference', 'uri', 'url']
    for (const field of refFields) {
      if (field in obj && typeof obj[field] === 'string') {
        return {
          ref: obj[field] as string,
          resolved: 'resolved' in obj ? Boolean(obj.resolved) : false,
          value: 'value' in obj ? obj.value : undefined,
        }
      }
    }

    throw new TypeError(`Could not extract reference from object: ${JSON.stringify(x)}`)
  }

  throw new TypeError(`Expected string or object, got ${typeof x}`)
}
