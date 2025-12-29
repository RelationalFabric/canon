/**
 * Type guard utilities for Canon type system
 */

/**
 * Type guard pattern that preserves specific types when narrowing
 *
 * CRITICAL: The parameter type must be `T | unknown` (NOT just `unknown`).
 *
 * While `T | unknown` reduces to `unknown` at runtime (since unknown is the
 * top type), the explicit union is essential for TypeScript's type narrowing.
 * Using just `unknown` makes T disjoint from the parameter, breaking type
 * discrimination. The union ensures T is NOT disjoint with the parameter type.
 *
 * This interface uses overloads to properly discriminate the target type
 * from unknown, allowing TypeScript to infer the most specific type.
 */
export interface TypeGuard<T> {
  <U extends T>(obj: U | unknown): obj is U
  (obj: T | unknown): obj is T
}

/**
 * Predicate function type - a boolean-returning function
 *
 * This is the input to typeGuard(), which converts it to a TypeGuard.
 * CRITICAL: Must use `T | unknown` to maintain type compatibility.
 */
export interface Predicate<T> {
  (obj: T | unknown): boolean
  <U extends T>(obj: U | unknown): boolean
}
