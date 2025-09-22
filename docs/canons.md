# Canons: Universal Type Blueprints

## Overview

A **Canon** is a universal type blueprint that serves as a foundational building block for robust, data-centric applications. Canons solve the "empty room problem" by providing a consistent set of initial design decisions and type primitives that can be shared and composed across any project.

## What is a Canon?

A Canon is a type that defines its data model using a predefined set of universal axioms. Think of it as a contract that establishes:

1. **Structural Identity** - What fields and types comprise the data
2. **Canonical Keys** - Which field serves as the primary identifier
3. **Metadata Context** - Rich configuration and validation rules
4. **Runtime Behavior** - How the type behaves at execution time

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
- **Axioms define structure** - Each axiom in the `Axioms` interface specifies the shape that instances must follow
- **Canons create instances** - A Canon creates instances that conform to the axiom shapes
- **Type safety is enforced** - The compiler ensures only valid axioms can be used in Canon definitions

### How Axioms Define Structure Requirements

When an axiom is added to the `Axioms` interface, it defines the **shape** that instances of that axiom must follow:

```typescript
// Example: Adding axioms to the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: {
      base: { id: string };
      key: 'id';
      meta?: { type: 'uuid'; required: boolean };
    };
    Count: number;
    Address: {
      street: string;
      city: string;
      country: string;
    };
  }
}

// Now any Canon can create instances of these axioms
type MyCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: true };
  };
  Count: 42;
  Address: {
    street: '123 Main St';
    city: 'Anytown';
    country: 'USA';
  };
}>;
```

The axiom defines the **structure** that instances must conform to, with different axioms having different shapes.

### CanonDefinition Constraint System

The `CanonDefinition` type ensures that Canons can only use valid axioms:

```typescript
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};

// This means a Canon can only create instances of axioms that exist in the Axioms interface
type ValidCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: true };
  };  // ✅ Valid - Instance conforms to Id axiom shape
  Count: 42;  // ✅ Valid - Instance conforms to Count axiom shape
  Invalid: SomeOtherType;  // ❌ Error - Not in Axioms interface
}>;
```

This constraint system ensures:
- **Type safety** - Only registered axioms can be used
- **Shape consistency** - All instances must conform to their axiom's shape
- **Discoverability** - Available axioms are clearly defined in the interface

## Understanding Axioms in Canons

Each Canon is built from **axiom instances** that conform to shapes defined in the global `Axioms` interface. These axioms serve as **templates** that define the structure instances must follow:

### Axiom Shape Definition

When an axiom is added to the `Axioms` interface, it defines the shape that instances must follow:

```typescript
interface Axioms {
  Id: {
    base: { id: string };
    key: 'id';
    meta?: { type: 'uuid'; required: boolean };
  };
  Count: number;
  Address: {
    street: string;
    city: string;
    country: string;
  };
}
```

### Canon Instance Creation

When a Canon uses an axiom, it creates an instance that conforms to the axiom's shape:

```typescript
type MyCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: true };
  };  // Instance conforms to Id axiom shape
  Count: 42;  // Instance conforms to Count axiom shape
  Address: {  // Instance conforms to Address axiom shape
    street: '123 Main St';
    city: 'Anytown';
    country: 'USA';
  };
}>;
```

### Type Safety Through Shape Conformance

The augmentable interface pattern ensures that:
- **All axioms define clear shapes** - The structure instances must follow is specified
- **Canons create conforming instances** - Instances must match the axiom's shape
- **Type checking is enforced** - The compiler validates shape conformance

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