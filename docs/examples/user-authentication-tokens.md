# Cross-Source Data Validation

## The Story

You're building an update process that needs to validate data from multiple sources - your internal database, a REST API, and a GraphQL endpoint. Each source has different field names and structures, but you need the same validation logic to work with all of them as part of your larger workflow.

## The Problem

Without a unified approach, you'd need separate validation code paths for each data source in your update process, leading to code duplication and maintenance nightmares. Your validation middleware becomes a mess of `if (data.source === 'database')` statements.

## The Canon Solution

Use the existing core axioms (`Id` and `Type`) and define additional axioms for validation concepts. The canons are already registered by different parts of your system - you just need to define the validation axioms and write universal logic.

## The Flow

**Step 1: Define validation axioms**
```typescript
// Define validation-specific axioms
type ValidationStatusAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

// Register the new axiom
declare module '@relational-fabric/canon' {
  interface Axioms {
    ValidationStatus: ValidationStatusAxiom;
  }
}

// Implement the API for the new axiom
function validationStatusOf<T extends Satisfies<'ValidationStatus'>>(entity: T): string {
  return (entity as Record<string, unknown>).validationStatus as string;
}
```

**Step 2: Write universal validation logic**
```typescript
// One validation function works with all data sources
function validateEntity<T extends Satisfies<'Id' | 'Type' | 'ValidationStatus'>>(entity: T): boolean {
  const id = idOf(entity);
  const entityType = typeOf(entity);
  const status = validationStatusOf(entity);
  
  // Universal validation logic
  return id && entityType && id.length > 0 && entityType.length > 0 && status !== 'invalid';
}

// Validation for update operations
function canUpdateEntity<T extends Satisfies<'Id' | 'Type' | 'ValidationStatus'>>(entity: T): boolean {
  return validateEntity(entity) && entityType !== 'readonly' && validationStatusOf(entity) === 'valid';
}
```

**Step 3: Use across multiple canons**
```typescript
// Process updates from any source using any canon
function processUpdates<T extends Satisfies<'Id' | 'Type' | 'ValidationStatus'>>(entities: T[]): T[] {
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