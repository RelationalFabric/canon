# S001 — Phase 2: Theories

- **Id:** S001
- **Title:** Phase 2: Theories
- **Purpose:** Carry Phase 2 (Theories) from the approved ADRs onto the Phase 1 definition registry: nameless `defineTheory`, `declareTheory` returning a `KeyRef`, identities `canon://theory/<Name>`, and the three specified Theories. ObjectConstraintAxiom, Morphisms, Order, Aggregate, and the docs phase stay out of this saga.
- **Goal:** A canon type can model Identity, Taxonomy, and Typed Entity, and `declareTheory` registers those values with only `uri` in metadata. Measured by the done check on each unit below, with `npm run check:all` green at the units whose gate requires full checks. No public name beyond the ADRs.
- **ADRs in scope:** ADR-0017 (Definitions as Values), ADR-0018 (Theories only; the Morphism and ObjectConstraintAxiom sections are dependencies, not work).
- **Status:** Active. U1–U5 and U7 are in. U6 and U8 are unblocked. Q1–Q8 are answered.

## Plan

# Phase 2 plan: Theories

Planning only. This file does not implement Theories. It covers Phase 2 (Theories) from ADR-0018, built on the Phase 1 definition APIs from ADR-0017 (commit `46ef312`).

Claim labels used below:

- **[ADR]** text in ADR-0017 or ADR-0018.
- **[code]** behavior in the tree at `46ef312`.
- **[rule]** an approved rule for this phase, stated in the planning brief. Where a rule and an ADR sentence disagree, the rule is what this plan implements, and the disagreement is an open question rather than a silent rename.
- **[inference]** a reading that is not a quote and not a rule. Inferences are not new public names.

## 1. Scope

### In scope

Phase 2 adds the Theory layer only: the `Theories` augmentation slot, nameless `defineTheory`, `declareTheory` returning a `KeyRef`, registration at `canon://theory/<Name>`, the three specified Theories (Identity, Taxonomy, Typed Entity), type-level laws beside those Theories, and type-level modeling (a canon type inherits a Theory type).

ADR sections this phase implements:

- ADR-0018, **Decision → Theory** (the bundle, laws, modeling by inheritance, optionality, composition as extension and union). ObjectConstraintAxiom is in that ADR and is out of this phase; see Dependencies.
- ADR-0018, **Decision → Defining and declaring Theories** (`Theories`, `defineTheory`, `declareTheory`, label or value). The sentence that `defineTheory`'s name comes from the config is not followed; see **[rule]** and open question 2.
- ADR-0018, **Decision → The Theories**, the three specified Theories only. Order and Aggregate stay unspecified **[ADR]**.
- ADR-0018, **Consequences**, the parts that place type-level laws next to a Theory and that leave Taxonomy's `Type` key as `KeyNameAxiom` for now.
- ADR-0017, **Decision → steps 1–4, Labels keep working, A label or a value**, applied to Theories: identity URI, shared registry, metadata on use, declare-versus-define. The sentence that `define*` reads the name from the config is not followed; see **[rule]** and open question 2.

### Approved rules this plan treats as decided **[rule]**

- `define*` functions are nameless. The name is given at registration: a `registerX` key, or the `declare*` label. This phase does not add a `registerTheories` function; see open question 4. The registration path this phase does specify is `declareTheory`.
- A field that takes definitions accepts a map `{ Name: value }`, or a list of name strings or registered values, with an optional trailing map for values that are not registered yet.
- Anywhere a Theory or an axiom is referenced, a label or a value is accepted.
- `declare*` functions return the `KeyRef`.
- Theory identities are `canon://theory/<Name>`.
- A registered value carries only `uri` in its metadata.

### Dependencies, not part of this phase

- **ObjectConstraintAxiom** (ADR-0018, Decision → ObjectConstraintAxiom). It will take Theory labels or values **[ADR]**. It should call the same resolution as Theory composition. This phase does not add the axiom kind, does not change `EntityReference` or `References`, and does not add a public helper for it.
- **Morphisms** (ADR-0018, Decision → Morphism). Phase 1 already exports `morphismRefFor` **[code]**. This phase does not define, declare, or compose Morphisms.
- **Docs.** No edits under `docs/` except this plan. User-facing axiom and canon docs wait for a docs phase.
- **Order and Aggregate.** Named in ADR-0018 and deferred there until canon can do algebra with Theories. No keys, no runtime values, no `Theories` entries.
- **Protocols.** ADR-0017 marks ADR-0015 Obsolescent and pauses protocol work. This phase does not import `src/protocol.ts`.

