/**
 * Format Conversion Utilities
 *
 * This file contains utilities for converting entities between different formats
 * and demonstrating cross-format compatibility.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { createLogger, idOf, referencesOf, typeOf, versionOf } from '@relational-fabric/canon'

// =============================================================================
// Format Conversion Functions
// =============================================================================

/**
 * Convert an entity to MongoDB format
 */
export function convertToMongoDb(entity: unknown): Record<string, unknown> {
  try {
    const id = idOf(entity as Satisfies<'Id'>)
    const type = typeOf(entity as Satisfies<'Type'>)
    const version = versionOf(entity as Satisfies<'Version'>)
    const references = referencesOf(entity as Satisfies<'References'>)

    // Handle timestamps manually
    const timestamps: Date[] = []
    if (typeof entity === 'object' && entity !== null) {
      const obj = entity as Record<string, unknown>
      if (obj.createdAt instanceof Date)
        timestamps.push(obj.createdAt)
      if (obj.updatedAt instanceof Date)
        timestamps.push(obj.updatedAt)
    }

    // Convert timestamps to Unix timestamps
    const mongoTimestamps = timestamps.map(ts => (ts instanceof Date ? ts.getTime() : Date.now()))

    return {
      _id: id,
      _type: type,
      _version: version,
      created_at: mongoTimestamps[0] || Date.now(),
      updated_at: mongoTimestamps[1] || Date.now(),
      // Keep original fields for compatibility
      id,
      type,
      version,
      createdAt: timestamps[0]?.toISOString(),
      updatedAt: timestamps[1]?.toISOString(),
      ...(entity as Record<string, unknown>),
      createdBy: references.ref,
    }
  } catch {
    // Fallback for entities that don't match the canon
    const entityObj = entity as Record<string, unknown>
    return {
      _id: entityObj.id || 'unknown',
      _type: entityObj.type || 'unknown',
      _version: entityObj.version || 1,
      created_at: Date.now(),
      updated_at: Date.now(),
      ...entityObj,
    }
  }
}

/**
 * Convert an entity to JSON-LD format
 */
export function convertToJsonLd(entity: unknown): Record<string, unknown> {
  try {
    const id = idOf(entity as Satisfies<'Id'>)
    const type = typeOf(entity as Satisfies<'Type'>)
    const version = versionOf(entity as Satisfies<'Version'>)
    const references = referencesOf(entity as Satisfies<'References'>)

    // Handle timestamps manually
    const timestamps: Date[] = []
    if (typeof entity === 'object' && entity !== null) {
      const obj = entity as Record<string, unknown>
      if (obj.createdAt instanceof Date)
        timestamps.push(obj.createdAt)
      if (obj.updatedAt instanceof Date)
        timestamps.push(obj.updatedAt)
    }

    return {
      '@id': `https://api.example.com/${type}s/${id}`,
      '@type': `https://schema.org/${type.charAt(0).toUpperCase() + type.slice(1)}`,
      '@version': version.toString(),
      'created_at': timestamps[0]?.toISOString(),
      'updated_at': timestamps[1]?.toISOString(),
      // Keep original fields for compatibility
      id,
      type,
      version,
      'createdAt': timestamps[0]?.toISOString(),
      'updatedAt': timestamps[1]?.toISOString(),
      ...(entity as Record<string, unknown>),
      'createdBy': references.ref,
    }
  } catch {
    // Fallback for entities that don't match the canon
    const entityObj = entity as Record<string, unknown>
    return {
      '@id': `https://api.example.com/entities/${entityObj.id || 'unknown'}`,
      '@type': 'https://schema.org/Thing',
      '@version': (entityObj.version || 1).toString(),
      'created_at': new Date().toISOString(),
      'updated_at': new Date().toISOString(),
      ...entityObj,
    }
  }
}

/**
 * Process users from different data sources
 */
const logger = createLogger('examples:format-conversion:utilities')

