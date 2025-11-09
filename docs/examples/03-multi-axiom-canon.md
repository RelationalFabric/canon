# Multi-Axiom Canon

Working with complex entities that implement multiple axioms (Id, Type, Version, Timestamps, References)

Real-world entities often have multiple attributes that need universal extraction: IDs, types, versions, timestamps, and references. Canon's multi-axiom system lets you work with all of these through a single, comprehensive canon.

In this example, we'll work with entities that implement all five core axioms and see how Canon provides unified access to their data.

```ts
import {
  analyzeEntity,
  demonstrateReferenceConversion,
  demonstrateTimestampConversion,
  processEntityUpdate,
} from './utility-functions.js'
import './comprehensive-canon.js'
```

## Sample Entities

Let's define some sample entities that implement all five axioms.

```ts
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
```

## Analyzing Entities

Canon can extract all axiom values from entities in one pass.

```ts
const userAnalysis = analyzeEntity(userEntity)
const productAnalysis = analyzeEntity(productEntity)
```

**The user analysis extracts all five axioms correctly.:**

```ts
expect(userAnalysis.id).toBe('user-123')
    expect(userAnalysis.type).toBe('user')
    expect(userAnalysis.version).toBe(5)
    expect(userAnalysis.timestamps).toHaveLength(2)
    expect(userAnalysis.references).toHaveLength(1)
```

_Status:_ ✅ pass

**The product analysis also extracts all axioms.:**

```ts
expect(productAnalysis.id).toBe('product-456')
    expect(productAnalysis.type).toBe('product')
    expect(productAnalysis.version).toBe(12)
    expect(productAnalysis.timestamps).toHaveLength(2)
    expect(productAnalysis.references).toHaveLength(1)
```

_Status:_ ✅ pass

## Processing Updates

Canon's version axiom enables automatic version tracking for entity updates.

```ts
const update = processEntityUpdate(productEntity)
```

**The update increments the version from 12 to 13.:**

```ts
expect(update.id).toBe('product-456')
    expect(update.oldVersion).toBe(12)
    expect(update.newVersion).toBe(13)
    expect(update.updatedAt).toBeInstanceOf(Date)
```

_Status:_ ✅ pass

## Working with Timestamps and References

Canon provides flexible conversion utilities for timestamps and references.

**The timestamp utilities demonstrate various conversion formats.:**

```ts
expect(() => demonstrateTimestampConversion()).not.toThrow()
```

_Status:_ ✅ pass

**The reference utilities demonstrate conversion patterns.:**

```ts
expect(() => demonstrateReferenceConversion()).not.toThrow()
```

_Status:_ ✅ pass

## Key Takeaways

- **Comprehensive canons** implement all five core axioms in one definition
- **Unified extraction** - Get all axiom values with consistent APIs
- **Version control** - Automatic version tracking for entity updates
- **Flexible conversions** - Timestamps and references support multiple formats
- Multi-axiom canons power real-world applications with complex entities

---

## References

**Source:** `/Users/bahulneel/Projects/RelationalFabric/canon/examples/03-multi-axiom-canon/index.ts`

## Metadata

**Keywords:** multi-axiom, comprehensive, entity, timestamps, references, version
**Difficulty:** intermediate