### Public names

Shipped names are only ones the ADRs already use: `defineTheory`, `declareTheory`, and the `Theories` interface. `theoryRefFor`, `definitionUri`, `DefinitionRegistry`, and `KeyRef` already exist **[code]** and are reused, not renamed.

No other export is added. In particular this phase does not add `registerTheories`, a `Theory` / `TheoryConfig` type alias, a composition-field identifier, a canon-side "models" field name, or a `name` property. Those are open questions. File paths below are **[inference]** from the existing `src/canon.ts`, `src/shell.ts`, and `src/axioms/` split.

## 2. Units

Each unit is one commit. Ratings: **S** one module and its tests, no new resolution rules; **M** registry behavior plus types, still local; **H** crosses canon config and inference, or cannot land until an open question is answered. Blocked units stay in the order so the dependency is visible; they are not started while their question is open.

### U1 — `Theories` slot

**Rating:** S

**Files:** `src/types/theories.d.ts` (new), `src/types/index.d.ts` (re-export).

**Work:** Add an empty `Theories` interface meant for module augmentation, in the same style as `Canons` and `Axioms` **[ADR]**, **[code]** `src/types/canons.d.ts`. Do not declare Identity, Taxonomy, or Typed Entity here. Do not add a runtime config type.

**Tests:** None at runtime. Typecheck must accept `declare module '@relational-fabric/canon' { interface Theories { } }` the way `Canons` already does. No new test file.

**Done check:** `npm run check:types` passes. `Theories` is exported from the package type entry. The public value surface (`src/index.ts`) is unchanged.

### U2 — nameless `defineTheory`

**Rating:** S

**Files:** `src/theory.ts` (new), `src/index.ts` (export `defineTheory` only), `src/theory.test.ts` (new; Phase 1 tests live in sibling `*.test.ts` files **[code]**).

**Work:** `defineTheory` returns its argument unchanged, matching `defineCanon` at this commit **[code]** `src/canon.ts`. It does not read a name, does not call `definitionRegistry.register`, and does not write metadata. The parameter type stays unexported. The composition field is `extends` (Bahul, 2026-11-10). Callers pass `{}` for a Theory that composes nothing. `defineTheory` still does not register that field.

**Tests:**

- The returned reference is the same object.
- `definitionRegistry.has(definitionUri('theory', 'Identity'))` is false after `defineTheory({})`.
- `metaOf` on the result has no `uri`.

**Done check:** Those three tests pass. `defineTheory` is the only new export.

### U3 — `declareTheory`

**Rating:** M

**Files:** `src/shell.ts`, `src/shell.test.ts`.

**Work:** Mirror `declareCanon` **[code]**:

1. `const defined = defineTheory(config)`.
2. `definitionRegistry.register(definitionUri('theory', label), defined)`.
3. `return theoryRefFor(label)`.

The label type parameter extends `keyof Theories`. The name is the label **[rule]**. The identity is `canon://theory/<Label>` **[rule]**, **[code]** `definitionUri`. Registration metadata is whatever `DefinitionRegistry.register` already writes, which is the `uri` key only **[code]**, **[rule]**. Do not set a `name` field. Do not add `registerTheories`.

Empty config is valid for a Theory with no composition (Identity and Taxonomy).

**Tests** (follow `declareCanon` / `registerCanons` in `src/shell.test.ts`):

- `declareTheory` on a `Theories` label returns `key === 'canon://theory/<Label>'` and `value` identical to the config.
- `metaOf(ref.value)` is `{ uri: 'canon://theory/<Label>' }` and no other keys, for a fresh object.
- A second declare of a structurally equal config does not throw **[code]** hash idempotency.
- A second declare of a different config throws ``Definition already registered: canon://theory/<Label> (ADR-0017)`` and leaves the first value in place.
- `resetRegistry()` makes `theoryRefFor(label).value` undefined.

**Done check:** Those tests pass under `npm run check:test`. `inferCanon` is not modified.

### U4 — composition resolution

**Rating:** H. The composition field is `extends` (Bahul, 2026-11-10). Do not use `theories` as a placeholder in code.

