# Axioms: The Fundamental Building Blocks

## Overview

**Axioms** are the atomic building blocks that compose Canons. They represent fundamental, indivisible units of type definition that encapsulate both structural information and behavioral metadata. Each axiom defines a single conceptual piece of a data model with rich configuration options.

## What is an Axiom?

An axiom is a **contract definition** that specifies both type and runtime requirements for implementors. When added to the global `Axioms` interface, an axiom defines what any Canon using that axiom must provide:

1. **Type Requirements** - The TypeScript type structure that must be implemented
2. **Runtime Requirements** - The runtime behavior, validators, and metadata that must be provided
3. **Contract Enforcement** - The system ensures implementors fulfill both type and runtime obligations

Think of axioms as **interface contracts** - they define what implementors must provide, not just what they can provide.

## The Axiom Type System

### Core Structure

An axiom defines a complete contract that implementors must fulfill:

```typescript
interface Axioms {
  MyAxiom: {
    // Type information that implementors must provide
    type: { id: string; name: string };
    // Runtime configuration that implementors must provide
    runtime: {
      validators: Validator[];
      transformers: Transformer[];
      metadata: AxiomMetadata;
    };
  };
}
```

This structure ensures that every axiom specifies both **type requirements** and **runtime requirements**, creating a complete contract for implementors.

### Type-Level Composition

Axioms compose naturally within Canon definitions by referencing the global `Axioms` interface:

```typescript
// First, define axioms in the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: {
      type: { id: string };
      runtime: { validators: [/* ... */]; metadata: { type: 'uuid'; required: true } };
    };
    Type: {
      type: { type: string };
      runtime: { validators: [/* ... */]; metadata: { enum: ['user', 'admin', 'guest'] } };
    };
    Version: {
      type: { version: number };
      runtime: { validators: [/* ... */]; metadata: { default: 1; min: 1 } };
    };
  }
}

// Then use them in Canon definitions
type MyCanon = Canon<{
  Id: Axioms['Id'];        // Must implement the Id axiom contract
  Type: Axioms['Type'];    // Must implement the Type axiom contract
  Version: Axioms['Version']; // Must implement the Version axiom contract
}>;
```

Each axiom reference ensures the Canon must implement the complete contract defined in the `Axioms` interface.

## Runtime Axiom Processing

### Registration and Validation

The runtime system processes axioms through a contract validation and registration pipeline:

```typescript
interface AxiomContract {
  type: TypeDefinition;           // Type requirements
  runtime: {
    validators: ValidationRule[]; // Runtime validation rules
    transformers: Transformer[];  // Runtime transformation functions
    metadata: AxiomMetadata;      // Runtime metadata
  };
}

function processAxiom(name: string, contract: AxiomContract): ProcessedAxiom {
  // 1. Validate the axiom contract structure
  validateAxiomContract(contract);
  
  // 2. Register type requirements
  registerTypeRequirements(name, contract.type);
  
  // 3. Setup runtime behavior
  registerRuntimeBehavior(name, contract.runtime);
  
  // 4. Validate implementor compliance
  validateImplementorCompliance(name, contract);
  
  return createProcessedAxiom(name, contract);
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