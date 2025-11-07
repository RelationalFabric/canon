# 05 Error Handling And Edge Cases

Error Handling and Edge Cases Usage Examples

## Key Concepts

- **Safe Wrapper Functions**: Use safe functions that return undefined instead of throwing
- **Comprehensive Validation**: Validate entities before processing
- **Graceful Error Handling**: Handle errors gracefully with fallback values
- **Batch Processing**: Process multiple entities with individual error handling
- **Edge Case Coverage**: Handle null, undefined, wrong types, and missing fields
- **Type Safety**: Maintain type safety even with error handling
- **Logging**: Log errors for debugging while continuing execution
- **Fallback Values**: Provide sensible defaults for missing data
- **Validation Results**: Return detailed validation results with errors and warnings
- **Robust Processing**: Build robust systems that handle real-world data variations

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases)

## Files

- `05-error-handling-and-edge-cases/basic-canon.ts`
- `05-error-handling-and-edge-cases/safe-functions.ts`
- `05-error-handling-and-edge-cases/usage.ts`
- `05-error-handling-and-edge-cases/validation-utilities.ts`

## File: `05-error-handling-and-edge-cases/basic-canon.ts`

```typescript
/**
 * Basic Canon for Error Handling Examples
 *
 * This file defines a basic canon for testing error handling scenarios.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// Basic Canon Definition
// =============================================================================

type BasicCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'string' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { format: 'string' } }
  Version: { $basis: { version: number }, key: 'version', $meta: { format: 'number' } }
  Timestamps: { $basis: Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'Date' } }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'string' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    BasicCanon: BasicCanon
  }
}

declareCanon('BasicCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'string' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { format: 'string' } },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { format: 'number' },
    },
    Timestamps: {
      $basis: (v: unknown): v is Date => v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'Date' },
    },
    References: {
      $basis: (v: unknown): v is string | object =>
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string, resolved: boolean } =>
        typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v,
      $meta: { format: 'string' },
    },
  },
})

export type { BasicCanon }
```
## File: `05-error-handling-and-edge-cases/safe-functions.ts`

```typescript
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
    console.warn(
      'Failed to convert reference:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}
```
## File: `05-error-handling-and-edge-cases/usage.ts`

