/**
 * Example: Multi-Axiom Canon with All Core Axioms
 *
 * This example demonstrates how to create a comprehensive canon that implements
 * all five core axioms (Id, Type, Version, Timestamps, References) and shows
 * how they work together in real-world scenarios.
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
// STEP 1: Define a Comprehensive Canon
// =============================================================================

/**
 * A comprehensive canon that implements all five core axioms.
 * This represents a typical internal data format for a modern application.
 */
type ComprehensiveCanon = Canon<{
  Id: {
    $basis: { id: string }
    key: 'id'
    $meta: { type: string, format: string }
  }
  Type: {
    $basis: { type: string }
    key: 'type'
    $meta: { enum: string, discriminator: boolean }
  }
  Version: {
    $basis: { version: number }
    key: 'version'
    $meta: { min: number, max: number }
  }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (value: unknown) => value is Date
    $meta: { format: string, timezone: string }
  }
  References: {
    $basis: string | object
    isCanonical: (value: unknown) => value is { ref: string; resolved: boolean; value?: unknown }
    $meta: { format: string, validation: string }
  }
}>

// Register the canon type globally
declare module '@relational-fabric/canon' {
  interface Canons {
    Comprehensive: ComprehensiveCanon
  }
}

// Register the runtime configuration
declareCanon('Comprehensive', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
      $meta: { type: 'uuid', format: 'v4' },
    },
    Type: {
      $basis: pojoWithOfType('type', 'string'),
      key: 'type',
      $meta: { enum: 'user,admin,guest,product,order', discriminator: true },
    },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { min: 1, max: 999999 },
    },
    Timestamps: {
      $basis: (value: unknown): value is number | string | Date => 
        typeof value === 'number' || typeof value === 'string' || value instanceof Date,
      isCanonical: (value: unknown): value is Date => value instanceof Date,
      $meta: { format: 'iso8601', timezone: 'UTC' },
    },
    References: {
      $basis: (value: unknown): value is string | object => 
        typeof value === 'string' || (typeof value === 'object' && value !== null),
      isCanonical: (value: unknown): value is { ref: string; resolved: boolean; value?: unknown } =>
        typeof value === 'object' && value !== null && 'ref' in value && 'resolved' in value,
      $meta: { format: 'uuid', validation: 'strict' },
    },
  },
})

// =============================================================================
// STEP 2: Demonstrate All Axioms Working Together
// =============================================================================

/**
 * A comprehensive user entity that uses all five axioms
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
  preferences: {
    theme: 'dark',
    notifications: true,
  },
}

/**
 * A product entity with references to other entities
 */
const productEntity = {
  id: 'product-456',
  type: 'product',
  version: 12,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework',
  price: 99.99,
  category: 'software',
  // Reference to the user who created this product
  createdBy: 'user-123',
  // Reference to related products
  relatedProducts: ['product-789', 'product-101'],
}

/**
 * A reference object (already in canonical format)
 */
const userReference = {
  ref: 'user-123',
  resolved: true,
  value: userEntity,
}

// =============================================================================
// STEP 3: Demonstrate Universal Functions
// =============================================================================

/**
 * Extract all semantic information from any entity
 */
