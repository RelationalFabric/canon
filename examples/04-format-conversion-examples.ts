/**
 * Example: Format Conversion and Cross-Format Compatibility
 *
 * This example demonstrates Canon's powerful format conversion capabilities,
 * showing how the same business logic works across different data formats
 * (REST APIs, MongoDB, JSON-LD, etc.) with automatic conversion.
 */

import type { Canon } from '@relational-fabric/canon'
import { 
  declareCanon, 
  idOf, 
  typeOf, 
  versionOf, 
  timestampsOf, 
  referencesOf,
  pojoWithOfType 
} from '@relational-fabric/canon'

// =============================================================================
// STEP 1: Define Multiple Data Format Canons
// =============================================================================

/**
 * REST API Canon - Standard camelCase format
 */
type RestApiCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { format: 'camelCase' } }
  Version: { $basis: { version: number }, key: 'version', $meta: { format: 'integer' } }
  Timestamps: { $basis: number | string | Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'Date' } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: 'string' } }
}>

/**
 * MongoDB Canon - Underscore prefix format
 */
type MongoDbCanon = Canon<{
  Id: { $basis: { _id: string }, key: '_id', $meta: { format: 'ObjectId' } }
  Type: { $basis: { _type: string }, key: '_type', $meta: { format: 'underscore' } }
  Version: { $basis: { _version: number }, key: '_version', $meta: { format: 'integer' } }
    Timestamps: { $basis: number | string | Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'mixed' } }
    References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: 'ObjectId' } }
}>

/**
 * JSON-LD Canon - Semantic web format
 */
type JsonLdCanon = Canon<{
  Id: { $basis: { '@id': string }, key: '@id', $meta: { format: 'URI' } }
  Type: { $basis: { '@type': string }, key: '@type', $meta: { format: 'URI' } }
  Version: { $basis: { '@version': string }, key: '@version', $meta: { format: 'string' } }
  Timestamps: { $basis: string | Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'ISO8601' } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: 'URI' } }
}>

// Register all canons
declare module '@relational-fabric/canon' {
  interface Canons {
    RestApi: RestApiCanon
    MongoDb: MongoDbCanon
    JsonLd: JsonLdCanon
  }
}

declareCanon('RestApi', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { format: 'camelCase' } },
    Version: { $basis: pojoWithOfType('version', 'number'), key: 'version', $meta: { format: 'integer' } },
    Timestamps: { $basis: (v: unknown): v is number | string | Date => typeof v === 'number' || typeof v === 'string' || v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'Date' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v, $meta: { format: 'string' } },
  },
})

declareCanon('MongoDb', {
  axioms: {
    Id: { $basis: pojoWithOfType('_id', 'string'), key: '_id', $meta: { format: 'ObjectId' } },
    Type: { $basis: pojoWithOfType('_type', 'string'), key: '_type', $meta: { format: 'underscore' } },
    Version: { $basis: pojoWithOfType('_version', 'number'), key: '_version', $meta: { format: 'integer' } },
    Timestamps: { $basis: (v: unknown): v is number | string | Date => typeof v === 'number' || typeof v === 'string' || v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'mixed' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v, $meta: { format: 'ObjectId' } },
  },
})

declareCanon('JsonLd', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id', $meta: { format: 'URI' } },
    Type: { $basis: pojoWithOfType('@type', 'string'), key: '@type', $meta: { format: 'URI' } },
    Version: { $basis: pojoWithOfType('@version', 'string'), key: '@version', $meta: { format: 'string' } },
    Timestamps: { $basis: (v: unknown): v is string | Date => typeof v === 'string' || v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'ISO8601' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v, $meta: { format: 'URI' } },
  },
})

// =============================================================================
// STEP 2: Sample Data in Different Formats
// =============================================================================

/**
 * REST API format data
 */
const restApiUser = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  createdBy: 'admin-456',
}

/**
 * MongoDB format data
 */
const mongoDbUser = {
  _id: '507f1f77bcf86cd799439011',
  _type: 'User',
  _version: 5,
  createdAt: 1640995200000, // Unix timestamp
  updatedAt: '2024-01-20T14:45:00Z', // ISO string
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  createdBy: '507f1f77bcf86cd799439012', // ObjectId string
}

/**
 * JSON-LD format data
 */
const jsonLdUser = {
  '@id': 'https://api.example.com/users/user-123',
  '@type': 'https://schema.org/Person',
  '@version': '5',
  createdAt: '2024-01-15T10:30:00Z', // ISO string
  updatedAt: '2024-01-20T14:45:00Z', // ISO string
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  createdBy: 'https://api.example.com/users/admin-456',
}

