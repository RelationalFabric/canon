# Deduplicating Entities in Heterogeneous Collections

## The Story

You're building a search results page that aggregates data from multiple sources - your product database, a third-party API, and user-generated content. Users are seeing duplicate products because the same item appears with different IDs across sources.

## The Problem

Each source has different ways to identify the same logical entity. Your database uses `product_id`, the API uses `sku`, and user content uses `asin`. Without a unified approach, you'd need complex matching logic that breaks every time a new source is added.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) to identify entities. No new axioms needed - just use the business logic of what makes entities "the same".

## The Flow

**Step 1: Decide which axioms are needed**
- `Id` and `Type` from core axioms (already provided)
- No new axioms needed!

**Step 2: Define the Canons**
```typescript
// Define the canon for internal products
type ProductCanon = Canon<{
  Id: { $basis: { id: string }; key: 'id'; $meta: { type: string; required: string } };
  Type: { $basis: { type: string }; key: 'type'; $meta: { enum: string; discriminator: string } };
}>;

// Define the canon for external JSON-LD products
type JsonLdProductCanon = Canon<{
  Id: { $basis: { '@id': string }; key: '@id'; $meta: { type: string; required: string } };
  Type: { $basis: { '@type': string }; key: '@type'; $meta: { enum: string; discriminator: string } };
}>;

// Register both canons globally
declare module '@relational-fabric/canon' {
  interface Canons {
    products: ProductCanon;
    jsonLdProducts: JsonLdProductCanon;
  }
}

// Register the runtime configurations
declareCanon('products', {
  axioms: {
    Id: { $basis: { id: 'string' }, key: 'id', $meta: { type: 'string', required: 'true' } },
    Type: { $basis: { type: 'string' }, key: 'type', $meta: { enum: 'string', discriminator: 'string' } },
  },
});

declareCanon('jsonLdProducts', {
  axioms: {
    Id: { $basis: { '@id': 'string' }, key: '@id', $meta: { type: 'string', required: 'true' } },
    Type: { $basis: { '@type': 'string' }, key: '@type', $meta: { enum: 'string', discriminator: 'string' } },
  },
});
```

**Step 3: Import and register external canons**
```typescript
// Import external canon from a module
import jsonLdCanon, { type JsonLdProductCanon } from '@my-org/json-ld-canon';
import { registerCanons } from '@relational-fabric/canon';

// Register all canons together
registerCanons({ 
  products: productCanon,
  jsonLdProducts: jsonLdCanon 
});
```

**Step 4: The usage**
```typescript
// One function works with all entity types using just core axioms
function findDuplicates(entities: any[]): any[][] {
  const groups = new Map();
  entities.forEach(entity => {
    const id = idOf(entity);
    const type = typeOf(entity);
    const groupKey = `${type}-${id}`;
    
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(entity);
  });
  return Array.from(groups.values()).filter(group => group.length > 1);
}
```

## The Magic

The same deduplication algorithm works across your database products (with `name`, `brand`, `price`), API products (with `title`, `manufacturer`, `cost`), and user content (with `productName`, `company`, `amount`). You write the matching logic once, and it works everywhere.