**Files:** `src/theory.ts`, `src/theory.test.ts`, and `declareTheory`'s call site in `src/shell.ts` only to pass the same config through.

**Work:** Once the property has a name, `declareTheory` (and any later reader) passes that property to `definitionRegistry.resolve('theory', field)` **[code]**. Accepted shapes **[rule]**, **[code]** `DefinitionRegistry.resolve`:

- a map `{ Name: unregisteredValue }`, which registers each entry at `canon://theory/Name`;
- a list of name strings, `KeyRef`s (`theoryRefFor`), or values whose metadata `uri` is already set;
- that list with an optional map as the last item only.

`resolve` today pushes `{ uri, value: undefined }` for an unknown string and does not throw **[code]** `#resolveList`. This phase does not change `resolve`. `declareTheory` checks the resolved list and throws a clear error when a label's `value` is `undefined`, because a label may fail to resolve **[ADR]** ADR-0017 "A label or a value". A value in the map is registered on use, so it does not fail for that reason **[ADR]**.

Extension and union both use this one field. This unit does not add a second field or a discriminant (open question 6). The TypeScript type carries the difference: extension is `extends` one Theory, union is `extends` both **[inference]** from ADR-0018 "the type system handles everything beyond a Theory's runtime name and composition".

Metadata on every registered member stays `uri` only. `defineTheory` still does not register by itself; the map keys are the names **[rule]**.

**Tests:**

- List `['Identity']` after U5's Identity is registered resolves to that value and does not invent a second registration.
- List `[theoryRefFor('Identity')]` resolves through the `KeyRef` **[code]** `definitionKeyOf`.
- A value already registered (metadata `uri` set) resolves to itself.
- Map `{ Fresh: defineTheory({}) }` registers `canon://theory/Fresh` and sets only `uri`.
- A map that is not the last list item throws the existing "only allowed as the last item" error **[code]**.
- An unknown string label throws from `declareTheory` and does not call `register` for that name.
- A value with no `uri` and no `KeyRef` shape, sitting alone in the list, surfaces the existing resolve error **[code]**.

**Done check:** The tests pass without a new export and without edits to `DefinitionRegistry`.

### U5 — Identity and Taxonomy

**Rating:** M

**Files:** `src/theories/identity.ts`, `src/theories/taxonomy.ts` (new), `src/index.ts` (side-effect imports so the augmentation and the declare run), `src/theories/identity.test.ts`, `src/theories/taxonomy.test.ts`.

**Work:** Augment `Theories` **[ADR]**:

- `Identity`: `{ Id: KeyNameAxiom }`.
- `Taxonomy`: `{ Type: KeyNameAxiom }`. Taxonomy stays `KeyNameAxiom` until a Type kind exists **[ADR]** "Type as a core axiom kind" and Consequences.

On load, `declareTheory('Identity', {})` and `declareTheory('Taxonomy', {})`. No composition property. Do not register the `Id` or `Type` axioms in the definition registry; they still exist only as `Axioms` members and as entries inside a canon config **[code]** `src/axioms/id.ts`, `src/axiom.ts`.

**Laws** sit in those modules, not in a docs file **[ADR]**:

- `invariant<Expect<Theories['Identity']['Id'], KeyNameAxiom>>()`
- `invariant<Expect<Theories['Taxonomy']['Type'], KeyNameAxiom>>()`

`invariant` and `Expect` already exist **[code]** `src/testing.ts`.

**Tests:**

- After import, `theoryRefFor('Identity').key` is `canon://theory/Identity` and `.value` is the declared config.
- Same for Taxonomy at `canon://theory/Taxonomy`.
- `metaOf` on each value has only `uri`.
- A type fixture `interface Clash extends Theories['Identity'], Theories['Taxonomy']` is legal (both keys, different names).
- A fixture that `extends` Identity and another type with `Id` assigned a different axiom kind is a `@ts-expect-error` **[ADR]** union/extension clash when kinds differ. Interface extension already rejects incompatible properties **[inference]**; no new combinator.

**Done check:** `npm run check:all` passes. Existing shell tests that call `resetRegistry()` still see an empty registry, because they clear after import **[code]**. See Risks for the wipe of these two entries.

### U6 — Typed Entity

**Rating:** M. Unblocked. The label is `TypedEntity`, so the identity is `canon://theory/TypedEntity` (Q3).

