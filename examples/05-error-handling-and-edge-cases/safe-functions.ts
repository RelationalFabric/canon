/**
 * Safe Wrapper Functions
 *
 * This file contains safe wrapper functions that handle errors gracefully
 * and provide fallback values instead of throwing exceptions.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { idOf, referencesOf, timestampsOf, typeOf, versionOf } from '@relational-fabric/canon'

// =============================================================================
// Safe Wrapper Functions
// =============================================================================

/**
 * Safely extract ID from any entity, returning undefined on error
 */
export function safeIdOf(entity: unknown): string | undefined {
  try {
    return idOf(entity as Satisfies<'Id'>)
  } catch (error) {
    console.warn('Failed to extract ID:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

/**
 * Safely extract type from any entity, returning undefined on error
 */
export function safeTypeOf(entity: unknown): string | undefined {
  try {
    return typeOf(entity as Satisfies<'Type'>)
  } catch (error) {
    console.warn(
      'Failed to extract type:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Safely extract version from any entity, returning undefined on error
 */
export function safeVersionOf(entity: unknown): number | undefined {
  try {
    const version = versionOf(entity as Satisfies<'Version'>)
    // Additional validation to ensure it's actually a number
    if (typeof version !== 'number') {
      return undefined
    }
    return version
  } catch (error) {
    console.warn(
      'Failed to extract version:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Safely extract timestamps from any entity, returning empty array on error
 */
export function safeTimestampsOf(entity: unknown): Date | undefined {
  try {
    return timestampsOf(entity as Satisfies<'Timestamps'>)
  } catch (error) {
    console.warn(
      'Failed to extract timestamps:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Safely extract references from any entity, returning empty array on error
 */
export function safeReferencesOf(
  entity: unknown,
): { ref: string, resolved: boolean, value?: unknown } | undefined {
  try {
    return referencesOf(entity as Satisfies<'References'>)
  } catch (error) {
    console.warn(
      'Failed to extract references:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Safely convert timestamp with error handling
 */
export function safeTimestampConversion(value: unknown): Date | undefined {
  try {
    if (value instanceof Date) {
      return value
    }

    if (typeof value === 'string') {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Invalid date string: ${value}`)
      }
      return date
    }

    if (typeof value === 'number') {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Invalid timestamp: ${value}`)
      }
      return date
    }

    throw new Error(`Unsupported timestamp type: ${typeof value}`)
  } catch (error) {
    console.warn(
      'Failed to convert timestamp:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Safely convert reference with error handling
 */
export function safeReferenceConversion(
  value: unknown,
): { ref: string, resolved: boolean, value?: unknown } | undefined {
  try {
    if (typeof value === 'string') {
      return { ref: value, resolved: false }
    }

    if (typeof value === 'object' && value !== null && 'ref' in value) {
      const obj = value as { ref: unknown, resolved?: unknown, value?: unknown }
      if (typeof obj.ref === 'string') {
        return {
          ref: obj.ref,
          resolved: typeof obj.resolved === 'boolean' ? obj.resolved : false,
          value: obj.value,
        }
      }
    }

    throw new Error(`Expected string or object, got ${typeof value}`)
  } catch (error) {
    console.warn(
      'Failed to convert reference:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}
