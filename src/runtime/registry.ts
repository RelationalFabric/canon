/**
 * Imperative shell for Canon runtime (global-based)
 *
 * Global registry and convenience functions built on the functional core.
 * This layer manages global state and provides a simpler API.
 */

import type { AxiomConfig, Axioms } from '../types/axioms.js'
import type { CanonConfig, Canons } from '../types/canons.js'
import { inferAxiomFromConfig } from './core.js'

/**
 * Global registry storing runtime canon configurations
 */
export const canonRegistry = new Map<string, CanonConfig>()

/**
 * Declare a canon with both type-level and runtime configuration
 *
 * This is the declarative style for defining canons locally.
 *
 * @param label - The canon label
 * @param config - The runtime canon configuration
 *
 * @example
 * ```typescript
 * declareCanon('Internal', {
 *   axioms: {
 *     Id: {
 *       $basis: (v): v is { id: string } => typeof v === 'object' && v !== null && 'id' in v,
 *       key: 'id',
 *       $meta: { type: 'uuid' }
 *     }
 *   }
 * })
 * ```
 */
export function declareCanon<TLabel extends keyof Canons>(
  label: TLabel,
  config: CanonConfig,
): void {
  canonRegistry.set(label as string, config)
}

/**
 * Define a canon runtime configuration for module-style pattern
 *
 * Returns the config object that can be exported and registered later.
 *
 * @param config - The runtime canon configuration
 * @returns The same config object for export
 *
 * @example
 * ```typescript
 * export default defineCanon({
 *   axioms: {
 *     Id: { $basis: (v): v is { id: string } => ..., key: 'id' }
 *   }
 * })
 * ```
 */
export function defineCanon(config: CanonConfig): CanonConfig {
  return config
}

/**
 * Register multiple canons at once
 *
 * @param configs - Object mapping canon labels to their configurations
 *
 * @example
 * ```typescript
 * registerCanons({
 *   Internal: internalCanon,
 *   JsonLd: jsonLdCanon
 * })
 * ```
 */
export function registerCanons(configs: Record<string, CanonConfig>): void {
  for (const [label, config] of Object.entries(configs)) {
    canonRegistry.set(label, config)
  }
}

/**
 * Infer axiom configuration from global registry
 *
 * Searches through registered canons to find one that matches the value,
 * then delegates to the functional core.
 *
 * @param axiomLabel - The axiom label to look up
 * @param value - The value to check against
 * @returns The matching axiom config or undefined
 *
 * @example
 * ```typescript
 * const idConfig = inferAxiom('Id', { id: 'test-123' })
 * ```
 */
export function inferAxiom<TLabel extends keyof Axioms>(
  axiomLabel: TLabel,
  value: unknown,
): AxiomConfig | undefined {
  // Try each registered canon until we find a match
  for (const canonConfig of canonRegistry.values()) {
    const axiomConfig = inferAxiomFromConfig(axiomLabel, value, canonConfig)
    if (axiomConfig) {
      return axiomConfig
    }
  }

  return undefined
}

// In-source tests
if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach } = import.meta.vitest

  describe('registry', () => {
    // Save and restore registry state
    let savedRegistry: Map<string, CanonConfig>

    beforeEach(() => {
      savedRegistry = new Map(canonRegistry)
      canonRegistry.clear()
    })

    afterEach(() => {
      canonRegistry.clear()
      for (const [key, value] of savedRegistry) {
        canonRegistry.set(key, value)
      }
    })

    describe('declareCanon', () => {
      it('should register a canon in the global registry', () => {
        const config: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { id: string } => true,
              key: 'id',
            },
          },
        }

        declareCanon('TestCanon' as any, config)

        expect(canonRegistry.has('TestCanon')).toBe(true)
        expect(canonRegistry.get('TestCanon')).toBe(config)
      })
    })

    describe('defineCanon', () => {
      it('should return the same config object', () => {
        const config: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { id: string } => true,
              key: 'id',
            },
          },
        }

        const result = defineCanon(config)

        expect(result).toBe(config)
      })
    })

    describe('registerCanons', () => {
      it('should register multiple canons at once', () => {
        const config1: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { id: string } => true,
              key: 'id',
            },
          },
        }

        const config2: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { '@id': string } => true,
              key: '@id',
            },
          },
        }

        registerCanons({
          Canon1: config1,
          Canon2: config2,
        })

        expect(canonRegistry.has('Canon1')).toBe(true)
        expect(canonRegistry.has('Canon2')).toBe(true)
        expect(canonRegistry.get('Canon1')).toBe(config1)
        expect(canonRegistry.get('Canon2')).toBe(config2)
      })
    })

    describe('inferAxiom', () => {
      it('should find matching axiom from registered canons', () => {
        const config: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { id: string } =>
                typeof v === 'object' && v !== null && 'id' in v,
              key: 'id',
            },
          },
        }

        declareCanon('TestCanon' as any, config)

        const value = { id: 'test-123' }
        const result = inferAxiom('Id', value)

        expect(result).toBeDefined()
        expect(result?.key).toBe('id')
      })

      it('should return undefined when no matching canon found', () => {
        const value = { id: 'test-123' }
        const result = inferAxiom('Id', value)

        expect(result).toBeUndefined()
      })

      it('should try all registered canons until finding a match', () => {
        const config1: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { wrong: string } => 'wrong' in (v as any),
              key: 'wrong',
            },
          },
        }

        const config2: CanonConfig = {
          axioms: {
            Id: {
              $basis: (v): v is { id: string } =>
                typeof v === 'object' && v !== null && 'id' in v,
              key: 'id',
            },
          },
        }

        registerCanons({
          Canon1: config1,
          Canon2: config2,
        })

        const value = { id: 'test-123' }
        const result = inferAxiom('Id', value)

        expect(result).toBeDefined()
        expect(result?.key).toBe('id')
      })
    })
  })
}