**Files:** `src/theories/typed-entity.ts`, `src/index.ts`, `src/theories/typed-entity.test.ts`.

**Work:** Augment `Theories` with `TypedEntity`. Its type `extends` Identity and Taxonomy and adds no keys **[ADR]**. Laws:

- `invariant<Expect<Theories['TypedEntity'], Theories['Identity']>>()`
- `invariant<Expect<Theories['TypedEntity'], Theories['Taxonomy']>>()`
- `invariant<Expect<keyof Theories['TypedEntity'], 'Id' | 'Type'>>()` so no extra keys appear.

Runtime: `declareTheory('TypedEntity', { extends: ['Identity', 'Taxonomy'] })`, using U4. One list, no discriminant (Q6). Identity and Taxonomy must already be registered (import order: identity, taxonomy, then typed entity).

**Tests:**

- The three `Expect` laws hold (compile-time).
- `theoryRefFor('TypedEntity').key` is `canon://theory/TypedEntity`, and resolving `extends` yields the Identity and Taxonomy values in that order.
- A canon-shaped fixture `interface SampleCanon extends Theories['TypedEntity'] { Id: KeyNameAxiom }` typechecks (narrowing is allowed **[ADR]**). No runtime canon field is added here.

**Done check:** Type half: `check:types` passes with the three laws. Runtime half: the resolve test passes and no new public name appears.

### U7 — type-level modeling only

**Rating:** S

**Files:** `src/theories/modeling.test.ts`.

**Work:** Show, in a test module only, that a canon type models a Theory by extending it **[ADR]**:

- `interface Modeled extends Theories['Identity'] {}` assigns to a `Canon<{ Id: KeyNameAxiom }>`-shaped type. `Canon<TAxioms>` is `TAxioms` **[code]** `src/types/canons.d.ts`, so this is an `Expect`, not a new wrapper.
- A type that does not have `Id` does not extend `Theories['Identity']` (`IsFalse` / `@ts-expect-error`).
- No change to `CanonConfig`. Q5 is now answered (`models`); that field is U8, not this commit.

**Tests:** The expects above, plus a comment that `models` is U8 so nobody adds a `CanonConfig` field in the U7 commit.

**Done check:** `check:types` and `check:test` pass. `git diff` for this commit does not touch `src/canon.ts`, `src/types/canons.d.ts`, or `inferCanon`.

### U8 — runtime "canon models these Theories"

**Rating:** H. Unblocked. The `CanonConfig` field is `models`, using the same map/list form as `extends` (Q5).

**Files:** `src/types/canons.d.ts`, `src/shell.ts` (`declareCanon` / `registerCanons` only), `src/shell.test.ts`. Not `inferCanon`, unless a test shows it breaks (it should not; see Risks).

**Work:** `models` uses U4's shapes with kind `'theory'`. `declareCanon` and `registerCanons` resolve it when present and leave canons that omit it unchanged **[ADR]** "Theories are optional". Absent labels throw. Values are registered on use. `CanonConfig.axioms` stays `Record<string, AxiomConfig>` **[code]**; this unit does not also accept axiom labels in `axioms`. The **[rule]** about axiom references applies to `models` and to any later axiom-reference field, not as a silent change to `$basis` matching.

**Done check:** A canon declared with `models` resolves Identity by label and by `theoryRefFor('Identity')`. A canon declared without `models` still round-trips through `canonRefFor` as it does today. `inferCanon({ id: ... })` still returns the canon with the most matching axioms **[code]**.

## 3. Risks and interactions

### `src/canon.ts` and `inferCanon` **[code]**

`inferCanon` iterates `definitionRegistry.entries('canon')`, casts each value to `CanonConfig`, and reads `.axioms`. `entries('canon')` keeps keys that start with `canon://canon/` **[code]**, so `canon://theory/...` values are not visited. Identity and Taxonomy registrations do not change inference results.

Risk: a Theory value registered under the `canon` kind would be cast and then throw when `.axioms` is missing. `declareTheory` must keep using kind `'theory'`. U8 must not register canons under a theory URI.

`defineCanon` is still an identity function at this commit **[code]**. This phase does not change it. `declareCanon` already attaches `uri` at register time **[code]**. `declareTheory` copies that pattern.

The `as CanonConfig` cast is pre-existing. This phase does not widen it.

### `src/shell.ts` **[code]**

