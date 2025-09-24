# API Reference

## Core

### `ObjectKey`
```typescript
type ObjectKey = string | number | symbol;
```
Union type representing all valid JavaScript object key types.

### `Pojo`
```typescript
type Pojo = Record<string, unknown>;
```
Type alias for Plain Old JavaScript Objects with string keys and unknown values.

### `isPojo`
```typescript
const isPojo: TypeGuard<Pojo>;
```
Type guard function that determines whether a value is a Plain Old JavaScript Object.

**Returns:** `true` if the value is a POJO, `false` otherwise

**Type Safety:** When this function returns `true`, TypeScript narrows the type to `Pojo`. The `TypeGuard<Pojo>` pattern allows for:
- Generic type narrowing: `isPojo<SpecificPojo>(value)` preserves specific POJO types
- Base type narrowing: `isPojo(value)` narrows to `Pojo`

## Canons

### `PojoWith<K extends ObjectKey>`
```typescript
type PojoWith<K extends ObjectKey> = Record<K, unknown>;
```
Generic type that creates a POJO with specific key types.

**Generic Parameters:**
- `K`: The key type(s) for the object (must extend `ObjectKey`)

### `PojoOf<O extends Pojo>`
```typescript
type PojoOf<O extends Pojo> = O;
```
Utility type that extracts the POJO structure from a given object type.

**Generic Parameters:**
- `O`: The object type to extract POJO structure from (must extend `Pojo`)

### `TypeGuard<T>`
```typescript
type TypeGuard<T> = {
  <U extends T>(obj: U | unknown): obj is U;
  (obj: T | unknown): obj is T;
};
```
Type guard pattern providing both generic and specific type narrowing capabilities.

**Behavior:**
- Generic type narrowing: When called with a specific type `U` that extends `T`, narrows to that specific type
- Base type narrowing: When called with the base type `T`, narrows to that type
- Discriminating union support: Enables proper type discrimination in complex scenarios

### `pojoHas<T extends PojoWith<K>, K extends ObjectKey>`
```typescript
const pojoHas = <T extends PojoWith<K>, K extends ObjectKey>(
  key: K
): TypeGuard<T>;
```
Type guard factory that creates a type guard for checking if an object has a specific key.

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
- **Composable**: Can be used as a building block for more complex type guards