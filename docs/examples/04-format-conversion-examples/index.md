# 04 Format Conversion Examples

Format Conversion Usage Examples

## Key Concepts

- **Cross-Format Compatibility**: Same business logic works across different data formats
- **Automatic Conversion**: Canon automatically converts between formats
- **Type Safety**: Full TypeScript type safety across all formats
- **Real-World Usage**: Practical examples with REST APIs, MongoDB, and JSON-LD
- **Error Handling**: Graceful error handling for invalid or partial data
- **Format Conversion**: Built-in utilities for converting between formats
- **Universal Functions**: Same functions work regardless of data format
- **Metadata Preservation**: Format-specific metadata is preserved and accessible
- **Business Logic**: Complex business logic works seamlessly across formats
- **Integration**: Easy integration with existing systems and data sources

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples)

## Files

- `04-format-conversion-examples/canons.ts`
- `04-format-conversion-examples/conversion-utilities.ts`
- `04-format-conversion-examples/usage.ts`

## File: `04-format-conversion-examples/canons.ts`

```typescript
/**
 * Format-Specific Canon Definitions
 *
 * This file defines canons for different data formats (REST API, MongoDB, JSON-LD)
 * to demonstrate Canon's cross-format compatibility.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// REST API Canon - Standard camelCase format
// =============================================================================

type RestApiCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { format: 'camelCase' } }
  Version: { $basis: { version: number }, key: 'version', $meta: { format: 'integer' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'Date' }
  }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'string' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    RestApiCanon: RestApiCanon
  }
}

declareCanon('RestApiCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { format: 'camelCase' } },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { format: 'integer' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
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

// =============================================================================
// MongoDB Canon - Underscore prefix format
// =============================================================================

type MongoDbCanon = Canon<{
  Id: { $basis: { _id: string }, key: '_id', $meta: { format: 'ObjectId' } }
  Type: { $basis: { _type: string }, key: '_type', $meta: { format: 'underscore' } }
  Version: { $basis: { _version: number }, key: '_version', $meta: { format: 'integer' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'mixed' }
  }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'ObjectId' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDbCanon: MongoDbCanon
  }
}

declareCanon('MongoDbCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('_id', 'string'), key: '_id', $meta: { format: 'ObjectId' } },
    Type: {
      $basis: pojoWithOfType('_type', 'string'),
      key: '_type',
      $meta: { format: 'underscore' },
    },
    Version: {
      $basis: pojoWithOfType('_version', 'number'),
      key: '_version',
      $meta: { format: 'integer' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'mixed' },
    },
    References: {
      $basis: (v: unknown): v is string | object =>
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string, resolved: boolean } =>
        typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v,
      $meta: { format: 'ObjectId' },
    },
  },
})

// =============================================================================
// JSON-LD Canon - Semantic web format
// =============================================================================

type JsonLdCanon = Canon<{
  Id: { $basis: { '@id': string }, key: '@id', $meta: { format: 'URI' } }
  Type: { $basis: { '@type': string }, key: '@type', $meta: { format: 'URI' } }
  Version: { $basis: { '@version': string }, key: '@version', $meta: { format: 'string' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'iso8601' }
  }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'URI' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    JsonLdCanon: JsonLdCanon
  }
}

declareCanon('JsonLdCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id', $meta: { format: 'URI' } },
    Type: { $basis: pojoWithOfType('@type', 'string'), key: '@type', $meta: { format: 'URI' } },
    Version: {
      $basis: pojoWithOfType('@version', 'string'),
      key: '@version',
      $meta: { format: 'string' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'iso8601' },
    },
    References: {
      $basis: (v: unknown): v is string | object =>
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string, resolved: boolean } =>
        typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v,
      $meta: { format: 'URI' },
    },
  },
})

export type { JsonLdCanon, MongoDbCanon, RestApiCanon }
```
## File: `04-format-conversion-examples/conversion-utilities.ts`

