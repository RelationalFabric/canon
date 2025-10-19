/**
 * Timestamps axiom implementation
 *
 * Provides universal access to timestamp data with format conversion.
 */

import type { RepresentationAxiom, Satisfies } from '../types/index.js'
import { inferAxiom } from '../axiom.js'

/**
 * Register Timestamps axiom in global Axioms interface
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    /**
     * Timestamps concept - might be number, string, Date, etc.
     */
    Timestamps: RepresentationAxiom<number | string | Date, Date>
  }
}

/**
 * Check if a value is a canonical timestamp (Date object)
 *
 * @param value - The value to check
 * @returns True if the value is a Date object
 */
export function isCanonicalTimestamp(value: number | string | Date): value is Date {
  return value instanceof Date
}

/**
 * Extract and convert timestamp data to canonical Date format
 *
 * @param x - The timestamp value to convert
 * @returns The timestamp as a Date object
 *
 * @example
 * ```typescript
 * const unixTimestamp = 1640995200000
 * const isoTimestamp = '2022-01-01T00:00:00Z'
 * const dateTimestamp = new Date('2022-01-01')
 *
 * console.log(timestampsOf(unixTimestamp)) // Converted to canonical Date
 * console.log(timestampsOf(isoTimestamp)) // Converted to canonical Date
 * console.log(timestampsOf(dateTimestamp)) // Already canonical Date
 * ```
 */
export function timestampsOf<T extends Satisfies<'Timestamps'>>(x: T): Date {
  const config = inferAxiom('Timestamps', x)

  if (!config) {
    throw new Error('No matching canon found for Timestamps axiom')
  }

  // Check if already canonical
  if (isCanonicalTimestamp(x)) {
    return x
  }

  // Convert to canonical format
  if (typeof x === 'number') {
    // Assume Unix timestamp in milliseconds
    return new Date(x)
  }

  if (typeof x === 'string') {
    // Try to parse as ISO string or other date format
    const date = new Date(x)
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Invalid date string: ${x}`)
    }
    return date
  }

  throw new TypeError(`Expected number, string, or Date, got ${typeof x}`)
}
