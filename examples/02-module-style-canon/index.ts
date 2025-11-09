/**
 * @document.title Module-Style Canon Pattern
 * @document.description Learn how to create reusable, shareable canons that can be published as npm packages
 * @document.keywords canon, module, reusable, npm, mongodb
 * @document.difficulty introductory
 */

/*
The module-style pattern allows you to create reusable canon configurations that can be:
- Shared across multiple projects
- Published as npm packages
- Versioned independently
- Easily maintained in one place

In this example, we'll create a MongoDB canon module and demonstrate how to use it in an application.

# The Pattern

A shareable canon module typically contains:
1. **Type definition** - TypeScript type for the canon
2. **Runtime configuration** - The actual canon configuration
3. **Exports** - Both type and configuration exported for consumers

Let's see how this works with a MongoDB canon that handles `_id` fields.
*/

/*
# The Canon Module

First, we define our canon in a separate module. This module exports both the type and runtime configuration.
*/

// #+
// @include ./mongodb-canon.ts
// #-

/*
# Using the Canon

Now that we have a reusable canon module, let's see how a consumer application would use it.
*/

// ```
import { declareCanon, idOf } from '@relational-fabric/canon'
import { mongoDbCanon, type MongoDbCanon } from './mongodb-canon.js'

declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDb: MongoDbCanon
  }
}

declareCanon('MongoDb', mongoDbCanon)
// ```

/*
# Working with MongoDB Documents

Now `idOf()` automatically works with MongoDB documents.
*/

// ```
const userDocument = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15'),
}

const userId = idOf(userDocument) // Returns: "507f1f77bcf86cd799439011"
// ```

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The userId variable contains the MongoDB ObjectId.', () => {
    expect(userId).toBe('507f1f77bcf86cd799439011')
  })

  it('The function works with any MongoDB document structure.', () => {
    const productDocument = {
      _id: 'abc123def456',
      title: 'Product Name',
      price: 29.99,
    }

    expect(idOf(productDocument)).toBe('abc123def456')
  })
}

/*
# Key Takeaways

- **Module-style canons** are reusable and shareable
- Use `defineCanon()` to create the configuration
- Export both the type and runtime configuration
- Consumers import and register with `declareCanon()`
- This pattern enables **canon libraries** that can be published to npm
- Teams can share canons across projects for consistency
*/