```typescript
/**
 * Format Conversion Utilities
 *
 * This file contains utilities for converting entities between different formats
 * and demonstrating cross-format compatibility.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { idOf, referencesOf, typeOf, versionOf } from '@relational-fabric/canon'

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
      console.log(
        `User ${index + 1}: Error processing - ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
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
    // @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
    idOf(invalidData)
  }
  catch (error) {
    console.log(
      `Expected error for invalid data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }

  // Test with partial data
  const partialData = { id: 'user-123' }

  try {
    // @ts-expect-error - Demonstrating type system correctly rejects partial data missing required fields
    typeOf(partialData)
  }
  catch (error) {
    console.log(
      `Error with partial data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
```
## File: `04-format-conversion-examples/usage.ts`

```typescript
/**
 * Format Conversion Usage Examples
 *
 * This file demonstrates how to use Canon's format conversion capabilities
 * with real-world examples across different data formats.
 */

import { idOf, typeOf, versionOf } from '@relational-fabric/canon'
import {
  demonstrateErrorHandling,
  demonstrateFormatConversion,
  processUsersFromDifferentSources,
} from './conversion-utilities.js'
import './canons.js' // Import canon definitions

// =============================================================================
// Sample Data
// =============================================================================

/**
 * REST API user entity
 */
const restApiUser = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  profile: { name: 'Alice Johnson', email: 'alice@example.com' },
  createdBy: 'admin-456',
}

/**
 * MongoDB user entity
 */
const mongoDbUser = {
  _id: '507f1f77bcf86cd799439011',
  _type: 'User',
  _version: 6,
  created_at: 1705314600000,
  updated_at: 1705761900000,
  profile: { name: 'Bob Smith', email: 'bob@example.com' },
  createdBy: 'admin-789',
}

/**
 * JSON-LD user entity
 */
const jsonLdUser = {
  '@id': 'https://api.example.com/users/user-123',
  '@type': 'https://schema.org/Person',
  '@version': '5-updated',
  'created_at': '2024-01-15T10:30:00Z',
  'updated_at': '2024-01-20T14:45:00Z',
  'profile': { name: 'Carol Davis', email: 'carol@example.com' },
  'createdBy': 'admin-123',
}

// =============================================================================
// Example Usage
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Format Conversion Examples', () => {
    it('processes REST API user correctly', () => {
      const id = idOf(restApiUser)
      const type = typeOf(restApiUser)
      const version = versionOf(restApiUser)

      // Handle timestamps manually since the canon doesn't know about createdAt/updatedAt
      const timestamps: Date[] = []
      if (typeof restApiUser === 'object' && restApiUser !== null) {
        const obj = restApiUser as Record<string, unknown>
        if (obj.createdAt instanceof Date)
          timestamps.push(obj.createdAt)
        if (obj.updatedAt instanceof Date)
          timestamps.push(obj.updatedAt)
      }

      expect(id).toBe('user-123')
      expect(type).toBe('user')
      expect(version).toBe(5)
      expect(timestamps).toHaveLength(2)
    })

    it('processes MongoDB user correctly', () => {
      const id = idOf(mongoDbUser)
      const type = typeOf(mongoDbUser)
      const version = versionOf(mongoDbUser)

      // Handle timestamps manually since the canon doesn't know about created_at/updated_at
      const timestamps: Date[] = []
      if (typeof mongoDbUser === 'object' && mongoDbUser !== null) {
        const obj = mongoDbUser as Record<string, unknown>
        if (typeof obj.created_at === 'number')
          timestamps.push(new Date(obj.created_at))
        if (typeof obj.updated_at === 'number')
          timestamps.push(new Date(obj.updated_at))
      }

      expect(id).toBe('507f1f77bcf86cd799439011')
      expect(type).toBe('User')
      expect(version).toBe(6)
      expect(timestamps).toHaveLength(2)
    })

    it('processes JSON-LD user correctly', () => {
      const id = idOf(jsonLdUser)
      const type = typeOf(jsonLdUser)
      const version = versionOf(jsonLdUser)

      // Handle timestamps manually since the canon doesn't know about created_at/updated_at
      const timestamps: Date[] = []
      if (typeof jsonLdUser === 'object' && jsonLdUser !== null) {
        const obj = jsonLdUser as Record<string, unknown>
        if (typeof obj.created_at === 'string')
          timestamps.push(new Date(obj.created_at))
        if (typeof obj.updated_at === 'string')
          timestamps.push(new Date(obj.updated_at))
      }

      expect(id).toBe('https://api.example.com/users/user-123')
      expect(type).toBe('https://schema.org/Person')
      expect(version).toBe('5-updated')
      expect(timestamps).toHaveLength(2)
    })

    it('handles invalid data gracefully', () => {
      const invalidData = { name: 'Invalid User' }

      // @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
      expect(() => idOf(invalidData)).toThrow('Expected string ID, got undefined')
      // @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
      expect(() => typeOf(invalidData)).toThrow('Expected string type, got undefined')
    })

    it('handles partial data gracefully', () => {
      const partialData = { id: 'user-123' }

      // @ts-expect-error - Demonstrating type system correctly rejects partial data missing required fields
      expect(() => typeOf(partialData)).toThrow('Expected string type, got undefined')
    })

    it('demonstrates format conversion', () => {
      // This test just ensures the function runs without error
      expect(() => demonstrateFormatConversion()).not.toThrow()
    })

    it('demonstrates error handling', () => {
      // This test just ensures the function runs without error
      expect(() => demonstrateErrorHandling()).not.toThrow()
    })
  })
}

// Run the examples
console.log('=== Format Conversion Examples ===')

processUsersFromDifferentSources()
demonstrateFormatConversion()
demonstrateErrorHandling()

/**
 * Key Takeaways:
 *
 * 1. **Cross-Format Compatibility**: Same business logic works across different data formats
 * 2. **Automatic Conversion**: Canon automatically converts between formats
 * 3. **Type Safety**: Full TypeScript type safety across all formats
 * 4. **Real-World Usage**: Practical examples with REST APIs, MongoDB, and JSON-LD
 * 5. **Error Handling**: Graceful error handling for invalid or partial data
 * 6. **Format Conversion**: Built-in utilities for converting between formats
 * 7. **Universal Functions**: Same functions work regardless of data format
 * 8. **Metadata Preservation**: Format-specific metadata is preserved and accessible
 * 9. **Business Logic**: Complex business logic works seamlessly across formats
 * 10. **Integration**: Easy integration with existing systems and data sources
 */
```
