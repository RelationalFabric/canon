# Canons: Universal Type Blueprints

## Overview

A **Canon** is a universal type blueprint that serves as a foundational building block for robust, data-centric applications. Canons solve the "empty room problem" by providing a consistent set of initial design decisions and type primitives that can be shared and composed across any project.

But Canon's true power goes beyond just solving the empty room problem. **Multiple canons can exist at runtime**, each representing different data formats (JSON-LD, MongoDB, REST APIs, etc.), yet developers can program against a **single, common API** for semantic properties. This enables truly universal code that works across diverse data structures without format-specific logic.

## What is a Canon?

A Canon is a type that defines its data model using a predefined set of universal axioms. Think of it as a contract that establishes:

1. **Structural Identity** - What fields and types comprise the data
2. **Canonical Keys** - Which field serves as the primary identifier
3. **Metadata Context** - Rich configuration and validation rules
4. **Runtime Behavior** - How the type behaves at execution time

**The Key Insight**: A Canon is a **format-specific implementation** of universal semantic concepts. Multiple Canons can exist simultaneously, each representing different data formats (JSON-LD, MongoDB, REST APIs, etc.), but they all implement the same semantic concepts. This enables developers to write **universal code** that works across all formats through a common API.

## The Type System Architecture

### The Augmentable Interface Pattern

Canons leverage TypeScript's **augmentable interface** pattern to create a global registry of available axioms. This is the foundational mechanism that enables type-safe composition. See the [Axioms documentation](./axioms.md) for detailed information about how axioms are structured and registered.

```typescript
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

When an axiom is registered in the `Axioms` interface, it references an axiom type that defines the **shape** that instances must follow. See the [Axioms documentation](./axioms.md) for detailed information about axiom types and their structure requirements.

```typescript
// Now any Canon can use these axiom keys - the shape is enforced by the axiom type
type MyCanon = Canon<{
  Id: {
    $basis: { id: string };
    key: 'id';
    $meta: { type: 'uuid'; required: 'true' };
  };  // Must conform to KeyNameAxiom shape
  Type: {
    $basis: { type: string };
    key: 'type';
    $meta: { enum: 'user,admin,guest'; discriminator: 'true' };
  };  // Must conform to KeyNameAxiom shape
  Version: {
    $basis: { version: number };
    key: 'version';
    $meta: { default: '1'; min: '1' };
  };  // Must conform to KeyNameAxiom shape
}>;
```

Note: The actual axiom structure uses the `Axiom<{...}, {...}>` type pattern as defined in the [Axioms documentation](./axioms.md). The examples above show the simplified structure for clarity.

### CanonDefinition Constraint System

The `CanonDefinition` type ensures that Canons can only use valid axiom keys:

```typescript
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};

// This means a Canon can only use axiom keys that exist in the Axioms interface
type ValidCanon = Canon<{
  Id: {
    $basis: { id: string };
    key: 'id';
    $meta: { type: 'uuid'; required: 'true' };
  };  // ✅ Valid - Uses Id axiom key, must conform to KeyNameAxiom shape
  Type: {
    $basis: { type: string };
    key: 'type';
    $meta: { enum: 'user,admin,guest'; discriminator: 'true' };
  };  // ✅ Valid - Uses Type axiom key, must conform to KeyNameAxiom shape
  Invalid: SomeOtherType;  // ❌ Error - Not in Axioms interface
}>;
```

Note: Axioms must be registered in the `@relational-fabric/canon` module as shown in the [Axioms documentation](./axioms.md).

This constraint system ensures:
- **Type safety** - Only registered axiom keys can be used
- **Shape consistency** - All instances must conform to their axiom type's shape
- **Discoverability** - Available axioms are clearly defined in the interface

## Complete Canon Example

A complete canon requires both **type-level definitions** and **runtime configuration**. Here's a working example:

### 1. Type-Level Definition

First, define the canon type and register it in the global interface:

```typescript
// Define the canon type
type UserCanon = Canon<{
  Id: {
    $basis: { id: string };
    key: 'id';
    $meta: { type: 'uuid'; required: 'true' };
  };
  Type: {
    $basis: { type: string };
    key: 'type';
    $meta: { enum: 'user,admin,guest'; discriminator: 'true' };
  };
  Version: {
    $basis: { version: number };
    key: 'version';
    $meta: { default: '1'; min: '1' };
  };
  Timestamp: {
    $basis: { createdAt: Date };
    key: 'createdAt';
    toCanonical: (value: Date) => value;
    fromCanonical: (value: Date) => value;
    $meta: { format: 'iso8601' };
  };
}>;

