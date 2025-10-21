/**
 * Type guard utility functions
 */

import type { Predicate, TypeGuard } from '../types/index.js'

/**
 * Convert a predicate function to a proper TypeGuard
 *
 * Accepts predicates (boolean-returning functions) and converts them to
 * TypeGuards with proper overload signatures that discriminate types correctly.
 *
 * @param predicate - A boolean-returning predicate function
 * @returns A TypeGuard with proper type discrimination
 *
 * @example
 * ```typescript
 * // Convert a simple predicate to a type guard
 * const isString = typeGuard<string>(v => typeof v === 'string')
 *
 * // Use with object checks
 * const hasId = typeGuard<{ id: string }>(v =>
 *   isPojo(v) && 'id' in v && typeof v.id === 'string'
 * )
 * ```
 */
export function typeGuard<T>(predicate: Predicate<T>): TypeGuard<T> {
  return predicate as TypeGuard<T>
}
