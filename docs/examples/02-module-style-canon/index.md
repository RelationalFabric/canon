# 02 Module Style Canon

Using the MongoDB Canon Module

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon)

## Files

- `02-module-style-canon/mongodb-canon.ts`
- `02-module-style-canon/usage.ts`

## File: `02-module-style-canon/mongodb-canon.ts`

```typescript
/**
 * MongoDB Canon Module
 *
 * This file shows how you'd define a shareable canon that could be
 * published as its own npm package (e.g., '@my-org/canon-mongodb').
 */

import type { Canon } from '@relational-fabric/canon'
import { defineCanon, pojoWithOfType } from '@relational-fabric/canon'

/**
 * Type-level configuration for MongoDB documents
 *
 * MongoDB uses '_id' as its primary key field
 */
export type MongoDbCanon = Canon<{
  Id: {
    $basis: { _id: string }
    key: '_id'
    $meta: { type: string, format: string }
  }
}>

/**
 * Runtime configuration for MongoDB canon
 *
 * This is the actual configuration that gets registered.
 * Export it so other projects can import and use it.
 */
export const mongoDbCanon = defineCanon({
  axioms: {
    Id: {
      $basis: pojoWithOfType('_id', 'string'),
      key: '_id',
      $meta: { type: 'objectid', format: 'hex' },
    },
  },
})

// Test: defineCanon creates the expected structure
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('creates a reusable MongoDB canon configuration', () => {
    expect(mongoDbCanon.axioms.Id.key).toBe('_id')
    expect((mongoDbCanon.axioms.Id.$meta as any).type).toBe('objectid')
    expect((mongoDbCanon.axioms.Id.$meta as any).format).toBe('hex')
  })
}
```
## File: `02-module-style-canon/usage.ts`

```typescript
/**
 * Using the MongoDB Canon Module
 *
 * This file demonstrates how a consumer would import and use
 * the MongoDB canon in their application.
 */

import { declareCanon, idOf } from '@relational-fabric/canon'
import { mongoDbCanon, type MongoDbCanon } from './mongodb-canon.js'

/**
 * Step 1: Register the canon type globally
 *
 * This augments TypeScript's type system so it knows about the MongoDb canon.
 */
declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDb: MongoDbCanon
  }
}

/**
 * Step 2: Register the runtime configuration
 *
 * Use declareCanon() to register the imported canon in the global shell.
 */
declareCanon('MongoDb', mongoDbCanon)

/**
 * Step 3: Use it in your application!
 *
 * Now idOf() automatically works with MongoDB documents.
 */
const userDocument = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15'),
}

const userId = idOf(userDocument)
// Returns: "507f1f77bcf86cd799439011"

// Test: Verify MongoDB canon works after registration
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('extracts _id from MongoDB documents', () => {
    expect(userId).toBe('507f1f77bcf86cd799439011')
  })

  it('works with any MongoDB document structure', () => {
    const productDocument = {
      _id: 'abc123def456',
      title: 'Product Name',
      price: 29.99,
    }

    expect(idOf(productDocument)).toBe('abc123def456')
  })
}
```
