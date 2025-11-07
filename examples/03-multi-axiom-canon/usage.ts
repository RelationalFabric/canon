/**
 * Multi-Axiom Canon Usage Examples
 *
 * This file demonstrates how to use the comprehensive canon with real-world
 * entities that implement multiple axioms.
 */

import {
  analyzeEntity,
  demonstrateReferenceConversion,
  demonstrateTimestampConversion,
  processEntityUpdate,
} from './utility-functions.js'
import './comprehensive-canon.js' // Import canon definition

// =============================================================================
// Sample Data
// =============================================================================

/**
 * User entity with all five axioms
 */
const userEntity = {
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
 * Product entity with all five axioms
 */
const productEntity = {
  id: 'product-456',
  type: 'product',
  version: 12,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework License',
  price: 99.99,
  category: 'software',
  createdBy: 'user-123',
}

// =============================================================================
// Example Usage
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Multi-Axiom Canon Examples', () => {
    it('analyzes user entity correctly', () => {
      const analysis = analyzeEntity(userEntity)

      expect(analysis.id).toBe('user-123')
      expect(analysis.type).toBe('user')
      expect(analysis.version).toBe(5)
      expect(analysis.timestamps).toHaveLength(2)
      expect(analysis.references).toHaveLength(1)
    })

    it('analyzes product entity correctly', () => {
      const analysis = analyzeEntity(productEntity)

      expect(analysis.id).toBe('product-456')
      expect(analysis.type).toBe('product')
      expect(analysis.version).toBe(12)
      expect(analysis.timestamps).toHaveLength(2)
      expect(analysis.references).toHaveLength(1)
    })

    it('processes entity updates with version increment', () => {
      const update = processEntityUpdate(productEntity)

      expect(update.id).toBe('product-456')
      expect(update.oldVersion).toBe(12)
      expect(update.newVersion).toBe(13)
      expect(update.updatedAt).toBeInstanceOf(Date)
    })

    it('demonstrates timestamp conversion', () => {
      // This test just ensures the function runs without error
      expect(() => demonstrateTimestampConversion()).not.toThrow()
    })

    it('demonstrates reference conversion', () => {
      // This test just ensures the function runs without error
      expect(() => demonstrateReferenceConversion()).not.toThrow()
    })
  })
}

// Run the examples
console.log('=== Multi-Axiom Canon Examples ===')

console.log('\n1. Analyzing user entity:')
const userAnalysis = analyzeEntity(userEntity)
console.log(userAnalysis)

console.log('\n2. Analyzing product entity:')
const productAnalysis = analyzeEntity(productEntity)
console.log(productAnalysis)

demonstrateTimestampConversion()
demonstrateReferenceConversion()

console.log('\n3. Processing entity update:')
processEntityUpdate(productEntity)

/**
 * Key Takeaways:
 *
 * 1. **Comprehensive Canon**: A single canon can implement all five core axioms
 * 2. **Universal Functions**: The same functions work across all axiom types
 * 3. **Type Safety**: Full TypeScript type safety with multiple axioms
 * 4. **Format Conversion**: Automatic conversion between different data formats
 * 5. **Real-World Usage**: Practical examples with user and product entities
 * 6. **Version Control**: Built-in optimistic concurrency control
 * 7. **Timestamp Handling**: Flexible timestamp conversion and validation
 * 8. **Reference Management**: Structured reference handling with resolution tracking
 * 9. **Entity Analysis**: Comprehensive entity analysis across all axioms
 * 10. **Business Logic**: Real-world business scenarios with multiple axioms
 */
