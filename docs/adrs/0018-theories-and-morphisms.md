# ADR-0018: Theories and Morphisms

## Status

Proposed

Date: 2026-11-01 (revised 2026-11-02, 2026-11-11)

## Context

Canon currently has three layers:

- **Axiom kinds** define the forms a statement can take, for example `KeyNameAxiom` and `RepresentationAxiom`.
- **Axioms** are named concepts registered in `Axioms`, such as `Id`, `Type`, `Version`, `Timestamps`, and `References`. Each axiom is typed by its kind.
- **Canons** implement a set of axioms for one data shape, for example JSON-LD, Mongo or Standard.

A canon makes data behave consistently, but there is no way to declare the *shape of a canon* on its own: a reusable, named bundle of axiom requirements that any canon can be shown to satisfy, and that a library can depend on without choosing a canon.

The immediate driver is DCSGS (the Distributed Context-Sensitive Graph Store). Consumers must be able to bring their own model. DCSGS should therefore state what it needs from a model rather than own the model's types. A first alignment pass against a consumer application found about 25 such requirements. That is too many to state as a flat list of axioms, and they are not one concern, so they need grouping and composition.

A second need follows from the first. Once several of these bundles exist in different bounded contexts, there has to be a way to map one onto another without corrupting meaning.

The governing idea: a Theory is a universal interface over all objects. Its objects stay theoretical until a canon supplies a concrete set of objects that model it. Canon says only what objects can express, never how they are used. How an object is used in a particular situation, for example as a reference to another object, is an interpretation and sits outside canon.

The decision must satisfy these constraints:

- Consumers bring their own model; libraries depend on requirements, not on canons.
- Requirements must be reusable and composable, not restated in every canon.
- Keep the existing layers intact: axiom kinds, axioms and canons keep their current meaning.
- Mapping between bundles must be complete, and that must be checkable.
- Follow canon's vocabulary and patterns. No new names beyond those decided here.

Related: ADR-0016: Lazy Module Pattern, ADR-0017: Definitions as Values, `docs/axioms.md`, `docs/canons.md`, Theory and theory morphism in algebraic specification (OBJ, CASL, institution theory).

## Decision

We will add two first-class concepts to canon, **Theory** and **Morphism**.

### Theory

A **Theory** is a named, reusable bundle of axiom requirements that sits above canons.

- A Theory is a type made of keys and the expected axiom kind at each key, plus its laws. For now it declares nothing else: no data shape, claims or per-axiom rules.
- Laws are part of a Theory. Type-level laws are written as canon invariants (`invariant<Expect<...>>()` from `src/testing.ts`) next to the Theory. Value-level laws are left to downstream packages; canon assumes nothing about them.
- A Canon models a Theory by having its canon type inherit from the Theory's type. It may narrow that type, for example by giving a more specific kind at a key.
- For now, a Theory's runtime form is only the Theories it composes, produced by `defineTheory` or `declareTheory` (below). The runtime value carries no name; a Theory is named when it is declared under a label or bound under a name.
- The type system handles everything beyond a Theory's composition, until we find something it can't express. Runtime machinery is added only then.
- Theories are optional. A canon that models no Theory works exactly as it does today, so existing canons are unaffected.
- A Theory earns its place only when several canons must agree on what its keys mean. A shape that only one subsystem reads is a plain TypeScript type, enforced by the implementation that consumes it. It may be promoted to a Theory later if a second consumer needs the shared meaning.
- A Canon **models** a Theory when its canon type inherits from (and may narrow) the Theory's type.
- A library **depends on** a Theory, not on a Canon. It works with any Canon that models that Theory.
- A Theory is a bounded context: its terms mean what that Theory says, and nothing outside it.
- Theories compose:
  - **Extension**: a Theory can extend another, so every model of the extending Theory is also a model of the one it extends.
  - **Union**: two Theories combine into one that requires both. A key present in both is shared if its axiom kinds match, and a type error if they don't.

### Defining and declaring Theories

Canon gets `defineTheory` and `declareTheory`, mirroring `defineCanon` and `declareCanon`.

- A global `Theories` interface, extended by module augmentation in the same way as `Canons` and `Axioms`, carries each Theory's TypeScript type, keyed by label.
- The config adds only the runtime information the type implies: the Theories it composes. The name is not part of the value: with `declareTheory` it comes from the label, and a value from `defineTheory` is named when it is bound under a name or registered.
- `defineTheory` produces the Theory value; `declareTheory` also registers it under a label, matching `declareCanon`.
- Composed Theories may be given as labels or Theory values. Identity, registration and label resolution follow ADR-0017: Definitions as Values.

### The Theories

We will start with five Theories. Three are fully specified: two base Theories and one composed Theory. Two are identified but not yet specified.

- **Identity**: every object can be told apart from every other. Key `Id` (KeyNameAxiom).
- **Taxonomy**: every object belongs to a kind or class, so canons can agree on classification. It is about kind membership, not field structure; each canon's field structure is its own shape and the type system already covers it. Key `Type` (KeyNameAxiom today, the Type kind once designed).
- **Typed Entity**: the first composed Theory. It is the union of Identity and Taxonomy and adds no keys of its own: every object can be told apart and belongs to a kind.
- **Order**: Order says something about an object's container: where the object sits in it.
- **Aggregate**: an aggregate in the domain-driven design sense. Aggregate says something about what an object contains.

