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

### Compile-Time Type Definition

At the type level, Canons leverage TypeScript's powerful generic system to create flexible, reusable type blueprints:

```typescript
type Canon<TAxioms extends Record<string, Axiom>> = {
  [K in keyof TAxioms]: TAxioms[K]['basis'] & {
    readonly [P in TAxioms[K]['key']]: TAxioms[K]['basis'][TAxioms[K]['key']];
  };
};
```

This creates a **discriminated union** where each axiom contributes both its structural shape and canonical identity. The type system uses the `canon` key as a **discriminator**, enabling precise type narrowing and IntelliSense support.

### Runtime Type Registration

The runtime system maintains a global registry that bridges the gap between compile-time types and execution-time behavior:

```typescript
// Global registry maintains canon configurations
const canonRegistry = new Map<string, CanonConfiguration>();

// Type-safe registration ensures runtime matches compile-time
function declareCanon<T extends Canon<any>>(
  name: string, 
  config: CanonConfiguration<T>
): void {
  canonRegistry.set(name, config);
}
```

This dual-layer approach ensures that:
- **Types are preserved** during compilation for static analysis
- **Configurations are available** at runtime for validation and behavior
- **Identity is maintained** across module boundaries

## Understanding Axioms in Canons

Each Canon is built from **axioms** - fundamental building blocks that define:

### Basis
The underlying TypeScript type that defines the structural shape:
```typescript
basis: { id: string; name: string }
```

### Key
The canonical field name that serves as the primary identifier:
```typescript
key: 'id'  // Points to the most important field
```

### Meta
Extensible metadata for validation, documentation, and behavior:
```typescript
meta: { 
  type: 'uuid',
  required: true,
  description: 'Unique identifier'
}
```

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