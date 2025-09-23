# Canons: Universal Type Blueprints

## Overview

A **Canon** is a universal type blueprint that serves as a foundational building block for robust, data-centric applications. Canons solve the "empty room problem" by providing a consistent set of initial design decisions and type primitives that can be shared and composed across any project.

**The Core Power**: Multiple canons can exist at runtime, each representing different data formats (JSON-LD, MongoDB, REST APIs, etc.), yet developers can program against a **single, common API** for semantic properties. This enables truly universal code that works across diverse data structures without format-specific logic.

## What is a Canon?

A Canon is a type that defines its data model using a predefined set of universal axioms. Think of it as a contract that establishes:

1. **Structural Identity** - What fields and types comprise the data
2. **Canonical Keys** - Which field serves as the primary identifier
3. **Metadata Context** - Rich configuration and validation rules
4. **Runtime Behavior** - How the type behaves at execution time

**The Key Insight**: A Canon is a **format-specific implementation** of universal semantic concepts. Multiple Canons can exist simultaneously, each representing different data formats (JSON-LD, MongoDB, REST APIs, etc.), but they all implement the same semantic concepts. This enables developers to write **universal code** that works across all formats through a common API.

## The Type System Architecture

### The Augmentable Interface Pattern

Canons leverage TypeScript's **augmentable interface** pattern to create a global registry of available axioms. This is the foundational mechanism that enables type-safe composition:

```typescript
// Global augmentable interface for axioms
interface Axioms {
  // Axioms are registered here by implementors
  // Each axiom defines both type and runtime requirements
}

// Canon definition uses the augmentable interface
type Canon<T extends CanonDefinition> = {
  [K in keyof T]: T[K] extends Axioms[keyof Axioms] 
    ? T[K] 
    : never;
};

// CanonDefinition constrains what can be used in a Canon
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};
```

This pattern ensures that:
- **Axiom types define structure** - Each axiom type specifies the shape that instances must follow
- **Axiom registrations enforce types** - The `Axioms` interface ensures only registered axiom types can be used
- **Canons use axiom keys** - A Canon uses axiom keys to enforce the correct shape
- **Type safety is enforced** - The compiler ensures only valid axioms can be used in Canon definitions

### How Axioms Define Structure Requirements

When an axiom is registered in the `Axioms` interface, it references an axiom type that defines the **shape** that instances must follow:

```typescript
// First, define axiom types
type KeyNameAxiom = {
  base: Record<string, unknown>;
  key: string;
  meta?: Record<string, string>;
};

// Then register axioms in the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;        // Id must conform to KeyNameAxiom shape
    Type: KeyNameAxiom;      // Type must conform to KeyNameAxiom shape
    Version: KeyNameAxiom;   // Version must conform to KeyNameAxiom shape
  }
}

// Now any Canon can use these axiom keys - the shape is enforced by the axiom type
type MyCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: 'true' };
  };  // Must conform to KeyNameAxiom shape
  Type: {
    base: { type: string };
    key: 'type';
    meta: { enum: 'user,admin,guest'; discriminator: 'true' };
  };  // Must conform to KeyNameAxiom shape
  Version: {
    base: { version: number };
    key: 'version';
    meta: { default: '1'; min: '1' };
  };  // Must conform to KeyNameAxiom shape
}>;
```

The axiom type defines the **structure** that instances must conform to, and the axiom key enforces this conformance.

### CanonDefinition Constraint System

The `CanonDefinition` type ensures that Canons can only use valid axiom keys:

```typescript
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};

// This means a Canon can only use axiom keys that exist in the Axioms interface
type ValidCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: 'true' };
  };  // ✅ Valid - Uses Id axiom key, must conform to KeyNameAxiom shape
  Type: {
    base: { type: string };
    key: 'type';
    meta: { enum: 'user,admin,guest'; discriminator: 'true' };
  };  // ✅ Valid - Uses Type axiom key, must conform to KeyNameAxiom shape
  Invalid: SomeOtherType;  // ❌ Error - Not in Axioms interface
}>;
```

This constraint system ensures:
- **Type safety** - Only registered axiom keys can be used
- **Shape consistency** - All instances must conform to their axiom type's shape
- **Discoverability** - Available axioms are clearly defined in the interface