`resetRegistry` clears the whole `definitionRegistry`, every kind. Shell tests call it in `beforeEach` **[code]**. After U5, importing the package declares Identity and Taxonomy, and the next `resetRegistry()` drops them. `theoryRefFor('Identity').value` is then `undefined` until something calls `declareTheory` again. Module top-level does not run twice, so a reset does not bring them back.

This plan leaves `resetRegistry` as a full clear (Q7, answered). The caller re-declares. Tests that need the built-ins after a reset must call `declareTheory` again. Re-declaring an equal config is idempotent **[code]**.

`registerCanons` is unchanged. It does not grow a theory parameter in U1–U7.

### `DefinitionRegistry.resolve` **[code]**

U4 depends on current list rules: strings become URIs without registering; a non-trailing map throws; a `KeyRef` is detected by a `value` getter plus a definition-shaped `key`. `theoryRefFor` matches that shape **[code]**. A plain `{ key, value }` data object does not, because `value` is not a getter. Tests should use `theoryRefFor` or a registered value, not a hand-built object.

Do not "fix" `resolve` to throw on missing labels. Canon and axiom callers, if they use `resolve` later, share that function. The throw belongs in `declareTheory`.

`register` refuses a value that already has a live `uri` pointing at a different entry **[code]**. A Theory value passed under two map names must throw. Test that in U4.

Hash idempotency uses `object-hash` **[code]**. Two `defineTheory({})` calls hash equal, so declaring Identity twice with `{}` is safe. A config that gains a composition array will hash differently and will throw if Identity is re-declared with new contents. Built-in declares must stay stable for the life of the process.

### Axioms and `inferAxiom` **[code]**

`inferAxiom` still finds a canon, then indexes `canon.axioms[label]`. Theories do not participate. `idOf` / `typeOf` keep working. The `Id` and `Type` keys on Identity and Taxonomy are type-level requirements **[ADR]**. They are not runtime axiom registrations. Putting axiom configs on the Theory value would invent a field the ADR does not list ("runtime form is only its name and the Theories it composes").

### Metadata **[code]**

`updateMeta` spreads existing metadata and sets `uri` **[code]**. "Carries only `uri`" means this phase adds no other key. A value that already had metadata keeps those keys. Tests for the rule use a fresh object. Do not strip foreign keys; that would change `register` for canons too.

Primitives cannot carry metadata **[code]** `isMetaCarrier`. Theory configs are objects, so this does not come up if `defineTheory` rejects non-objects. `defineCanon` does not reject non-objects today. **[inference]** `defineTheory` should accept only a non-null object so `register` can attach `uri`. That constraint is local to `defineTheory` and is not a new public type name.

### Module augmentation and `keyof Theories`

`declareCanon` is generic on `keyof Canons` but tests still pass a label with a cast in one case **[code]** `shell.test.ts`. `declareTheory` uses the same constraint. Built-in labels typecheck only after the theory modules are imported. Tests that declare a throwaway Theory must augment `Theories` in the test module, the way `shell.test.ts` augments `Canons`.

### What this phase must not disturb

- `CanonConfig.axioms` shape and `$basis` counting in `inferCanon`.
- `defineAxiom` / the absence of an axiom registry entry for `Id` and `Type`.
- Protocol `$id` symbols.
- `morphismRefFor` and lexicon URIs, beyond leaving them registered in the same map.

## 4. Open questions for Bahul

Settled. Q1 was answered by Bahul. Q2–Q8 were answered on 2026-11-10 by the consistency rule: follow the existing patterns.

1. **Composition field name.** Answered. Bahul, 2026-11-10: `extends`.

2. **Does the runtime value still store `name`?** Answered. 2026-11-10, consistency rule: no `name` property. The ADR sentences that put `name` on the runtime value, and that have `defineTheory` read the name from the config, are withdrawn for this phase. The name is the declare label, which is the final URI segment. Metadata holds only `uri`.

3. **Typed Entity's label.** Answered. 2026-11-10, consistency rule: `TypedEntity`, so `canon://theory/TypedEntity`.

4. **`registerTheories`.** Answered. 2026-11-10, consistency rule: no `registerTheories` in this saga. Names come from `declareTheory` or from map keys on `extends`.

5. **`CanonConfig` field for Theories a canon models.** Answered. 2026-11-10, consistency rule: `models`, using the same map/list form as `extends`. U8 adds it.

