# Example Usage: Applying Utility Types and Functions

This document demonstrates how to use the utility types and functions from the API reference in real-world scenarios.

## Basic POJO Validation

```typescript
import { isPojo, pojoHas, pojoWith, ObjectKey, Pojo, PojoWith, PojoOf, TypeGuard } from './api';

// Basic POJO validation
const data: unknown = { name: "John", age: 30 };

if (isPojo(data)) {
  // data is now typed as Pojo
  console.log(data.name); // TypeScript knows this is a POJO
}

// With specific type preservation
interface UserData extends Pojo {
  name: string;
  age: number;
  email: string;
}

const userData: unknown = { name: "John", age: 30, email: "john@example.com" };

if (isPojo<UserData>(userData)) {
  // userData is now typed as UserData (preserves the specific type)
  console.log(userData.name); // string
  console.log(userData.age);  // number
  console.log(userData.email); // string
}
```

## Working with Different Key Types

```typescript
// Numeric keys
interface NumericPojo extends PojoWith<number> {
  0: string;
  1: string;
}
const numericData: NumericPojo = { 0: "first", 1: "second" };

// Symbol keys
const sym = Symbol("key");
interface SymbolPojo extends PojoWith<symbol> {
  [sym]: string;
}
const symbolData: SymbolPojo = { [sym]: "value" };

// Mixed key types - this is more complex with interfaces
interface MixedPojo extends Pojo {
  stringKey: string;
  42: number;
  [Symbol("symbolKey")]: boolean;
}
const mixedData: MixedPojo = { 
  stringKey: "value1", 
  42: 42, 
  [Symbol("symbolKey")]: true 
};
```

## Type-Safe Property Checking

```typescript
interface UserData extends Pojo {
  name: string;
  email: string;
}

function processUserData(data: unknown) {
  if (pojoHas<UserData, "name">(data, "name")) {
    // data is now typed as UserData
    console.log(data.name); // Type-safe access
    console.log(data.email); // Also available due to type narrowing
  }
}
```

## Discriminating Type Guard Usage

```typescript
// Base type
interface BaseUser extends Pojo {
  id: string;
}

// Extended type
interface AdminUser extends BaseUser {
  permissions: string[];
  role: "admin";
}

// Regular user type
interface RegularUser extends BaseUser {
  role: "user";
  lastLogin: Date;
}

// Using TypeGuard pattern for discriminating unions
const userTypeGuard: TypeGuard<BaseUser> = (obj): obj is BaseUser => {
  return isPojo(obj) && "id" in obj;
};

function processUser(user: unknown) {
  if (userTypeGuard(user)) {
    // user is BaseUser
    console.log(user.id);
    
    // Type narrowing with extends safety
    if (userTypeGuard<AdminUser>(user)) {
      // user is now AdminUser - preserves the specific type
      console.log(user.permissions); // Type-safe access to AdminUser properties
      console.log(user.role); // "admin"
    }
  }
}

// Enhanced pojoWith with TypeGuard pattern
const hasName = pojoWith<"name">("name");
const hasEmail = pojoWith<"email">("email");

function validateUserData(data: unknown) {
  if (hasName(data)) {
    // data is { name: string }
    console.log(data.name);
    
    if (hasEmail(data)) {
      // data is now { name: string; email: string }
      console.log(data.email);
    }
  }
}
```

## Generic Object Processing

```typescript
function processPojo<T extends Pojo>(obj: T): PojoOf<T> {
  // Process the object while maintaining its POJO structure
  return { ...obj };
}

// Works with any POJO type
const processed = processPojo({ name: "John", age: 30 });
```

## Advanced Type Guard Composition

```typescript
// Create composed type guards
const hasId = pojoWith<"id">("id");
const hasType = pojoWith<"type">("type");
const hasVersion = pojoWith<"version">("version");

function validateEntity(data: unknown): data is { id: string; type: string; version: number } {
  return hasId(data) && hasType(data) && hasVersion(data);
}

// Use in complex validation
function processEntity(data: unknown) {
  if (validateEntity(data)) {
    // data is fully typed with all required properties
    console.log(`Processing ${data.type} entity ${data.id} version ${data.version}`);
  }
}
```

## Working with Canon Axioms

```typescript
import { idOf, typeOf, versionOf, timestampsOf, referencesOf } from '@relational-fabric/canon';

// Apply utility types to Canon data
function processCanonEntity<T extends Pojo>(entity: T) {
  // Validate it's a POJO first
  if (!isPojo(entity)) {
    throw new Error("Entity must be a POJO");
  }
  
  // Extract Canon properties safely
  const id = idOf(entity);
  const type = typeOf(entity);
  const version = versionOf(entity);
  
  // Use utility types for additional validation
  if (pojoHas<{ name: string }, "name">(entity, "name")) {
    console.log(`Entity ${id} of type ${type} has name: ${entity.name}`);
  }
  
  return {
    id,
    type,
    version,
    entity: entity as PojoOf<T>
  };
}
```

## Improved Standard Object Methods

The API provides improved implementations of standard Object methods with better type safety:

### `objectKeys<T extends Pojo>`
```typescript
const objectKeys = <T extends Pojo>(obj: T): (keyof T)[];
```
Type-safe version of `Object.keys()` that preserves key types.

### `objectEntries<T extends Pojo>`
```typescript
const objectEntries = <T extends Pojo>(obj: T): [keyof T, T[keyof T]][];
```
Type-safe version of `Object.entries()` that preserves key-value pair types.

### `objectValues<T extends Pojo>`
```typescript
const objectValues = <T extends Pojo>(obj: T): T[keyof T][];
```
Type-safe version of `Object.values()` that preserves value types.

## Lodash Integration

For advanced object manipulation, use lodash (bundled with the package) with proper type safety:

```typescript
import _ from 'lodash';

// Use lodash for complex operations with type safety
function processComplexData<T extends Pojo>(data: T) {
  // Deep clone with lodash
  const cloned = _.cloneDeep(data);
  
  // Merge with type safety
  const merged = _.merge({}, data, { timestamp: Date.now() });
  
  // Pick specific keys
  const picked = _.pick(data, ['id', 'name', 'type']);
  
  // Omit specific keys
  const omitted = _.omit(data, ['internal', 'debug']);
  
  return { cloned, merged, picked, omitted };
}
```

## Philosophy

The utility library focuses on:
1. **Core type safety** - Essential type guards and POJO validation
2. **Standard method improvements** - Better typed versions of Object methods
3. **Lodash integration** - Complex operations handled by proven library
4. **Minimal abstraction** - Avoid over-engineering simple operations