# TypeScript Utility Types and Functions Documentation

This document describes a collection of built-in utility types and functions designed to simplify common TypeScript tasks, particularly around working with Plain Old JavaScript Objects (POJOs) and type safety.

## Core Types

### `ObjectKey`
```typescript
type ObjectKey = string | number | symbol;
```

A union type representing all valid JavaScript object key types. This serves as the foundation for other utility types that work with object keys.

**Use Cases:**
- Generic constraints for object key operations
- Type-safe key validation
- Consistent key type handling across utilities

---

## POJO (Plain Old JavaScript Object) Utilities

### `Pojo`
```typescript
type Pojo = Record<string, unknown>;
```

A type alias for Plain Old JavaScript Objects. Represents objects with string keys and unknown values, which is the most common structure for POJOs.

**Characteristics:**
- Keys are always strings
- Values can be of any type (unknown)
- Excludes arrays, functions, and other non-object types
- Provides a clean abstraction for generic object handling

### `isPojo`
```typescript
function isPojo(value: unknown): value is Pojo;
```

A type guard function that determines whether a given value is a Plain Old JavaScript Object.

**Returns:** `true` if the value is a POJO, `false` otherwise

**Type Safety:** When this function returns `true`, TypeScript will narrow the type to `Pojo`

**Use Cases:**
- Runtime validation of object types
- Type narrowing in conditional blocks
- Input validation in functions that expect POJOs

---

## Generic POJO Types

### `PojoWith<K extends ObjectKey>`
```typescript
type PojoWith<K extends ObjectKey> = Record<K, unknown>;
```

A generic type that creates a POJO with specific key types. Allows for more flexible key types while maintaining the POJO structure.

**Generic Parameters:**
- `K`: The key type(s) for the object (must extend `ObjectKey`)

**Use Cases:**
- Objects with numeric keys
- Objects with symbol keys
- Mixed key type objects
- Type-safe object creation with specific key constraints

### `PojoOf<O extends Pojo>`
```typescript
type PojoOf<O extends Pojo> = O;
```

A utility type that extracts the POJO structure from a given object type. Useful for ensuring type compatibility and working with object transformations.

**Generic Parameters:**
- `O`: The object type to extract POJO structure from (must extend `Pojo`)

**Use Cases:**
- Type transformations that preserve POJO structure
- Ensuring type compatibility between different object types
- Generic functions that work with any POJO structure

---

## Type Guard Functions

### `pojoHas<T extends PojoWith<K>, K extends ObjectKey>`
```typescript
function pojoHas<T extends PojoWith<K>, K extends ObjectKey>(
  obj: T | unknown, 
  key: K
): obj is T;
```

A sophisticated type guard that checks if an object has a specific key and narrows the type accordingly.

**Parameters:**
- `obj`: The object to check (can be the expected type or unknown)
- `key`: The key to check for (must be a valid `ObjectKey`)

**Returns:** `true` if the object has the specified key, `false` otherwise

**Type Safety:** When this function returns `true`, TypeScript will narrow the type to the specific POJO type `T`

**Use Cases:**
- Safe property access with type narrowing
- Runtime validation of object structure
- Conditional logic based on object properties
- API response validation

---

## Usage Examples

### Basic POJO Validation
```typescript
const data: unknown = { name: "John", age: 30 };

if (isPojo(data)) {
  // data is now typed as Pojo
  console.log(data.name); // TypeScript knows this is a POJO
}
```

### Working with Different Key Types
```typescript
// Numeric keys
type NumericPojo = PojoWith<number>;
const numericData: NumericPojo = { 0: "first", 1: "second" };

// Symbol keys
const sym = Symbol("key");
type SymbolPojo = PojoWith<symbol>;
const symbolData: SymbolPojo = { [sym]: "value" };
```

### Type-Safe Property Checking
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

### Generic Object Processing
```typescript
function processPojo<T extends Pojo>(obj: T): PojoOf<T> {
  // Process the object while maintaining its POJO structure
  return { ...obj };
}
```

---

## Design Principles

1. **Type Safety**: All utilities provide compile-time type checking and runtime validation
2. **Composability**: Types and functions are designed to work together seamlessly
3. **Flexibility**: Support for various key types and object structures
4. **Performance**: Minimal runtime overhead with maximum type safety
5. **Developer Experience**: Clear, intuitive APIs with excellent TypeScript IntelliSense

---

## Integration Notes

These utilities are designed to work together as a cohesive system:
- `ObjectKey` provides the foundation for key type constraints
- `Pojo` and `isPojo` handle basic POJO operations
- `PojoWith` and `PojoOf` provide generic flexibility
- `pojoHas` offers sophisticated type-safe property checking

The combination of these utilities enables robust, type-safe object manipulation while maintaining clean, readable code.