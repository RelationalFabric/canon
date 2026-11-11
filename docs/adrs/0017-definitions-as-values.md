# ADR-0017: Definitions as Values

## Status

Proposed

Date: 2026-11-02 (revised 2026-11-11)

## Context

Canon lets you define three kinds of thing today: canons, axioms and protocols. The Theory work (ADR-0018, to follow) adds a fourth, Theories. Theories need to be passed around: a canon lists the Theories it models, `ObjectConstraintAxiom` names the Theories its value must model, and one Theory composes others. Before we can write that ADR we need to settle what a definition *is* once it has been defined, and how canon finds it again at runtime.

Here is what canon does today. Each point is confirmed from the code on `develop`.

**`defineCanon` and `defineAxiom` return the config unchanged.** Both are identity functions (`src/canon.ts`, `src/axiom.ts`). Nothing marks the result as a definition, and two calls with equal configs produce values canon cannot tell apart from any other object.

**There is one registry, it holds only canons, and it is keyed by label.** `src/shell.ts` keeps a single global `Registry` (`src/registry.ts`), which is a `Map<string, CanonConfig>`. `declareCanon(label, config)` and `registerCanons({ label: config })` put configs into it. `inferCanon` and `inferAxiom` search it. A canon is only reachable through the string label it was declared under.

**Axioms have no registry.** An axiom exists only inside a canon's `axioms` record. `inferAxiom('Id', value)` finds a canon first and then reads the axiom from it by label.

**Protocols already use a formal identity.** `defineProtocol` (`src/protocol.ts`) gives each protocol an `$id`, a fresh `Symbol('canon:protocol:N')`, and an `$name`, which is generated as `ProtocolN`. Implementations are stored on the constructor and keyed by `$id`, and a private module-level map, also keyed by `$id`, records which constructors implement each protocol. This is the closest precedent for this ADR: a definition that carries an identity, is used as a value, and is looked up in a registry keyed by that identity. But that registry is private to protocols and cannot see canons or axioms.

**Canon has object metadata.** `metaOf`, `withMeta` and `updateMeta` (`src/meta.ts`) attach a metadata record to any object, out of band, using `reflect-metadata`. Nothing uses it yet for registration.

The problems this leaves:

1. A definition is not a thing you can point at. To refer to a canon you need its label; to refer to an axiom you need a canon and a label. Theories would have the same problem.
2. Separate registries cannot follow links between kinds. Nothing can walk from a canon to the Theories it models, or from a Theory to the Theories it composes.
3. If definitions refer to each other by value, registration order matters. A canon might be declared before a Theory it lists has been registered anywhere.

## Decision

We will treat every definition as a value with a formal identity, held in one shared registry. We build this up in four steps.

### 1. A definition is the thing itself

The result of defining a canon, an axiom, a Theory or a Morphism is equivalent to the thing it defines. Morphisms are definitions too, alongside canons, axioms and Theories. There is no separate "real" object behind it to look up by name. The definition can be passed wherever it is needed, for example where a canon names the Theories it models, where `ObjectConstraintAxiom` names the Theories its value must model, and where Theories compose.

### 2. Each definition gets a formal identity

When a definition is registered, canon gives it a formal identity. That identity is a URI in a `canon://` scheme that identifies what kind of definition sits at each location. That identity is what canon stores and passes as the value. `defineProtocol` already gives each protocol an `$id`; that is historical precedent only. Names must be unique at registration, because type augmentation keys definitions by name; a duplicate is a clash. A Morphism is still a definition with a URI identity, but its name is derived from its source and target Theories rather than given.

### 3. One shared registry, keyed by identity

There is a single shared registry for all kinds of definition: canons, axioms, Theories, Morphisms and lexicon terms. It is keyed by formal identity. Protocols are not definitions in this registry (see Consequences). Registries remain the runtime source of truth: when canon needs a definition's full config, it gets it from the registry.

Keeping every kind in one registry lets it traverse itself:

- from a canon to the Theories it models;
- from a Theory to the Theories it composes;
- from an `ObjectConstraintAxiom` to the Theories it requires.

Separate registries per kind could only do this by being stitched together.

### 4. Metadata records registration state

Canon's object metadata (`metaOf` / `withMeta` / `updateMeta`) holds each definition's registration state: a registered definition carries its `uri`. Defining a value does not register it and writes no metadata.

Registration is required only where an operation cannot work without a registry entry:

