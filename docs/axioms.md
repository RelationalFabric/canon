# Axioms: The Fundamental Building Blocks

## Overview

**Axioms** are the atomic building blocks that enable **lazy typing** and **adaptability** in Canons. They provide a way to define where to find fundamental concepts (like ID, type, version) in different data structures, allowing libraries to operate on these concepts without knowing the specific field names or locations.

The key purpose is to create a **shared set of concepts** that can mold themselves to different use cases and data formats, enabling type-safe operations across diverse data structures.

## What is an Axiom?

An axiom is a **type definition** that specifies what utility types and functions will accept. Axioms define the **interface** that utilities expect, enabling them to work with different data formats without knowing the specific field names.

A common axiom type is the **KeyNameAxiom** concept. This represents the fundamental idea that many semantic concepts can be found by looking for a specific key name within an object. For example, an "ID" concept might be found at different key names depending on the data format - it could be `id`, `@id`, `_id`, or any other field name.

The KeyNameAxiom concept captures this pattern by specifying that:
- There must be a $basis object with at least one string key
- There is a field name that contains the concept (which varies by data format)
- Additional metadata can be attached to describe the concept

Note that `key` is specific to `KeyNameAxiom` - other axiom types may have different structures, but all axioms share the universal distinguished keys `$basis` and `$meta`.

This enables utilities to work with the concept of "ID" without knowing whether it's stored as `object.id`, `object['@id']`, or `object._id`. The **canon** provides the specific field name for each data format, while the **runtime config** provides the actual values needed at runtime.

## The Axiom Type System

### Universal Distinguished Keys

All axioms share two universal distinguished keys that have special meaning to Canon:

- **`$basis`** - The underlying TypeScript type/object structure that contains the concept
- **`$meta`** - Additional metadata for documentation and behavior

These keys are available to all axioms through the `Axiom` utility type, providing a consistent interface across different axiom types.

### Core Structure

Axioms are type definitions that can be reused for multiple specific axiom types. Here are some common axiom patterns:

#### Key-Name Axiom Type
```typescript
type KeyNameAxiom = Axiom<{
  $basis: Record<string, unknown>;  // Object with at least 1 string key
  key: string;                      // The field name that contains the concept
}, {
  key: string;
}>;

// Representation axiom for data with multiple representations
type RepresentationAxiom<T> = {
  $basis: T;
  toCanonical: (value: T) => unknown;
  fromCanonical: (value: unknown) => T;
};

// Other axiom types for meta-type level concepts that might vary between codebases
type TimestampsAxiom = RepresentationAxiom<number | string | Date | TypeGuard<unknown>>;

type ReferencesAxiom = RepresentationAxiom<string | object | string[] | TypeGuard<unknown>>;
```

#### Axiom Registration
Axioms are registered in the global `Axioms` interface using these type definitions:

```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;        // Id concept - might be 'id', '@id', '_id', etc.
    Type: KeyNameAxiom;      // Type concept - might be 'type', '@type', '_type', etc.
    Version: KeyNameAxiom;   // Version concept - might be 'version', 'v', 'rev', etc.
    Timestamps: TimestampsAxiom; // Timestamps concept - might be number, string, Date, etc.
    References: ReferencesAxiom; // References concept - might be string, object, array, etc.
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

### API Specification

A complete axiom description includes its definition, registration, and API specification. The API provides functions that libraries can use to operate on semantic concepts without knowing specific field names or formats:

```typescript
function idOf<T extends Satisfies<'Id'>>(x: T): AxiomValue<'Id'> {
  const config = inferAxiom('Id', x);
  return x[config.key] as AxiomValue<'Id'>;
}

function timestampsOf<T extends Satisfies<'Timestamps'>>(x: T): AxiomValue<'Timestamps'> {
  const config = inferAxiom('Timestamps', x);
  return config.toCanonical(x[config.key]);
}
```

This enables **lazy typing** - libraries work with semantic concepts through the axiom interface, automatically converting between different formats.

## Understanding $basis Runtime Representation

The `$basis` field in runtime configurations uses a **TypeGuard pattern** to ensure type safety at runtime. This is implemented as `TypeGuard<Satisfies<AxiomLabel, CanonLabel>>` where:

- **`AxiomLabel`** - The specific axiom being configured (e.g., 'Id', 'Type', 'Version')
- **`CanonLabel`** - The specific canon being configured (e.g., 'Internal', 'JsonLd', 'Mongo')
- **`Satisfies`** - Ensures the configuration matches the expected axiom structure

### How $basis TypeGuard Works

The runtime representation of `$basis` is not just a simple object - it's a **TypeGuard predicate** that:

1. **Validates Structure**: Ensures the runtime configuration matches the expected axiom type structure
2. **Provides Type Safety**: TypeScript can infer the correct types at compile time
3. **Enables Runtime Inference**: The system can automatically determine field names and conversion logic

### Example: $basis TypeGuard in Action

```typescript
// Type-level definition specifies the structure
type IdAxiom = {
  $basis: { id: string };
  key: 'id';
  $meta: { type: string; required: string };
}

// Runtime configuration with TypeGuard
const runtimeConfig = {
  Id: {
    $basis: { id: 'string' },  // TypeGuard<Satisfies<'Id', 'Internal'>>
    key: 'id',
    $meta: { type: 'uuid'; required: 'true' },
  }
};
```

**What happens at runtime:**
1. The TypeGuard validates that the runtime configuration structure matches the expected axiom type
2. The string literals (`'string'`, `'number'`) represent the actual runtime type information
3. The `inferAxiom()` function uses this information to extract values with the correct types

### Why This Matters

This TypeGuard approach enables **lazy typing** - your code can work with semantic concepts without knowing the specific field names or conversion logic at compile time, while maintaining full type safety.

## Complete Example: The Id Axiom

Here's a complete working example showing all three parts of an axiom description:

```typescript
// 1. Registration - Register the axiom in the global interface
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: KeyNameAxiom;  // Id concept - might be 'id', '@id', '_id', etc.
  }
}

// 2. API Specification - Functions that libraries can use
function idOf<T extends Satisfies<'Id'>>(x: T): AxiomValue<'Id'> {
  const config = inferAxiom('Id', x);
  return x[config.key] as AxiomValue<'Id'>;
}
```

This axiom system provides the foundation for Canon's powerful type composition, enabling developers to work with semantic concepts across different data formats through lazy typing and adaptability.