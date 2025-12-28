/**
 * Lazy Module type system for Canon
 *
 * Lazy modules provide a pattern for selecting implementations at runtime
 * based on capability scoring. This enables architecture-based, capability-based,
 * and runtime requirement-based implementation selection.
 *
 * @see ADR-0016: Lazy Module Pattern
 */

import type { Fn } from './js.js'

/**
 * Capability score returned by implementation's `supports` function
 *
 * Score meanings:
 * - `undefined` - Not supported (excluded from selection)
 * - `-1.0` - Works but risky/unstable (last resort, may explode)
 * - `-0.1` - Pure JS default (functional fallback, loses to thoughtful implementations)
 * - `0.0` - Baseline (thoughtful implementations that haven't measured)
 * - `> 0` - Better (up to `1.0` = optimal)
 */
export type CapabilityScore = number | undefined

/**
 * Options passed to implementation selection
 *
 * The structure depends on the specific lazy module being used.
 * For example, a hash module might accept `{ width: 64 | 128 }`.
 */
export type SelectionOptions = Record<string, unknown>

/**
 * Implementation registration for a lazy module
 *
 * @template TFn - The function type this implementation provides
 * @template TOpts - The options type for selection
 */
export interface LazyImplementation<TFn extends Fn, TOpts extends SelectionOptions = SelectionOptions> {
  /**
   * Unique name for this implementation
   */
  name: string

  /**
   * Determine if this implementation supports the given options
   *
   * @param opts - Selection options
   * @returns A score indicating support level, or undefined if not supported
   */
  supports: (opts: TOpts) => CapabilityScore

  /**
   * Load and return the actual implementation
   *
   * This may be async to support dynamic imports.
   */
  implementation: () => TFn | Promise<TFn>
}

/**
 * Selection result with the chosen implementation
 *
 * @template TFn - The function type
 */
export interface SelectionResult<TFn extends Fn> {
  /**
   * Name of the selected implementation
   */
  name: string

  /**
   * The score that won the selection
   */
  score: number

  /**
   * The implementation function
   */
  fn: TFn
}

/**
 * A lazy module function with selection capabilities
 *
 * The main function uses the pre-selected (cached) implementation.
 * Use `.select(opts)` for runtime selection based on specific options.
 *
 * @template TFn - The function type
 * @template TOpts - The options type for selection
 */
export type LazyModuleFn<TFn extends Fn, TOpts extends SelectionOptions = SelectionOptions> = TFn & {
  /**
   * Select an implementation based on options
   *
   * Results are memoized per unique opts value.
   *
   * @param opts - Selection options
   * @returns A function that uses the selected implementation
   */
  select: (opts: TOpts) => TFn

  /**
   * Get the current default selection result
   */
  getDefault: () => SelectionResult<TFn>

  /**
   * Get all registered implementations
   */
  getImplementations: () => Array<{ name: string, supports: (opts: TOpts) => CapabilityScore }>
}

/**
 * Configuration for defining a lazy module
 *
 * @template TFn - The function type
 * @template TOpts - The options type for selection
 */
export interface LazyModuleConfig<TFn extends Fn, TOpts extends SelectionOptions = SelectionOptions> {
  /**
   * Name of the lazy module (for error messages)
   */
  name: string

  /**
   * Default options for initial selection
   */
  defaultOptions?: TOpts

  /**
   * Pure JS fallback implementation (required)
   *
   * This implementation:
   * - Always scores `-0.1` (functional but suboptimal)
   * - Loses to any implementation that returns `0` or positive
   * - Only wins if nothing else supports the requested opts
   */
  fallback: () => TFn | Promise<TFn>
}
