# Core Axioms: The Essential Building Blocks

## Overview

This document defines the core set of axioms that form the foundation of the Canon type system. These axioms represent the essential semantic concepts that appear in virtually all data-centric applications, providing a standardized way to work with common data patterns across different formats.

## Core Axiom Set

The core axiom set consists of five essential axioms that cover the fundamental concepts found in most data-centric applications:

1. **Id** - Unique identifiers for entities
2. **Type** - Entity classification and schema information  
3. **Version** - Data versioning for optimistic concurrency control
4. **Timestamps** - Time-based data with format conversion
5. **References** - Entity relationships and references

## Axiom Types

```typescript
// Key-name axiom for simple field-based concepts
type KeyNameAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

// Representation axiom for data with multiple representations
type RepresentationAxiom<T, C = unknown> = Axiom<{
  $basis: T | TypeGuard<unknown>;
  isCanonical: (value: T | TypeGuard<unknown>) => value is C;
}, {
  isCanonical: (value: T | TypeGuard<unknown>) => value is C;
}>;

// Canonical reference type for entity relationships
interface EntityReference<R, T = unknown> {
  ref: R;
  value?: T;
  resolved: boolean;
}
```

## Axiom Definitions

### 1. Id Axiom

**Purpose**: Represents unique identifiers for entities across different data formats.

**Type Definition**:
```typescript
type IdAxiom = KeyNameAxiom;
```

**Registration**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Id: IdAxiom;
  }
}
```

**Common Field Names**:
- REST APIs: `id`
- MongoDB: `_id`
- JSON-LD: `@id`
- GraphQL: `id`

**API Functions**:
```typescript
function idOf<T extends Satisfies<'Id'>>(x: T): AxiomValue<'Id'> {
  const config = inferAxiom('Id', x);
  return x[config.key] as AxiomValue<'Id'>;
}
```

### 2. Type Axiom

**Purpose**: Represents entity classification or schema information across different data formats.

**Type Definition**:
```typescript
type TypeAxiom = KeyNameAxiom;
```

**Registration**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Type: TypeAxiom;
  }
}
```

**Common Field Names**:
- REST APIs: `type`
- MongoDB: `_type`
- JSON-LD: `@type`
- GraphQL: `__typename`

**API Functions**:
```typescript
function typeOf<T extends Satisfies<'Type'>>(x: T): AxiomValue<'Type'> {
  const config = inferAxiom('Type', x);
  return x[config.key] as AxiomValue<'Type'>;
}
```

**Usage Example**:
```typescript
// Works with different data formats
const restData = { type: "user" };
const mongoData = { _type: "User" };
const jsonLdData = { "@type": "Person" };

console.log(typeOf(restData));    // "user"
console.log(typeOf(mongoData));   // "User" 
console.log(typeOf(jsonLdData));  // "Person"
```

### 3. Version Axiom

**Purpose**: Represents version information for data entities, enabling optimistic concurrency control and change tracking.

**Type Definition**:
```typescript
type VersionAxiom = KeyNameAxiom;
```

**Registration**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Version: VersionAxiom;
  }
}
```

**Common Field Names**:
- REST APIs: `version`
- MongoDB: `_version`
- JSON-LD: `@version`
- Custom: `rev`

**API Functions**:
```typescript
function versionOf<T extends Satisfies<'Version'>>(x: T): AxiomValue<'Version'> {
  const config = inferAxiom('Version', x);
  return x[config.key] as AxiomValue<'Version'>;
}
```

**Usage Example**:
```typescript
// Works with different data formats
const restData = { version: 5 };
const mongoData = { _version: 3 };
const jsonLdData = { "@version": "2.1" };

console.log(versionOf(restData));    // 5
console.log(versionOf(mongoData));   // 3
console.log(versionOf(jsonLdData));  // "2.1"
```

### 4. Timestamps Axiom

**Purpose**: Represents time-based data with automatic conversion between different timestamp formats.

**Type Definition**:
```typescript
type TimestampsAxiom = RepresentationAxiom<number | string | Date, Date>;
```

**Registration**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    Timestamps: {
      $basis: number | string | Date | TypeGuard<unknown>;
      isCanonical: (value: number | string | Date | TypeGuard<unknown>) => value is Date;
    };
  }
}
```

**Common Value Types**:
- Unix timestamps: `number` (milliseconds since epoch)
- ISO strings: `string` (ISO 8601 format)
- Date objects: `Date` (JavaScript Date instances)
- Custom formats: `string` (various timestamp formats)

**API Functions**:
```typescript
function timestampsOf<T extends Satisfies<'Timestamps'>>(x: T): AxiomValue<'Timestamps'> {
  const config = inferAxiom('Timestamps', x);
  return config.isCanonical(x) ? x : new Date(x as any);
}
```

**Implementation**:
```typescript
// Timestamp canonical type guard
const timestampsIsCanonical = (value: number | string | Date | TypeGuard<unknown>): value is Date => {
  return value instanceof Date;
};
```

