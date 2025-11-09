# Module-Style Canon Pattern

Learn how to create reusable, shareable canons that can be published as npm packages

The module-style pattern allows you to create reusable canon configurations that can be:

- Shared across multiple projects
- Published as npm packages
- Versioned independently
- Easily maintained in one place

In this example, we'll create a MongoDB canon module and demonstrate how to use it in an application.

## The Pattern

A shareable canon module typically contains:

1. **Type definition** - TypeScript type for the canon
2. **Runtime configuration** - The actual canon configuration
3. **Exports** - Both type and configuration exported for consumers

Let's see how this works with a MongoDB canon that handles `_id` fields.

## The Canon Module

First, we define our canon in a separate module. This module exports both the type and runtime configuration.

--
Supporting File (`mongodb-canon.ts`)

```ts
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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The canon uses "_id" as the Id key.', () => {
    expect(mongoDbCanon.axioms.Id.key).toBe('_id')
  })

  it('The canon metadata specifies objectid type and hex format.', () => {
    const meta = mongoDbCanon.axioms.Id.$meta as Record<string, unknown>
    expect(meta.type).toBe('objectid')
    expect(meta.format).toBe('hex')
  })
}
```
--

## Using the Canon

Now that we have a reusable canon module, let's see how a consumer application would use it.

```ts
import { declareCanon, idOf } from '@relational-fabric/canon'
import { mongoDbCanon, type MongoDbCanon } from './mongodb-canon.js'

declare module '@relational-fabric/canon' {
interface Canons {
  MongoDb: MongoDbCanon
}
}

declareCanon('MongoDb', mongoDbCanon)
```

## Working with MongoDB Documents

Now `idOf()` automatically works with MongoDB documents.

```ts
const userDocument = {
_id: '507f1f77bcf86cd799439011',
name: 'Alice Johnson',
email: 'alice@example.com',
createdAt: new Date('2024-01-15'),
}

const userId = idOf(userDocument) // Returns: "507f1f77bcf86cd799439011"
```

**The userId variable contains the MongoDB ObjectId.:**

```ts
expect(userId).toBe('507f1f77bcf86cd799439011')
```

_Status:_ ✅ pass

**The function works with any MongoDB document structure.:**

```ts
const productDocument = {
  _id: 'abc123def456',
  title: 'Product Name',
  price: 29.99,
}

expect(idOf(productDocument)).toBe('abc123def456')
```

_Status:_ ✅ pass

## Key Takeaways

- **Module-style canons** are reusable and shareable
- Use `defineCanon()` to create the configuration
- Export both the type and runtime configuration
- Consumers import and register with `declareCanon()`
- This pattern enables **canon libraries** that can be published to npm
- Teams can share canons across projects for consistency

---

## References

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon/index.ts)

**Referenced files:**
- `./mongodb-canon.ts`

## Metadata

**Keywords:** canon, module, reusable, npm, mongodb
**Difficulty:** introductory