```typescript
/**
 * Error Handling and Edge Cases Usage Examples
 *
 * This file demonstrates how to handle errors and edge cases gracefully
 * when working with Canon's universal type system.
 */

import {
  safeIdOf,
  safeReferenceConversion,
  safeTimestampConversion,
  safeTypeOf,
  safeVersionOf,
} from './safe-functions.js'
import {
  findMatchingCanon,
  processBatchSafely,
  processEntitySafely,
  validateEntity,
} from './validation-utilities.js'
import './basic-canon.js' // Import canon definition

// =============================================================================
// Sample Data for Testing
// =============================================================================

/**
 * Valid entity with all required fields
 */
const validEntity = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  createdBy: 'admin-456',
}

/**
 * Entity with missing required fields
 */
const missingFields = {
  name: 'Incomplete User',
  email: 'incomplete@example.com',
}

/**
 * Entity with wrong field types
 */
const wrongTypes = {
  id: 123,
  type: true,
  version: 'five',
}

/**
 * Entity with null values
 */
const nullValues = {
  id: null,
  version: 0,
}

/**
 * Empty object
 */
const emptyObject = {}

/**
 * Non-object value
 */
const nonObject = 'not an object'

/**
 * Nested object with valid data in wrong location
 */
const nestedObject = {
  user: {
    id: 'user-456',
    type: 'user',
    version: 3,
  },
  metadata: {
    source: 'api',
    timestamp: '2024-01-15T10:30:00Z',
  },
}

// =============================================================================
// Example Usage
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Error Handling and Edge Cases', () => {
    it('handles valid entities correctly', () => {
      const id = safeIdOf(validEntity)
      const type = safeTypeOf(validEntity)
      const version = safeVersionOf(validEntity)

      expect(id).toBe('user-123')
      expect(type).toBe('user')
      expect(version).toBe(5)
    })

    it('handles missing fields gracefully', () => {
      const id = safeIdOf(missingFields)
      const type = safeTypeOf(missingFields)
      const version = safeVersionOf(missingFields)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('handles wrong field types gracefully', () => {
      const id = safeIdOf(wrongTypes)
      const type = safeTypeOf(wrongTypes)
      const version = safeVersionOf(wrongTypes)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      // versionOf returns the actual value when it's not a number, safeVersionOf returns undefined
      expect(version).toBeUndefined()
    })

    it('handles null and undefined values', () => {
      const id = safeIdOf(nullValues)
      const type = safeTypeOf(nullValues)
      const version = safeVersionOf(nullValues)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      // The nullValues object has version: 0, which is a valid number, so safeVersionOf returns 0
      expect(version).toBe(0)
    })

    it('handles empty objects', () => {
      const id = safeIdOf(emptyObject)
      const type = safeTypeOf(emptyObject)
      const version = safeVersionOf(emptyObject)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('handles non-object values', () => {
      const id = safeIdOf(nonObject)
      const type = safeTypeOf(nonObject)
      const version = safeVersionOf(nonObject)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('validates entities correctly', () => {
      const validResult = validateEntity(validEntity)
      const invalidResult = validateEntity(missingFields)

      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)
    })

    it('processes entities safely', () => {
      const validResult = processEntitySafely(validEntity)
      const invalidResult = processEntitySafely(missingFields)

      expect(validResult.success).toBe(true)
      expect(validResult.result?.id).toBe('user-123')

      expect(invalidResult.success).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)
    })

    it('processes batch entities correctly', () => {
      const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])

      expect(batchResult.successful).toBe(1)
      expect(batchResult.failed).toBe(3)
      expect(batchResult.results).toHaveLength(4)
    })

    it('handles timestamp conversion errors', () => {
      const validTimestamp = safeTimestampConversion('2024-01-15T10:30:00Z')
      const invalidTimestamp = safeTimestampConversion('not a date')

      expect(validTimestamp).toBeInstanceOf(Date)
      expect(invalidTimestamp).toBeUndefined()
    })

    it('handles reference conversion errors', () => {
      const validReference = safeReferenceConversion('user-123')
      const invalidReference = safeReferenceConversion(123)

      expect(validReference).toEqual({ ref: 'user-123', resolved: false })
      expect(invalidReference).toBeUndefined()
    })
  })
}

// Run the examples
console.log('=== Error Handling and Edge Cases ===')

// Test different edge cases
const testCases = [
  { name: 'validEntity', data: validEntity },
  { name: 'missingFields', data: missingFields },
  { name: 'wrongTypes', data: wrongTypes },
  { name: 'nullValues', data: nullValues },
  { name: 'emptyObject', data: emptyObject },
  { name: 'nonObject', data: nonObject },
  { name: 'nestedObject', data: nestedObject },
]

console.log('=== Edge Case Examples ===\n')

testCases.forEach(({ name, data }) => {
  console.log(`--- ${name} ---`)
  console.log('Data:', JSON.stringify(data, null, 2))

  const validation = validateEntity(data)
  console.log('Validation:', validation)

  const id = safeIdOf(data)
  const type = safeTypeOf(data)
  const version = safeVersionOf(data)

  console.log('Extracted values:')
  console.log(`  ID: ${id}`)
  console.log(`  Type: ${type}`)
  console.log(`  Version: ${version}`)

  const canon = findMatchingCanon(data)
  console.log(`  Canon match: ${canon ? `Found matching canon` : 'No matching canon'}`)
  console.log()
})

// Test batch processing
console.log('=== Batch Processing Example ===')
const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])
console.log('Batch processing results:')
console.log(`  Successful: ${batchResult.successful}`)
console.log(`  Failed: ${batchResult.failed}`)
console.log('  Results:', batchResult.results)
console.log()

/**
 * Key Takeaways:
 *
 * 1. **Safe Wrapper Functions**: Use safe functions that return undefined instead of throwing
 * 2. **Comprehensive Validation**: Validate entities before processing
 * 3. **Graceful Error Handling**: Handle errors gracefully with fallback values
 * 4. **Batch Processing**: Process multiple entities with individual error handling
 * 5. **Edge Case Coverage**: Handle null, undefined, wrong types, and missing fields
 * 6. **Type Safety**: Maintain type safety even with error handling
 * 7. **Logging**: Log errors for debugging while continuing execution
 * 8. **Fallback Values**: Provide sensible defaults for missing data
 * 9. **Validation Results**: Return detailed validation results with errors and warnings
 * 10. **Robust Processing**: Build robust systems that handle real-world data variations
 */
```
## File: `05-error-handling-and-edge-cases/validation-utilities.ts`

