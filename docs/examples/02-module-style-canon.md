# Using the MongoDB Canon Module

```typescript
import { declareCanon, idOf } from '@relational-fabric/canon'

import { mongoDbCanon, type MongoDbCanon } from './mongodb-canon.js'
```

Step 1: Register the canon type globally

This augments TypeScript's type system so it knows about the MongoDb canon.

```typescript
declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDb: MongoDbCanon
  }
}
```

Step 2: Register the runtime configuration

Use declareCanon() to register the imported canon in the global shell.

```typescript
declareCanon('MongoDb', mongoDbCanon)
```

Step 3: Use it in your application!

Now idOf() automatically works with MongoDB documents.

```typescript
const userDocument = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15'),
}

const userId = idOf(userDocument)
```

**Test: extracts _id from MongoDB documents** ✅

```typescript
expect(userId).toBe('507f1f77bcf86cd799439011')
```

**Test: works with any MongoDB document structure** ✅

```typescript
const productDocument = {
      _id: 'abc123def456',
      title: 'Product Name',
      price: 29.99,
    }
expect(idOf(productDocument)).toBe('abc123def456')
```

---

## References

**Source:** `02-module-style-canon/usage.ts`
