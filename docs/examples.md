# Canon Examples: Core Axioms in Practice

## Overview

This document provides comprehensive examples of how to use Canon's core axioms in real-world applications. It demonstrates the power of the axiom system through practical examples, showing how semantic concepts can be implemented across different data formats while maintaining type safety and consistency.

For detailed information about the axiom system architecture, see the [Axioms documentation](./axioms.md). For information about how canons work with axioms, see the [Canons documentation](./canons.md). For the complete definition of the core axioms, see the [Core Axioms documentation](./core-axioms.md).

## The Need for a Core Set of Axioms

### The Problem

In modern applications, data comes from diverse sources with different naming conventions and structural patterns:

- **REST APIs** might use `id`, `type`, `createdAt`
- **MongoDB** might use `_id`, `_type`, `created_at`  
- **JSON-LD** might use `@id`, `@type`, `dateCreated`
- **GraphQL** might use `id`, `__typename`, `createdAt`

Without a standardized approach, developers end up writing format-specific code everywhere:

```typescript
// Without axioms - format-specific code everywhere
function getIdFromRest(data: any) { return data.id; }
function getIdFromMongo(data: any) { return data._id; }
function getIdFromJsonLd(data: any) { return data['@id']; }
function getIdFromGraphQL(data: any) { return data.id; }
```

This leads to:
- **Code duplication** - Same logic repeated for each format
- **Maintenance burden** - Changes require updates in multiple places
- **Type safety issues** - No compile-time validation of field access
- **Testing complexity** - Need to test each format separately

### The Solution: Core Axioms

Canon's core axioms provide a **semantic layer** that abstracts away format differences. Instead of writing format-specific code, developers write **semantic code** that works across all formats:

```typescript
import { idOf } from '@relational-fabric/canon';

// With axioms - universal semantic code

// Works with ALL formats automatically
idOf(restData);    // Uses 'id'
idOf(mongoData);   // Uses '_id'  
idOf(jsonLdData);  // Uses '@id'
idOf(graphqlData); // Uses 'id'
```

## Core Axiom Set

The core axiom set consists of five essential axioms that cover the fundamental concepts found in most data-centric applications. These are fully defined in the [Core Axioms documentation](./core-axioms.md):

1. **Id** - Unique Identifiers
2. **Type** - Entity Classification  
3. **Version** - Data Versioning
4. **Timestamps** - Time-based Data
5. **References** - Entity Relationships

These five axioms provide a solid foundation for semantic programming across diverse data formats.

## Core Axiom Examples

The following examples demonstrate how to use each of the core axioms in practice. For complete axiom definitions and API specifications, see the [Core Axioms documentation](./core-axioms.md).

### 1. Id Axiom Examples

**Purpose**: Represents unique identifiers for entities across different data formats.

**Common Implementations**:
- REST APIs: `{ id: "user-123" }`
- MongoDB: `{ _id: "user-123" }`
- JSON-LD: `{ "@id": "user-123" }`
- GraphQL: `{ id: "user-123" }`

**Example Usage**:

```typescript
import { idOf } from '@relational-fabric/canon';

// Universal function that works with any format

// Usage across different formats
const restUser = { id: "user-123", name: "John" };
const mongoUser = { _id: "user-456", name: "Jane" };
const jsonLdUser = { "@id": "user-789", name: "Bob" };

console.log(idOf(restUser));    // "user-123"
console.log(idOf(mongoUser));   // "user-456" 
console.log(idOf(jsonLdUser));  // "user-789"
```

**Business Logic Example**:

```typescript
import { idOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

class UserService {
  async findUserById<T extends Satisfies<'Id'>>(id: string): Promise<T | null> {
    // Universal ID extraction - works with any format
    const entities = await this.database.findByField('id', id);
    return entities.find(entity => idOf(entity) === id) || null;
  }
  
  async updateUser<T extends Satisfies<'Id'>>(userData: T): Promise<T> {
    const id = idOf(userData);
    return await this.database.update(id, userData);
  }
}
```

### 2. Type Axiom Examples

**Purpose**: Represents entity classification or schema information across different data formats.

**Common Implementations**:
- REST APIs: `{ type: "User" }`
- MongoDB: `{ _type: "User" }`
- JSON-LD: `{ "@type": "User" }`
- GraphQL: `{ __typename: "User" }`

**Example Usage**:

