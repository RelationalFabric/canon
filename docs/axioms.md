# Axioms: The Fundamental Building Blocks

## Overview

**Axioms** are the atomic building blocks that enable **lazy typing** and **adaptability** in Canons. They provide a way to define where to find fundamental concepts (like ID, type, version) in different data structures, allowing libraries to operate on these concepts without knowing the specific field names or locations.

The key purpose is to create a **shared set of concepts** that can mold themselves to different use cases and data formats, enabling type-safe operations across diverse data structures.

## What is an Axiom?

An axiom is a **type definition** that specifies what utility types and functions will accept. Axioms define the **interface** that utilities expect, enabling them to work with different data formats without knowing the specific field names.

A common axiom type is `KeyNameAxiom`:
```typescript
type KeyNameAxiom = {
  base: Record<string, unknown>;  // The base must be an object with at least 1 string key
  key: string;                    // The key name that contains the concept
  meta?: Record<string, string>;  // Additional metadata about the concept
};

// Utility type to abstract away the axiom type key
type Axiom<Definition, ConfigType> = Definition & { 
  axiomType: ConfigType;
  meta?: Record<string, string>;  // Available to all axioms and configs
};
```

This defines what utilities expect - they know they'll get an object with a specific key name, but they don't know what that key name is. The **canon** provides the specific implementation, and the **runtime config** provides the actual values needed at runtime (like `'id'` vs `typeof 'id'`).

## The Axiom Type System

### Core Structure

Axioms are type definitions that can be reused for multiple specific axiom types. Here are some common axiom patterns:

#### Key-Name Axiom Type
```typescript
type KeyNameAxiom = Axiom<{
  base: Record<string, unknown>;  // Object with at least 1 string key
  key: string;                    // The canonical field name
}, {
  key: string;
}>;

// Other axiom types for meta-type level concepts that might vary between codebases
type TimestampAxiom = Axiom<{
  // The timestamp type - could be number, string, Date, or custom type
  type: number | string | Date | TypeGuard<unknown>;
  // Way to convert from this timestamp to canonical value
  toCanonical: (value: this['type']) => CanonicalTimestamp;
  // Way to convert from canonical value to this timestamp
  fromCanonical: (value: CanonicalTimestamp) => this['type'];
}, {
  key: string;
}>;

type ReferenceAxiom = Axiom<{
  // The reference type - could be string, object, array, or custom type
  type: string | object | string[] | TypeGuard<unknown>;
  // Way to convert from this reference to canonical value
  toCanonical: (value: this['type']) => CanonicalReference;
  // Way to convert from canonical value to this reference
  fromCanonical: (value: CanonicalReference) => this['type'];
}, {
  key: string;
}>;
```

#### Axiom Registration
Axioms are registered in the global `Axioms` interface using these type definitions:

```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;        // Id concept - might be 'id', '@id', '_id', etc.
    Type: KeyNameAxiom;      // Type concept - might be 'type', '@type', '_type', etc.
    Version: KeyNameAxiom;   // Version concept - might be 'version', 'v', 'rev', etc.
    Timestamp: TimestampAxiom; // Timestamp concept - might be number, string, Date, etc.
    Reference: ReferenceAxiom; // Reference concept - might be string, object, array, etc.
  }
  
  interface AxiomConfig {
    // Definers map their axiom names to config shapes that reference their axiom types
    // Example: Id: Axiom<{ key: string; }, KeyNameAxiom['axiomType']>
  }
}
```

The key is that each axiom represents a **semantic concept** that might vary in shape between codebases but is otherwise equivalent.

### Type-Level Composition

Axioms define what utilities expect, canons provide specific implementations. For example:

- **JSON-LD Canon**: Uses `@id`, `@type`, ISO8601 strings, and URI references
- **Standard Canon**: Uses `id`, `type`, Date objects, and UUID strings  
- **MongoDB Canon**: Uses `_id`, `_type`, Unix timestamps, and ObjectId strings

Each canon provides specific implementations of the same semantic concepts, while utilities work with the axiom interface.

### Runtime Configuration

The `AxiomConfig` interface works like the `Axioms` interface - definers map their axiom names to config shapes that reference their axiom types, reusing the structure and ensuring type consistency.

### Library API Generation

Libraries can operate on semantic concepts using the axiom interface without knowing specific field names or formats. For example:

```typescript
function getId<T extends Canon<any>>(object: T, canon: T): string {
  const idAxiom = getAxiom(canon, 'Id');
  return object[idAxiom.key] as string;
}

function getTimestamp<T extends Canon<any>>(object: T, canon: T): CanonicalTimestamp {
  const timestampAxiom = getAxiom(canon, 'Timestamp');
  return timestampAxiom.toCanonical(object[timestampAxiom.key]);
}
```

This enables **lazy typing** - libraries work with semantic concepts through the axiom interface, automatically converting between different formats.

## Runtime Processing

The runtime system processes axiom instances through validation and registration, enforcing contracts at type, runtime, and instance scopes.

## Axiom Categories

Common axiom patterns include:
- **Identity Axioms**: Unique identifiers and primary keys
- **Classification Axioms**: Type discrimination and categorization  
- **Temporal Axioms**: Time-based fields and versioning
- **Relational Axioms**: Relationships between entities