1. **Resolving a name.** A label is only a key into the registry. With no entry, there is nothing to resolve, and the reference fails. Binding a name in a map (`{ Name: value }`) is registration, not lookup.
2. **Canon inference.** `inferCanon` and `inferAxiom` choose among registered canons. An unregistered canon is never a candidate.
3. **Referring to a value by identity.** An identity needs a name, and runtime values carry no name. A value referred to by identity must already be registered, or be bound under a name in map form, which registers it.
4. **Finding a Morphism by its Theory pair.** Finding the Morphism for a pair of Theories without already holding it is a lookup, so it needs registration (ADR-0018).

Everywhere else, registration is not required. When the caller already holds a value and the operation can take what it needs from that value or its other arguments, the operation must not refuse the value because it has no `uri`. A formal identity is a result of registration, not a precondition for using a value in hand.

Uniqueness and clash checks happen only at registration. A Morphism produced by composing two others is not registered automatically, because it could clash with a registered Morphism for the same pair; it stays unregistered unless the caller registers it.

These rules cover the definition registry only. Protocol implementations are registered separately, and dispatch needs that registration.

Registration order still does not matter. A canon can list a Theory under a name in map form before that Theory is registered anywhere, and the Theory is registered when the canon is.

### Labels keep working

Existing `declareCanon(label, config)` and `registerCanons({ label: config })` calls keep working. A label becomes a name that maps to an identity: declaring a canon under a label defines it (giving it an identity), registers it in the shared registry, and records which identity the label points to. Looking up by label goes through that mapping. Code that never uses labels does not need them.

### A label or a value, whichever is at hand

Anywhere canon refers to a canon, an axiom or a Theory by name, it accepts either a label or the definition value, whichever is at hand:

- a **label** resolves through the label-to-identity mapping;
- a **value** is used as it is. If it must be referred to by identity, it must be registered or bound under a name first (step 4).

The two are not symmetric. A label assumes the definition is already registered, so it may fail to resolve. A value carries its definition with it, so an operation that only needs the value never fails for lack of registration.

The two ways of defining split on where the name comes from:

- **declare** (`declareCanon`, `declareTheory`): the label supplies the name;
- **define** (`defineCanon`, `defineAxiom`, `defineTheory`): there is no label, and the value carries no name. It gets a name, and so an identity, only when it is bound under a name or registered.

### A new ADR status: Obsolescent

We add one status to the canon ADR conventions alongside Proposed, Accepted, Deprecated and Superseded:

- **Obsolescent**: the decision is still in force, but we expect it to be superseded. Neither the decision nor any work built on it should be treated as stable.

It is the step before Superseded. If the name stops fitting, it can be changed everywhere at once.

## Consequences

**Theories have a foundation.** ADR-0018 (Theories) relies on this ADR for how Theories are defined, named and registered.

**`defineCanon` and `defineAxiom` keep returning the config unchanged.** Defining a value neither registers it nor writes metadata. A value gets a formal identity when it is registered, through a label, a map binding or a registration call.

**The canon-only registry is replaced.** The canon-only registry in `src/registry.ts` gives way to the shared, identity-keyed registry, with labels mapping to identities.

**Labels and values are interchangeable, but not symmetric.** Every place that names a canon, axiom or Theory takes either form: a label assumes the definition is already registered and may fail to resolve, while a value can be used without registration wherever the operation needs only the value.

**Axioms become reachable on their own.** Because axioms are definitions too, they get identities and registry entries, instead of existing only inside a canon's config.

**Protocols are separate from definitions.** Protocols are separate from canon's types and more basic than them: they sit underneath canons, axioms, Theories and Morphisms, and are not brought into this ADR's shared registry or its define, declare and register model. Protocol work resumes on that basis. ADR-0015 (Protocol System) stays **Obsolescent** until a protocol ADR supersedes it. The known gaps between ADR-0015 and the code, confirmed from the code on `develop`:

- Protocols as axioms are not wired. ADR-0015 places protocols in the `Axioms` interface and directly in a canon's `axioms`; the code uses a separate `Protocols` interface, and the canon and axiom types do not mention protocols.
- Canon expectation arrays (such as `PSeq: [Array, String, ...]` in a canon config) are not supported.
- Protocol names are generated as `ProtocolN` rather than taken from the variable name as ADR-0015 describes.
- ADR-0015's five open questions are unresolved: how types are identified, protocol composition, static methods, generic protocols, and error handling.

**Out of scope.** Laws, and anything that downstream packages do with definitions, are not part of this ADR. Canon makes no assumptions about how other packages use the registry or these identities.
