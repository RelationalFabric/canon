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
```

This defines what utilities expect - they know they'll get an object with a specific key name, but they don't know what that key name is. The **canon** provides the specific implementation, and the **runtime config** provides the actual values needed at runtime (like `'id'` vs `typeof 'id'`).

## The Axiom Type System

### Core Structure

Axioms are type definitions that can be reused for multiple specific axiom types. Here are some common axiom patterns:

#### Key-Name Axiom Type
```typescript
type KeyNameAxiom = {
  base: Record<string, unknown>;  // Object with at least 1 string key
  key: string;                    // The canonical field name
  meta?: Record<string, string>;  // Optional metadata
};

// Other axiom types for semantic concepts that might vary between codebases
type TimestampAxiom = {
  base: Record<string, unknown>;
  key: string;
  meta?: Record<string, string>;
};

type ReferenceAxiom = {
  base: Record<string, unknown>;
  key: string;
  meta?: Record<string, string>;
};

type StatusAxiom = {
  base: Record<string, unknown>;
  key: string;
  meta?: Record<string, string>;
};
```

#### Axiom Registration
Axioms are registered in the global `Axioms` interface using these type definitions:

```typescript
interface Axioms {
  Id: KeyNameAxiom;        // Id concept - might be 'id', '@id', '_id', etc.
  Type: KeyNameAxiom;      // Type concept - might be 'type', '@type', '_type', etc.
  Version: KeyNameAxiom;   // Version concept - might be 'version', 'v', 'rev', etc.
  Timestamp: TimestampAxiom; // Timestamp concept - might be 'createdAt', 'timestamp', 'date', etc.
  Reference: ReferenceAxiom; // Reference concept - might be 'ref', 'parentId', 'ownerId', etc.
  Status: StatusAxiom;     // Status concept - might be 'status', 'state', 'active', etc.
}
```

The key is that each axiom represents a **semantic concept** that might vary in shape between codebases but is otherwise equivalent.

### Type-Level Composition

Axioms define what utilities expect, canons provide specific implementations:

```typescript
// First, define axiom types - these specify what utilities will accept
type KeyNameAxiom = {
  base: Record<string, unknown>;
  key: string;
  meta?: Record<string, string>;
};

// Register axioms in the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;        // Utilities expect this shape for ID concept
    Type: KeyNameAxiom;      // Utilities expect this shape for Type concept
    Version: KeyNameAxiom;   // Utilities expect this shape for Version concept
  }
}

// JSON-LD Canon - provides specific implementation for JSON-LD format
type JsonLdCanon = Canon<{
  Id: {
    base: { '@id': string };
    key: '@id';
    meta: { format: 'json-ld' };
  };
  Type: {
    base: { '@type': string };
    key: '@type';
    meta: { format: 'json-ld' };
  };
  Timestamp: {
    base: { 'http://schema.org/dateCreated': string };
    key: 'http://schema.org/dateCreated';
    meta: { format: 'json-ld'; type: 'iso8601' };
  };
  Reference: {
    base: { 'http://schema.org/parent': string };
    key: 'http://schema.org/parent';
    meta: { format: 'json-ld'; type: 'uri' };
  };
}>;

// Standard Canon - provides specific implementation for standard format
type StandardCanon = Canon<{
  Id: {
    base: { id: string };
    key: 'id';
    meta: { format: 'standard' };
  };
  Type: {
    base: { type: string };
    key: 'type';
    meta: { format: 'standard' };
  };
  Timestamp: {
    base: { createdAt: Date };
    key: 'createdAt';
    meta: { format: 'standard'; type: 'date' };
  };
  Reference: {
    base: { parentId: string };
    key: 'parentId';
    meta: { format: 'standard'; type: 'uuid' };
  };
}>;

// MongoDB Canon - provides specific implementation for MongoDB format
type MongoCanon = Canon<{
  Id: {
    base: { _id: string };
    key: '_id';
    meta: { format: 'mongodb' };
  };
  Type: {
    base: { _type: string };
    key: '_type';
    meta: { format: 'mongodb' };
  };
  Timestamp: {
    base: { timestamp: number };
    key: 'timestamp';
    meta: { format: 'mongodb'; type: 'unix' };
  };
  Reference: {
    base: { ref: string };
    key: 'ref';
    meta: { format: 'mongodb'; type: 'objectid' };
  };
}>;
```

The canon collects specific incarnations of the axioms for a given model, while utilities work with the axiom interface.

### Runtime Configuration

The runtime config provides the actual values needed at runtime (e.g., `'id'` vs `typeof 'id'`):

```typescript
// Runtime configuration interface
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