**Usage Example**:
```typescript
// Works with different timestamp value types
const unixTimestamp = 1640995200000;
const isoTimestamp = "2022-01-01T00:00:00Z";
const dateTimestamp = new Date("2022-01-01");

console.log(timestampsOf(unixTimestamp));  // Converted to canonical Date
console.log(timestampsOf(isoTimestamp));   // Converted to canonical Date
console.log(timestampsOf(dateTimestamp));  // Converted to canonical Date
```

### 5. References Axiom

**Purpose**: Represents relationships between entities with automatic conversion between different reference formats.

**Type Definition**:
```typescript
type ReferencesAxiom = RepresentationAxiom<string | object, EntityReference<string, unknown>>;
```

**Registration**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    References: {
      $basis: string | object | TypeGuard<unknown>;
      toCanonical: (value: string | object | TypeGuard<unknown>) => EntityReference<string, unknown>;
      fromCanonical: (value: EntityReference<string, unknown>) => string | object | TypeGuard<unknown>;
    };
  }
}
```

**Common Value Types**:
- String IDs: `string` (single identifier)
- Object references: `object` (reference objects with metadata)
- URI references: `string` (URI-formatted references)

**API Functions**:
```typescript
function referencesOf<T extends Satisfies<'References'>>(x: T): AxiomValue<'References'> {
  const config = inferAxiom('References', x);
  return config.toCanonical(x);
}
```

**Implementation**:
```typescript
// Reference conversion functions
const referencesToCanonical = (value: string | object | TypeGuard<unknown>): EntityReference<string, unknown> => {
  if (typeof value === 'string') {
    return {
      ref: value,
      resolved: false
    };
  }
  if (typeof value === 'object' && value !== null) {
    // Extract ID from object reference
    const obj = value as any;
    if (obj.id) return { ref: obj.id, value: obj, resolved: true };
    if (obj._id) return { ref: obj._id, value: obj, resolved: true };
    if (obj['@id']) return { ref: obj['@id'], value: obj, resolved: true };
    // If no ID field found, stringify the object
    return { ref: JSON.stringify(value), resolved: false };
  }
  // For TypeGuard<unknown>, try to convert to string
  return { ref: String(value), resolved: false };
};

const referencesFromCanonical = (value: EntityReference<string, unknown>): string | object | TypeGuard<unknown> => {
  return value.resolved && value.value ? value.value : value.ref;
};
```

**Usage Example**:
```typescript
// Works with different reference value types
const stringRef = "user-123";
const objectRef = { id: "user-123", name: "John" };

console.log(referencesOf(stringRef));  // Converted to EntityReference
console.log(referencesOf(objectRef));  // Converted to EntityReference
```

## Conversion Types

The core axioms use conversion functions that work with different data formats. The specific types are determined by the axiom implementation:

```typescript
// Conversion functions work with any type
// The specific types are determined by the axiom implementation
```

## Utility Types

The core axioms are built on top of the fundamental axiom utility types:

```typescript
// Base axiom type with universal distinguished keys
interface Axiom<TBasis, TMeta> {
  $basis: TBasis;
  $meta: TMeta;
}

// Utility types for working with axioms
type Satisfies<T extends keyof Axioms> = {
  [K in keyof Axioms[T]['$basis']]: Axioms[T]['$basis'][K];
};

type AxiomValue<T extends keyof Axioms> = Axioms[T]['$basis'][keyof Axioms[T]['$basis']];

// Runtime axiom inference
declare function inferAxiom<T extends keyof Axioms>(
  axiom: T, 
  value: Satisfies<T>
): Axioms[T];
```

## Implementation Notes

### Registration Pattern

All core axioms follow the same registration pattern:

1. **Type Definition**: Define the axiom type using the appropriate base type (`KeyNameAxiom`, `RepresentationAxiom<T>`, or `Axiom<{...}, {...}>`)
2. **Module Augmentation**: Register the axiom in the `@relational-fabric/canon` module
3. **API Functions**: Provide utility functions for working with the axiom

### Field Name Conventions

While the core axioms define the semantic concepts, the actual field names vary by data format:

- **REST APIs**: Use standard camelCase (`id`, `type`, `version`)
- **MongoDB**: Use underscore prefix (`_id`, `_type`, `_version`)
- **JSON-LD**: Use at-sign prefix (`@id`, `@type`, `@version`)
- **GraphQL**: Use double underscore for types (`__typename`)

### Conversion Functions

Axioms that support multiple data formats (like `Timestamps` and `References`) include conversion functions:

- `toCanonical`: Convert from the specific format to the canonical format
- `fromCanonical`: Convert from the canonical format to the specific format

This enables seamless interoperability between different data sources while maintaining type safety.

## Usage Guidelines

1. **Always use the provided API functions** rather than accessing fields directly
2. **Register axioms early** in your application lifecycle
3. **Use the `Satisfies` constraint** to ensure type safety
4. **Leverage canonical types** for consistent data processing
5. **Test across different formats** to ensure compatibility

## Extending the Core Set

While the core axioms cover the most common use cases, applications may need additional axioms for specific domains:

- **Email**: For email address formatting and processing
- **URL**: For web resource references
- **Currency**: For monetary values with locale support
- **GeoLocation**: For geographic coordinates

When adding new axioms, follow the same patterns established by the core axioms to maintain consistency and interoperability.