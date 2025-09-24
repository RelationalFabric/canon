# Deduplicating Entities in Heterogeneous Collections

> **Prerequisites**: This example builds on the concepts covered in the [main examples documentation](../examples.md). Make sure you understand the basic Canon concepts before proceeding.

## The Story

You're building an update process that needs to deduplicate entities from multiple sources - your product database, a third-party API, and user-generated content. As part of your workflow, you need to identify and merge duplicate products before applying updates, but the same item appears with different IDs across sources.

## The Problem

Each source has different ways to identify the same logical entity. Your database uses `product_id`, the API uses `sku`, and user content uses `asin`. Without a unified approach, you'd need complex matching logic in your update process that breaks every time a new source is added.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) to identify entities. No new axioms needed - just use the business logic of what makes entities "the same".

## The Flow

**Step 1: Decide which axioms are needed**
- `Id` and `Type` from core axioms (already provided)
- No new axioms needed!

**Step 2: Use the existing core axioms**
```typescript
// The core axioms (Id, Type) are already defined and registered
// No need to redefine them - just use them directly in your business logic
```

**Step 3: Import and register external canons**
```typescript
// Import JSON-LD canon from Canon
import jsonLdCanon, { type JsonLdCanon } from '@relational-fabric/canon/jsonld';
import { registerCanons } from '@relational-fabric/canon';

// Register external canon using registerCanons
registerCanons({ 
  JsonLd: jsonLdCanon 
});
```

**Step 4: The usage**
```typescript
// One function works with all entity types using just core axioms
function findDuplicates<T extends Satisfies<'Id' | 'Type'>>(entities: T[]): T[][] {
  const groups = new Map<string, T[]>();
  entities.forEach(entity => {
    const id = idOf(entity);
    const entityType = typeOf(entity);
    const groupKey = `${entityType}-${id}`;
    
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(entity);
  });
  return Array.from(groups.values()).filter(group => group.length > 1);
}
```

## The Magic

The same deduplication algorithm works across your database products (with `name`, `brand`, `price`), API products (with `title`, `manufacturer`, `cost`), and user content (with `productName`, `company`, `amount`) in your update process. You write the matching logic once, and it works everywhere, making your update workflow robust and maintainable.