export function processUsersFromDifferentSources(): void {
  logger.info('=== Mixed Data Sources Example ===')
  logger.log('\nProcessing users from different sources:\n')

  // REST API user
  const restUser = {
    id: 'user-123',
    type: 'user',
    version: 6,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T14:45:00Z'),
    profile: { name: 'Alice Johnson', email: 'alice@example.com' },
    createdBy: 'admin-456',
  }

  // MongoDB user
  const mongoUser = {
    _id: '507f1f77bcf86cd799439011',
    _type: 'User',
    _version: 6,
    created_at: 1705314600000,
    updated_at: 1705761900000,
    profile: { name: 'Bob Smith', email: 'bob@example.com' },
    createdBy: 'admin-789',
  }

  // JSON-LD user
  const jsonLdUser = {
    '@id': 'https://api.example.com/users/user-123',
    '@type': 'https://schema.org/Person',
    '@version': '5-updated',
    'created_at': '2024-01-15T10:30:00Z',
    'updated_at': '2024-01-20T14:45:00Z',
    'profile': { name: 'Carol Davis', email: 'carol@example.com' },
    'createdBy': 'admin-123',
  }

  // Process each user
  const users = [restUser, mongoUser, jsonLdUser]
  users.forEach((user, index) => {
    try {
      const id = idOf(user)
      const type = typeOf(user)
      const version = versionOf(user)

      // Handle timestamps manually for different formats
      let updated = new Date()
      if (typeof user === 'object' && user !== null) {
        const userObj = user as Record<string, unknown>
        if (userObj.updatedAt instanceof Date) {
          updated = userObj.updatedAt
        } else if (userObj.updated_at instanceof Date) {
          updated = userObj.updated_at
        } else if (typeof userObj.updated_at === 'number') {
          updated = new Date(userObj.updated_at)
        } else if (typeof userObj.updated_at === 'string') {
          updated = new Date(userObj.updated_at)
        }
      }

        logger.info(`User ${index + 1}:`)
        logger.log(`  ID: ${id}`)
        logger.log(`  Type: ${type}`)
        logger.log(`  Version: ${version}`)
        logger.log(`  Updated: ${updated.toISOString()}`)
        logger.log('')
    } catch (error) {
        logger.error(
        `User ${index + 1}: Error processing - ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
        logger.log('')
    }
  })
}

/**
 * Demonstrate format conversion
 */
export function demonstrateFormatConversion(): void {
  logger.info('=== Format Conversion Example ===')
  logger.log('\nConverting REST API user to different formats:\n')

  const restUser = {
    id: 'user-123',
    type: 'user',
    version: 5,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T14:45:00Z'),
    profile: { name: 'Alice Johnson', email: 'alice@example.com' },
    createdBy: 'admin-456',
  }

  // Convert to MongoDB format
  logger.info('MongoDB format:')
  const mongoFormat = convertToMongoDb(restUser)
  logger.log(JSON.stringify(mongoFormat, null, 2))
  logger.log('')

  // Convert to JSON-LD format
  logger.info('JSON-LD format:')
  const jsonLdFormat = convertToJsonLd(restUser)
  logger.log(JSON.stringify(jsonLdFormat, null, 2))
  logger.log('')
}

/**
 * Demonstrate error handling with format conversion
 */
export function demonstrateErrorHandling(): void {
  logger.info('=== Error Handling Example ===')
  logger.log('')

  // Test with invalid data
  const invalidData = { name: 'Invalid User' }

  try {
    // @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
    idOf(invalidData)
    } catch (error) {
      logger.error(
        `Expected error for invalid data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
  }

  // Test with partial data
  const partialData = { id: 'user-123' }

  try {
    // @ts-expect-error - Demonstrating type system correctly rejects partial data missing required fields
    typeOf(partialData)
    } catch (error) {
      logger.error(
        `Error with partial data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
  }
}
