/**
 * Validation Utilities
 *
 * This file contains utilities for validating entities and handling edge cases
 * in a robust manner.
 */

import { safeIdOf, safeTypeOf, safeVersionOf, safeTimestampsOf, safeReferencesOf } from './safe-functions'

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
  if (timestamps.length === 0) {
    warnings.push('No timestamp fields found (createdAt, updatedAt, etc.)')
  }

  // Check for reference fields
  const references = safeReferencesOf(entity)
  if (references.length === 0) {
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
  } catch (error) {
    console.warn('Failed to find matching canon:', error instanceof Error ? error.message : 'Unknown error')
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
  } catch (error) {
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