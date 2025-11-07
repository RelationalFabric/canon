# 03 Multi Axiom Canon

Multi-Axiom Canon Usage Examples

## Key Concepts

- **Comprehensive Canon**: A single canon can implement all five core axioms
- **Universal Functions**: The same functions work across all axiom types
- **Type Safety**: Full TypeScript type safety with multiple axioms
- **Format Conversion**: Automatic conversion between different data formats
- **Real-World Usage**: Practical examples with user and product entities
- **Version Control**: Built-in optimistic concurrency control
- **Timestamp Handling**: Flexible timestamp conversion and validation
- **Reference Management**: Structured reference handling with resolution tracking
- **Entity Analysis**: Comprehensive entity analysis across all axioms
- **Business Logic**: Real-world business scenarios with multiple axioms

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon)

## Files

- `03-multi-axiom-canon/comprehensive-canon.ts`
- `03-multi-axiom-canon/usage.ts`
- `03-multi-axiom-canon/utility-functions.ts`

## File: `03-multi-axiom-canon/comprehensive-canon.ts`

```typescript
/**
 * Comprehensive Canon Definition
 *
 * This file defines a comprehensive canon that implements all five core axioms
 * (Id, Type, Version, Timestamps, References) and shows how they work together.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// Comprehensive Canon Definition
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
    isCanonical: (value: unknown) => value is { ref: string, resolved: boolean, value?: unknown }
    $meta: { format: string, validation: string }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    ComprehensiveCanon: ComprehensiveCanon
  }
}

// Register the comprehensive canon
declareCanon('ComprehensiveCanon', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
      $meta: { type: 'string', format: 'uuid' },
    },
    Type: {
      $basis: pojoWithOfType('type', 'string'),
      key: 'type',
      $meta: { enum: 'entity', discriminator: true },
    },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { min: 1, max: 1000000 },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'iso8601', timezone: 'UTC' },
    },
    References: {
      $basis: (v: unknown): v is string | object =>
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string, resolved: boolean, value?: unknown } =>
        typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v,
      $meta: { format: 'uuid', validation: 'strict' },
    },
  },
})

export type { ComprehensiveCanon }

```

## File: `03-multi-axiom-canon/usage.ts`

```typescript
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

```

## File: `03-multi-axiom-canon/utility-functions.ts`

```typescript
/**
 * Utility Functions for Multi-Axiom Canon
 *
 * This file contains utility functions that demonstrate how to work with
 * entities that implement multiple axioms.
 */

import type { EntityReference, Satisfies } from '@relational-fabric/canon'
import { idOf, referencesOf, typeOf, versionOf } from '@relational-fabric/canon'

type MultiAxiomEntity = Satisfies<'Id'> & Satisfies<'Type'> & Satisfies<'Version'> & Satisfies<'References'> & {
  createdAt?: Date
  updatedAt?: Date
}

function ensureEntity(entity: unknown): MultiAxiomEntity {
  return entity as MultiAxiomEntity
}

// =============================================================================
// Entity Analysis Functions
// =============================================================================

/**
 * Analyze an entity and extract all available axiom data
 */
export function analyzeEntity(input: unknown): {
  id: string
  type: string
  version: string | number
  timestamps: Date[]
  references: Array<{ ref: string, resolved: boolean, value?: unknown }>
} {
  const entity = ensureEntity(input)
  const id = idOf(entity)
  const type = typeOf(entity)
  const version = typeof versionOf(entity) === 'number'
    ? versionOf(entity) as number
    : Number(versionOf(entity))

  // Handle timestamps manually since the canon doesn't know about createdAt/updatedAt
  const timestamps: Date[] = []
  if (entity.createdAt instanceof Date)
    timestamps.push(entity.createdAt)
  if (entity.updatedAt instanceof Date)
    timestamps.push(entity.updatedAt)

  const references = referencesOf(entity)
  const referenceList: EntityReference<string, unknown>[] = Array.isArray(references) ? references : [references]

  return {
    id,
    type,
    version: Number.isFinite(version) ? version : 0,
    timestamps,
    references: referenceList,
  }
}

/**
 * Demonstrate timestamp conversion from different formats
 */
export function demonstrateTimestampConversion(): void {
  console.log('=== Timestamp Conversion Examples ===')

  // Unix timestamp
  const unixTimestamp = 1640995200000
  const unixConverted = new Date(unixTimestamp)
  console.log(`Unix timestamp ${unixTimestamp} -> ${unixConverted.toISOString()}`)

  // ISO string
  const isoString = '2024-01-15T10:30:00Z'
  const isoConverted = new Date(isoString)
  console.log(`ISO string "${isoString}" -> ${isoConverted.toISOString()}`)

  // Date object
  const dateObject = new Date('2024-01-15T10:30:00Z')
  console.log(`Date object -> ${dateObject.toISOString()}`)
}

/**
 * Demonstrate reference conversion from different formats
 */
export function demonstrateReferenceConversion(): void {
  console.log('=== Reference Conversion Examples ===')

  // String reference
  const stringRef = 'user-123'
  const stringConverted = { ref: stringRef, resolved: false }
  console.log(`String reference "${stringRef}" ->`, stringConverted)

  // Object reference
  const objectRef = { ref: 'product-456', resolved: false }
  console.log(`Object reference ->`, objectRef)

  // Complex object
  const complexRef = { ref: 'order-789', resolved: false, value: undefined }
  console.log(`Complex object ->`, complexRef)
}

/**
 * Process an entity update with version increment
 */
export function processEntityUpdate(input: unknown): {
  id: string
  oldVersion: string | number
  newVersion: string | number
  updatedAt: Date
} {
  const entity = ensureEntity(input)
  const id = idOf(entity)
  const rawVersion = versionOf(entity)
  const numericVersion = typeof rawVersion === 'number' ? rawVersion : Number(rawVersion)
  const oldVersion = Number.isFinite(numericVersion) ? numericVersion : 0
  const newVersion = oldVersion + 1
  const updatedAt = new Date()

  console.log(`\n=== Processing Update for ${typeOf(entity as Satisfies<'Type'>)} ${id} ===`)
  console.log(`Current version: ${oldVersion}`)
  console.log(`New version: ${newVersion}`)
  console.log(`Updated at: ${updatedAt.toISOString()}`)

  return {
    id,
    oldVersion,
    newVersion,
    updatedAt,
  }
}

```
