# API Reference

Authoritative signatures and usage guidance for the exports surfaced from the `@relational-fabric/canon` entry point. Runtime behaviour and type-only surfaces are listed separately for clarity.

## Runtime APIs

### Canon discovery

#### `inferCanon`

```ts
function inferCanon(value: unknown): CanonConfig | undefined
```

Inspects every registered canon and returns the configuration whose `$basis` guards match the value most completely. Returns `undefined` when no canon matches.

#### `inferAxiom`

```ts
function inferAxiom<Label extends keyof Axioms>(
  axiomLabel: Label,
  value: unknown,
): AxiomConfig | undefined
```

Finds the canon that satisfies the provided value and returns the runtime configuration for the requested axiom label. Returns `undefined` when no canon matches.

### Registry and shell

#### `Registry`

```ts
class Registry {
  register(label: string, config: CanonConfig): void
  get(label: string): CanonConfig | undefined
  values(): IterableIterator<CanonConfig>
  has(label: string): boolean
  get size(): number
  clear(): void
  [Symbol.iterator](): Iterator<CanonConfig>
}
```

In-memory store backing canon discovery.

#### `createRegistry`

```ts
function createRegistry(): Registry
```

Creates a fresh, empty registry instance.

#### `getRegistry`

```ts
function getRegistry(): Registry
```

Returns the global singleton registry used by `inferCanon` / `inferAxiom`.

#### `resetRegistry`

```ts
function resetRegistry(): void
```

Clears the global registry. Handy for tests and long-lived processes.

#### `declareCanon`

```ts
function declareCanon<Label extends keyof Canons>(
  label: Label,
  config: CanonConfig,
): void
```

Registers a single canon configuration on the global registry, wrapping the input with `defineCanon` for type safety.

#### `registerCanons`

```ts
function registerCanons(canons: Record<string, CanonConfig>): void
```

Bulk registration helper for module-style canon packages.

### Axiom helpers

All helpers throw when no matching canon is found or when the extracted data violates the axiom contract.

#### `idOf`

```ts
function idOf<T extends Satisfies<'Id'>>(value: T): string
```

Returns the identifier string declared by the Id axiom.

#### `typeOf`

```ts
function typeOf<T extends Satisfies<'Type'>>(value: T): string
```

Returns the classification string declared by the Type axiom.

#### `versionOf`

```ts
function versionOf<T extends Satisfies<'Version'>>(value: T): string | number
```

Returns the version declared by the Version axiom, supporting numeric or string revisions.

#### `timestampsOf`

```ts
function timestampsOf<T extends Satisfies<'Timestamps'>>(value: T): Date
```

Normalises timestamp representations to canonical `Date` instances.

#### `isCanonicalTimestamp`

```ts
function isCanonicalTimestamp(value: number | string | Date): value is Date
```

Predicate used by `timestampsOf` to detect already canonical inputs.

#### `referencesOf`

```ts
function referencesOf<T extends Satisfies<'References'>>(
  value: T,
): EntityReference<string, unknown>
```

Normalises reference values (strings, objects, canonical references) to the `EntityReference` shape.

#### `isCanonicalReference`

```ts
function isCanonicalReference(
  value: string | object,
): value is EntityReference<string, unknown>
```

Predicate used by `referencesOf` to detect pre-normalised references.

### Metadata utilities

#### `metaOf`

```ts
function metaOf<T extends object, M extends Metadata = Metadata>(value: T): M
```

Reads the reflective metadata previously attached to the object. Returns an empty metadata object when nothing has been stored.

#### `withMeta`

```ts
function withMeta<T extends object, M extends Metadata = Metadata>(
  value: T,
  metadata: M,
): T
```

Stores metadata alongside the object (using `reflect-metadata`) and returns the same object for chaining.

#### `updateMeta`

```ts
function updateMeta<T extends object, M extends Metadata = Metadata>(
  value: T,
  updater: (metadata?: M) => M | undefined,
): T
```

Retrieves the current metadata, allows callers to return an updated payload, and persists the new value. Returning `undefined` removes the metadata.

### Type-testing runtime helper

#### `invariant`

```ts
function invariant<_ extends true>(): void
```

Runtime no-op used alongside the `Expect`, `IsTrue`, and `IsFalse` type utilities to enforce compile-time assertions.

### Kit surface

The curated runtime utilities (filesystem helpers, logging, third-party bridges, etc.) are covered in detail under [Canon Kit & Third-Party Utilities](./kit.md). Refer to that document for signatures exposed from `@relational-fabric/canon`.

