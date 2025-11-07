# 02 Module Style Canon

## File: usage.ts

Using the MongoDB Canon Module

This file demonstrates how a consumer would import and use
the MongoDB canon in their application.

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
// Returns: "507f1f77bcf86cd799439011"
```

Test: Verify MongoDB canon works after registration

## File: mongodb-canon.ts

MongoDB Canon Module

This file shows how you'd define a shareable canon that could be
published as its own npm package (e.g., '@my-org/canon-mongodb').

```typescript
import type { Canon } from '@relational-fabric/canon'
import { defineCanon, pojoWithOfType } from '@relational-fabric/canon'
```

Type-level configuration for MongoDB documents

MongoDB uses '_id' as its primary key field

```typescript
export type MongoDbCanon = Canon<{
  Id: {
    $basis: { _id: string }
    key: '_id'
    $meta: { type: string, format: string }
  }
}>
```

Runtime configuration for MongoDB canon

This is the actual configuration that gets registered.
Export it so other projects can import and use it.

```typescript
export const mongoDbCanon = defineCanon({
  axioms: {
    Id: {
      $basis: pojoWithOfType('_id', 'string'),
      key: '_id',
      $meta: { type: 'objectid', format: 'hex' },
    },
  },
})
```

Test: defineCanon creates the expected structure