## Understanding Axioms in Canons

Each Canon **collects specific incarnations** of axioms for a given model. The axioms define what utilities expect, and the canon provides the specific implementation:

### Canon Implementation

A canon provides specific implementations of axioms for a given data model:

```typescript
// JSON-LD Canon - specific implementation for JSON-LD format
type JsonLdCanon = Canon<{
  Id: {
    basis: { '@id': string };
    key: '@id';
    meta: { format: 'json-ld' };
  };  // Specific implementation of Id axiom for JSON-LD
  Type: {
    basis: { '@type': string };
    key: '@type';
    meta: { format: 'json-ld' };
  };  // Specific implementation of Type axiom for JSON-LD
}>;

// Standard Canon - specific implementation for standard format
type StandardCanon = Canon<{
  Id: {
    basis: { id: string };
    key: 'id';
    meta: { format: 'standard' };
  };  // Specific implementation of Id axiom for standard format
  Type: {
    basis: { type: string };
    key: 'type';
    meta: { format: 'standard' };
  };  // Specific implementation of Type axiom for standard format
}>;
```

### Runtime Configuration

The runtime config provides the actual values needed at runtime:

```typescript
interface AxiomRuntime {
  [K in keyof Axioms]: {
    keyValue: string;  // The actual key value at runtime
    metaValues: Record<string, string>;  // The actual meta values at runtime
  };
}

// Example runtime configuration
declare module '@relational-fabric/canon' {
  interface AxiomRuntime {
    Id: {
      keyValue: 'id';  // Runtime value for the key
      metaValues: { type: 'uuid'; required: 'true' };
    };
    Type: {
      keyValue: 'type';
      metaValues: { enum: 'user,admin,guest'; discriminator: 'true' };
    };
  }
}
```

### Type Safety Through Axiom Interface

The augmentable interface pattern ensures that:
- **Axiom types define what utilities expect** - The interface that utilities will work with
- **Canons provide specific implementations** - Each canon implements the axioms for its format
- **Runtime config provides actual values** - The real values needed at runtime
- **Type checking is enforced** - The compiler validates conformance to the axiom interface

## Universal Data Structure Operations

The most powerful feature of Canon is **universal data structure operations** - the ability to write code that works identically across completely different data formats through a common semantic API. This is where Canon's true value shines.

### The Problem Canon Solves

Consider a typical application that needs to work with data from multiple sources:

```typescript
// Different data formats for the same semantic concept
const jsonLdUser = { "@id": "user-123", "@type": "Person", "name": "John" };
const mongoUser = { "_id": "user-123", "_type": "Person", "name": "John" };
const restUser = { "id": "user-123", "type": "Person", "name": "John" };
const graphqlUser = { "id": "user-123", "__typename": "Person", "name": "John" };

// Without Canon - format-specific code everywhere
function getIdFromJsonLd(user: any) { return user["@id"]; }
function getIdFromMongo(user: any) { return user["_id"]; }
function getIdFromRest(user: any) { return user["id"]; }
function getIdFromGraphQL(user: any) { return user["id"]; }

// With Canon - universal code that works everywhere
function getId<T extends Satisfies<'Id'>>(user: T): string {
  const config = inferAxiom('Id', user);
  return user[config.key] as string;
}

// All of these work with the same function:
getId(jsonLdUser);  // Returns "user-123" using @id
getId(mongoUser);   // Returns "user-123" using _id  
getId(restUser);    // Returns "user-123" using id
getId(graphqlUser); // Returns "user-123" using id
```

### Multiple Canons, Single API

The magic happens when you have multiple canons registered at runtime, each representing different data formats, but your code uses a **single, universal API**:

