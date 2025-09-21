# Axioms: The Fundamental Building Blocks

## Overview

**Axioms** are the atomic building blocks that compose Canons. They represent fundamental, indivisible units of type definition that encapsulate both structural information and behavioral metadata. Each axiom defines a single conceptual piece of a data model with rich configuration options.

## What is an Axiom?

An axiom is a self-contained type definition that includes:

1. **Basis** - The underlying TypeScript type structure
2. **Key** - The canonical field name that serves as the primary identifier
3. **Meta** - Extensible metadata for validation, behavior, and documentation

Think of axioms as the "atoms" of the Canon type system - they cannot be broken down further while maintaining their semantic meaning.

## The Axiom Type System

### Core Structure

At the type level, an axiom follows this fundamental structure:

```typescript
interface Axiom {
  basis: Record<string, any>;     // The structural TypeScript type
  key: keyof basis;               // The canonical field identifier
  meta?: Record<string, any>;     // Optional extensible metadata
}
```

This structure ensures that every axiom provides both **shape** (via `basis`) and **identity** (via `key`), with optional **behavior** (via `meta`).

### Type-Level Composition

Axioms compose naturally within Canon definitions:

```typescript
type MyCanon = Canon<{
  // Identity axiom
  Id: {
    basis: { id: string };
    key: 'id';
    meta: { type: 'uuid'; required: true };
  };
  
  // Classification axiom  
  Type: {
    basis: { type: string };
    key: 'type';
    meta: { enum: ['user', 'admin', 'guest'] };
  };
  
  // Versioning axiom
  Version: {
    basis: { version: number };
    key: 'version';
    meta: { default: 1; min: 1 };
  };
}>;
```

Each axiom contributes its `basis` to the final type while maintaining its canonical `key` for identification and discrimination.

## Runtime Axiom Processing

### Registration and Validation

The runtime system processes axioms through a sophisticated validation and registration pipeline:

```typescript
interface AxiomConfiguration {
  basis: TypeDefinition;          // Runtime type definition
  key: string;                    // Canonical field name
  meta?: AxiomMetadata;          // Runtime metadata
  validators?: ValidationRule[];  // Runtime validation rules
  transformers?: Transformer[];   // Runtime transformation functions
}

function processAxiom(name: string, config: AxiomConfiguration): ProcessedAxiom {
  // 1. Validate the axiom configuration
  validateAxiomStructure(config);
  
  // 2. Register type information
  registerTypeDefinition(name, config.basis);
  
  // 3. Setup canonical key mapping
  registerCanonicalKey(name, config.key);
  
  // 4. Process metadata and setup behaviors
  processMetadata(name, config.meta);
  
  return createProcessedAxiom(name, config);
}
```

### Scope Management

Axioms exist in multiple scopes simultaneously:

#### Type Scope
At compile time, axioms contribute to the overall type structure:
```typescript
// Type-level axiom contribution
type ResolvedCanon = {
  [K in keyof Axioms]: Axioms[K]['basis'] & {
    readonly [P in Axioms[K]['key']]: Axioms[K]['basis'][Axioms[K]['key']];
  }
}[keyof Axioms];
```

#### Runtime Scope
At execution time, axioms provide behavioral configuration:
```typescript
class AxiomRuntime {
  private configurations = new Map<string, AxiomConfiguration>();
  private validators = new Map<string, ValidationRule[]>();
  private transformers = new Map<string, Transformer[]>();
  
  register(name: string, config: AxiomConfiguration): void {
    this.configurations.set(name, config);
    this.setupValidation(name, config);
    this.setupTransformation(name, config);
  }
}
```

#### Instance Scope
When data is processed, axioms define field-level behavior:
```typescript
function processInstance(data: unknown, canon: string): ProcessedInstance {
  const axioms = getAxiomsForCanon(canon);
  const result = {};
  
  for (const [axiomName, axiom] of axioms) {
    const fieldValue = extractField(data, axiom.key);
    const validatedValue = validateField(fieldValue, axiom.validators);
    const transformedValue = transformField(validatedValue, axiom.transformers);
    
    result[axiom.key] = transformedValue;
  }
  
  return result as ProcessedInstance;
}
```

## Axiom Categories and Patterns

### Identity Axioms
Define unique identifiers and primary keys:
```typescript
Id: {
  basis: { id: string };
  key: 'id';
  meta: { 
    type: 'uuid',
    required: true,
    immutable: true,
    generate: () => crypto.randomUUID()
  };
}
```

### Classification Axioms
Define type discrimination and categorization:
```typescript
Type: {
  basis: { type: string };
  key: 'type';
  meta: { 
    enum: ['user', 'admin', 'guest'],
    discriminator: true,
    required: true
  };
}
```

### Temporal Axioms
Define time-based fields and versioning:
```typescript
Timestamp: {
  basis: { createdAt: Date };
  key: 'createdAt';
  meta: { 
    autoGenerate: true,
    immutable: true,
    format: 'ISO8601'
  };
}
```

### Relational Axioms
Define relationships between entities:
```typescript
Reference: {
  basis: { userId: string };
  key: 'userId';
  meta: { 
    references: 'User.Id',
    cascade: 'delete',
    validate: 'foreign_key'
  };
}
```