```typescript
import { typeOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Universal type checking

function isUser<T extends Satisfies<'Type'>>(entity: T): boolean {
  const type = typeOf(entity);
  return type === 'User' || type === 'Person';
}

// Usage across different formats
const restUser = { id: "123", type: "User", name: "John" };
const mongoUser = { _id: "456", _type: "User", name: "Jane" };
const jsonLdUser = { "@id": "789", "@type": "Person", name: "Bob" };

console.log(typeOf(restUser));    // "User"
console.log(typeOf(mongoUser));   // "User"
console.log(typeOf(jsonLdUser));  // "Person"

console.log(isUser(restUser));     // true
console.log(isUser(mongoUser));    // true
console.log(isUser(jsonLdUser));   // true
```

**Business Logic Example**:

```typescript
import { typeOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Define application-specific types
interface ValidationResult {
  valid: boolean;
  error?: string;
}

class EntityValidator {
  validateEntity<T extends Satisfies<'Type'>>(entity: T): ValidationResult {
    const type = typeOf(entity);
    
    switch (type) {
      case 'User':
        return this.validateUser(entity);
      case 'Product':
        return this.validateProduct(entity);
      case 'Order':
        return this.validateOrder(entity);
      default:
        return { valid: false, error: `Unknown entity type: ${type}` };
    }
  }
  
  private validateUser<T extends Satisfies<'Type'>>(user: T): ValidationResult {
    // Type-specific validation logic
    return { valid: true };
  }
}
```

### 3. Version Axiom Examples

**Purpose**: Represents version information for data entities, enabling optimistic concurrency control and change tracking.

**Common Implementations**:
- REST APIs: `{ version: 1 }`
- MongoDB: `{ _version: 1 }`
- JSON-LD: `{ "@version": 1 }`
- Custom: `{ rev: 1 }`

**Example Usage**:

```typescript
import { versionOf, inferAxiom } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Universal version handling

function incrementVersion<T extends Satisfies<'Version'>>(entity: T): T {
  const config = inferAxiom('Version', entity);
  return {
    ...entity,
    [config.key]: versionOf(entity) + 1
  };
}

// Usage across different formats
const restEntity = { id: "123", type: "User", version: 1, name: "John" };
const mongoEntity = { _id: "456", _type: "User", _version: 2, name: "Jane" };

console.log(versionOf(restEntity));     // 1
console.log(versionOf(mongoEntity));    // 2

const updatedRest = incrementVersion(restEntity);
console.log(versionOf(updatedRest));    // 2
```

**Business Logic Example**:

```typescript
import { idOf, versionOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

class OptimisticConcurrencyService {
  async updateEntity<T extends Satisfies<'Id' | 'Version'>>(
    entity: T, 
    updates: Partial<T>
  ): Promise<T> {
    const id = idOf(entity);
    const currentVersion = versionOf(entity);
    
    // Check if entity has been modified since last read
    const latestEntity = await this.database.findById(id);
    if (versionOf(latestEntity) !== currentVersion) {
      throw new Error('Entity has been modified by another user');
    }
    
    // Apply updates and increment version
    const updatedEntity = {
      ...entity,
      ...updates,
      ...incrementVersion(entity)
    };
    
    return await this.database.update(id, updatedEntity);
  }
}
```

### 4. Timestamps Axiom Examples

**Purpose**: Represents time-based data with automatic conversion between different timestamp formats.

**Common Implementations**:
- Unix timestamps: `{ createdAt: 1640995200 }`
- ISO strings: `{ createdAt: "2022-01-01T00:00:00Z" }`
- Date objects: `{ createdAt: new Date() }`
- Custom formats: `{ created_at: "2022-01-01" }`

**Example Usage**:

```typescript
import { timestampsOf, inferAxiom } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Universal timestamp handling

function setTimestamps<T extends Satisfies<'Timestamps'>>(
  entity: T, 
  timestamp: Date
): T {
  const config = inferAxiom('Timestamps', entity);
  return {
    ...entity,
    [config.key]: config.fromCanonical(timestamp)
  };
}

// Usage across different formats
const unixEntity = { id: "123", createdAt: 1640995200 };
const isoEntity = { id: "456", createdAt: "2022-01-01T00:00:00Z" };
const dateEntity = { id: "789", createdAt: new Date("2022-01-01") };

console.log(timestampsOf(unixEntity));  // 2022-01-01T00:00:00.000Z
console.log(timestampsOf(isoEntity));   // 2022-01-01T00:00:00.000Z
console.log(timestampsOf(dateEntity));  // 2022-01-01T00:00:00.000Z
```

