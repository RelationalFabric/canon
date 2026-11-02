# Theories: Shared Requirements Above Canons

> **Status: proposed.** This document describes [ADR-0018: Theories and Morphisms](./adrs/0018-theories-and-morphisms.md). None of it is implemented yet. `ObjectConstraintAxiom`, the `Theories` interface, `defineTheory`, `declareTheory`, `defineMorphism` and Morphisms are all proposed.

## Prerequisites

**Before reading this document, please read the [Axioms](./axioms.md), [Canons](./canons.md) and [Definitions](./definitions.md) documentation.**

## Overview

A canon tells canon how one data format holds its concepts. A **Theory** goes one level up: it states which concepts a canon must hold, without choosing a canon. A library can then depend on a Theory and work with **any** canon that models it.

## What is a Theory?

A Theory is a **universal interface** over objects. It is made of keys, the axiom kind expected at each key, and its laws.

A Theory's objects are **theoretical**. A Theory doesn't hold data itself; it describes what objects can express. Only when a canon supplies a concrete set of objects that model the Theory do those objects become real.

Canon says only **what** objects can express, never **how** they are used. How an object is used in a given situation (for example, as a reference to another object) is an *interpretation*. Interpretations sit outside canon.

A Theory is worth defining only when several canons must agree on what its keys mean. A shape that only one subsystem reads should stay a plain TypeScript type next to that subsystem.

## The Theories

### Identity

Every object can be told apart from every other. Identity has one key, `Id`, which is a `KeyNameAxiom`.

```typescript
interface Identity {
  Id: KeyNameAxiom
}
```

### Taxonomy

Every object belongs to a kind, so canons can agree on classification. Taxonomy is about kind membership, not field structure.

Taxonomy has two parts, a **lexicon** (the names of kinds) and a **hierarchy** (how kinds relate). Only the lexicon can be expressed for now. It is a single `Type` key, whose value is an open `string` for now. The hierarchy comes later.

```typescript
interface Taxonomy {
  Type: KeyNameAxiom
}
```

### Typed Entity: Composing Theories

Theories compose:

- **Extension**: a Theory can extend another, so every model of the extending Theory is also a model of the one it extends.
- **Union**: two Theories combine into one that requires both.

Typed Entity is the simplest example. It is the union of Identity and Taxonomy and adds no keys of its own:

```typescript
interface TypedEntity extends Identity, Taxonomy {}
```

#### Union Conflicts

If two Theories in a union use the same key, the key is **shared** as long as both expect the same axiom kind there. If the kinds differ, the union is a **type error**.

### Order and Aggregate

Two more Theories are named but **not yet specified**:

- **Order** says something about an object's container: where the object sits in it.
- **Aggregate**, in the domain-driven design sense, says something about what an object contains.

Both are about what can be done with objects rather than their values. Their keys will be specified once canon can do algebra with Theories. You can't model either of them yet.

## Modelling a Theory

A canon **models** a Theory when its canon type inherits from the Theory's type. It lists those Theories in the `models` field of its config, as labels or Theory values. Theories are optional: a canon that models no Theory works exactly as it does today.

```typescript
// Models Typed Entity, and so Identity and Taxonomy
interface MyCanon extends TypedEntity {
  Owner: ObjectConstraintAxiom<[Identity]>
  Category: ObjectConstraintAxiom<[TypedEntity]>
}

// Models no Theory: unchanged from today
type PlainCanon = Canon<{ Id: KeyNameAxiom }>
```

A canon may **narrow** a Theory's type, for example by giving a more specific kind at a key. It may not replace a key's kind with an incompatible one. TypeScript rejects that:

```typescript
interface BadCanon extends TypedEntity {
  Type: RepresentationAxiom<string, string>
}
// error TS2430: Interface 'BadCanon' incorrectly extends interface 'TypedEntity'.
//   Types of property 'Type' are incompatible.
//     Property 'key' is missing in type 'RepresentationAxiom<string, string>' but required in type 'KeyNameAxiom'.
```

### Depending on a Theory

A library depends on a Theory, not on a canon. Until canon has a whole-canon "models" constraint, a library can fall back to the per-axiom `Satisfies`:

```typescript
export function keyOf<T extends Satisfies<'Id'>>(x: T): string {
  return idOf(x)
}
```

## ObjectConstraintAxiom

`ObjectConstraintAxiom` is a new axiom kind. It says that the value at a key must be an **object that models the listed Theories**. In `MyCanon` above, the value at `Owner` must model Identity, and the value at `Category` must model Typed Entity.

It says nothing about how that value is used. In particular it doesn't make the value a reference; that is an interpretation, outside canon.

## Laws

Laws are part of a Theory. Write **type-level** laws as canon invariants next to the Theory, using `invariant` and `Expect` from canon's type testing:

```typescript
// Every Typed Entity is also an Identity and a Taxonomy
invariant<Expect<TypedEntity, Identity>>()
invariant<Expect<TypedEntity, Taxonomy>>()
```

Canon assumes nothing about value-level laws.

## Declaring Theories

Like canons, Theories have a type and a runtime config:

- The **type** lives in the global `Theories` interface, extended by module augmentation, keyed by label.
- The **config** adds only the runtime information the type implies: the Theory's name and the Theories it composes. Composed Theories are listed in `extends`. With `defineTheory` the name comes from `name`; with `declareTheory` it comes from the label.

```typescript
declare module '@relational-fabric/canon' {
  interface Theories {
    Taxonomy: Taxonomy
    TypedEntity: TypedEntity
  }
}

// Defined by value: `name` supplies the name
const Identity = defineTheory({ name: 'Identity', extends: [] })

// Declared by label: the label supplies the name
declareTheory('Taxonomy', { extends: [] })

// Composed from a value and a label
declareTheory('TypedEntity', { extends: [Identity, 'Taxonomy'] })
```

See [Definitions](./definitions.md) for the difference between defining and declaring, and between referring by label and by value.

## Morphisms

A **Morphism** maps one Theory's terms onto another's. Canon defines, applies and type-checks Morphisms. Use one to carry meaning across bounded contexts, for example between a consumer's own Theory and a library's. A Morphism is a homomorphism by definition: one-way from source to target, complete, and structure-preserving through the axioms at each key. It need not be a monomorphism or an isomorphism; those are properties a particular Morphism may have, and an isomorphism is a pair of Morphisms that are inverses.

Morphisms are definitions too. `defineMorphism` produces the Morphism value. Its name is derived from the source and target Theories, so there is at most one Morphism per pair, and its identity looks like `canon://morphism/<Source>/<Target>`. It is found and dispatched by that pair, not by a label. Identity and registration follow [Definitions](./definitions.md).

### Completeness

A Morphism has one requirement: it must be **complete**. Every term of the source Theory must be mapped. Once it is, the axioms at each key do the rest. Two complete Morphisms, A→B and B→C, compose into a complete Morphism A→C.

### Representation

For each mapped key, a Morphism assumes the representation is **the same on both sides**, except when:

- either side's axiom is a `RepresentationAxiom`, which converts between representations itself; or
- one or both sides are **patched** with a representation for that mapping.

Patching is optional and never forced. Use it only when you need a conversion that the base axiom doesn't supply.

## Best Practices

1. **Start with a plain type.** Promote it to a Theory only when a second consumer needs the same meaning.
2. **Compose rather than repeat.** Build Theories from smaller ones, as Typed Entity does.
3. **Write type-level laws as invariants** next to the Theory they belong to.
4. **Keep usage out of Theories.** Say what objects can express, never how they are used.
