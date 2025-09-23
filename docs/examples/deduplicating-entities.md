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

**Step 2: The usage**
```typescript
// One function works with all entity types using just core axioms
function findDuplicates(entities: any[]): any[][] {
  const groups = new Map();
  entities.forEach(entity => {
    const id = idOf(entity);
    const type = typeOf(entity);
    
    // Business logic: what makes entities "the same"
    const name = (entity as any).name || (entity as any).title || (entity as any).productName;
    const brand = (entity as any).brand || (entity as any).manufacturer || (entity as any).company;
    const price = (entity as any).price || (entity as any).cost || (entity as any).amount;
    
    const deduplicationKey = `${type}-${name}-${brand}-${Math.round(price / 100)}`;
    
    if (!groups.has(deduplicationKey)) groups.set(deduplicationKey, []);
    groups.get(deduplicationKey).push(entity);
  });
  return Array.from(groups.values()).filter(group => group.length > 1);
}
```

## The Magic

The same deduplication algorithm works across your database products (with `name`, `brand`, `price`), API products (with `title`, `manufacturer`, `cost`), and user content (with `productName`, `company`, `amount`). You write the matching logic once, and it works everywhere.