### Library API Generation

Libraries can operate on these semantic concepts using the axiom interface:

```typescript
// A library function that works with any canon
function getId<T extends Canon<any>>(object: T, canon: T): string {
  // The library doesn't need to know if it's 'id', '@id', or '_id'
  // It uses the axiom interface to get the key
  const idAxiom = getAxiom(canon, 'Id');
  return object[idAxiom.key] as string;
}

function getTimestamp<T extends Canon<any>>(object: T, canon: T): string | Date | number {
  // The library doesn't need to know if it's 'createdAt', 'timestamp', or 'http://schema.org/dateCreated'
  const timestampAxiom = getAxiom(canon, 'Timestamp');
  return object[timestampAxiom.key];
}

function getReference<T extends Canon<any>>(object: T, canon: T): string {
  // The library doesn't need to know if it's 'parentId', 'ref', or 'http://schema.org/parent'
  const referenceAxiom = getAxiom(canon, 'Reference');
  return object[referenceAxiom.key] as string;
}

// Usage with different canons
const jsonLdObject = { 
  '@id': 'user-123', 
  '@type': 'Person',
  'http://schema.org/dateCreated': '2023-01-01T00:00:00Z',
  'http://schema.org/parent': 'org-456'
};
const standardObject = { 
  id: 'user-123', 
  type: 'Person',
  createdAt: new Date('2023-01-01'),
  parentId: 'org-456'
};
const mongoObject = { 
  _id: 'user-123', 
  _type: 'Person',
  timestamp: 1672531200000,
  ref: 'org-456'
};

// Same library functions work with all formats
const id1 = getId(jsonLdObject, JsonLdCanon);     // Uses @id
const id2 = getId(standardObject, StandardCanon); // Uses id
const id3 = getId(mongoObject, MongoCanon);       // Uses _id

const timestamp1 = getTimestamp(jsonLdObject, JsonLdCanon);     // Uses http://schema.org/dateCreated
const timestamp2 = getTimestamp(standardObject, StandardCanon); // Uses createdAt
const timestamp3 = getTimestamp(mongoObject, MongoCanon);       // Uses timestamp
```

This enables **lazy typing** - libraries work with semantic concepts through the axiom interface, not specific implementations.

## Runtime Axiom Processing

### Registration and Validation

The runtime system processes axiom instances through validation and registration:

```typescript
// Axiom instances can have various shapes
type AxiomInstance = Axioms[keyof Axioms];

function processAxiomInstance(
  axiomName: keyof Axioms, 
  instance: AxiomInstance
): ProcessedAxiomInstance {
  // 1. Validate the instance conforms to axiom shape
  validateAxiomInstance(axiomName, instance);
  
  // 2. Get runtime configuration for this axiom
  const runtimeConfig = getAxiomRuntime(axiomName);
  
  // 3. Register the instance with runtime behavior
  registerAxiomInstance(axiomName, instance, runtimeConfig);
  
  // 4. Setup validation and transformation
  setupInstanceBehavior(axiomName, instance, runtimeConfig);
  
  return createProcessedAxiomInstance(axiomName, instance, runtimeConfig);
}
```

### Scope Management

Axioms exist in multiple scopes simultaneously, each enforcing the contract:

#### Type Scope
At compile time, axioms enforce type requirements through the `Axioms` interface:
```typescript
// Type-level contract enforcement
type CanonDefinition = {
  [K in keyof Axioms]?: Axioms[K];
};

// Canon must implement the complete axiom contract
type MyCanon = Canon<{
  Id: Axioms['Id'];  // Must provide both type and runtime requirements
}>;
```

