# API Reference

## Core

### `ObjectKey`
```typescript
type ObjectKey = string | number | symbol;
```
Union type representing all valid JavaScript object key types.

### `Pojo`
```typescript
type Pojo = Record<ObjectKey, unknown>;
```
Type alias for Plain Old JavaScript Objects with ObjectKey keys and unknown values.

### `isPojo`
```typescript
const isPojo: TypeGuard<Pojo>;
```
Type guard that checks if a value is a Plain Old JavaScript Object.

## Canons

### `PojoWith<K extends ObjectKey>`
```typescript
type PojoWith<K extends ObjectKey> = Record<K, unknown>;
```
POJO type with specific key types.

### `PojoOf<O extends Pojo>`
```typescript
type PojoOf<O extends Pojo> = O;
```
Extracts POJO structure from an object type.

### `TypeGuard<T>`
```typescript
type TypeGuard<T> = {
  <U extends T>(obj: U | unknown): obj is U;
  (obj: T | unknown): obj is T;
};
```
Type guard pattern that preserves specific types when narrowing.

### `pojoHas<T extends PojoWith<K>, K extends ObjectKey>`
```typescript
const pojoHas = <T extends PojoWith<K>, K extends ObjectKey>(
  obj: T | unknown,
  key: K
): obj is T;
```
Type guard that checks if an object has a specific key.

### `pojoWith<K extends ObjectKey>`
```typescript
const pojoWith = <K extends ObjectKey>(
  key: K
): TypeGuard<PojoWith<K>>;
```
Creates a type guard for checking if an object has a specific key.

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