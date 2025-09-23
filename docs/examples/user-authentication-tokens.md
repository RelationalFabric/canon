# Cross-Source Data Transformation

## The Story

You're building a data pipeline that needs to transform entities from multiple sources - your internal database, a REST API, and a GraphQL endpoint - into a unified format for reporting. Each source has different field names and structures, but you need the same transformation logic to work with all of them as part of your larger workflow.

## The Problem

Without a unified approach, you'd need separate transformation code paths for each data source in your pipeline, leading to code duplication and maintenance nightmares. Your transformation middleware becomes a mess of `if (data.source === 'database')` statements.

## The Canon Solution

Use the existing core axioms (`Id`, `Type`, `Timestamp`) that are already defined and registered. The canons are already registered by different parts of your system - you just need to write universal transformation logic using the provided API functions.

## The Flow

**Step 1: The axioms are already defined**
The core axioms are already registered in the global `Axioms` interface:
- `Id: KeyNameAxiom` - for entity identification
- `Type: KeyNameAxiom` - for entity typing
- `Timestamp: TimestampAxiom` - for timestamps

**Step 2: Write universal transformation logic using existing APIs**
```typescript
// Transform any entity into a unified report format
function transformToReport<T extends Satisfies<'Id' | 'Type' | 'Timestamp'>>(entity: T): ReportEntity {
  const id = idOf(entity);
  const entityType = typeOf(entity);
  const timestamp = timestampsOf(entity);
  
  // Universal transformation using existing axiom APIs
  return {
    reportId: `report-${id}`,
    reportType: `report-${entityType}`,
    reportTimestamp: timestamp,
    source: getSourceFromId(id),
    // Additional fields extracted using the same universal approach
    name: extractName(entity),
    status: extractStatus(entity)
  };
}

// Helper functions that work with any entity structure
function extractName<T extends Record<string, unknown>>(entity: T): string {
  const possibleKeys = ['name', 'title', 'label', 'displayName'];
  for (const key of possibleKeys) {
    if (key in entity) return entity[key] as string;
  }
  return 'Unknown';
}

function extractStatus<T extends Record<string, unknown>>(entity: T): string {
  const possibleKeys = ['status', 'state', 'phase', 'condition'];
  for (const key of possibleKeys) {
    if (key in entity) return entity[key] as string;
  }
  return 'Unknown';
}
```

**Step 3: Use across multiple canons**
```typescript
// Transform entities from any source using any canon
function processPipeline<T extends Satisfies<'Id' | 'Type' | 'Timestamp'>>(entities: T[]): ReportEntity[] {
  return entities
    .filter(entity => idOf(entity) && typeOf(entity))
    .map(transformToReport);
}

// Works with database entities
const dbEntities = await getDatabaseEntities();
const reportDb = processPipeline(dbEntities);

// Works with REST API responses
const apiEntities = await getRestApiEntities();
const reportApi = processPipeline(apiEntities);

// Works with GraphQL responses
const graphqlEntities = await getGraphQLEntities();
const reportGraphQL = processPipeline(graphqlEntities);

// Combine all reports
const allReports = [...reportDb, ...reportApi, ...reportGraphQL];
```

## The Magic

The same transformation logic works across your database entities (with `id` and `type` fields), REST API responses (with `@id` and `@type` fields), and GraphQL responses (with `nodeId` and `__typename` fields) in your data pipeline. You write the transformation logic once using the existing axiom APIs, and it works everywhere, making your data pipeline robust and maintainable.