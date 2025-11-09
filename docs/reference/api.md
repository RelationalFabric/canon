# API Reference

## Core

### `ObjectKey`

```typescript
type ObjectKey = string | number | symbol
```

Union type representing all valid JavaScript object key types.

## Type Testing

### `Expect<A, B>`

```typescript
type Expect<A, B> = A extends B ? true : false
```

Resolves to `true` when `A` extends `B`; otherwise `false`.

### `IsTrue<A>`

```typescript
type IsTrue<A> = Expect<A, true>
```

Convenience alias that verifies a type reduces to `true`.

### `IsFalse<A>`

```typescript
type IsFalse<A> = A extends false ? true : false
```

Resolves to `true` only when the argument is exactly `false`.

### `invariant<T extends true>()`

```typescript
function invariant<T extends true>(): void
```

Runtime no-op that fails to compile when `T` is not `true`.

### `Pojo`

```typescript
interface Pojo {
  [key: ObjectKey]: unknown
}
```

Interface for Plain Old JavaScript Objects with ObjectKey keys and unknown values.

### `isPojo`

```typescript
const isPojo: TypeGuard<Pojo>
```

Type guard that checks if a value is a Plain Old JavaScript Object.

## Canons

### `PojoWith<K extends ObjectKey>`

```typescript
interface PojoWith<K extends ObjectKey> {
  [key in K]: unknown
}
```

POJO interface with specific key types.

### `PojoOf<O extends Pojo>`

```typescript
type PojoOf<O extends Pojo> = O
```

Extracts POJO structure from an object type.

### `TypeGuard<T>`

```typescript
interface TypeGuard<T> {
  <U extends T>(obj: U | unknown): obj is U
  (obj: T | unknown): obj is T
}
```

Type guard pattern that preserves specific types when narrowing.

### `pojoHas<K extends ObjectKey, T extends PojoWith<K>>`

```typescript
function pojoHas<K extends ObjectKey, T extends PojoWith<K>>(obj: T | unknown, key: K): obj is T
```

Type guard that checks if an object has a specific key.

### `pojoWith<K extends ObjectKey>`

```typescript
function pojoWith<K extends ObjectKey>(key: K): TypeGuard<PojoWith<K>>
```

Creates a type guard for checking if an object has a specific key.

### `objectKeys<T extends Pojo>`

```typescript
function objectKeys<T extends Pojo>(obj: T): (keyof T)[]
```

Type-safe version of `Object.keys()` that preserves key types.

### `objectEntries<T extends Pojo>`

```typescript
function objectEntries<T extends Pojo>(obj: T): [keyof T, T[keyof T]][]
```

Type-safe version of `Object.entries()` that preserves key-value pair types.

### `objectValues<T extends Pojo>`

```typescript
function objectValues<T extends Pojo>(obj: T): T[keyof T][]
```

Type-safe version of `Object.values()` that preserves value types.

### `inferAxiom<T extends keyof Axioms>`

```typescript
declare function inferAxiom<T extends keyof Axioms>(axiom: T, value: Satisfies<T>): Axioms[T]
```

Runtime axiom inference function that determines the axiom configuration for a given value.

### `declareCanon`

```typescript
declare function declareCanon(name: string, config: CanonConfig): void
```

Declarative function that registers both type and runtime configuration for a canon in one step.

### `registerCanons`

```typescript
declare function registerCanons(canons: Record<string, CanonConfig>): void
```

Registers multiple canons with their runtime configurations.

## Canon Types

### `Canon<T extends CanonDefinition>`

```typescript
type Canon<T extends CanonDefinition> = T
```

Canon type that represents a universal type blueprint.

### `Axiom<T extends AxiomDefinition, C extends AxiomConfig>`

```typescript
interface Axiom<T extends AxiomDefinition, C extends AxiomConfig> {
  axiom: T
  config: C
}
```

Axiom type that pairs axiom definition with configuration.

## Kit Utilities

### `createEslintConfig(options?, ...configs)`

```typescript
function createEslintConfig(options?: Record<string, unknown>, ...configs: object[]): object
```

Factory that wraps `@antfu/eslint-config`, applying Canon defaults and merging any additional configuration.

### `defu`

```typescript
import { defu } from '@relational-fabric/canon'
```

Re-export of [`defu`](https://github.com/unjs/defu) for deep configuration merging.

### `parseYaml`

```typescript
import { parseYaml } from '@relational-fabric/canon'
```

Alias for [`yaml.parse`](https://github.com/eemeli/yaml) used for Canon's radar tooling.

### `objectHash(value, options?)`

```typescript
import { objectHash } from '@relational-fabric/canon'
```

Re-export of the default export from [`object-hash`](https://github.com/puleos/object-hash), providing stable hash generation.

### `Immutable`

```typescript
import { Immutable } from '@relational-fabric/canon'
```

Namespace export of [`immutable`](https://github.com/immutable-js/immutable-js), exposing persistent data structures through the Kit surface.