```typescript
// Register multiple canons for different data formats
declare module '@relational-fabric/canon' {
  interface Canons {
    JsonLd: Canon<{
      Id: { basis: { '@id': string }; key: '@id'; meta: { format: 'json-ld' } };
      Type: { basis: { '@type': string }; key: '@type'; meta: { format: 'json-ld' } };
    }>;
    Mongo: Canon<{
      Id: { basis: { '_id': string }; key: '_id'; meta: { format: 'mongodb' } };
      Type: { basis: { '_type': string }; key: '_type'; meta: { format: 'mongodb' } };
    }>;
    Rest: Canon<{
      Id: { basis: { 'id': string }; key: 'id'; meta: { format: 'rest' } };
      Type: { basis: { 'type': string }; key: 'type'; meta: { format: 'rest' } };
    }>;
  }
}

// Universal utility functions that work across ALL formats
function getId<T extends Satisfies<'Id'>>(data: T): string {
  const config = inferAxiom('Id', data);
  return data[config.key] as string;
}

function getType<T extends Satisfies<'Type'>>(data: T): string {
  const config = inferAxiom('Type', data);
  return data[config.key] as string;
}

function isUser<T extends Satisfies<'Type'>>(data: T): boolean {
  return getType(data) === 'User' || getType(data) === 'Person';
}

// These functions work identically regardless of data format:
const jsonLdData = { "@id": "123", "@type": "User" };
const mongoData = { "_id": "123", "_type": "User" };
const restData = { "id": "123", "type": "User" };

getId(jsonLdData);    // "123" - uses @id
getId(mongoData);     // "123" - uses _id
getId(restData);      // "123" - uses id

isUser(jsonLdData);   // true - checks @type
isUser(mongoData);    // true - checks _type  
isUser(restData);     // true - checks type
```

### Real-World Benefits

This universal API approach provides massive benefits:

1. **Write Once, Run Everywhere**: Your business logic doesn't need to know about data format differences
2. **Easy Data Source Migration**: Switch from MongoDB to PostgreSQL without changing business logic
3. **API Versioning**: Support multiple API versions with the same codebase
4. **Microservice Interoperability**: Different services can use different formats but share business logic
5. **Testing Simplicity**: Test with simple objects, deploy with complex formats

### Advanced Universal Patterns

```typescript
// Universal data transformation
function transformToStandard<T extends Satisfies<'Id' | 'Type'>>(data: T) {
  return {
    id: getId(data),
    type: getType(data),
    // ... other universal properties
  };
}

// Universal validation
function validateUser<T extends Satisfies<'Id' | 'Type'>>(data: T): boolean {
  return getId(data).length > 0 && isUser(data);
}

// Universal serialization
function serializeForApi<T extends Satisfies<'Id' | 'Type'>>(data: T, targetFormat: 'json-ld' | 'rest' | 'mongo') {
  const id = getId(data);
  const type = getType(data);
  
  switch (targetFormat) {
    case 'json-ld': return { '@id': id, '@type': type };
    case 'mongo': return { '_id': id, '_type': type };
    case 'rest': return { 'id': id, 'type': type };
  }
}
```

This is the true power of Canon: **semantic programming** where you write code against concepts, not formats.

### Business Logic Example

Here's a real-world example showing how business logic becomes format-agnostic:

```typescript
// Business logic that works with ANY data format
class UserService {
  // Universal user operations - no format knowledge needed
  async createUser<T extends Satisfies<'Id' | 'Type' | 'Email'>>(userData: T): Promise<T> {
    const id = getId(userData);
    const type = getType(userData);
    const email = getEmail(userData);
    
    // Business validation - same logic regardless of format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!this.isValidUserType(type)) {
      throw new Error('Invalid user type');
    }
    
    // Store in database - format doesn't matter
    return await this.database.save(userData);
  }
  
  async findUserById<T extends Satisfies<'Id'>>(id: string): Promise<T | null> {
    // Database query - works with any format
    return await this.database.findById(id);
  }
  
  async updateUser<T extends Satisfies<'Id' | 'Type'>>(userData: T): Promise<T> {
    const id = getId(userData);
    const type = getType(userData);
    
    // Business rules - format independent
    if (type === 'Admin' && !this.hasAdminPermissions()) {
      throw new Error('Insufficient permissions');
    }
    
    return await this.database.update(id, userData);
  }
  
  // Format-agnostic utility methods
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  private isValidUserType(type: string): boolean {
    return ['User', 'Admin', 'Guest'].includes(type);
  }
}

// Usage - same service works with different formats
const service = new UserService();

// JSON-LD format
const jsonLdUser = { "@id": "user-123", "@type": "User", "email": "john@example.com" };
await service.createUser(jsonLdUser);

// MongoDB format  
const mongoUser = { "_id": "user-456", "_type": "Admin", "email": "admin@example.com" };
await service.createUser(mongoUser);

// REST API format
const restUser = { "id": "user-789", "type": "User", "email": "jane@example.com" };
await service.createUser(restUser);

// All use the same business logic!
```

