/**
 * Format Conversion Utilities
 *
 * This file contains utilities for converting entities between different formats
 * and demonstrating cross-format compatibility.
 */

import {
  idOf,
  referencesOf,
  typeOf,
  versionOf,
} from '@relational-fabric/canon'

// =============================================================================
// Format Conversion Functions
// =============================================================================

/**
 * Convert an entity to MongoDB format
 */
export function convertToMongoDb(entity: unknown): Record<string, unknown> {
  try {
    const id = idOf(entity)
    const type = typeOf(entity)
    const version = versionOf(entity)
    const references = referencesOf(entity)

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
    const mongoTimestamps = timestamps.map(ts => ts instanceof Date ? ts.getTime() : Date.now())

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
      createdBy: references[0]?.ref,
    }
  }
  catch {
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
    const id = idOf(entity)
    const type = typeOf(entity)
    const version = versionOf(entity)
    const references = referencesOf(entity)

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
      'createdBy': references[0]?.ref,
    }
  }
  catch {
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
export function processUsersFromDifferentSources(): void {
  console.log('=== Mixed Data Sources Example ===')
  console.log('\nProcessing users from different sources:\n')

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
        }
        else if (userObj.updated_at instanceof Date) {
          updated = userObj.updated_at
        }
        else if (typeof userObj.updated_at === 'number') {
          updated = new Date(userObj.updated_at)
        }
        else if (typeof userObj.updated_at === 'string') {
          updated = new Date(userObj.updated_at)
        }
      }

      console.log(`User ${index + 1}:`)
      console.log(`  ID: ${id}`)
      console.log(`  Type: ${type}`)
      console.log(`  Version: ${version}`)
      console.log(`  Updated: ${updated.toISOString()}`)
      console.log()
    }
    catch (error) {
      console.log(`User ${index + 1}: Error processing - ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.log()
    }
  })
}

/**
 * Demonstrate format conversion
 */
export function demonstrateFormatConversion(): void {
  console.log('=== Format Conversion Example ===')
  console.log('\nConverting REST API user to different formats:\n')

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
  console.log('MongoDB format:')
  const mongoFormat = convertToMongoDb(restUser)
  console.log(JSON.stringify(mongoFormat, null, 2))
  console.log()

  // Convert to JSON-LD format
  console.log('JSON-LD format:')
  const jsonLdFormat = convertToJsonLd(restUser)
  console.log(JSON.stringify(jsonLdFormat, null, 2))
  console.log()
}

/**
 * Demonstrate error handling with format conversion
 */
export function demonstrateErrorHandling(): void {
  console.log('=== Error Handling Example ===')
  console.log()

  // Test with invalid data
  const invalidData = { name: 'Invalid User' }

  try {
    idOf(invalidData)
  }
  catch (error) {
    console.log(`Expected error for invalid data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test with partial data
  const partialData = { id: 'user-123' }

  try {
    typeOf(partialData)
  }
  catch (error) {
    console.log(`Error with partial data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
