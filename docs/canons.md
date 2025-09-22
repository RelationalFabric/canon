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
- **Axioms define requirements** - Each axiom in the `Axioms` interface specifies both type information and runtime requirements
- **Canons must implement** - A Canon's type must extend from the available axioms in the global registry
- **Type safety is enforced** - The compiler ensures only valid axioms can be used in Canon definitions

### How Axioms Define Implementation Requirements

When an axiom is added to the `Axioms` interface, it defines the **contract** that any Canon using that axiom must fulfill:

```typescript
// Example: Adding an axiom to the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: {
      // Type information the implementor must provide
      type: { id: string };
      // Runtime information the implementor must provide  
      runtime: {
        validators: Validator[];
        transformers: Transformer[];
        metadata: AxiomMetadata;
      };
    };
  }
}

// Now any Canon can use the Id axiom
type MyCanon = Canon<{
  Id: Axioms['Id'];  // Must implement the Id axiom contract
}>;
```

The axiom defines **both**:
- **Type requirements** - What TypeScript types must be provided
- **Runtime requirements** - What runtime behavior must be implemented

### CanonDefinition Constraint System

The `CanonDefinition` type ensures that Canons can only use valid axioms:

```typescript
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};

// This means a Canon can only use axioms that exist in the Axioms interface
type ValidCanon = Canon<{
  Id: Axioms['Id'];        // ✅ Valid - Id exists in Axioms
  Name: Axioms['Name'];    // ✅ Valid - Name exists in Axioms  
  Invalid: SomeOtherType;  // ❌ Error - Not in Axioms interface
}>;
```

This constraint system ensures:
- **Type safety** - Only registered axioms can be used
- **Runtime consistency** - All axioms have both type and runtime definitions
- **Discoverability** - Available axioms are clearly defined in the interface

## Understanding Axioms in Canons

Each Canon is built from **axioms** that are defined in the global `Axioms` interface. These axioms serve as **contracts** that specify both type and runtime requirements:

### Axiom Contract Structure

When an axiom is added to the `Axioms` interface, it defines a complete contract:

```typescript
interface Axioms {
  Id: {
    // Type information that implementors must provide
    type: { id: string };
    // Runtime configuration that implementors must provide
    runtime: {
      validators: [(value: unknown) => boolean];
      transformers: [(value: unknown) => string];
      metadata: {
        description: string;
        required: boolean;
        format: 'uuid' | 'nanoid' | 'custom';
      };
    };
  };
}
```

### Canon Implementation Requirements

When a Canon uses an axiom, it must implement the complete contract:

```typescript
type MyCanon = Canon<{
  Id: Axioms['Id'];  // Must provide both type and runtime implementation
}>;

// The Canon implementation must satisfy:
// 1. Type requirements: { id: string }
// 2. Runtime requirements: validators, transformers, metadata
```

### Type Safety Through Contracts

The augmentable interface pattern ensures that:
- **All axioms are fully defined** - Both type and runtime requirements are specified
- **Canons must implement completely** - No partial implementations are allowed
- **Type checking is enforced** - The compiler validates contract compliance

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