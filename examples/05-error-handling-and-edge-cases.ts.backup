/**
 * Example: Error Handling and Edge Cases
 *
 * This example demonstrates how Canon handles error conditions, edge cases,
 * and provides robust error handling for production applications.
 */

import type { Canon } from '@relational-fabric/canon'
import { 
  declareCanon, 
  idOf, 
  typeOf, 
  versionOf, 
  timestampsOf, 
  referencesOf,
  pojoWithOfType,
  inferCanon,
  inferAxiom
} from '@relational-fabric/canon'

// =============================================================================
// STEP 1: Define a Robust Canon with Error Handling
// =============================================================================

type RobustCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { required: boolean } }
  Type: { $basis: { type: string }, key: 'type', $meta: { required: boolean } }
  Version: { $basis: { version: number }, key: 'version', $meta: { required: boolean } }
  Timestamps: { $basis: number | string | Date, isCanonical: (v: unknown) => v is Date, $meta: { format: string } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: string } }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    Robust: RobustCanon
  }
}

declareCanon('Robust', {
  axioms: {
    Id: { 
      $basis: pojoWithOfType('id', 'string'), 
      key: 'id', 
      $meta: { required: true } 
    },
    Type: { 
      $basis: pojoWithOfType('type', 'string'), 
      key: 'type', 
      $meta: { required: true } 
    },
    Version: { 
      $basis: pojoWithOfType('version', 'number'), 
      key: 'version', 
      $meta: { required: true } 
    },
    Timestamps: { 
      $basis: (v: unknown): v is number | string | Date => 
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'mixed' }
    },
    References: { 
      $basis: (v: unknown): v is string | object => 
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => 
        typeof v === 'object' && v !== null && 'ref' in v,
      $meta: { format: 'mixed' }
    },
  },
})

// =============================================================================
// STEP 2: Safe Wrapper Functions
// =============================================================================

/**
 * Safe wrapper for idOf that returns undefined instead of throwing
 */
