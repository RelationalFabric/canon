# TypeScript Utility Types and Functions Documentation

This document describes a collection of built-in utility types and functions designed to simplify common TypeScript tasks, particularly around working with Plain Old JavaScript Objects (POJOs) and type safety.

## Core Types

### `ObjectKey`
```typescript
type ObjectKey = string | number | symbol;
```

A union type representing all valid JavaScript object key types. This serves as the foundation for other utility types that work with object keys.


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
const isPojo: TypeGuard<Pojo>;
```

A type guard function that determines whether a given value is a Plain Old JavaScript Object, implemented using the `TypeGuard<Pojo>` pattern.

**Returns:** `true` if the value is a POJO, `false` otherwise

**Type Safety:** When this function returns `true`, TypeScript will narrow the type to `Pojo`. The `TypeGuard<Pojo>` pattern allows for:
- Generic type narrowing: `isPojo<SpecificPojo>(value)` preserves specific POJO types
- Base type narrowing: `isPojo(value)` narrows to `Pojo`

---

## Generic POJO Types

### `PojoWith<K extends ObjectKey>`
```typescript
type PojoWith<K extends ObjectKey> = Record<K, unknown>;
```

A generic type that creates a POJO with specific key types. Allows for more flexible key types while maintaining the POJO structure.

**Generic Parameters:**
- `K`: The key type(s) for the object (must extend `ObjectKey`)


### `PojoOf<O extends Pojo>`
```typescript
type PojoOf<O extends Pojo> = O;
```

A utility type that extracts the POJO structure from a given object type. Useful for ensuring type compatibility and working with object transformations.

**Generic Parameters:**
- `O`: The object type to extract POJO structure from (must extend `Pojo`)


---

## Type Guard System

### `TypeGuard<T>`
```typescript
type TypeGuard<T> = {
  <U extends T>(obj: U | unknown): obj is U;
  (obj: T | unknown): obj is T;
};
```

A sophisticated type guard pattern that provides both generic and specific type narrowing capabilities. This pattern allows for:

1. **Generic Type Narrowing**: When called with a more specific type `U` that extends `T`, it narrows to that specific type
2. **Base Type Narrowing**: When called with the base type `T`, it narrows to that type
3. **Discriminating Union Support**: Enables proper type discrimination in complex scenarios

**Key Benefits:**
- **Extends Safety**: Preserves the specific type when working with subtypes
- **Flexible Usage**: Works with both specific and general type scenarios
- **Better IntelliSense**: Provides more accurate type information in IDEs
- **Composable**: Can be used as a building block for more complex type guards

### `pojoHas<T extends PojoWith<K>, K extends ObjectKey>`
```typescript
const pojoHas = <T extends PojoWith<K>, K extends ObjectKey>(
  key: K
): TypeGuard<T>;
```

A sophisticated type guard factory that creates a type guard for checking if an object has a specific key. The returned function conforms to the `TypeGuard<T>` pattern for optimal type discrimination.

**Parameters:**
- `key`: The key to check for (must be a valid `ObjectKey`)

**Returns:** A `TypeGuard<T>` function that:
- When called with a specific type `U extends T`, narrows to that specific type `U`
- When called with the base type `T`, narrows to `T`
- Returns `true` if the object has the specified key, `false` otherwise

**Type Safety:** The `TypeGuard<T>` pattern provides:
- **Extends Safety**: Preserves specific types when working with subtypes
- **Flexible Usage**: Works with both specific and general type scenarios
- **Better IntelliSense**: More accurate type information in IDEs


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