// Register the canon type
declare module '@relational-fabric/canon' {
  interface Canons {
    User: UserCanon;
  }
}
```

### 2. Runtime Configuration

Next, register the runtime configuration:

```typescript
// Register the runtime configuration
declareCanon('User', {
  axioms: {
    Id: {
      $basis: { id: 'string' },
      key: 'id',
      $meta: { type: 'uuid'; required: 'true' },
    },
    Type: {
      $basis: { type: 'string' },
      key: 'type',
      $meta: { enum: 'user,admin,guest'; discriminator: 'true' },
    },
    Version: {
      $basis: { version: 'number' },
      key: 'version',
      $meta: { default: '1'; min: '1' },
    },
    Timestamp: {
      $basis: { createdAt: 'Date' },
      key: 'createdAt',
      toCanonical: (value: Date) => value,
      fromCanonical: (value: Date) => value,
      $meta: { format: 'iso8601' },
    },
  },
});
```

### 3. Usage

Now the canon can be used with universal functions:

```typescript
// Universal functions work with any canon that satisfies the axioms
function getId<T extends Satisfies<'Id'>>(entity: T): string {
  const config = inferAxiom('Id', entity);
  return entity[config.key] as string;
}

function getType<T extends Satisfies<'Type'>>(entity: T): string {
  const config = inferAxiom('Type', entity);
  return entity[config.key] as string;
}

// Usage with the User canon
const user = {
  id: "user-123",
  type: "user", 
  version: 1,
  createdAt: new Date("2022-01-01")
};

console.log(getId(user));    // "user-123"
console.log(getType(user));  // "user"
```

## Universal Data Operations

The power of Canon lies in **universal data operations** - writing code that works across different data formats through a common semantic API.

### The Problem Canon Solves

Without Canon, you need format-specific code:

```typescript
// Different data formats for the same concept
const jsonLdUser = { "@id": "user-123", "@type": "Person" };
const mongoUser = { "_id": "user-123", "_type": "Person" };
const restUser = { "id": "user-123", "type": "Person" };

// Format-specific code everywhere
function getIdFromJsonLd(user: any) { return user["@id"]; }
function getIdFromMongo(user: any) { return user["_id"]; }
function getIdFromRest(user: any) { return user["id"]; }
```

With Canon, you write universal code:

```typescript
// Universal function that works with any format
function getId<T extends Satisfies<'Id'>>(user: T): string {
  const config = inferAxiom('Id', user);
  return user[config.key] as string;
}

// All formats work with the same function
getId(jsonLdUser);  // "user-123" using @id
getId(mongoUser);   // "user-123" using _id  
getId(restUser);    // "user-123" using id
```

### Real-World Benefits

- **Write Once, Run Everywhere**: Business logic doesn't need to know about data format differences
- **Easy Migration**: Switch from MongoDB to PostgreSQL without changing business logic
- **API Versioning**: Support multiple API versions with the same codebase
- **Testing Simplicity**: Test with simple objects, deploy with complex formats

## Best Practices

1. **Complete Canon Definition**: Always include both type-level and runtime definitions
2. **Use Core Axioms**: Start with the core axiom set before adding custom ones
3. **Register Early**: Register canons at application startup for best performance
4. **Leverage Type Safety**: Use the `Satisfies` constraint to ensure compile-time validation
5. **Document Dependencies**: Clearly document inter-canon relationships

## Integration

Canon is designed as a **universal adapter** that composes with existing TypeScript libraries:

- **type-fest** & **ts-essentials** - For utility types
- **uuid** & **nanoid** - For identity generation
- **object-hash** - For content-based hashing
- **immutable.js** - For immutable data structures

This composition approach ensures that Canon enhances rather than replaces your existing type infrastructure.