**Business Logic Example**:

```typescript
import { idOf, timestampsOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Define application-specific types
interface AuditLog {
  entityId: string;
  action: string;
  timestamp: Date;
  createdAt: Date;
}

class AuditService {
  async createAuditLog<T extends Satisfies<'Id' | 'Timestamps'>>(
    entity: T,
    action: string
  ): Promise<AuditLog> {
    const id = idOf(entity);
    const timestamp = timestampsOf(entity);
    
    return {
      entityId: id,
      action,
      timestamp,
      createdAt: new Date()
    };
  }
  
  async findRecentChanges<T extends Satisfies<'Timestamps'>>(
    entities: T[],
    since: Date
  ): T[] {
    return entities.filter(entity => 
      timestampsOf(entity) > since
    );
  }
}
```

### 5. References Axiom

**Purpose**: Represents relationships between entities with automatic conversion between different reference formats.

**Definition**: A `ReferencesAxiom` that provides conversion functions between different reference representations.

**Common Implementations**:
- String IDs: `{ userId: "user-123" }`
- Object references: `{ user: { id: "user-123", name: "John" } }`
- Array references: `{ tags: ["tag1", "tag2"] }`
- URI references: `{ user: "https://api.example.com/users/123" }`

**Example Usage**:

```typescript
import { referencesOf, inferAxiom } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Universal reference handling

function setReferences<T extends Satisfies<'References'>>(
  entity: T, 
  reference: string
): T {
  const config = inferAxiom('References', entity);
  return {
    ...entity,
    [config.key]: config.fromCanonical(reference)
  };
}

// Usage across different formats
const stringRef = { id: "123", userId: "user-456" };
const objectRef = { id: "789", user: { id: "user-456", name: "John" } };
const arrayRef = { id: "101", tags: ["tag1", "tag2"] };

console.log(referencesOf(stringRef));  // "user-456"
console.log(referencesOf(objectRef));  // "user-456"
console.log(referencesOf(arrayRef));   // "tag1,tag2"
```

**Business Logic Example**:

```typescript
import { referencesOf } from '@relational-fabric/canon';
import type { Satisfies } from '@relational-fabric/canon';

// Define application-specific types
interface ResolvedEntity {
  [key: string]: any;
  resolvedReferences?: any;
}

interface Entity {
  id: string;
  [key: string]: any;
}

class RelationshipService {
  async resolveReferences<T extends Satisfies<'References'>>(
    entities: T[]
  ): Promise<ResolvedEntity[]> {
    const references = entities.map(entity => referencesOf(entity));
    const resolvedRefs = await this.database.findByIds(references);
    
    return entities.map(entity => ({
      ...entity,
      resolvedReferences: resolvedRefs.find(ref => 
        ref.id === referencesOf(entity)
      )
    }));
  }
  
  async findRelatedEntities<T extends Satisfies<'References'>>(
    entity: T,
    relationType: string
  ): Promise<Entity[]> {
    const reference = referencesOf(entity);
    return await this.database.findByRelation(relationType, reference);
  }
}
```

## Complete Working Example

Here's a comprehensive example showing how all core axioms work together in a real application:

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf, inferAxiom } from '@relational-fabric/canon';
import type { Satisfies, KeyNameAxiom, TimestampsAxiom, ReferencesAxiom } from '@relational-fabric/canon';

// 1. Register all core axioms
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;
    Type: KeyNameAxiom;
    Version: KeyNameAxiom;
    Timestamps: TimestampsAxiom;
    References: ReferencesAxiom;
  }
}

