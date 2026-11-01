# ADR-0017: Theories and Morphisms

- Status: proposed
- Date: 2026-11-01

## Context and Problem Statement

Canon currently has three layers:

- **Axiom kinds** define the forms a statement can take, for example `KeyNameAxiom` and `RepresentationAxiom`. ADR-0015 adds protocols as another kind of axiom.
- **Axioms** are named concepts registered in `Axioms`, such as `Id`, `Type`, `Version`, `Timestamps`, `References` and the protocol axioms like `PSeq`. Each axiom is typed by its kind.
- **Canons** implement a set of axioms for one data shape, for example JSON-LD, Mongo or Standard.

A canon makes data behave consistently, but there is no way to declare the *shape of a canon* on its own: a reusable, named bundle of axiom requirements that any canon can be shown to satisfy, and that a library can depend on without choosing a canon. ADR-0015 names this as the "canons of canons" problem but solves only the API half of it, through protocols.

The immediate driver is DCSGS (the Distributed Context-Sensitive Graph Store). Consumers must be able to bring their own model. DCSGS should therefore state what it needs from a model rather than own the model's types. A first alignment pass against For My Event found about 25 such requirements. That is too many to state as a flat list of axioms, and they are not one concern, so they need grouping and composition.

A second need follows from the first. Once several of these bundles exist in different bounded contexts, there has to be a way to map one onto another without corrupting meaning.

## Decision Drivers

- Consumers bring their own model; libraries depend on requirements, not on canons.
- Requirements must be reusable and composable, not restated in every canon.
- Keep the existing layers intact: axiom kinds, axioms, canons and protocols keep their current meaning.
- Mapping between bundles must preserve meaning, and that must be checkable.
- Follow canon's vocabulary and patterns. No new names beyond those decided here.

## Decision Outcome

Add two first-class concepts to canon, **Theory** and **Morphism**.

### Theory

A **Theory** is a named, reusable bundle of axiom requirements that sits above canons.

- A Theory declares the axioms it requires, each typed by its axiom kind but with no data shape.
- A Canon **models** a Theory when it supplies every required axiom for its data.
- A library **depends on** a Theory, not on a Canon. It works with any Canon that models that Theory.
- A Theory is a bounded context: its terms mean what that Theory says, and nothing outside it.
- Theories compose:
  - **Extension**: a Theory can extend another, so every model of the extending Theory is also a model of the one it extends.
  - **Union**: two Theories combine into one that requires both.
  - Shared terms across Theories are only treated as the same through a Morphism (below), never by name alone.

Illustrative usage (not a final API):

> A Canon *models* a Theory when it supplies each required axiom for its data. A library *depends on* a Theory, not a Canon: DCSGS requires its Canons to model its Theories, and works with any Canon that does.

### Morphism

A **Morphism** is a mapping from one Theory's terms and axioms into another's that preserves meaning. It is the only first-class kind of morphism in a canon-based project.

A Morphism must be:

1. **Total**: every term of the source Theory is mapped.
2. **Axiom-preserving**: a Canon that models the target Theory, viewed through the Morphism, is a model of the source Theory.
3. **Composable**: Morphisms A→B and B→C compose to a Morphism A→C with the same effect.

### Relationship to existing concepts

| Concept | Role | Changes in this ADR |
| --- | --- | --- |
| Axiom kind | Defines what form a statement can take | None. New kinds are added only when a requirement needs a statement form that no kind can express. |
| Axiom | One named statement, typed by its kind | None |
| Protocol (ADR-0015) | An axiom kind whose statements are operations | None. A Theory may require protocol axioms. |
| Canon | Implements axioms for one data shape | A Canon may now *model* Theories. |
| Theory | Bundle of axiom requirements, a bounded context | New |
| Morphism | Meaning-preserving mapping between Theories | New |
| howard claim | Proof that something holds | Optional proof that a Canon models a Theory, or that a Morphism preserves axioms |

### Type as a core axiom kind

`Type` is currently registered as a `KeyNameAxiom`. Theories need type hierarchy (for example, "every model of X is a model of Y" at the data level). This ADR records that Type is to become its own core axiom kind that can express a type hierarchy. Its design is left to a follow-up ADR.

## Positive Consequences

- Libraries such as DCSGS state their requirements once, as Theories, and accept any consumer Canon that models them.
- The ~25 DCSGS requirements become a few Theories that build on each other instead of a flat list.
- Meaning is kept intact across bounded contexts (for example, an FME ontology and a DCSGS Theory) through Morphisms.
- Clear separation: axiom kinds, axioms, canons and protocols keep their current meaning.

## Negative Consequences

- Two more concepts to learn, on top of axiom kinds, axioms, canons, protocols and lazy modules.
- "Model" is now a verb (a Canon models a Theory). Docs must not also use "model" for a consumer's data model; call that the consumer's Canon.
- Checking that a Morphism preserves axioms may need howard, which adds a dependency for full soundness checks.

## Open Questions

1. **Laws.** Does a Theory carry laws relating its axioms (for example, Version increases over time) from the start, or only axiom requirements for now?
2. **Checking "models".** Is "a Canon models a Theory" checked at type level only, at runtime too, or proven through a howard claim?
3. **Union conflicts.** When two Theories are combined and both use a term, must a Morphism always be given, or can identical axiom labels be treated as shared?
4. **Where Morphisms are proven.** Does canon only define and apply Morphisms, with howard proving axiom preservation, or does canon check it directly?
5. **Type axiom kind.** Shape of the Type axiom kind with hierarchy, in a follow-up ADR.
6. **Registration.** How Theories and Morphisms are registered (for example, alongside `Axioms` and canons in the registry).
7. **ADR number.** 0017 assumes no newer canon ADR exists on `develop` since the local copy (release 1.4.1, 29 Dec 2025).

## Links

- ADR-0015: Protocol System (the "canons of canons" problem)
- ADR-0016: Lazy Module Pattern
- `docs/axioms.md`, `docs/canons.md`
- Theory and theory morphism in algebraic specification (OBJ, CASL, institution theory)
