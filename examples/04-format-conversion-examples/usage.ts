/**
 * Format Conversion Usage Examples
 *
 * This file demonstrates how to use Canon's format conversion capabilities
 * with real-world examples across different data formats.
 */

import {
  idOf,
  typeOf,
  versionOf,
} from '@relational-fabric/canon'
import {
  demonstrateErrorHandling,
  demonstrateFormatConversion,
  processUsersFromDifferentSources,
} from './conversion-utilities'
import './canons' // Import canon definitions

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

      expect(() => idOf(invalidData)).toThrow('Expected string ID, got undefined')
      expect(() => typeOf(invalidData)).toThrow('Expected string type, got undefined')
    })

    it('handles partial data gracefully', () => {
      const partialData = { id: 'user-123' }

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
