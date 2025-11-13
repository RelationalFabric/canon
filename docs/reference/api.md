# API Reference

Authoritative signatures and usage guidance for the exports surfaced from the `@relational-fabric/canon` entry point.

## Axiom and Canon Inference

### `inferAxiom`

```ts
function inferAxiom<Label extends keyof Axioms>(
  axiomLabel: Label,
  value: unknown,
): AxiomConfig | undefined
```

Determines the runtime configuration for the requested axiom by locating the canon whose basis functions match the supplied value. Returns `undefined` when no registered canon satisfies the value.

### `inferCanon`

```ts
function inferCanon(value: unknown): CanonConfig | undefined
```

Inspects all registered canons and returns the configuration with the highest number of matching axiom basis checks. Falls back to `undefined` when nothing matches.

## Registry & Shell

### `getRegistry`

```ts
function getRegistry(): Registry
```

Provides access to the global registry singleton that backs canon discovery.

### `resetRegistry`

```ts
function resetRegistry(): void
```

Clears the global registry. Helpful in tests and long‑running processes.

### `declareCanon`

```ts
function declareCanon<Label extends keyof Canons>(
  label: Label,
  config: CanonConfig,
): void
```

Registers a single canon configuration against the global registry. The config is wrapped with `defineCanon` to ensure type conformance.

### `registerCanons`

```ts
function registerCanons(canons: Record<string, CanonConfig>): void
```

Bulk registration helper for module‑style canons. Iterates the object and declares each entry.

## Type System Helpers

### `defineCanon`

```ts
function defineCanon(config: CanonConfig): CanonConfig
```

Identity helper for authoring canons as re‑exportable modules. Provides an explicit place to enforce runtime typing when publishing derived packages.

### `CanonConfig`

```ts
interface CanonConfig {
  axioms: Record<string, AxiomConfig>
}
```

Runtime shape that binds axiom labels to their configuration objects, including `$basis` guards.

### `Canons`

```ts
interface Canons {}
```

Augmentation target for declaring the set of canons your application or library registers. Extend this interface using module augmentation:

```ts
declare module '@relational-fabric/canon' {
  interface Canons {
    Internal: InternalCanon
  }
}
```

### `Satisfies`

```ts
type Satisfies<
  TAxiomLabel extends keyof Axioms,
  TCanonLabel extends keyof Canons = keyof Canons,
> = {
  [K in keyof Canons]:
    TAxiomLabel extends keyof Canons[K]
      ? Canons[K][TAxiomLabel] extends { $basis: infer TBasis } ? TBasis : never
      : never
}[TCanonLabel]
```

Constraint that extracts the `$basis` input type for an axiom, ensuring caller values conform to at least one registered canon implementation.

## Guard & Predicate Utilities

### `TypeGuard`

```ts
interface TypeGuard<T> {
  <U extends T>(value: U | unknown): value is U
  (value: T | unknown): value is T
}
```

Preserves specific types when narrowing from `unknown`.

### `Predicate`

```ts
interface Predicate<T> {
  (value: T | unknown): boolean
  <U extends T>(value: U | unknown): boolean
}
```

Predicate signature that feeds `typeGuard`.

### `typeGuard`

```ts
function typeGuard<T>(predicate: Predicate<T>): TypeGuard<T>
```

Upgrades a predicate into a fully typed guard while maintaining overload behaviour.

## Object Utilities

### `Pojo`

```ts
type Pojo = Record<string, unknown>
```

Canonical plain object definition used across Canon’s type system.

### `PojoWith`

```ts
type PojoWith<T extends Pojo, K extends string, V = unknown> =
  T & { [P in K]: V }
```

Captures a POJO that guarantees the presence of the given key with the specified value type.

### `isPojo`

```ts
const isPojo: TypeGuard<Pojo>
```

Checks for plain objects (rejects arrays, `null`, and non–object values).

### `pojoWith`

```ts
function pojoWith<K extends string>(key: K): TypeGuard<PojoWith<Pojo, K>>
```

Factory that creates a guard verifying the existence of a property on a POJO.

### `pojoHas`

```ts
function pojoHas<T extends Pojo, K extends string>(
  value: T | unknown,
  key: K,
): value is PojoWith<T, K>
```

Convenience wrapper around `pojoWith` for immediate checks.

### `pojoWithOfType`

```ts
function pojoWithOfType<K extends string, V extends JsTypeName>(
  key: K,
  type: V,
): TypeGuard<PojoWith<Pojo, K, JsType[V]>>
```

Ensures a key exists on a POJO and its value matches a JavaScript primitive type.

### `pojoHasOfType`

```ts
function pojoHasOfType<T extends Pojo, K extends string, V extends JsTypeName>(
  value: T | unknown,
  key: K,
  type: V,
): value is PojoWith<T, K, JsType[V]>
```

Runtime helper that pairs `pojoHas` with primitive type assertions.

### `objectKeys`

```ts
function objectKeys<T extends object>(value: T): Array<keyof T>
```

Typed wrapper around `Object.keys` that preserves key inference for objects and arrays.

### `objectValues`

```ts
function objectValues<T extends object>(value: T): unknown[]
```

Typed wrapper around `Object.values`, returning array values while supporting arrays and objects.

### `objectEntries`

```ts
function objectEntries<T extends object>(
  value: T,
): Array<[keyof T, T[keyof T]]>
```

Typed wrapper around `Object.entries` that preserves tuple relationships.

## JavaScript Type Metadata

### `JsType`

```ts
interface JsType {
  string: string
  number: number
  boolean: boolean
  object: object
  array: unknown[]
  null: null
  undefined: undefined
  symbol: symbol
  bigint: bigint
  function: (...args: any[]) => any
}
```

Lookup interface mapping JavaScript primitive names to their runtime types. Used by POJO helpers to enforce type expectations.

### `JsTypeName`

```ts
type JsTypeName = keyof JsType
```

Union of supported primitive type labels for POJO predicates.

