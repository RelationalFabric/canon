# Deduplicating Entities in Heterogeneous Collections

## The Story

You're building a search results page that aggregates data from multiple sources - your product database, a third-party API, and user-generated content. Users are seeing duplicate products because the same item appears with different IDs across sources.

## The Problem

Each source has different ways to identify the same logical entity. Your database uses `product_id`, the API uses `sku`, and user content uses `asin`. Without a unified approach, you'd need complex matching logic that breaks every time a new source is added.

## The Canon Solution

Define a `DeduplicationKey` axiom that captures how to identify the same logical entity across sources.

## The Flow

Start by defining what makes two entities "the same" - maybe it's a combination of name, brand, and price range. Create a `DeduplicationKey` axiom that extracts this signature from any entity.

```typescript
// One simple axiom for deduplication - like Clojure's seq interface
type DeduplicationKeyAxiom = Axiom<{ $basis: Record<string, unknown>; key: string }, { key: string }>;
```

Now your deduplication logic can use `deduplicationKeyOf(entity)` to group similar items.

## The Magic

The same deduplication algorithm works across your database products (with `name`, `brand`, `price`), API products (with `title`, `manufacturer`, `cost`), and user content (with `productName`, `company`, `amount`). You write the matching logic once, and it works everywhere.

```typescript
// One function works with all entity types
function findDuplicates(entities: any[]): any[][] {
  const groups = new Map();
  entities.forEach(entity => {
    const key = deduplicationKeyOf(entity);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entity);
  });
  return Array.from(groups.values()).filter(group => group.length > 1);
}
```