// 2. Universal entity operations
class UniversalEntityService {
  // Create entity with all core properties
  async createEntity<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    entityData: T
  ): Promise<T> {
    const id = idOf(entityData);
    const type = typeOf(entityData);
    const version = versionOf(entityData) || 1;
    const timestamp = timestampsOf(entityData) || new Date();
    
    // Validate entity
    if (!this.isValidId(id)) {
      throw new Error('Invalid entity ID');
    }
    
    if (!this.isValidType(type)) {
      throw new Error('Invalid entity type');
    }
    
    // Store with audit trail
    const entity = {
      ...entityData,
      ...setTimestamps(entityData, timestamp),
      ...incrementVersion(entityData)
    };
    
    await this.database.save(entity);
    await this.auditService.logCreation(entity);
    
    return entity;
  }
  
  // Update entity with optimistic concurrency
  async updateEntity<T extends Satisfies<'Id' | 'Type' | 'Version' | 'Timestamps'>>(
    entity: T,
    updates: Partial<T>
  ): Promise<T> {
    const id = idOf(entity);
    const currentVersion = versionOf(entity);
    
    // Check for concurrent modifications
    const latestEntity = await this.database.findById(id);
    if (versionOf(latestEntity) !== currentVersion) {
      throw new Error('Entity has been modified by another user');
    }
    
    // Apply updates
    const updatedEntity = {
      ...entity,
      ...updates,
      ...setTimestamps(entity, new Date()),
      ...incrementVersion(entity)
    };
    
    await this.database.update(id, updatedEntity);
    await this.auditService.logUpdate(entity, updatedEntity);
    
    return updatedEntity;
  }
  
  // Find entities by type with time filtering
  async findEntitiesByType<T extends Satisfies<'Type' | 'Timestamps'>>(
    type: string,
    since?: Date
  ): Promise<T[]> {
    const entities = await this.database.findByType(type);
    
    if (since) {
      return entities.filter(entity => 
        timestampsOf(entity) > since
      );
    }
    
    return entities;
  }
  
  // Resolve entity relationships
  async resolveRelationships<T extends Satisfies<'References'>>(
    entities: T[]
  ): Promise<ResolvedEntity[]> {
    const references = entities.map(entity => referencesOf(entity));
    const resolvedRefs = await this.database.findByIds(references);
    
    return entities.map(entity => ({
      ...entity,
      resolvedReferences: resolvedRefs.find(ref => 
        ref.id === referencesOf(entity)
      )
    }));
  }
  
  // Validation helpers
  private isValidId(id: string): boolean {
    return id && id.length > 0;
  }
  
  private isValidType(type: string): boolean {
    return ['User', 'Product', 'Order', 'Category'].includes(type);
  }
}

// 3. Usage with different data formats
const service = new UniversalEntityService();

// REST API format
const restUser = {
  id: "user-123",
  type: "User",
  version: 1,
  createdAt: "2022-01-01T00:00:00Z",
  name: "John Doe",
  email: "john@example.com"
};

// MongoDB format
const mongoUser = {
  _id: "user-456",
  _type: "User",
  _version: 1,
  created_at: 1640995200,
  name: "Jane Doe",
  email: "jane@example.com"
};

// JSON-LD format
const jsonLdUser = {
  "@id": "user-789",
  "@type": "User",
  "@version": 1,
  "dateCreated": "2022-01-01T00:00:00Z",
  "name": "Bob Smith",
  "email": "bob@example.com"
};

// All work with the same service methods
await service.createEntity(restUser);
await service.createEntity(mongoUser);
await service.createEntity(jsonLdUser);

// Universal queries work across all formats
const recentUsers = await service.findEntitiesByType("User", new Date("2022-01-01"));
const allUsers = await service.findEntitiesByType("User");
```

## Best Practices

1. **Start with Core Axioms**: Begin with the five core axioms (Id, Type, Version, Timestamps, References) before adding custom ones.

2. **Use Semantic Names**: Choose axiom names that represent business concepts, not technical implementation details.

3. **Leverage Type Safety**: Always use the `Satisfies` constraint to ensure type safety at compile time.

4. **Test Across Formats**: Write tests that verify your code works with different data formats.

5. **Document Conversions**: Clearly document how different timestamp and reference formats are converted.

6. **Handle Edge Cases**: Consider what happens when required fields are missing or have unexpected values.

7. **Performance Considerations**: Be aware that axiom resolution has a small runtime cost, so cache results when possible.

## Conclusion

The core axiom set provides a powerful foundation for building universal, format-agnostic applications. By focusing on semantic concepts rather than technical implementation details, developers can write code that works seamlessly across different data sources and formats.

This approach enables:
- **Reduced complexity** - One set of business logic for all data formats
- **Better maintainability** - Changes in one place affect all formats
- **Improved type safety** - Compile-time validation of semantic operations
- **Easier testing** - Test business logic independently of data format
- **Future-proofing** - Easy to add new data sources without changing business logic

The examples in this document demonstrate how these principles work in practice, providing a solid foundation for building robust, data-centric applications with Canon.