## Type-only APIs

### Axiom type system

#### `Axioms`

```ts
interface Axioms {}
```

Module-augmentation surface for declaring available axioms.

#### `Axiom`

```ts
type Axiom<TConfig, TMeta> = TConfig & { $meta: TMeta }
```

Base shape applied by axiom definitions.

#### `KeyNameAxiom`

```ts
type KeyNameAxiom = Axiom<{
  $basis: Record<string, unknown>
  key: string
}, Record<string, unknown>>
```

Standard pattern for key-based concepts (Id, Type, Version).

#### `RepresentationAxiom`

```ts
type RepresentationAxiom<T, C = unknown> = Axiom<{
  $basis: T | TypeGuard<unknown>
  isCanonical: (value: unknown) => value is C
}, Record<string, unknown>>
```

Used by axioms that convert between multiple representations (timestamps, references).

#### `AxiomConfig`

```ts
interface AxiomConfig {
  $basis: TypeGuard<unknown>
  [key: string]: unknown
}
```

Runtime configuration shape returned by `inferAxiom`.

#### `defineAxiom`

```ts
function defineAxiom(config: AxiomConfig): AxiomConfig
```

Identity helper for publishing reusable axiom configurations.

#### `EntityReference`

```ts
interface EntityReference<R, T = unknown> {
  ref: R
  value?: T
  resolved: boolean
}
```

Canonical reference object returned by `referencesOf`.

#### `AxiomValue`

```ts
type AxiomValue<TLabel extends keyof Axioms> = Axioms[TLabel] extends { $basis: infer TBasis }
  ? TBasis extends TypeGuard<infer T>
    ? T
    : TBasis
  : never
```

Extracts the input type accepted by the `$basis` guard for a given axiom.

### Canon type system

#### `Canons`

```ts
interface Canons {}
```

Module-augmentation surface for declaring available canons.

#### `CanonConfig`

```ts
interface CanonConfig {
  axioms: Record<string, AxiomConfig>
}
```

Runtime description of a canon (used by registry operations).

#### `defineCanon`

```ts
function defineCanon(config: CanonConfig): CanonConfig
```

Identity helper that affirms a runtime configuration satisfies the canon contract.

#### `Canon`

```ts
type Canon<TAxioms extends Partial<Axioms>> = TAxioms
```

Type-level representation mapping axiom labels to their configurations.

#### `Satisfies`

```ts
type Satisfies<
  TAxiomLabel extends keyof Axioms,
  TCanonLabel extends keyof Canons = keyof Canons,
> = {
  [K in keyof Canons]: TAxiomLabel extends keyof Canons[K]
    ? Canons[K][TAxiomLabel] extends { $basis: infer TBasis }
      ? TBasis
      : never
    : never
}[TCanonLabel]
```

Constraint used by runtime helpers (`idOf`, `typeOf`, etc.) to demand inputs that are covered by at least one registered canon.

### Guard and predicate types

#### `TypeGuard`

```ts
interface TypeGuard<T> {
  <U extends T>(value: U | unknown): value is U
  (value: T | unknown): value is T
}
```

### `Predicate`

```ts
interface Predicate<T> {
  (value: T | unknown): boolean
  <U extends T>(value: U | unknown): boolean
}
```

#### `typeGuard`

```ts
function typeGuard<T>(predicate: Predicate<T>): TypeGuard<T>
```

### Object utility types

#### `Pojo`

```ts
type Pojo = Record<string, unknown>
```

#### `PojoWith`

```ts
type PojoWith<T extends Pojo, K extends string, V = unknown> = T & { [P in K]: V }
```

### JavaScript type metadata

#### `JsType`

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

#### `JsTypeName`

```ts
type JsTypeName = keyof JsType
```

### Type-testing utilities

#### `Expect`

```ts
type Expect<A, B> = A extends B ? true : false
```

#### `IsTrue`

```ts
type IsTrue<A> = Expect<A, true>
```

#### `IsFalse`

```ts
type IsFalse<A> = A extends false ? true : false
```

### Metadata helpers

#### `Metadata`

```ts
type Metadata = Record<PropertyKey, unknown>
```

### Technology Radar utilities

The radar conversion and validation helpers exported from `@relational-fabric/canon/radar` primarily support the build scripts. For detailed signatures and usage patterns, see [Technology Radar Utilities](./radar.md).
