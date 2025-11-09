/**
 * @document.title Multi-Axiom Canon
 * @document.description Working with complex entities that implement multiple axioms (Id, Type, Version, Timestamps, References)
 * @document.keywords multi-axiom, comprehensive, entity, timestamps, references, version
 * @document.difficulty intermediate
 */

/*
Real-world entities often have multiple attributes that need universal extraction: IDs, types, versions, timestamps, and references. Canon's multi-axiom system lets you work with all of these through a single, comprehensive canon.

In this example, we'll work with entities that implement all five core axioms and see how Canon provides unified access to their data.
*/

// ```
import {
  analyzeEntity,
  demonstrateReferenceConversion,
  demonstrateTimestampConversion,
  processEntityUpdate,
} from './utility-functions.js'
import './comprehensive-canon.js'
// ```

/*
# Sample Entities

Let's define some sample entities that implement all five axioms.
*/

// ```
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
// ```

/*
# Analyzing Entities

Canon can extract all axiom values from entities in one pass.
*/

// ```
const userAnalysis = analyzeEntity(userEntity)
const productAnalysis = analyzeEntity(productEntity)
// ```

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The user analysis extracts all five axioms correctly.', () => {
    expect(userAnalysis.id).toBe('user-123')
    expect(userAnalysis.type).toBe('user')
    expect(userAnalysis.version).toBe(5)
    expect(userAnalysis.timestamps).toHaveLength(2)
    expect(userAnalysis.references).toHaveLength(1)
  })

  it('The product analysis also extracts all axioms.', () => {
    expect(productAnalysis.id).toBe('product-456')
    expect(productAnalysis.type).toBe('product')
    expect(productAnalysis.version).toBe(12)
    expect(productAnalysis.timestamps).toHaveLength(2)
    expect(productAnalysis.references).toHaveLength(1)
  })
}

/*
# Processing Updates

Canon's version axiom enables automatic version tracking for entity updates.
*/

// ```
const update = processEntityUpdate(productEntity)
// ```

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The update increments the version from 12 to 13.', () => {
    expect(update.id).toBe('product-456')
    expect(update.oldVersion).toBe(12)
    expect(update.newVersion).toBe(13)
    expect(update.updatedAt).toBeInstanceOf(Date)
  })
}

/*
# Working with Timestamps and References

Canon provides flexible conversion utilities for timestamps and references.
*/

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The timestamp utilities demonstrate various conversion formats.', () => {
    expect(() => demonstrateTimestampConversion()).not.toThrow()
  })

  it('The reference utilities demonstrate conversion patterns.', () => {
    expect(() => demonstrateReferenceConversion()).not.toThrow()
  })
}

/*
# Key Takeaways

- **Comprehensive canons** implement all five core axioms in one definition
- **Unified extraction** - Get all axiom values with consistent APIs
- **Version control** - Automatic version tracking for entity updates
- **Flexible conversions** - Timestamps and references support multiple formats
- Multi-axiom canons power real-world applications with complex entities
*/