// =============================================================================
// STEP 3: Universal Business Logic
// =============================================================================

/**
 * Universal function that works with any data format
 */
function processUserUpdate(user: unknown, updates: Record<string, unknown>): {
  id: string
  type: string
  version: number | string
  updatedAt: Date
  changes: Record<string, unknown>
} {
  // Extract semantic information using universal functions
  const id = idOf(user)
  const type = typeOf(user)
  const currentVersion = versionOf(user)
  
  // Find and convert timestamp fields
  let updatedAt: Date
  if (typeof user === 'object' && user !== null) {
    const obj = user as Record<string, unknown>
    const timestampFields = ['updatedAt', 'modifiedAt', 'lastModified']
    
    for (const field of timestampFields) {
      if (field in obj) {
        try {
          updatedAt = timestampsOf(obj[field])
          break
        } catch {
          // Try next field
        }
      }
    }
  }
  
  // If no timestamp found, use current time
  if (!updatedAt!) {
    updatedAt = new Date()
  }
  
  // Increment version (handle both number and string versions)
  const newVersion = typeof currentVersion === 'number' 
    ? currentVersion + 1 
    : `${currentVersion}-updated`
  
  return {
    id,
    type,
    version: newVersion,
    updatedAt,
    changes: updates,
  }
}

/**
 * Convert entity between different formats
 */
