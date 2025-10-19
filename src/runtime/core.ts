/**
 * Functional core for Canon runtime (value-based)
 *
 * Pure functions that work with explicit configuration values.
 * This layer has no side effects and maintains referential transparency.
 */

import type { AxiomConfig, Axioms } from '../types/axioms.js'
import type { CanonConfig } from '../types/canons.js'

/**
 * Pure function to infer axiom configuration from an explicit canon config
 *
 * @param axiomLabel - The axiom label to look up
 * @param value - The value to check against
 * @param canonConfig - The explicit canon configuration
 * @returns The matching axiom config or undefined
 */
export function inferAxiomFromConfig<TLabel extends keyof Axioms>(
  axiomLabel: TLabel,
  value: unknown,
  canonConfig: CanonConfig,
): AxiomConfig | undefined {
  const axiomConfig = canonConfig.axioms[axiomLabel as string]

  if (!axiomConfig) {
    return undefined
  }

  // Check if the value matches the axiom's $basis type guard
  if (axiomConfig.$basis(value)) {
    return axiomConfig
  }

  return undefined
}

/**
 * Pure function to extract axiom value using explicit axiom config
 *
 * @param axiomLabel - The axiom label
 * @param value - The value to extract from
 * @param axiomConfig - The explicit axiom configuration
 * @returns The extracted value
 */
export function extractAxiomValue<TLabel extends keyof Axioms>(
  axiomLabel: TLabel,
  value: unknown,
  axiomConfig: AxiomConfig,
): unknown {
  // For KeyNameAxiom pattern, extract using the key field
  if ('key' in axiomConfig && typeof axiomConfig.key === 'string') {
    return (value as Record<string, unknown>)[axiomConfig.key]
  }

  // For other axiom patterns, the value itself might be the result
  return value
}

// In-source tests
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('inferAxiomFromConfig', () => {
    it('should return axiom config when value matches type guard', () => {
      const canonConfig: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v): v is { id: string } =>
              typeof v === 'object' && v !== null && 'id' in v,
            key: 'id',
          },
        },
      }

      const value = { id: 'test-123' }
      const result = inferAxiomFromConfig('Id', value, canonConfig)

      expect(result).toBeDefined()
      expect(result?.key).toBe('id')
    })

    it('should return undefined when value does not match type guard', () => {
      const canonConfig: CanonConfig = {
        axioms: {
          Id: {
            $basis: (v): v is { id: string } =>
              typeof v === 'object' && v !== null && 'id' in v,
            key: 'id',
          },
        },
      }

      const value = { name: 'test' }
      const result = inferAxiomFromConfig('Id', value, canonConfig)

      expect(result).toBeUndefined()
    })

    it('should return undefined when axiom not in config', () => {
      const canonConfig: CanonConfig = {
        axioms: {},
      }

      const value = { id: 'test-123' }
      const result = inferAxiomFromConfig('Id', value, canonConfig)

      expect(result).toBeUndefined()
    })
  })

  describe('extractAxiomValue', () => {
    it('should extract value using key field for KeyNameAxiom', () => {
      const axiomConfig: AxiomConfig = {
        $basis: (v): v is { id: string } => true,
        key: 'id',
      }

      const value = { id: 'test-123', name: 'Test' }
      const result = extractAxiomValue('Id', value, axiomConfig)

      expect(result).toBe('test-123')
    })

    it('should return value itself when no key field present', () => {
      const axiomConfig: AxiomConfig = {
        $basis: (v): v is string => true,
      }

      const value = 'direct-value'
      const result = extractAxiomValue('Id', value, axiomConfig)

      expect(result).toBe('direct-value')
    })

    it('should handle different key names', () => {
      const axiomConfig: AxiomConfig = {
        $basis: (v): v is { '@id': string } => true,
        key: '@id',
      }

      const value = { '@id': 'https://example.com/123' }
      const result = extractAxiomValue('Id', value, axiomConfig)

      expect(result).toBe('https://example.com/123')
    })
  })
}