This demonstrates how Canon enables **true separation of concerns**: business logic focuses on semantics, while data format concerns are handled by the canon system.

## Lazy Type Resolution

One of Canon's most powerful features is **lazy typing** - the ability to defer full type resolution while maintaining canonical identity. This enables:

### Deferred Composition
Types can reference each other without circular dependencies:
```typescript
declare module '@relational-fabric/canon' {
  interface Canons {
    User: Canon<{
      Id: { basis: { id: string }; key: 'id' };
      Profile: { basis: { profileId: string }; key: 'profileId' };
    }>;
    Profile: Canon<{
      Id: { basis: { profileId: string }; key: 'profileId' };
      Owner: { basis: { userId: string }; key: 'userId' };
    }>;
  }
}
```

### Cross-Module Type Sharing
Canons can be defined in one module and consumed in another without losing type safety:
```typescript
// In library module
export type MyCanon = Canon<{ /* axioms */ }>;
export default defineCanon<MyCanon>({ /* config */ });

// In consuming application
import myCanon, { type MyCanon } from 'library/canon';
declare module '@relational-fabric/canon' {
  interface Canons { myCanon: MyCanon; }
}
registerCanons({ myCanon });
```

## Runtime Scope and Execution

### Global Registry Pattern
Canon uses a **global registry pattern** to maintain runtime configurations:

```typescript
// Type augmentation creates compile-time registry
declare module '@relational-fabric/canon' {
  interface Canons {
    myProject: MyCanon;
  }
}

// Runtime registration creates execution-time registry
declareCanon('myProject', {
  axioms: { /* runtime config */ }
});
```

This pattern ensures:
- **Single source of truth** for each canon definition
- **Global accessibility** across the entire application
- **Type-safe registration** with compile-time validation

### Scope Isolation and Composition
While canons are globally registered, they maintain **scope isolation**:

1. **Module Scope** - Each canon is defined within its own module
2. **Application Scope** - Canons are composed at the application level
3. **Runtime Scope** - Configurations are available globally but accessed safely

### Memory Management
The runtime system efficiently manages canon configurations:
- **Lazy Loading** - Configurations are only loaded when accessed
- **Weak References** - Unused canons can be garbage collected
- **Immutable Configs** - Once registered, configurations are immutable

## Advanced Patterns

### Canon Inheritance
Canons can extend and compose other canons:
```typescript
type BaseCanon = Canon<{
  Id: { basis: { id: string }; key: 'id' };
}>;

type ExtendedCanon = Canon<{
  Id: { basis: { id: string }; key: 'id' };
  Name: { basis: { name: string }; key: 'name' };
}>;
```

### Conditional Axioms
Axioms can be conditionally applied based on runtime context:
```typescript
type ConditionalCanon<TEnv extends 'dev' | 'prod'> = Canon<{
  Id: { basis: { id: string }; key: 'id' };
  Debug: TEnv extends 'dev' 
    ? { basis: { debug: boolean }; key: 'debug' }
    : never;
}>;
```

## Best Practices

1. **Keep Axioms Atomic** - Each axiom should represent a single concept
2. **Use Descriptive Keys** - Choose canonical keys that clearly identify the primary field
3. **Leverage Meta Extensively** - Use metadata for validation, documentation, and behavior
4. **Register Early** - Register canons at application startup for best performance
5. **Document Dependencies** - Clearly document inter-canon relationships

## Integration with the Broader Ecosystem

Canon is designed as a **universal adapter** that composes with existing TypeScript libraries:

- **type-fest** & **ts-essentials** - For utility types
- **uuid** & **nanoid** - For identity generation
- **object-hash** - For content-based hashing
- **immutable.js** - For immutable data structures

This composition approach ensures that Canon enhances rather than replaces your existing type infrastructure.