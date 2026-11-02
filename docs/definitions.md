# Definitions: Canons, Axioms and Theories as Values

> **Status: proposed.** This document describes [ADR-0017: Definitions as Values](./adrs/0017-definitions-as-values.md). None of it is implemented yet. Today `defineCanon` and `defineAxiom` return their config unchanged, and only canons are registered, by label.

## Prerequisites

**Before reading this document, please read the [Axioms](./axioms.md) and [Canons](./canons.md) documentation.**

## Overview

When you define something in canon (a canon, an axiom or a Theory), the result **is** that thing. You can hold it in a variable, pass it to other definitions, and canon will know what it is. You never need a separate "real" object hidden behind a name.

This document explains what that means, how definitions are named, and how to refer to one definition from another.

## What is a Definition?

A definition is the value you get back from defining a canon, an axiom or a Theory. Each definition has:

- **A formal identity.** Canon gives every definition its own identity when it is defined. Two definitions with identical configs are still two different definitions.
- **Registration state.** Canon records, in the definition's metadata, whether it has been registered yet.

All definitions, of every kind, live in **one shared registry**, keyed by identity. Because they share a registry, canon can follow the links between them: from a canon to the Theories it models, or from a Theory to the Theories it composes.

## Defining vs Declaring

There are two ways to create a definition. They differ in where the definition's name comes from.

### Declaring: the label supplies the name

`declareCanon` and `declareTheory` take a **label** and a config. The label is the name, so the config does not repeat it. Declaring also registers the definition under that label.

```typescript
declareTheory('Taxonomy', { theories: [] })
```

### Defining: the config supplies the name

`defineCanon`, `defineAxiom` and `defineTheory` take only a config. There is no label, so the config carries the name. The result is the definition value, which you keep in a variable.

```typescript
const Identity = defineTheory({ name: 'Identity', theories: [] })
```

> `theories` is a **placeholder** field name for the Theories being composed. It has not been decided yet.

### Choosing the Right Style

- **Declare** when other code will look the definition up by name, the way canons are declared today.
- **Define** when you want to pass the definition around directly as a value.

## Referring to Definitions: a Label or a Value

Anywhere canon expects you to name a canon, an axiom or a Theory, you can give it either a **label** or the **definition value**, whichever you have to hand. You can mix both in one list:

```typescript
declareTheory('TypedEntity', { theories: [Identity, 'Taxonomy'] })
```

The two forms behave differently:

- **A label assumes the definition is already registered.** Canon resolves it through its map from labels to identities. If nothing has been declared under that label, the reference **may fail to resolve**.
- **A value carries its definition with it.** If it isn't registered yet, canon registers it when it is used. It **cannot fail** because something wasn't registered.

### Why This Matters

Because any value you use is registered on the spot, **the order you define things in does not matter**. A canon can refer to a Theory value that nobody has registered yet, and the Theory is registered when the canon is.

If you aren't sure whether something has been declared yet, prefer passing the value.

## Best Practices

1. **Pass values where you can.** They can't fail to resolve.
2. **Use labels for shared, well-known definitions** that are declared once, early, by the module that owns them.
3. **Don't rely on getting your config object back.** A definition is not guaranteed to be the very same object you passed in.
