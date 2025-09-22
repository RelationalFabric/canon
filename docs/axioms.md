# Axioms: The Fundamental Building Blocks

## Overview

**Axioms** are the atomic building blocks that enable **lazy typing** and **adaptability** in Canons. They provide a way to define where to find fundamental concepts (like ID, type, version) in different data structures, allowing libraries to operate on these concepts without knowing the specific field names or locations.

The key purpose is to create a **shared set of concepts** that can mold themselves to different use cases and data formats, enabling type-safe operations across diverse data structures.

## What is an Axiom?

An axiom is a **type definition** that specifies how to locate and access a fundamental concept within a data structure. Axioms enable **lazy typing** by allowing different data formats to specify where to find the same conceptual information.

A common axiom type is `KeyNameAxiom`:
```typescript
type KeyNameAxiom = {
  base: Record<string, unknown>;  // The base must be an object with at least 1 string key
  key: string;                    // The key name that contains the concept
  meta?: Record<string, string>;  // Additional metadata about the concept
};
```

This allows different canons to specify where to find the same concept in different ways. For example, an ID concept might be found at `object.id`, `object['@id']`, or `object._id` depending on the data format. Think of axioms as **location specifications** - they tell you where to find a concept, not what the concept is.

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

// Other axiom types
type SimpleValueAxiom = number | string | boolean;
type ObjectAxiom = Record<string, unknown>;
type FunctionAxiom = (...args: any[]) => any;
```

#### Axiom Registration
Axioms are registered in the global `Axioms` interface using these type definitions:

```typescript
interface Axioms {
  Id: KeyNameAxiom;        // Id must conform to KeyNameAxiom shape
  Version: KeyNameAxiom;   // Version must conform to KeyNameAxiom shape
  Type: KeyNameAxiom;      // Type must conform to KeyNameAxiom shape
  Count: SimpleValueAxiom; // Count must conform to SimpleValueAxiom shape
  Address: ObjectAxiom;    // Address must conform to ObjectAxiom shape
}
```

The key is that each axiom registration references a type definition that specifies the structure instances must conform to.

### Type-Level Composition

Axioms enable different data formats to specify where to find the same concepts:

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
    Id: KeyNameAxiom;        // Id concept location
    Type: KeyNameAxiom;      // Type concept location
    Version: KeyNameAxiom;   // Version concept location
  }
}

// JSON-LD Canon - uses @id and @type
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
}>;

// Standard Canon - uses id and type
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
}>;

// MongoDB Canon - uses _id and _type
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
}>;
```

Each canon specifies where to find the same concepts in different data formats, enabling libraries to work with any of them.

### Library API Generation

The real power comes from libraries that can operate on these concepts without knowing the specific field names:

```typescript
// A library can provide generic functions that work with any canon
function getId<T extends Canon<any>>(object: T, canon: T): string {
  // The library doesn't need to know if it's object.id, object['@id'], or object._id
  // The axiom tells us where to find the ID
  const idAxiom = getAxiom(canon, 'Id');
  return object[idAxiom.key] as string;
}

function getType<T extends Canon<any>>(object: T, canon: T): string {
  const typeAxiom = getAxiom(canon, 'Type');
  return object[typeAxiom.key] as string;
}

// Usage with different canons
const jsonLdObject = { '@id': 'user-123', '@type': 'Person' };
const standardObject = { id: 'user-123', type: 'Person' };
const mongoObject = { _id: 'user-123', _type: 'Person' };

// Same library functions work with all formats
const id1 = getId(jsonLdObject, JsonLdCanon);     // Uses @id
const id2 = getId(standardObject, StandardCanon); // Uses id  
const id3 = getId(mongoObject, MongoCanon);       // Uses _id
```

This enables **lazy typing** - libraries can work with typed entities without knowing where the concepts are located.

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