## Advanced Features

Axioms support conditional inclusion, computed values, and polymorphic behavior based on context and type discrimination.

## Axiom Lifecycle and Memory Management

### Initialization Phase
1. **Contract Registration** - Axiom contracts are registered in the global `Axioms` interface
2. **Type Validation** - Type requirements are validated and registered
3. **Runtime Setup** - Runtime behavior (validators, transformers) is configured
4. **Compliance Checking** - Implementor compliance is validated

### Runtime Phase
1. **Contract Enforcement** - New instances are validated against axiom contracts
2. **Type Safety** - Field access is mediated by type requirements
3. **Runtime Behavior** - Validators and transformers are applied based on contracts
4. **Compliance Monitoring** - Ongoing validation of implementor compliance

### Cleanup Phase
1. **Contract Cleanup** - Unused axiom contracts are identified and removed
2. **Memory Management** - Unused validators and transformers are garbage collected
3. **Registry Optimization** - The axiom registry is compacted and optimized

## Integration with Type System Utilities

### With Type Guards
```typescript
function isAxiomContract<T extends keyof Axioms>(
  axiom: unknown,
  expectedType: T
): axiom is Axioms[T] {
  return (
    typeof axiom === 'object' &&
    axiom !== null &&
    'type' in axiom &&
    'runtime' in axiom &&
    typeof axiom.runtime === 'object' &&
    'validators' in axiom.runtime &&
    'transformers' in axiom.runtime &&
    'metadata' in axiom.runtime
  );
}
```

### With Validation Libraries
```typescript
import { z } from 'zod';

function createZodValidator<T extends keyof Axioms>(axiom: Axioms[T]): z.ZodSchema {
  const baseSchema = createSchemaFromType(axiom.type);
  const runtimeConstraints = createConstraintsFromRuntime(axiom.runtime);
  return baseSchema.refine(...runtimeConstraints);
}
```

### With Serialization
```typescript
function serializeAxiomContract<T extends keyof Axioms>(axiom: Axioms[T]): SerializedAxiomContract {
  return {
    type: serializeTypeDefinition(axiom.type),
    runtime: {
      validators: serializeValidators(axiom.runtime.validators),
      transformers: serializeTransformers(axiom.runtime.transformers),
      metadata: serializeMetadata(axiom.runtime.metadata)
    }
  };
}
```

## Best Practices for Axiom Design

### 1. Single Responsibility
Each axiom should represent exactly one conceptual piece of data:
```typescript
// Good: Single concept
interface Axioms {
  Id: {
    type: { id: string };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
}

// Bad: Multiple concepts
interface Axioms {
  UserInfo: {
    type: { id: string; name: string; email: string };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
}
```

### 2. Immutable Configuration
Axiom contracts should be immutable once defined:
```typescript
const axiomContract = Object.freeze({
  type: Object.freeze({ id: 'string' }),
  runtime: Object.freeze({
    validators: Object.freeze([/* ... */]),
    transformers: Object.freeze([/* ... */]),
    metadata: Object.freeze({ type: 'uuid' })
  })
});
```

### 3. Rich Metadata
Use metadata extensively to capture behavior and constraints:
```typescript
interface Axioms {
  Email: {
    type: { email: string };
    runtime: {
      validators: [isString, isEmail, isUnique];
      transformers: [normalizeEmail, sanitizeEmail];
      metadata: {
        format: 'email',
        required: true,
        unique: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        sanitize: (email) => email.toLowerCase().trim()
      };
    };
  };
}
```

### 4. Semantic Naming
Choose axiom names that clearly convey their semantic meaning:
```typescript
// Good: Clear semantic meaning
interface Axioms {
  UserIdentifier: {
    type: { userId: string };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
  CreationTimestamp: {
    type: { createdAt: Date };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
}

// Bad: Generic or unclear naming
interface Axioms {
  Data: {
    type: { value: any };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
  Field1: {
    type: { field1: string };
    runtime: { validators: [/* ... */]; metadata: { /* ... */ } };
  };
}
```

## Debugging and Development Tools

### Axiom Inspector
```typescript
function inspectAxiomContract<T extends keyof Axioms>(axiomName: T): AxiomContractInspection {
  const contract = getAxiomContract(axiomName);
  return {
    name: axiomName,
    typeStructure: analyzeTypeStructure(contract.type),
    runtimeConstraints: analyzeRuntimeConstraints(contract.runtime),
    contractDependencies: analyzeContractDependencies(contract),
    usage: analyzeUsage(axiomName)
  };
}
```

### Runtime Validation
```typescript
function validateAxiomContractAtRuntime<T extends keyof Axioms>(
  axiomName: T, 
  value: unknown
): ValidationResult {
  const contract = getAxiomContract(axiomName);
  const validators = contract.runtime.validators;
  
  return validators.reduce((result, validator) => {
    const validationResult = validator(value, contract);
    return mergeValidationResults(result, validationResult);
  }, { valid: true, errors: [] });
}
```

This comprehensive axiom system provides the foundation for Canon's powerful type composition and runtime behavior, enabling developers to build robust, type-safe applications with rich metadata and validation capabilities.