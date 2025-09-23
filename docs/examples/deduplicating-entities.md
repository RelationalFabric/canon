# Deduplicating Entities in Heterogeneous Collections

## The Story

You're building a search results page that aggregates data from multiple sources - your product database, a third-party API, and user-generated content. Users are seeing duplicate products because the same item appears with different IDs across sources.

## The Problem

Each source has different ways to identify the same logical entity. Your database uses `product_id`, the API uses `sku`, and user content uses `asin`. Without a unified approach, you'd need complex matching logic that breaks every time a new source is added.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) to identify entities, then define a `DeduplicationKey` axiom for the business logic of what makes entities "the same".

## The Flow

**Step 1: Decide which axioms are needed**
- `Id` and `Type` from core axioms (already provided)
- `DeduplicationKey` - new axiom for business logic

**Step 2: Compose the Canon and register it**
```typescript
// Define the new axiom type
type DeduplicationKeyAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

// Register only the new axiom
declare module '@relational-fabric/canon' {
  interface Axioms {
    DeduplicationKey: DeduplicationKeyAxiom;
  }
}

// Define the canon for this example
type DeduplicationCanon = Canon<{
  DeduplicationKey: { $basis: { name: string; brand: string; price: number }; key: 'deduplicationKey'; $meta: { type: string } };
}>;
```

**Step 3: Implement the API for the new axiom**
```typescript
function deduplicationKeyOf<T extends Satisfies<'DeduplicationKey'>>(entity: T): string {
  const key = (entity as any).deduplicationKey;
  return `${key.name}-${key.brand}-${Math.round(key.price / 100)}`;
}
```

**Step 4: The usage**
```typescript
// One function works with all entity types
function findDuplicates(entities: any[]): any[][] {
  const groups = new Map();
  entities.forEach(entity => {
    const id = idOf(entity);
    const type = typeOf(entity);
    const key = deduplicationKeyOf(entity);
    const groupKey = `${type}-${key}`;
    
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(entity);
  });
  return Array.from(groups.values()).filter(group => group.length > 1);
}
```

## The Magic

The same deduplication algorithm works across your database products (with `name`, `brand`, `price`), API products (with `title`, `manufacturer`, `cost`), and user content (with `productName`, `company`, `amount`). You write the matching logic once, and it works everywhere.