## Advanced Axiom Features

### Conditional Axioms
Axioms can be conditionally included based on context:

```typescript
type ConditionalAxiom<TCondition extends boolean> = TCondition extends true
  ? {
      basis: { debugInfo: string };
      key: 'debugInfo';
      meta: { environment: 'development' };
    }
  : never;

type DevelopmentCanon = Canon<{
  Id: IdentityAxiom;
  Debug: ConditionalAxiom<typeof process.env.NODE_ENV === 'development'>;
}>;
```

### Computed Axioms
Axioms can derive their values from other fields:

```typescript
Computed: {
  basis: { fullName: string };
  key: 'fullName';
  meta: { 
    computed: true,
    dependencies: ['firstName', 'lastName'],
    compute: (data) => `${data.firstName} ${data.lastName}`
  };
}
```

### Polymorphic Axioms
Axioms can adapt their behavior based on type discrimination:

```typescript
Polymorphic: {
  basis: { content: string | number | boolean };
  key: 'content';
  meta: { 
    polymorphic: true,
    typeMap: {
      'text': 'string',
      'numeric': 'number', 
      'boolean': 'boolean'
    }
  };
}
```

## Axiom Lifecycle and Memory Management

### Initialization Phase
1. **Type Registration** - Axiom types are registered in the global type registry
2. **Validation Setup** - Validation rules are compiled and optimized
3. **Metadata Processing** - Metadata is processed and indexed for fast access

### Runtime Phase
1. **Instance Creation** - New instances are validated against axiom rules
2. **Field Access** - Field access is mediated by axiom configurations
3. **Transformation** - Data transformations are applied based on axiom metadata

### Cleanup Phase
1. **Reference Counting** - Unused axiom configurations are identified
2. **Memory Cleanup** - Unused validators and transformers are garbage collected
3. **Registry Maintenance** - The axiom registry is compacted and optimized

## Integration with Type System Utilities

### With Type Guards
```typescript
function isAxiomOfType<T extends Axiom>(
  axiom: unknown,
  expectedType: T
): axiom is T {
  return (
    typeof axiom === 'object' &&
    axiom !== null &&
    'basis' in axiom &&
    'key' in axiom
  );
}
```

### With Validation Libraries
```typescript
import { z } from 'zod';

function createZodValidator(axiom: Axiom): z.ZodSchema {
  const baseSchema = createSchemaFromBasis(axiom.basis);
  const metaConstraints = createConstraintsFromMeta(axiom.meta);
  return baseSchema.refine(...metaConstraints);
}
```

### With Serialization
```typescript
function serializeAxiom(axiom: Axiom): SerializedAxiom {
  return {
    basis: serializeTypeDefinition(axiom.basis),
    key: axiom.key,
    meta: serializeMetadata(axiom.meta)
  };
}
```

## Best Practices for Axiom Design

### 1. Single Responsibility
Each axiom should represent exactly one conceptual piece of data:
```typescript
// Good: Single concept
Id: { basis: { id: string }; key: 'id' }

// Bad: Multiple concepts
UserInfo: { basis: { id: string; name: string; email: string }; key: 'id' }
```

### 2. Immutable Configuration
Axiom configurations should be immutable once defined:
```typescript
const axiomConfig = Object.freeze({
  basis: { id: 'string' },
  key: 'id',
  meta: Object.freeze({ type: 'uuid' })
});
```

### 3. Rich Metadata
Use metadata extensively to capture behavior and constraints:
```typescript
Email: {
  basis: { email: string };
  key: 'email';
  meta: {
    format: 'email',
    required: true,
    unique: true,
    validate: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    sanitize: (email) => email.toLowerCase().trim()
  };
}
```

### 4. Semantic Naming
Choose axiom names that clearly convey their semantic meaning:
```typescript
// Good: Clear semantic meaning
UserIdentifier: { basis: { userId: string }; key: 'userId' }
CreationTimestamp: { basis: { createdAt: Date }; key: 'createdAt' }

// Bad: Generic or unclear naming
Data: { basis: { value: any }; key: 'value' }
Field1: { basis: { field1: string }; key: 'field1' }
```

## Debugging and Development Tools

### Axiom Inspector
```typescript
function inspectAxiom(axiomName: string): AxiomInspection {
  const config = getAxiomConfiguration(axiomName);
  return {
    name: axiomName,
    structure: analyzeStructure(config.basis),
    constraints: analyzeConstraints(config.meta),
    dependencies: analyzeDependencies(config),
    usage: analyzeUsage(axiomName)
  };
}
```

### Runtime Validation
```typescript
function validateAxiomAtRuntime(
  axiomName: string, 
  value: unknown
): ValidationResult {
  const axiom = getAxiom(axiomName);
  const validators = getValidators(axiomName);
  
  return validators.reduce((result, validator) => {
    const validationResult = validator(value, axiom);
    return mergeValidationResults(result, validationResult);
  }, { valid: true, errors: [] });
}
```

This comprehensive axiom system provides the foundation for Canon's powerful type composition and runtime behavior, enabling developers to build robust, type-safe applications with rich metadata and validation capabilities.