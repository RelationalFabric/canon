# Cross-Source Data Validation

## The Story

You're building an update process that needs to validate data from multiple sources - your internal database, a REST API, and a GraphQL endpoint. Each source has different field names and structures, but you need the same validation logic to work with all of them as part of your larger workflow.

## The Problem

Without a unified approach, you'd need separate validation code paths for each data source in your update process, leading to code duplication and maintenance nightmares. Your validation middleware becomes a mess of `if (data.source === 'database')` statements.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) across multiple canons. The canons are already registered by different parts of your system - you just need to write universal validation logic.

## The Flow

**Step 1: Multiple canons are already in use**
Your system already has canons registered for different data sources:
- `DatabaseCanon` for internal database entities
- `RestApiCanon` for REST API responses  
- `GraphQLCanon` for GraphQL responses

**Step 2: Write universal validation logic**
```typescript
// One validation function works with all data sources
function validateEntity<T extends Satisfies<'Id' | 'Type'>>(entity: T): boolean {
  const id = idOf(entity);
  const entityType = typeOf(entity);
  
  // Universal validation logic
  return id && entityType && id.length > 0 && entityType.length > 0;
}

// Validation for update operations
function canUpdateEntity<T extends Satisfies<'Id' | 'Type'>>(entity: T): boolean {
  return validateEntity(entity) && entityType !== 'readonly';
}
```

**Step 3: Use across multiple canons**
```typescript
// Process updates from any source using any canon
function processUpdates<T extends Satisfies<'Id' | 'Type'>>(entities: T[]): T[] {
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

The same validation logic works across your database entities (with `id` and `type` fields), REST API responses (with `@id` and `@type` fields), and GraphQL responses (with `nodeId` and `__typename` fields) in your update process. You write the validation logic once, and it works everywhere, making your update workflow robust and maintainable.