6. **Extension vs union at runtime.** Answered. 2026-11-10, consistency rule: one list, no discriminant. `extends` one type versus `extends` both types is the distinction, and a kind clash is a TypeScript error.

7. **`resetRegistry` vs built-in Theories.** Answered. 2026-11-10, consistency rule: `resetRegistry` does a full clear, and the caller re-declares.

8. **Order and Aggregate.** Answered. 2026-11-10, consistency rule: they get no `Theories` keys.

## Ledger

The matrix is configuration. Each cell is `required`, `N/A`, or `opt-in`. It is not a checklist and is not ticked as work proceeds.

`commit` is required on every unit because each unit is one commit. `push` is opt-in until U8, which closes the saga and must be pushed. `scoped tests` is N/A only for U1, which adds no test file. `scoped checks` is required everywhere (the unit's own typecheck or test run). `full tests` is required where the unit's done check names `check:test` or `check:all` (U3, U5, U7, U8). `full checks` is required where the done check names `check:all` (U5) and on the closing unit (U8). `smoke` is N/A: this package has no app to smoke-test.

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | required | opt-in | N/A | required | opt-in | opt-in | N/A |
| U2 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U3 | required | opt-in | required | required | required | opt-in | N/A |
| U4 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U5 | required | opt-in | required | required | required | required | N/A |
| U6 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U7 | required | opt-in | required | required | required | opt-in | N/A |
| U8 | required | required | required | required | required | required | N/A |

### Notes

- 2026-11-10 — Docs only. Q2–Q8 answered by the consistency rule. U6 is unblocked with label `TypedEntity`. U8 is unblocked with `CanonConfig.models`. No code.
- 2026-11-10 — U4. `declareTheory` resolves `extends` through `definitionRegistry.resolve('theory', …)` and throws `Unresolved theory: <uri> (ADR-0017)` when a label is missing. No new export, no `name`, no `registerTheories`, no discriminant. Q1 marked answered. Tests in `src/theory.test.ts`. `npm run check:all`.
- 2026-11-10 — U7. `src/theories/modeling.test.ts` only: `Modeled` extends Identity and `Expect`s `Canon<{ Id: KeyNameAxiom }>`. A type without `Id` is `IsFalse` and a `@ts-expect-error`. No `CanonConfig` field (open question 5). `src/canon.ts`, `src/types/canons.d.ts`, and `inferCanon` untouched. `npm run check:all`.
- 2026-11-10 — U5. `src/theories/identity.ts` and `taxonomy.ts`: augment `Theories`, laws via `invariant`/`Expect`, `declareTheory` with `{}` on load. Side-effect imports in `src/index.ts`. Tests in `src/theories/identity.test.ts` and `taxonomy.test.ts`. Id and Type axioms not registered in the definition registry. `resetRegistry` unchanged. `npm run check:all`.
- 2026-11-10 — U3. `declareTheory` in `src/shell.ts` mirrors `declareCanon`: `defineTheory`, register at `canon://theory/<Label>`, return `theoryRefFor`. Five tests in `src/shell.test.ts`. `inferCanon` unchanged. `npm run check:all`.
- 2026-11-10 — U2. Nameless `defineTheory` in `src/theory.ts`, exported only from `src/index.ts`. It returns the same object, does not register, and does not write `uri`. Tests in `src/theory.test.ts`. `npm run check:all` is the scoped check.
- 2026-11-10 — Docs only, after U1. Codified the saga and drip-feed patterns in `planning/process/saga.md` and `planning/process/drip-feed.md`. `planning/README.md` now states the folder's purpose, keeps the saga entry, and points at `planning/process/`. No code, and no saga CLI, hooks, or CI.
- 2026-11-10 — U1. Empty `Theories` interface in `src/types/theories.d.ts`, re-exported from `src/types/index.d.ts`. No test file. `src/index.ts` unchanged. Scoped checks: `npm run check:types` as part of `npm run check:all`.
- 2026-11-10 — The Phase 2 plan left `docs/plans/phase-2-theories.md` (commit `cfa30f8`) and now lives in this file. `docs/plans/` is gone. Links from `README.md` and `docs/README.md` into `planning/**` were removed in that move and restored in `8d3f460`. Permanent docs may link into `planning/`. No observations, hypotheses, issues, candidates, rrs, or deferred directories, and no saga CLI, hooks, or CI.
