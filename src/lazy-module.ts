/**
 * Lazy Module API for Canon
 *
 * Provides a pattern for selecting implementations at runtime based on
 * capability scoring. Supports architecture-based, capability-based,
 * and runtime requirement-based implementation selection.
 *
 * @see ADR-0016: Lazy Module Pattern
 */

import type {
  CapabilityScore,
  Fn,
  LazyImplementation,
  LazyModuleConfig,
  LazyModuleFn,
  SelectionOptions,
  SelectionResult,
} from './types/index.js'

/**
 * Capability scores for common implementation types
 */
export const CapabilityScores = {
  /** Not supported - excluded from selection */
  UNSUPPORTED: undefined,
  /** Last resort - may explode */
  RISKY: -1.0,
  /** Pure JS fallback - functional but loses to anything better */
  FALLBACK: -0.1,
  /** Baseline - thoughtful but unmeasured */
  BASELINE: 0.0,
  /** Good - measured and performs well */
  GOOD: 0.5,
  /** Optimal - best possible for this use case */
  OPTIMAL: 1.0,
} as const

/**
 * Normalize options to a stable string key for memoization
 *
 * @param opts - The options object
 * @returns A stable string representation
 */
function optionsToKey(opts: SelectionOptions): string {
  // Sort keys for stable ordering
  const sorted = Object.keys(opts).sort()
  const pairs = sorted.map(k => `${k}:${JSON.stringify(opts[k])}`)
  return pairs.join('|')
}

/**
 * Create a lazy module with capability-based implementation selection
 *
 * @param config - Configuration for the lazy module
 * @returns A function that creates lazy module instances with registration
 *
 * @example
 * ```typescript
 * const hash = defineLazyModule<HashFn, HashOpts>({
 *   name: 'hash',
 *   defaultOptions: { width: 64 },
 *   fallback: () => (data) => simpleHash(data)
 * })
 *
 * // Register implementations
 * hash.register({
 *   name: 'xxhash',
 *   supports: (opts) => opts.width === 64 ? 1.0 : undefined,
 *   implementation: () => xxhash64
 * })
 *
 * // Use the module
 * const h = hash(data) // Uses best available
 * const h128 = hash.select({ width: 128 })(data) // Select for specific opts
 * ```
 */
export function defineLazyModule<
  TFn extends Fn,
  TOpts extends SelectionOptions = SelectionOptions,
>(config: LazyModuleConfig<TFn, TOpts>): LazyModuleFn<TFn, TOpts> {
  // Storage for registered implementations
  const implementations: Array<LazyImplementation<TFn, TOpts>> = []

  // Memoization caches
  let defaultSelection: SelectionResult<TFn> | undefined
  const selectionCache = new Map<string, SelectionResult<TFn>>()

  // Track if we've added the fallback
  let fallbackAdded = false

  /**
   * Ensure fallback is registered
   */
  function ensureFallback(): void {
    if (fallbackAdded)
      return

    fallbackAdded = true
    implementations.push({
      name: '$fallback',
      supports: () => CapabilityScores.FALLBACK,
      implementation: config.fallback,
    })
  }

  /**
   * Select the best implementation for given options
   */
  function selectBest(opts: TOpts): SelectionResult<TFn> {
    ensureFallback()

    // Score all implementations
    const scored: Array<{ impl: LazyImplementation<TFn, TOpts>, score: number }> = []

    for (const impl of implementations) {
      const score = impl.supports(opts)
      if (score !== undefined) {
        scored.push({ impl, score })
      }
    }

    if (scored.length === 0) {
      throw new Error(
        `No implementation of ${config.name} supports the requested options: ${JSON.stringify(opts)}`,
      )
    }

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score)

    const winner = scored[0]

    // Load the implementation (synchronously for now)
    const implResult = winner.impl.implementation()

    // Handle async implementations
    if (implResult instanceof Promise) {
      throw new TypeError(
        `Async implementations are not supported in synchronous context for ${config.name}. `
        + `Use selectAsync() instead.`,
      )
    }

    return {
      name: winner.impl.name,
      score: winner.score,
      fn: implResult,
    }
  }

  /**
   * Get or compute the default selection
   */
  function getDefaultSelection(): SelectionResult<TFn> {
    if (!defaultSelection) {
      const opts = (config.defaultOptions || {}) as TOpts
      defaultSelection = selectBest(opts)
    }
    return defaultSelection
  }

  /**
   * Get or compute selection for specific options
   */
  function getSelection(opts: TOpts): SelectionResult<TFn> {
    const key = optionsToKey(opts)
    let cached = selectionCache.get(key)

    if (!cached) {
      cached = selectBest(opts)
      selectionCache.set(key, cached)
    }

    return cached
  }

  /**
   * The main module function - uses default selection
   */
  const moduleFn = ((...args: unknown[]): unknown => {
    const selection = getDefaultSelection()
    return selection.fn(...args)
  }) as LazyModuleFn<TFn, TOpts>

  /**
   * Select implementation based on options
   */
  moduleFn.select = (opts: TOpts): TFn => {
    const selection = getSelection(opts)
    return selection.fn
  }

  /**
   * Get the current default selection
   */
  moduleFn.getDefault = (): SelectionResult<TFn> => {
    return getDefaultSelection()
  }

  /**
   * Get all registered implementations
   */
  moduleFn.getImplementations = (): Array<{ name: string, supports: (opts: TOpts) => CapabilityScore }> => {
    ensureFallback()
    return implementations.map(impl => ({
      name: impl.name,
      supports: impl.supports,
    }))
  }

  /**
   * Register a new implementation
   */
  function register(impl: LazyImplementation<TFn, TOpts>): void {
    implementations.push(impl)

    // Clear caches when new implementation is registered
    defaultSelection = undefined
    selectionCache.clear()
  }

  // Add register as a method on the module function
  moduleFn.register = register

  return moduleFn
}