function convertEntityFormat(entity: unknown, targetFormat: 'rest' | 'mongo' | 'jsonld'): Record<string, unknown> {
  const id = idOf(entity)
  const type = typeOf(entity)
  const version = versionOf(entity)
  
  // Extract timestamps
  const timestamps: Record<string, Date> = {}
  if (typeof entity === 'object' && entity !== null) {
    const obj = entity as Record<string, unknown>
    for (const [key, value] of Object.entries(obj)) {
      if (key.includes('At') || key.includes('Time') || key.includes('Date')) {
        try {
          timestamps[key] = timestampsOf(value)
        } catch {
          // Skip non-timestamp fields
        }
      }
    }
  }
  
  // Convert based on target format
  switch (targetFormat) {
    case 'rest':
      return {
        id,
        type,
        version,
        ...timestamps,
        ...(entity as Record<string, unknown>),
      }
    
    case 'mongo':
      return {
        _id: id,
        _type: type,
        _version: version,
        ...Object.fromEntries(
          Object.entries(timestamps).map(([key, value]) => [
            key.replace(/([A-Z])/g, '_$1').toLowerCase(),
            value.getTime() // Convert to Unix timestamp
          ])
        ),
        ...(entity as Record<string, unknown>),
      }
    
    case 'jsonld':
      return {
        '@id': `https://api.example.com/${type}s/${id}`,
        '@type': `https://schema.org/${type.charAt(0).toUpperCase() + type.slice(1)}`,
        '@version': String(version),
        ...Object.fromEntries(
          Object.entries(timestamps).map(([key, value]) => [
            key.replace(/([A-Z])/g, '_$1').toLowerCase(),
            value.toISOString()
          ])
        ),
        ...(entity as Record<string, unknown>),
      }
    
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`)
  }
}

// =============================================================================
// STEP 4: Demonstrate Cross-Format Operations
// =============================================================================

/**
 * Demonstrate working with mixed data sources
 */
function demonstrateMixedDataSources() {
  console.log('=== Mixed Data Sources Example ===')
  
  const users = [restApiUser, mongoDbUser, jsonLdUser]
  
  console.log('\nProcessing users from different sources:')
  users.forEach((user, index) => {
    const result = processUserUpdate(user, { 
      lastLogin: new Date().toISOString(),
      status: 'active' 
    })
    
    console.log(`\nUser ${index + 1}:`)
    console.log(`  ID: ${result.id}`)
    console.log(`  Type: ${result.type}`)
    console.log(`  Version: ${result.version}`)
    console.log(`  Updated: ${result.updatedAt.toISOString()}`)
  })
}

/**
 * Demonstrate format conversion
 */
function demonstrateFormatConversion() {
  console.log('\n=== Format Conversion Example ===')
  
  console.log('\nConverting REST API user to different formats:')
  
  // Convert to MongoDB format
  const mongoFormat = convertEntityFormat(restApiUser, 'mongo')
  console.log('\nMongoDB format:')
  console.log(JSON.stringify(mongoFormat, null, 2))
  
  // Convert to JSON-LD format
  const jsonLdFormat = convertEntityFormat(restApiUser, 'jsonld')
  console.log('\nJSON-LD format:')
  console.log(JSON.stringify(jsonLdFormat, null, 2))
}

// =============================================================================
// STEP 5: Error Handling and Edge Cases
// =============================================================================

/**
 * Demonstrate error handling for invalid data
 */
function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Example ===')
  
  const invalidData = {
    // Missing required fields
    name: 'Invalid User',
    email: 'invalid@example.com',
  }
  
  try {
    const id = idOf(invalidData)
    console.log('ID extracted:', id)
  } catch (error) {
    console.log('Expected error for invalid data:', error instanceof Error ? error.message : 'Unknown error')
  }
  
  // Test with partial data
  const partialData = {
    id: 'user-456',
    // Missing type and version
    name: 'Partial User',
  }
  
  try {
    const id = idOf(partialData)
    const type = typeOf(partialData)
    console.log('Partial data - ID:', id, 'Type:', type)
  } catch (error) {
    console.log('Error with partial data:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// =============================================================================
// STEP 6: Run Examples and Tests
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Format Conversion Examples', () => {
    it('extracts data from REST API format', () => {
      const id = idOf(restApiUser)
      const type = typeOf(restApiUser)
      const version = versionOf(restApiUser)
      
      expect(id).toBe('user-123')
      expect(type).toBe('user')
      expect(version).toBe(5)
    })

    it('extracts data from MongoDB format', () => {
      const id = idOf(mongoDbUser)
      const type = typeOf(mongoDbUser)
      const version = versionOf(mongoDbUser)
      
      expect(id).toBe('507f1f77bcf86cd799439011')
      expect(type).toBe('User')
      expect(version).toBe(5)
    })

    it('extracts data from JSON-LD format', () => {
      const id = idOf(jsonLdUser)
      const type = typeOf(jsonLdUser)
      const version = versionOf(jsonLdUser)
      
      expect(id).toBe('https://api.example.com/users/user-123')
      expect(type).toBe('https://schema.org/Person')
      expect(version).toBe('5')
    })

    it('converts timestamps between formats', () => {
      // Test Unix timestamp conversion
      const unixTime = 1640995200000
      const converted = timestampsOf(unixTime)
      expect(converted).toBeInstanceOf(Date)
      expect(converted.getTime()).toBe(unixTime)
      
      // Test ISO string conversion
      const isoString = '2024-01-15T10:30:00Z'
      const isoConverted = timestampsOf(isoString)
      expect(isoConverted).toBeInstanceOf(Date)
      expect(isoConverted.toISOString()).toBe('2024-01-15T10:30:00.000Z')
    })

    it('converts references between formats', () => {
      // Test string reference conversion
      const stringRef = 'user-123'
      const converted = referencesOf(stringRef)
      expect(converted).toEqual({
        ref: 'user-123',
        resolved: false,
      })
      
      // Test object reference (already canonical)
      const objectRef = { ref: 'user-456', resolved: true, value: { name: 'Test' } }
      const objectConverted = referencesOf(objectRef)
      expect(objectConverted).toEqual(objectRef)
    })

    it('processes updates across different formats', () => {
      const restUpdate = processUserUpdate(restApiUser, { status: 'active' })
      const mongoUpdate = processUserUpdate(mongoDbUser, { status: 'active' })
      const jsonLdUpdate = processUserUpdate(jsonLdUser, { status: 'active' })
      
      expect(restUpdate.id).toBe('user-123')
      expect(mongoUpdate.id).toBe('507f1f77bcf86cd799439011')
      expect(jsonLdUpdate.id).toBe('https://api.example.com/users/user-123')
      
      // All should have incremented versions
      expect(restUpdate.version).toBe(6)
      expect(mongoUpdate.version).toBe(6)
      expect(jsonLdUpdate.version).toBe('5-updated')
    })

    it('handles errors gracefully', () => {
      const invalidData = { name: 'Invalid' }
      
      expect(() => idOf(invalidData)).toThrow('Expected string ID, got undefined')
      expect(() => typeOf(invalidData)).toThrow('Expected string type, got undefined')
    })
  })
}

// Run the examples
console.log('=== Format Conversion Examples ===')
demonstrateMixedDataSources()
demonstrateFormatConversion()
demonstrateErrorHandling()

/**
 * Key Takeaways:
 *
 * 1. **Multi-Format Support**: Define canons for different data formats (REST, MongoDB, JSON-LD)
 * 2. **Universal Functions**: Same business logic works across all formats
 * 3. **Automatic Conversion**: Timestamps and references convert between formats automatically
 * 4. **Format Conversion**: Convert entities between different data formats
 * 5. **Error Handling**: Gracefully handle invalid or incomplete data
 * 6. **Real-World Scenarios**: Examples show practical cross-format operations
 * 7. **Type Safety**: Maintain full TypeScript type safety across all formats
 */