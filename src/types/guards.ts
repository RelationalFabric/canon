/**
 * Type guard utilities for Canon type system
 */

/**
 * Type for type guard predicates that narrow unknown to a specific type
 */
export type TypeGuard<T> = (value: unknown) => value is T