Order and Aggregate are about what can be done with objects, not about their values. They are identified here, but their specification, including their keys, is deferred together until canon can do algebra with Theories. That is potentially where protocols come in.

Reference is not a Theory. Storage, Causality, Context, Governance and Matching are not Theories either; they are shapes required by single subsystems and stay plain types next to their consumers.

### ObjectConstraintAxiom

We will add one axiom kind, **ObjectConstraintAxiom**. It states that the value at a key must be an object that models the listed Theories. Its type parameter takes Theories only.

ObjectConstraintAxiom replaces `EntityReference` as the way a key says "this value has an identity". It says nothing about whether the value is used as a reference; that is an interpretation. Constraints on values or value-like data (as opposed to objects) are a separate family, left for later.

### Interpretations (out of scope)

An interpretation is a set of Theories plus claims, including situational claims such as "a lookup or resolver exists here that can turn an Identity into its object". Interpretations are out of scope for canon and are left to downstream packages. Reference is an example: it would require Identity, with claims saying under which conditions an object can stand for another.

### Morphism

A **Morphism** is a mapping from one Theory's terms into another's. Canon defines, applies and type-checks Morphisms. A Morphism's name is derived from its source and target Theories, so there is one registered Morphism per pair, and it can be found and dispatched by that pair on demand. Finding a Morphism by its pair is a registry lookup, so it needs the Morphism to be registered (ADR-0017). A Morphism value carries its own source and target, so applying or composing a Morphism already in hand does not need registration.

A Morphism is a homomorphism by definition. It is one-way, from source to target, complete, and structure-preserving through the axioms at each key. It is not required to be a monomorphism or an isomorphism. Those are properties a particular Morphism may have. An isomorphism is a pair of Morphisms that are inverses.

The only requirement on a Morphism is that it is **complete**: every term of the source Theory is mapped. Once a Morphism is complete, the axioms at each key do the rest. For example, a `RepresentationAxiom` converts whichever representation the target uses to its canonical form. A Morphism therefore needs no separate rule about value representation or axiom preservation.

A Morphism assumes the representation is the same on both sides of a mapped key, unless either side's axiom is a `RepresentationAxiom`, or one or both sides are patched with a representation for that mapping. Patching is optional and is never forced; it covers a conversion that the base axiom doesn't supply.

Composition follows: two complete Morphisms A→B and B→C compose into a complete Morphism A→C. The composed Morphism carries A and C as its source and target, so it can be composed and applied again. It is not registered automatically.

### Relationship to existing concepts

| Concept | Role | Changes in this ADR |
| --- | --- | --- |
| Axiom kind | Defines what form a statement can take | Adds ObjectConstraintAxiom. Other new kinds are added only when a requirement needs a statement form that no kind can express. |
| Axiom | One named statement, typed by its kind | None |
| Canon | Implements axioms for one data shape | A Canon may now *model* Theories. |
| Theory | Bundle of axiom requirements, a bounded context | New |
| Morphism | Complete mapping between Theories | New |
| Interpretation | Theories plus claims, such as Reference | Out of scope; left to downstream packages. |

### Type as a core axiom kind

`Type` is currently registered as a `KeyNameAxiom`. Taxonomy's hierarchy part would need more than that (for example, "every model of X is a model of Y" at the data level). That is deferred; see Consequences.

## Consequences

Easier:

- Libraries such as DCSGS state their requirements once, as Theories, and accept any consumer Canon that models them.
- Only two base Theories, Identity and Taxonomy, carry shared meaning; Typed Entity is just their composition. The rest of the ~25 DCSGS requirements are plain types next to the subsystem that consumes them, which keeps the cost of the canon path low.
- A key can require that its value has an identity (ObjectConstraintAxiom) without canon deciding how that value is used.
- Meaning is kept intact across bounded contexts (for example, a consumer application's ontology and a DCSGS Theory) through Morphisms.
- Clear separation: axiom kinds, axioms and canons keep their current meaning; usage lives in interpretations, left to downstream packages.
- Type-level laws sit next to their Theory as canon invariants, checked by the existing type tests.

Harder:

- More concepts to learn, on top of axiom kinds, axioms, canons and lazy modules.
- `EntityReference` and the `References` axiom describe usage, not what an object can express. They have no users yet, so they can be changed or deprecated in favour of ObjectConstraintAxiom; that work is a follow-up.
- Reference and other interpretations are unavailable until a downstream package supplies them.
- Canon checks only that a Morphism is complete; everything else is left to the axioms at each key.
- Taxonomy has two parts, lexicon and hierarchy. Only the lexicon is expressible now, as a single `Type` key whose value is an open `string` for now. Each lexicon term is addressable in the shared registry, so lexicon terms can later be mapped between lexicons (type morphisms); whether type morphisms are the same concept as Morphisms is not yet decided. The hierarchy is deferred.
- Order and Aggregate are named but unspecified, so nothing can model them yet. Their specification waits until canon can do algebra with Theories, potentially where protocols come in.