#### Runtime Scope
At execution time, axioms enforce runtime behavior through contract validation:
```typescript
class AxiomRuntime {
  private contracts = new Map<string, AxiomContract>();
  private validators = new Map<string, ValidationRule[]>();
  private transformers = new Map<string, Transformer[]>();
  
  register(name: string, contract: AxiomContract): void {
    this.contracts.set(name, contract);
    this.setupValidation(name, contract.runtime.validators);
    this.setupTransformation(name, contract.runtime.transformers);
  }
  
  validateImplementor(name: string, implementation: any): boolean {
    const contract = this.contracts.get(name);
    return validateContractCompliance(contract, implementation);
  }
}
```

#### Instance Scope
When data is processed, axioms enforce field-level contract compliance:
```typescript
function processInstance(data: unknown, canon: CanonDefinition): ProcessedInstance {
  const result = {};
  
  for (const [axiomName, axiomContract] of canon) {
    const fieldValue = extractField(data, axiomContract.type);
    const validatedValue = validateField(fieldValue, axiomContract.runtime.validators);
    const transformedValue = transformField(validatedValue, axiomContract.runtime.transformers);
    
    result[axiomName] = transformedValue;
  }
  
  return result as ProcessedInstance;
}
```

## Axiom Categories and Patterns

### Identity Axioms
Define unique identifiers and primary keys:
```typescript
// Define in Axioms interface
interface Axioms {
  Id: {
    type: { id: string };
    runtime: {
      validators: [isString, isUuid];
      transformers: [normalizeUuid];
      metadata: { 
        type: 'uuid',
        required: true,
        immutable: true,
        generate: () => crypto.randomUUID()
      };
    };
  };
}
```

### Classification Axioms
Define type discrimination and categorization:
```typescript
interface Axioms {
  Type: {
    type: { type: string };
    runtime: {
      validators: [isString, isEnum(['user', 'admin', 'guest'])];
      transformers: [normalizeType];
      metadata: { 
        enum: ['user', 'admin', 'guest'],
        discriminator: true,
        required: true
      };
    };
  };
}
```

### Temporal Axioms
Define time-based fields and versioning:
```typescript
interface Axioms {
  Timestamp: {
    type: { createdAt: Date };
    runtime: {
      validators: [isDate, isValidTimestamp];
      transformers: [normalizeDate, toISO8601];
      metadata: { 
        autoGenerate: true,
        immutable: true,
        format: 'ISO8601'
      };
    };
  };
}
```

### Relational Axioms
Define relationships between entities:
```typescript
interface Axioms {
  Reference: {
    type: { userId: string };
    runtime: {
      validators: [isString, isValidReference];
      transformers: [normalizeReference];
      metadata: { 
        references: 'User.Id',
        cascade: 'delete',
        validate: 'foreign_key'
      };
    };
  };
}
```

## Advanced Axiom Features

### Conditional Axioms
Axioms can be conditionally included based on context:

```typescript
// Define conditional axiom in Axioms interface
interface Axioms {
  DebugInfo: {
    type: { debugInfo: string };
    runtime: {
      validators: [isString, isDebugInfo];
      transformers: [normalizeDebugInfo];
      metadata: { environment: 'development' };
    };
  };
}

// Use conditionally in Canon
type DevelopmentCanon = Canon<{
  Id: Axioms['Id'];
  Debug: typeof process.env.NODE_ENV === 'development' 
    ? Axioms['DebugInfo'] 
    : never;
}>;
```

### Computed Axioms
Axioms can derive their values from other fields:

```typescript
interface Axioms {
  Computed: {
    type: { fullName: string };
    runtime: {
      validators: [isString, isComputed];
      transformers: [normalizeComputed];
      metadata: { 
        computed: true,
        dependencies: ['firstName', 'lastName'],
        compute: (data) => `${data.firstName} ${data.lastName}`
      };
    };
  };
}
```

### Polymorphic Axioms
Axioms can adapt their behavior based on type discrimination:

```typescript
interface Axioms {
  Polymorphic: {
    type: { content: string | number | boolean };
    runtime: {
      validators: [isPolymorphic, validateByType];
      transformers: [normalizePolymorphic];
      metadata: { 
        polymorphic: true,
        typeMap: {
          'text': 'string',
          'numeric': 'number', 
          'boolean': 'boolean'
        }
      };
    };
  };
}
```

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