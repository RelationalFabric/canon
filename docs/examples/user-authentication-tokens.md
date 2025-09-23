# Cross-Source Data Validation

## The Story

You're building an update process that needs to validate data from multiple sources - your internal database, a REST API, and a GraphQL endpoint. Each source has different field names and structures, but you need the same validation logic to work with all of them as part of your larger workflow.

## The Problem

Without a unified approach, you'd need separate validation code paths for each data source in your update process, leading to code duplication and maintenance nightmares. Your validation middleware becomes a mess of `if (data.source === 'database')` statements.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) that are already defined and registered. The canons are already registered by different parts of your system - you just need to write universal validation logic using the provided API functions.

## The Flow

**Step 1: The axioms are already defined**
The core axioms are already registered in the global `Axioms` interface:
- `Id: KeyNameAxiom` - for entity identification
- `Type: KeyNameAxiom` - for entity typing
- `Version: KeyNameAxiom` - for versioning
- `Timestamp: TimestampAxiom` - for timestamps

**Step 2: Write universal validation logic using existing APIs**
```typescript
// One validation function works with all data sources using existing APIs
function validateEntity<T extends Satisfies<'Id' | 'Type'>>(entity: T): boolean {
  const id = idOf(entity);
  const entityType = typeOf(entity);
  
  // Universal validation logic using existing axiom APIs
  return id && entityType && id.length > 0 && entityType.length > 0;
}

// Validation for update operations using existing APIs
function canUpdateEntity<T extends Satisfies<'Id' | 'Type' | 'Version'>>(entity: T): boolean {
  const version = versionOf(entity);
  return validateEntity(entity) && entityType !== 'readonly' && version > 0;
}
```

**Step 3: Use across multiple canons**
```typescript
// Process updates from any source using any canon
function processUpdates<T extends Satisfies<'Id' | 'Type' | 'Version'>>(entities: T[]): T[] {
  return entities
    .filter(validateEntity)
    .filter(canUpdateEntity)
    .map(applyUpdate);
}

// Works with database entities
const dbEntities = await getDatabaseEntities();
const validatedDb = processUpdates(dbEntities);

// Works with REST API responses
const apiEntities = await getRestApiEntities();
const validatedApi = processUpdates(apiEntities);

// Works with GraphQL responses
const graphqlEntities = await getGraphQLEntities();
const validatedGraphQL = processUpdates(graphqlEntities);
```

## The Magic

The same validation logic works across your database entities (with `id` and `type` fields), REST API responses (with `@id` and `@type` fields), and GraphQL responses (with `nodeId` and `__typename` fields) in your update process. You write the validation logic once using the existing axiom APIs, and it works everywhere, making your update workflow robust and maintainable.