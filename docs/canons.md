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

### Why Two Kinds of Configuration?

Canons require both **type-level** and **runtime** configurations because they serve different purposes:

#### Type-Level Configuration
- **Purpose**: Defines the structure and constraints at compile time
- **Benefits**: Provides type safety, IntelliSense, and compile-time validation
- **When**: Used during development to catch errors before runtime

#### Runtime Configuration  
- **Purpose**: Provides actual values and behavior at execution time
- **Benefits**: Enables dynamic behavior, format conversion, and runtime flexibility
- **When**: Used during execution to determine how axioms behave with real data

This dual approach enables **lazy typing** - you can write type-safe code that works with different data formats without knowing the specific field names or conversion logic at compile time.

### How Axioms Work with Canons

Axioms define the **semantic concepts** that canons implement. Each canon provides specific implementations of these concepts for different data formats. See the [Axioms documentation](./axioms.md) for detailed information about how axioms are structured and registered.

The key insight is that:
- **Axioms define what utilities expect** - The interface that universal functions work with
- **Canons provide specific implementations** - Each canon implements the axioms for its data format
- **Type safety is enforced** - The compiler ensures only valid axioms can be used in canon definitions

## Complete Canon Example

A complete canon requires both **type-level definitions** and **runtime configuration**. Here's why both are needed and how they work together:

### 1. Type-Level Definition

The type-level definition provides **compile-time safety** and **IntelliSense support**:

```typescript
// Define the canon type - this tells TypeScript what structure to expect
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

// Register the canon type globally
declare module '@relational-fabric/canon' {
  interface Canons {
    User: UserCanon;
  }
}
```

**Why this matters**: TypeScript can now validate that your canon uses valid axioms and catch errors at compile time.

### 2. Runtime Configuration

The runtime configuration provides **actual behavior** and **format conversion logic**:

```typescript
// Register the runtime configuration - this tells the system how to behave at runtime
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

**Why this matters**: The runtime system needs to know how to actually extract values and perform conversions when your code runs.

### 3. How They Work Together

The universal functions use **both** configurations:

```typescript
// Universal functions work with any canon that satisfies the axioms
function getId<T extends Satisfies<'Id'>>(entity: T): string {
  const config = inferAxiom('Id', entity);  // Uses runtime config to find the key
  return entity[config.key] as string;      // Uses type config for validation
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

console.log(getId(user));    // "user-123" - runtime finds 'id' key
console.log(getType(user));  // "user" - runtime finds 'type' key
```

**The magic**: TypeScript ensures type safety at compile time, while the runtime system provides the actual field names and conversion logic at execution time.

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