function analyzeEntity(entity: unknown): {
  id: string
  type: string
  version: number | string
  timestamps: Date[]
  references: Array<{ ref: string; resolved: boolean; value?: unknown }>
} {
  try {
    const id = idOf(entity)
    const type = typeOf(entity)
    const version = versionOf(entity)
    
    // Extract timestamps from the entity
    const timestamps: Date[] = []
    if (typeof entity === 'object' && entity !== null) {
      const obj = entity as Record<string, unknown>
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('At') || key.includes('Time') || key.includes('Date')) {
          try {
            timestamps.push(timestampsOf(value))
          } catch {
            // Skip non-timestamp fields
          }
        }
      }
    }
    
    // Extract references from the entity
    const references: Array<{ ref: string; resolved: boolean; value?: unknown }> = []
    if (typeof entity === 'object' && entity !== null) {
      const obj = entity as Record<string, unknown>
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('Ref') || key.includes('Id') || key === 'createdBy') {
          try {
            references.push(referencesOf(value))
          } catch {
            // Skip non-reference fields
          }
        }
      }
    }
    
    return { id, type, version, timestamps, references }
  } catch (error) {
    throw new Error(`Failed to analyze entity: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// =============================================================================
// STEP 4: Demonstrate Format Conversion
// =============================================================================

/**
 * Convert timestamps between different formats
 */
function demonstrateTimestampConversion() {
  console.log('=== Timestamp Conversion Examples ===')
  
  // Unix timestamp (number)
  const unixTime = 1640995200000
  const unixDate = timestampsOf(unixTime)
  console.log(`Unix timestamp ${unixTime} -> ${unixDate.toISOString()}`)
  
  // ISO string
  const isoString = '2024-01-15T10:30:00Z'
  const isoDate = timestampsOf(isoString)
  console.log(`ISO string "${isoString}" -> ${isoDate.toISOString()}`)
  
  // Already a Date object
  const dateObj = new Date('2024-01-15T10:30:00Z')
  const canonicalDate = timestampsOf(dateObj)
  console.log(`Date object -> ${canonicalDate.toISOString()}`)
}

/**
 * Convert references between different formats
 */
function demonstrateReferenceConversion() {
  console.log('\n=== Reference Conversion Examples ===')
  
  // String reference
  const stringRef = 'user-123'
  const stringRefConverted = referencesOf(stringRef)
  console.log(`String reference "${stringRef}" ->`, stringRefConverted)
  
  // Object reference (already canonical)
  const objectRef = { ref: 'product-456', resolved: false }
  const objectRefConverted = referencesOf(objectRef)
  console.log('Object reference ->', objectRefConverted)
  
  // Complex object with reference fields
  const complexRef = { id: 'order-789', status: 'pending' }
  const complexRefConverted = referencesOf(complexRef)
  console.log('Complex object ->', complexRefConverted)
}

// =============================================================================
// STEP 5: Real-World Business Logic
// =============================================================================

/**
 * Business logic that works with any entity format
 */
function processEntityUpdate(entity: unknown, updates: Record<string, unknown>): unknown {
  const currentVersion = versionOf(entity)
  const entityType = typeOf(entity)
  const entityId = idOf(entity)
  
  console.log(`\n=== Processing Update for ${entityType} ${entityId} ===`)
  console.log(`Current version: ${currentVersion}`)
  
  // Create updated entity with incremented version
  const updatedEntity = {
    ...(entity as Record<string, unknown>),
    ...updates,
    version: (currentVersion as number) + 1,
    updatedAt: new Date(),
  }
  
  console.log(`New version: ${versionOf(updatedEntity)}`)
  console.log(`Updated at: ${timestampsOf(updatedEntity.updatedAt).toISOString()}`)
  
  return updatedEntity
}

// =============================================================================
// STEP 6: Run Examples and Tests
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Multi-Axiom Canon Examples', () => {
    it('extracts all semantic information from user entity', () => {
      const analysis = analyzeEntity(userEntity)
      
      expect(analysis.id).toBe('user-123')
      expect(analysis.type).toBe('user')
      expect(analysis.version).toBe(5)
      expect(analysis.timestamps).toHaveLength(2) // createdAt and updatedAt
      expect(analysis.timestamps[0]).toBeInstanceOf(Date)
    })

    it('extracts references from product entity', () => {
      const analysis = analyzeEntity(productEntity)
      
      expect(analysis.id).toBe('product-456')
      expect(analysis.type).toBe('product')
      expect(analysis.version).toBe(12)
      expect(analysis.references).toHaveLength(1) // createdBy
      expect(analysis.references[0].ref).toBe('user-123')
    })

    it('converts timestamps between formats', () => {
      const unixTime = 1640995200000
      const converted = timestampsOf(unixTime)
      
      expect(converted).toBeInstanceOf(Date)
      expect(converted.getTime()).toBe(unixTime)
    })

    it('converts string references to canonical format', () => {
      const stringRef = 'user-123'
      const converted = referencesOf(stringRef)
      
      expect(converted).toEqual({
        ref: 'user-123',
        resolved: false,
      })
    })

    it('processes entity updates with version increment', () => {
      const updates = { name: 'Updated Product Name' }
      const updated = processEntityUpdate(productEntity, updates)
      
      expect(versionOf(updated)).toBe(13) // 12 + 1
      expect((updated as any).name).toBe('Updated Product Name')
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
const updatedProduct = processEntityUpdate(productEntity, { 
  name: 'Canon Framework Pro',
  price: 149.99 
})

/**
 * Key Takeaways:
 *
 * 1. **Multi-Axiom Canons**: Define canons that implement multiple axioms for comprehensive data modeling
 * 2. **Universal Functions**: Use idOf(), typeOf(), versionOf(), timestampsOf(), referencesOf() together
 * 3. **Format Conversion**: Timestamps and References automatically convert between different formats
 * 4. **Real-World Logic**: Write business logic that works with any entity format
 * 5. **Error Handling**: Handle cases where entities don't match expected axioms
 * 6. **Type Safety**: All functions maintain full TypeScript type safety
 * 7. **Comprehensive Coverage**: Examples should demonstrate all available functionality
 */