function safeIdOf(entity: unknown): string | undefined {
  try {
    return idOf(entity)
  } catch (error) {
    console.warn('Failed to extract ID:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

/**
 * Safe wrapper for typeOf that returns undefined instead of throwing
 */
function safeTypeOf(entity: unknown): string | undefined {
  try {
    return typeOf(entity)
  } catch (error) {
    console.warn('Failed to extract type:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

/**
 * Safe wrapper for versionOf that returns undefined instead of throwing
 */
function safeVersionOf(entity: unknown): number | string | undefined {
  try {
    return versionOf(entity)
  } catch (error) {
    console.warn('Failed to extract version:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

/**
 * Safe wrapper for timestampsOf that handles conversion errors
 */
function safeTimestampsOf(value: unknown): Date | undefined {
  try {
    return timestampsOf(value)
  } catch (error) {
    console.warn('Failed to convert timestamp:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

/**
 * Safe wrapper for referencesOf that handles conversion errors
 */
function safeReferencesOf(value: unknown): { ref: string; resolved: boolean; value?: unknown } | undefined {
  try {
    return referencesOf(value)
  } catch (error) {
    console.warn('Failed to convert reference:', error instanceof Error ? error.message : 'Unknown error')
    return undefined
  }
}

// =============================================================================
// STEP 3: Validation and Error Detection
// =============================================================================

/**
 * Validate that an entity has all required fields
 */
function validateEntity(entity: unknown): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!entity || typeof entity !== 'object') {
    errors.push('Entity must be an object')
    return { isValid: false, errors, warnings }
  }
  
  // Check for required fields
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
  
  // Check for optional but recommended fields
  if (typeof entity === 'object' && entity !== null) {
    const obj = entity as Record<string, unknown>
    
    // Check for timestamp fields
    const timestampFields = ['createdAt', 'updatedAt', 'modifiedAt']
    const hasTimestamps = timestampFields.some(field => field in obj)
    if (!hasTimestamps) {
      warnings.push('No timestamp fields found (createdAt, updatedAt, etc.)')
    }
    
    // Check for reference fields
    const referenceFields = ['createdBy', 'updatedBy', 'parentId', 'categoryId']
    const hasReferences = referenceFields.some(field => field in obj)
    if (!hasReferences) {
      warnings.push('No reference fields found (createdBy, updatedBy, etc.)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if an entity matches any registered canon
 */
function findMatchingCanon(entity: unknown): string | undefined {
  try {
    const canon = inferCanon(entity)
    return canon ? 'Found matching canon' : undefined
  } catch {
    return undefined
  }
}

// =============================================================================
// STEP 4: Edge Case Examples
// =============================================================================

/**
 * Test data with various edge cases
 */
const edgeCaseData = {
  // Valid entity
  validEntity: {
    id: 'user-123',
    type: 'user',
    version: 5,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    createdBy: 'admin-456',
  },
  
  // Missing required fields
  missingFields: {
    name: 'Incomplete User',
    email: 'incomplete@example.com',
  },
  
  // Wrong field types
  wrongTypes: {
    id: 123, // Should be string
    type: true, // Should be string
    version: 'five', // Should be number
  },
  
  // Null and undefined values
  nullValues: {
    id: null,
    type: undefined,
    version: 0,
  },
  
  // Empty object
  emptyObject: {},
  
  // Non-object values
  nonObject: 'not an object',
  
  // Nested objects with mixed validity
  nestedObject: {
    user: {
      id: 'user-456',
      type: 'user',
      version: 3,
    },
    metadata: {
      source: 'api',
      timestamp: '2024-01-15T10:30:00Z',
    },
  },
}

/**
 * Demonstrate error handling for various edge cases
 */
function demonstrateEdgeCases() {
  console.log('=== Edge Case Examples ===')
  
  Object.entries(edgeCaseData).forEach(([name, data]) => {
    console.log(`\n--- ${name} ---`)
    console.log('Data:', JSON.stringify(data, null, 2))
    
    // Validate the entity
    const validation = validateEntity(data)
    console.log('Validation:', validation)
    
    // Try to extract semantic information
    const id = safeIdOf(data)
    const type = safeTypeOf(data)
    const version = safeVersionOf(data)
    
    console.log('Extracted values:')
    console.log(`  ID: ${id || 'undefined'}`)
    console.log(`  Type: ${type || 'undefined'}`)
    console.log(`  Version: ${version || 'undefined'}`)
    
    // Check for canon match
    const canonMatch = findMatchingCanon(data)
    console.log(`  Canon match: ${canonMatch || 'No matching canon'}`)
  })
}

// =============================================================================
// STEP 5: Robust Business Logic
// =============================================================================

/**
 * Robust entity processor that handles errors gracefully
 */
function processEntitySafely(entity: unknown): {
  success: boolean
  result?: {
    id: string
    type: string
    version: number | string
    processedAt: Date
  }
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate the entity first
  const validation = validateEntity(entity)
  if (!validation.isValid) {
    return {
      success: false,
      errors: [...errors, ...validation.errors],
      warnings: [...warnings, ...validation.warnings],
    }
  }
  
  // Extract semantic information safely
  const id = safeIdOf(entity)
  const type = safeTypeOf(entity)
  const version = safeVersionOf(entity)
  
  if (!id || !type || version === undefined) {
    return {
      success: false,
      errors: [...errors, 'Failed to extract required semantic information'],
      warnings,
    }
  }
  
  // Process the entity
  try {
    const result = {
      id,
      type,
      version,
      processedAt: new Date(),
    }
    
    return {
      success: true,
      result,
      errors,
      warnings: [...warnings, ...validation.warnings],
    }
  } catch (error) {
    return {
      success: false,
      errors: [...errors, `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    }
  }
}

/**
 * Batch processor that handles multiple entities
 */
function processBatchSafely(entities: unknown[]): {
  successful: number
  failed: number
  results: Array<{
    index: number
    success: boolean
    result?: unknown
    errors: string[]
  }>
} {
  const results: Array<{
    index: number
    success: boolean
    result?: unknown
    errors: string[]
  }> = []
  
  let successful = 0
  let failed = 0
  
  entities.forEach((entity, index) => {
    const processResult = processEntitySafely(entity)
    
    if (processResult.success) {
      successful++
      results.push({
        index,
        success: true,
        result: processResult.result,
        errors: processResult.errors,
      })
    } else {
      failed++
      results.push({
        index,
        success: false,
        errors: processResult.errors,
      })
    }
  })
  
  return { successful, failed, results }
}

// =============================================================================
// STEP 6: Run Examples and Tests
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Error Handling and Edge Cases', () => {
    it('handles valid entities correctly', () => {
      const result = processEntitySafely(edgeCaseData.validEntity)
      
      expect(result.success).toBe(true)
      expect(result.result).toBeDefined()
      expect(result.result?.id).toBe('user-123')
      expect(result.result?.type).toBe('user')
      expect(result.result?.version).toBe(5)
    })

    it('handles missing fields gracefully', () => {
      const result = processEntitySafely(edgeCaseData.missingFields)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Missing required field: id')
      expect(result.errors).toContain('Missing required field: type')
      expect(result.errors).toContain('Missing required field: version')
    })

    it('handles wrong field types gracefully', () => {
      const result = processEntitySafely(edgeCaseData.wrongTypes)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('handles null and undefined values', () => {
      const result = processEntitySafely(edgeCaseData.nullValues)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Missing required field: id')
      expect(result.errors).toContain('Missing required field: type')
    })

    it('handles empty objects', () => {
      const result = processEntitySafely(edgeCaseData.emptyObject)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Missing required field: id')
    })

    it('handles non-object values', () => {
      const result = processEntitySafely(edgeCaseData.nonObject)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Entity must be an object')
    })

    it('processes batch entities correctly', () => {
      const entities = [
        edgeCaseData.validEntity,
        edgeCaseData.missingFields,
        edgeCaseData.wrongTypes,
      ]
      
      const result = processBatchSafely(entities)
      
      expect(result.successful).toBe(1)
      expect(result.failed).toBe(2)
      expect(result.results).toHaveLength(3)
    })

    it('validates entities correctly', () => {
      const validValidation = validateEntity(edgeCaseData.validEntity)
      expect(validValidation.isValid).toBe(true)
      
      const invalidValidation = validateEntity(edgeCaseData.missingFields)
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors.length).toBeGreaterThan(0)
    })

    it('handles timestamp conversion errors', () => {
      const invalidTimestamp = 'not a date'
      const result = safeTimestampsOf(invalidTimestamp)
      
      expect(result).toBeUndefined()
    })

    it('handles reference conversion errors', () => {
      const invalidReference = 123
      const result = safeReferencesOf(invalidReference)
      
      expect(result).toBeUndefined()
    })
  })
}

// Run the examples
console.log('=== Error Handling and Edge Cases ===')
demonstrateEdgeCases()

console.log('\n=== Batch Processing Example ===')
const batchEntities = [
  edgeCaseData.validEntity,
  edgeCaseData.missingFields,
  edgeCaseData.wrongTypes,
  edgeCaseData.nullValues,
]

const batchResult = processBatchSafely(batchEntities)
console.log('Batch processing results:')
console.log(`  Successful: ${batchResult.successful}`)
console.log(`  Failed: ${batchResult.failed}`)
console.log('  Results:', batchResult.results)

/**
 * Key Takeaways:
 *
 * 1. **Safe Wrappers**: Create safe wrapper functions that return undefined instead of throwing
 * 2. **Validation**: Always validate entities before processing
 * 3. **Error Handling**: Handle errors gracefully and provide meaningful messages
 * 4. **Edge Cases**: Test with null, undefined, wrong types, and missing fields
 * 5. **Batch Processing**: Handle multiple entities with proper error isolation
 * 6. **Logging**: Log warnings and errors for debugging
 * 7. **Graceful Degradation**: Continue processing even when some entities fail
 */