```typescript
/**
 * Validation Utilities
 *
 * This file contains utilities for validating entities and handling edge cases
 * in a robust manner.
 */

import {
  safeIdOf,
  safeReferencesOf,
  safeTimestampsOf,
  safeTypeOf,
  safeVersionOf,
} from './safe-functions.js'

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate an entity and return detailed validation results
 */
export function validateEntity(entity: unknown): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if entity is an object
  if (typeof entity !== 'object' || entity === null) {
    errors.push('Entity must be an object')
    return { isValid: false, errors, warnings }
  }

  // Check required fields
  const id = safeIdOf(entity)
  if (!id) {
    errors.push('Missing required field: id')
  }

  const type = safeTypeOf(entity)
  if (!type) {
    errors.push('Missing required field: type')
  }

  const version = safeVersionOf(entity)
  if (version === undefined) {
    errors.push('Missing required field: version')
  }

  // Check for timestamp fields
  const timestamps = safeTimestampsOf(entity)
  if (!timestamps) {
    warnings.push('No timestamp fields found (createdAt, updatedAt, etc.)')
  }

  // Check for reference fields
  const references = safeReferencesOf(entity)
  if (!references) {
    warnings.push('No reference fields found (createdBy, updatedBy, etc.)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Find the best matching canon for an entity
 */
export function findMatchingCanon(entity: unknown): string | undefined {
  try {
    // Try to extract basic information to determine canon type
    const id = safeIdOf(entity)
    const type = safeTypeOf(entity)

    if (id && type) {
      // Check for MongoDB format
      if (typeof entity === 'object' && entity !== null && '_id' in entity) {
        return 'MongoDbCanon'
      }

      // Check for JSON-LD format
      if (typeof entity === 'object' && entity !== null && '@id' in entity) {
        return 'JsonLdCanon'
      }

      // Default to REST API format
      return 'RestApiCanon'
    }

    return undefined
  }
  catch (error) {
    console.warn(
      'Failed to find matching canon:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return undefined
  }
}

/**
 * Process an entity safely with comprehensive error handling
 */
export function processEntitySafely(entity: unknown): {
  success: boolean
  result?: {
    id: string
    type: string
    version: number
    processedAt: Date
  }
  errors: string[]
  canon?: string
} {
  const errors: string[] = []

  try {
    // Validate entity
    const validation = validateEntity(entity)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      }
    }

    // Find matching canon
    const canon = findMatchingCanon(entity)
    if (!canon) {
      errors.push('No matching canon found for entity')
      return {
        success: false,
        errors,
      }
    }

    // Extract values safely
    const id = safeIdOf(entity)
    const type = safeTypeOf(entity)
    const version = safeVersionOf(entity)

    if (!id || !type || version === undefined) {
      errors.push('Failed to extract required fields')
      return {
        success: false,
        errors,
      }
    }

    return {
      success: true,
      result: {
        id,
        type,
        version,
        processedAt: new Date(),
      },
      errors: [],
      canon,
    }
  }
  catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

/**
 * Process multiple entities in batch with error handling
 */
export function processBatchSafely(entities: unknown[]): {
  successful: number
  failed: number
  results: Array<{
    index: number
    success: boolean
    result?: {
      id: string
      type: string
      version: number
      processedAt: Date
    }
    errors: string[]
  }>
} {
  const results = entities.map((entity, index) => {
    const result = processEntitySafely(entity)
    return {
      index,
      success: result.success,
      result: result.result,
      errors: result.errors,
    }
  })

  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return {
    successful,
    failed,
    results,
  }
}
```
