/**
 * Compile-time type testing utilities for Canon
 */

/**
 * Expect the first type to extend the second type.
 */
export type Expect<A, B> = A extends B ? true : false

/**
 * Assert that a type resolves to `true`.
 */
export type IsTrue<A> = Expect<A, true>

/**
 * Assert that a type resolves to `false`.
 */
export type IsFalse<A> = A extends false ? true : false

/**
 * Runtime no-op function that enforces the provided type resolves to `true`.
 */
export function invariant<_ extends true>(): void {
  // Intentionally empty – the generic constraint encodes the assertion.
}

// ---------------------------------------------------------------------------
// Self-validation of the utilities
// ---------------------------------------------------------------------------

invariant<Expect<true, true>>()
invariant<Expect<'value', string>>()
invariant<Expect<1 | 2, number>>()
invariant<IsFalse<Expect<string, number>>>()

// @ts-expect-error - Expect should fail when the left side does not extend the right.
invariant<Expect<{ id: string }, { id: number }>>()

// @ts-expect-error - IsTrue rejects non-true values.
invariant<IsTrue<false>>()

// @ts-expect-error - IsFalse only accepts precisely `false`.
invariant<IsFalse<true>>()
