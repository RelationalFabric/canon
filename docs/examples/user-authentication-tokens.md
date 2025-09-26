# Cross-Source Data Transformation

> **Prerequisites**: This example builds on the concepts covered in the [main examples documentation](./tree-walk-over-mixed-entities.md). Make sure you understand the basic Canon concepts before proceeding.

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
- `Timestamps: RepresentationAxiom<number | string | Date | TypeGuard<unknown>>` - for timestamps

**Step 2: Write universal transformation logic using existing APIs**
```typescript
// Type definitions for this example
type CanonDefinition = Record<string, unknown>;
type AxiomDefinition = Record<string, unknown>;
type AxiomConfig = Record<string, unknown>;
type ReportEntity = {
  reportId: string;
  reportType: string;
  reportTimestamp: unknown;
  source: string;
  name: string;
  status: string;
};

import { isPojo, pojoHas } from '@relational-fabric/canon';
import _ from 'lodash';

// Transform any entity into a unified report format
function transformToReport<T extends Pojo>(entity: T): ReportEntity {
  const id = idOf(entity);
  const entityType = typeOf(entity);
  const timestamp = timestampsOf(entity);
  
  // Universal transformation using existing axiom APIs
  return {
    reportId: `report-${id}`,
    reportType: `report-${entityType}`,
    reportTimestamp: timestamp,
    source: sourceOf(id),
    // Additional fields extracted using the same universal approach
    name: extractName(entity),
    status: extractStatus(entity)
  };
}

// Helper functions that work with any entity structure
function extractName<T extends Pojo>(entity: T): string {
  const possibleKeys = ['name', 'title', 'label', 'displayName'];
  const foundKey = _.find(possibleKeys, key => pojoHas(entity, key));
  return foundKey ? (entity[foundKey] as string) : 'Unknown';
}

function extractStatus<T extends Pojo>(entity: T): string {
  const possibleKeys = ['status', 'state', 'phase', 'condition'];
  const foundKey = _.find(possibleKeys, key => pojoHas(entity, key));
  return foundKey ? (entity[foundKey] as string) : 'Unknown';
}
```

**Step 3: Use across multiple canons**
```typescript
// Transform entities from any source using any canon
function processPipeline<T extends Pojo>(entities: T[]): ReportEntity[] {
  return _(entities)
    .filter(entity => idOf(entity) && typeOf(entity))
    .map(transformToReport)
    .value();
}

// Works with database entities
const dbEntities = await databaseEntitiesOf();
const reportDb = processPipeline(dbEntities);

// Works with REST API responses
const apiEntities = await restApiEntitiesOf();
const reportApi = processPipeline(apiEntities);

// Works with GraphQL responses
const graphqlEntities = await graphQLEntitiesOf();
const reportGraphQL = processPipeline(graphqlEntities);

// Combine all reports
const allReports = [...reportDb, ...reportApi, ...reportGraphQL];
```

## Implementation Functions

```typescript
// Helper function to determine source from ID pattern
function sourceOf(id: string): string {
  if (id.startsWith('db-')) return 'database';
  if (id.startsWith('api-')) return 'rest-api';
  if (id.startsWith('gql-')) return 'graphql';
  return 'unknown';
}

// Data source functions following *Of naming convention
async function databaseEntitiesOf() {
  // Simulate database query
  return [
    { id: 'db-user-1', type: 'user', createdAt: new Date('2022-01-01'), name: 'John Doe', status: 'active' },
    { id: 'db-user-2', type: 'user', createdAt: new Date('2022-01-02'), name: 'Jane Smith', status: 'inactive' }
  ];
}

async function restApiEntitiesOf() {
  // Simulate REST API call
  return [
    { id: 'api-user-1', type: 'user', createdAt: '2022-01-01T00:00:00Z', name: 'API User 1', status: 'pending' },
    { id: 'api-user-2', type: 'user', createdAt: '2022-01-02T00:00:00Z', name: 'API User 2', status: 'approved' }
  ];
}

async function graphQLEntitiesOf() {
  // Simulate GraphQL query
  return [
    { id: 'gql-user-1', type: 'user', createdAt: 1640995200, name: 'GraphQL User 1', status: 'verified' },
    { id: 'gql-user-2', type: 'user', createdAt: 1641081600, name: 'GraphQL User 2', status: 'unverified' }
  ];
}
```

## The Magic

The same transformation logic works across your database entities (with `id` and `type` fields), REST API responses (with `@id` and `@type` fields), and GraphQL responses (with `nodeId` and `__typename` fields) in your data pipeline. You write the transformation logic once using the existing axiom APIs, and it works everywhere, making your data pipeline robust and maintainable.