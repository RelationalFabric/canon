# S002 — Phase 3: Morphisms and ObjectConstraintAxiom

- **Id:** S002
- **Title:** Phase 3: Morphisms and ObjectConstraintAxiom
- **Purpose:** Carry the two ADR-0018 sections that Phase 2 left as dependencies onto the definition registry: Morphisms (`defineMorphism`, `declareMorphism`, `registerMorphisms`, completeness, composition, apply) and `ObjectConstraintAxiom`. Order, Aggregate, lexicon hierarchy, interpretations, `EntityReference` removal, and the docs phase stay out.
- **Goal:** A complete Morphism between two Theories registers at `canon://morphism/<Source>/<Target>`, composes, and applies; a canon key can require that its value models listed Theories. Measured by the done check on each unit, with `npm run check:all` green where the gate requires full checks. No public name beyond the names this plan settles from existing patterns.
- **ADRs in scope:** ADR-0018 (Decision → ObjectConstraintAxiom, Decision → Morphism, and the consequences that follow from those two). ADR-0017 for identity, the shared registry, and label-or-value resolution. Phase 2 (`feature/theories`, head `61e61a0`) is the base.
- **Status:** Active. No unit is started.

## Plan

Planning only. This file does not implement Phase 3.

`planning/` has no separate roadmap file. The radar under `planning/radar/` does not sequence these phases. Phase 3 is the remainder of ADR-0018 after Phase 2: S001 named ObjectConstraintAxiom and Morphisms as the next dependencies, and the ADR's Morphism and ObjectConstraintAxiom sections are the work those names point at.

Claim labels:

- **[ADR]** text in ADR-0017 or ADR-0018.
- **[code]** behavior in the tree at `61e61a0`.
- **[rule]** a naming or shape settled here by consistency with canon as it is: nameless `define*`, `declare*` plus `register*` for every kind, map/list fields, identities `canon://<kind>/<name>`. Where an ADR sentence disagrees, the rule is what this plan implements.
- **[inference]** a reading that is not a quote and not a rule.

## 1. Scope

### In scope

- A Morphism definition kind end to end: nameless `defineMorphism`, `declareMorphism`, `registerMorphisms`, type-level completeness, composition of two complete Morphisms, and apply.
- `ObjectConstraintAxiom`: the value at a canon key is an object that models the listed Theories. The list uses the same map/list resolution as `CanonConfig.models` **[code]** `src/shell.ts` `resolveModels`.

### Settled by consistency **[rule]**

- `defineMorphism` is nameless. It returns the config unchanged. It does not read a name, does not register, and does not write metadata. Same as `defineTheory` **[code]** `src/theory.ts`.
- The name is not a `name` property. It is the pair given to `declareMorphism`, or the `registerMorphisms` key. The identity is `canon://morphism/<Source>/<Target>` **[ADR]**, **[code]** `morphismRefFor` in `src/definitions.ts`.
- `declareMorphism` takes the source Theory label, the target Theory label, and the config. It returns `morphismRefFor(source, target)`. There is no separate label argument: the pair is the name **[ADR]** "found and dispatched by that pair, not by a label".
- `registerMorphisms` mirrors `registerTheories` **[code]** `src/shell.ts`. One map. Each key is `<Source>/<Target>`, the same string `definitionUri('morphism', key)` already accepts. It returns nothing.
- A field that names Theories uses the same map/list as `extends` and `models`: labels, `KeyRef`s, registered values, and an optional trailing map. Missing labels throw `Unresolved theory: <uri> (ADR-0017)` before the definition is stored.
- `declareMorphism` resolves `source` and `target` as Theory labels (or values, when passed inside the config's theory fields — see the config shape below) before register. A missing Theory throws and nothing is stored.
- Morphism config does not repeat `source` and `target`. Those are the name, supplied at declare or by the register key, the way a Theory label is not repeated inside `TheoryConfig`.
- The term mapping field is `maps`. It is a map of source term to target term (`Record<string, string>`), not a definition-registry ref list. Terms are keys of a Theory, and Theories do not register their keys as definitions **[code]** Phase 2: Identity's runtime value is `{}`.
- Completeness is type-level. Every key of `Theories[Source]` appears in `maps`, and each target name is a key of `Theories[Target]`. The runtime value has no key inventory to check against **[rule]** from Phase 2. `declareMorphism` does not invent a runtime key list.
- `composeMorphisms` takes two registered Morphisms A→B and B→C and returns a config for A→C. It does not register. The caller declares or registers the result. The composed `maps` is the chain of the two maps.
- `applyMorphism` reads a registered Morphism and copies each source term onto the target term. Same representation on both sides **[ADR]**. It throws `Incomplete value: canon://morphism/<Source>/<Target> missing <term>` when a mapped source term is absent on the value.
- `ObjectConstraintAxiom` is an axiom kind in `src/types/axioms.d.ts`, next to `KeyNameAxiom` and `RepresentationAxiom`. Its type parameter is a tuple of Theory types **[ADR]**.
- Its runtime config stays an `AxiomConfig` **[code]** `src/types/axioms.d.ts`: `$basis` is the object guard, and `models` is the Theory map/list. `models` is the same field name as `CanonConfig.models`. `declareCanon` / `registerCanons` resolve `models` on each axiom config that has it, through the existing `resolveModels` path, kind `'theory'`.
- `inferCanon` is unchanged. `ObjectConstraintAxiom` has no `key` string, so `$basis` matching does not start treating theory lists as data keys.
- `resetRegistry` stays a full clear. The caller re-declares. Built-in Theories are not special-cased.
- Registration metadata stays `uri` only.

### Out of scope

- **Order and Aggregate.** Named and deferred until canon can do algebra with Theories **[ADR]**. No `Theories` keys.
- **Lexicon hierarchy, lexicon term mappings, and whether those mappings are Morphisms.** Open question 1. This saga does not map lexicon terms.
- **Interpretations**, including Reference **[ADR]**.
- **`EntityReference` and `References`.** The ADR calls replacing them a follow-up. They stay.
- **Docs** under `docs/`. The docs phase is separate. This saga file is the only planning edit besides the S002 entry in `planning/README.md`.
- **Protocols.** ADR-0015 stays paused.
- **Patch values.** Open question 2. Until it is answered, `maps` has no `patch` field and apply does not convert representations.

### Public names

From the ADR and from the define/declare/register pattern: `defineMorphism`, `declareMorphism`, `registerMorphisms`, `composeMorphisms`, `applyMorphism`, `ObjectConstraintAxiom`. `morphismRefFor` and `definitionUri` already exist **[code]** and are reused.

No `name` property. No `Morphisms` label that is not the `Source/Target` pair. No second mapping field.

## 2. Units

Each unit is one commit. **S**: one module and its tests, no new resolution rules. **M**: registry behavior plus types, still local. **H**: crosses canon config or inference, or cannot land until an open question is answered. No unit here is blocked on an open question. Q1 and Q2 are excluded from the units rather than embedded in them.

### U1 — `Morphisms` slot

**Rating:** S

**Files:** `src/types/morphisms.d.ts` (new), `src/types/index.d.ts` (re-export, beside the Theories export).

**Work:** Empty `Morphisms` interface for module augmentation, keyed by the pair string `` `${Source}/${Target}` ``. Same style as `Theories` **[code]** `src/types/theories.d.ts`. Do not declare a Morphism here. Do not add a runtime config type in this unit.

**Tests:** None at runtime. Typecheck must accept `declare module '@relational-fabric/canon' { interface Morphisms { } }`.

**Done check:** `npm run check:types` passes. `Morphisms` is exported from the package type entry. `src/index.ts` is unchanged.

### U2 — nameless `defineMorphism`

**Rating:** S

**Files:** `src/morphism.ts` (new), `src/index.ts` (export `defineMorphism` only), `src/morphism.test.ts` (new).

**Work:** `defineMorphism` returns its argument unchanged. Parameter type `MorphismConfig` stays in this module (same choice as `TheoryConfig` in `src/theory.ts`). The only field is `maps?: Record<string, string>`. No `source`, `target`, `name`, or `patch`. It does not call `definitionRegistry.register` and does not write metadata.

**Tests:**

- The returned reference is the same object.
- `definitionRegistry.has(definitionUri('morphism', 'Identity/Taxonomy'))` is false after `defineMorphism({ maps: { Id: 'Id' } })`.
- `metaOf` on the result has no `uri`.

**Done check:** Those three tests pass. `defineMorphism` is the only new export.

### U3 — `declareMorphism`

**Rating:** M

**Files:** `src/shell.ts` (`declareMorphism` next to `declareTheory`), `src/shell.test.ts`.

**Work:**

1. `const defined = defineMorphism(config)`.
2. Resolve source and target with `definitionRegistry.resolve('theory', [source])` and the same for target. A missing label throws `Unresolved theory: <uri> (ADR-0017)` and does not register.
3. `definitionRegistry.register(definitionUri('morphism', `${source}/${target}`), defined)`.
4. `return morphismRefFor(source, target)`.

Source and target type parameters extend `keyof Theories`. Do not check `maps` against theory keys at runtime (U5). Do not add `registerMorphisms` here.

**Tests** (follow `declareTheory` in `src/shell.test.ts`):

- After Identity and Taxonomy are declared, `declareMorphism('Identity', 'Taxonomy', { maps: { Id: 'Type' } })` returns `key === 'canon://morphism/Identity/Taxonomy'` and `value` identical to the config.
- `metaOf(ref.value)` is `{ uri: 'canon://morphism/Identity/Taxonomy' }` only, for a fresh object.
- A second declare of a structurally equal config does not throw.
- A different `maps` value throws ``Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)`` and leaves the first value.
- An unknown source or target throws `Unresolved theory: canon://theory/<Label> (ADR-0017)` and does not register the Morphism.
- `resetRegistry()` makes `morphismRefFor('Identity', 'Taxonomy').value` undefined.

**Done check:** Those tests pass under `npm run check:test`. `inferCanon` is not modified.

### U4 — `registerMorphisms`

**Rating:** M

**Files:** `src/shell.ts`, `src/shell.test.ts`.

**Work:** `registerMorphisms(morphisms: Record<string, MorphismConfig>): void`. For each key, split on the first `/` into source and target, then do what `declareMorphism` does. A key without `/` throws `Invalid morphism name: <key> (ADR-0018)` before any register for that entry. Resolve source and target before storing that entry. Keys that do not name each other need no ordering pass; do not copy the `registerTheories` pending-set loop unless a test shows one Morphism's `maps` referring to another Morphism (it must not: `maps` is term names).

**Tests:**

- `registerMorphisms({ 'Identity/Taxonomy': { maps: { Id: 'Type' } } })` records only `uri: canon://morphism/Identity/Taxonomy`.
- A structurally equal second call does not throw.
- A different config under the same key throws ``Definition already registered: canon://morphism/Identity/Taxonomy (ADR-0017)`` and keeps the original value.
- A missing source Theory throws and does not leave the Morphism registered.
- `'IdentityTaxonomy'` (no slash) throws `Invalid morphism name: IdentityTaxonomy (ADR-0018)`.

**Done check:** Those tests pass under `npm run check:test`.

### U5 — type-level completeness

**Rating:** S

**Files:** `src/morphism.test.ts` (type fixtures only; no new runtime export).

**Work:** In the test module, a fixture Morphism type whose `maps` keys are `keyof Theories['Identity']` and whose target names extend `keyof Theories['Taxonomy']` typechecks. A fixture that omits `Id` is `@ts-expect-error`. A fixture that maps `Id` to a name that is not a Taxonomy key is `@ts-expect-error`. Use `invariant` / `Expect` **[code]** `src/testing.ts`. No change to `declareMorphism`.

**Done check:** `npm run check:types` passes. `git diff` for this commit does not touch `src/shell.ts`.

### U6 — `composeMorphisms`

**Rating:** M

**Files:** `src/morphism.ts`, `src/index.ts` (export `composeMorphisms`), `src/morphism.test.ts`.

**Work:** `composeMorphisms(left, right)` requires both values to be registered Morphisms (metadata `uri` of kind `morphism`). Read source/target from the URI (`canon://morphism/<Source>/<Target>`). The left target must equal the right source; otherwise throw `Morphism composition break: <left-uri> then <right-uri> (ADR-0018)`. Return `{ maps }` where each left source term maps to the right target of the left target term. Do not register the result. Do not accept a patch.

**Tests:**

- Identity→Taxonomy `{ Id: 'Type' }` composed with Taxonomy→Identity `{ Type: 'Id' }` returns `{ maps: { Id: 'Id' } }` and does not register `canon://morphism/Identity/Identity`.
- A break in the chain throws the composition error and registers nothing new.
- An unregistered object throws because it has no morphism `uri`.

**Done check:** Those tests pass. `composeMorphisms` is the only new export in this commit.

### U7 — `applyMorphism`

**Rating:** M

**Files:** `src/morphism.ts`, `src/index.ts`, `src/morphism.test.ts`.

**Work:** `applyMorphism(morphism, value)` reads `maps` from a registered Morphism. For each entry, copy `value[sourceTerm]` to `result[targetTerm]`. No representation conversion (Q2). Missing source term throws `Incomplete value: <uri> missing <term>` and does not return a partial object. The input object is not mutated.

**Tests:**

- `{ Id: 'a' }` through `{ maps: { Id: 'Type' } }` yields `{ Type: 'a' }`.
- A missing `Id` throws `Incomplete value: canon://morphism/Identity/Taxonomy missing Id`.
- The input object's keys are unchanged after apply.

**Done check:** Those tests pass under `npm run check:test`. No axiom files change.

### U8 — `ObjectConstraintAxiom`

**Rating:** H

**Files:** `src/types/axioms.d.ts` (`ObjectConstraintAxiom` next to `RepresentationAxiom`, around the `AxiomConfig` block), `src/shell.ts` (`declareCanon` / `registerCanons` only, beside `resolveModels`), `src/shell.test.ts`. Not `inferCanon`.

**Work:**

```ts
export type ObjectConstraintAxiom<T extends readonly unknown[] = readonly unknown[]> = Axiom<
  {
    $basis: TypeGuard<unknown>
    models: Record<string, unknown> | readonly unknown[]
  },
  { [key: string]: unknown }
> & { theories: T }
```

`theories` is type-only in the sense that tests do not read it at runtime; the runtime list is `models`. If a type-only field cannot sit on the value type without forcing a runtime property, keep the tuple as a second type parameter and do not add a `theories` runtime field. The public name is `ObjectConstraintAxiom`.

When an axiom config on a canon has `models`, resolve it as kind `'theory'` before the canon is stored. Missing labels throw. Canons whose axioms omit `models` are unchanged. Do not resolve `models` inside `defineAxiom`.

**Tests:**

- A canon axiom `{ $basis, models: ['Identity'] }` resolves to the Identity value.
- `models: ['Missing']` throws `Unresolved theory: canon://theory/Missing (ADR-0017)` and does not register the canon.
- A canon with no `models` on its axioms still round-trips through `canonRefFor`.
- `inferCanon({ id: 'x' })` still returns the canon with the most matching axioms.

**Done check:** `npm run check:all` passes. `EntityReference` is unchanged.

### U9 — a canon key models a Theory through the axiom

**Rating:** S

**Files:** `src/theories/object-constraint.test.ts` (new).

**Work:** Type-only fixture. A canon type with `Owner: ObjectConstraintAxiom<[Theories['Identity']]>` accepts a value whose `Owner` extends Identity and rejects, with `@ts-expect-error`, a value whose `Owner` has no `Id`. No runtime registration beyond what U8 already does. Do not edit `docs/theories.md`.

**Done check:** `npm run check:types` and `npm run check:test` pass. `git diff` does not touch `src/axioms/references.ts` or `EntityReference`.

## 3. Risks

### Theory keys are not runtime data **[code]**

Identity and Taxonomy register `{}`. Completeness cannot be a registry lookup. U5 is types. U7's runtime check is "every `maps` key is present on the value", not "every Theory key is present".

### `registerTheories` order **[code]** `src/shell.ts`

Sibling Theories in one map register bases first. Morphisms do not compose by naming sibling Morphisms inside `maps`. U4 must not grow that loop without a failing test.

### `AxiomConfig` index **[code]** `src/types/axioms.d.ts`

`$basis` is a `TypeGuard<unknown>` and the rest is `unknown`. `models` fits the index. Do not narrow `$basis` for every axiom.

### `inferCanon` **[code]** `src/canon.ts`

It walks `entries('canon')` and reads `.axioms`. A Morphism URI is `canon://morphism/`, so it is not visited. An axiom config that gains `models` must not be read as a list of data keys. U8's done check locks the current `inferCanon({ id })` result.

### Built-ins and `resetRegistry` **[code]**

Shell tests clear the registry in `beforeEach`. Re-declare Identity and Taxonomy before declaring a Morphism that names them. Do not change `resetRegistry`.

## 4. Open questions

Only direction the consistency rule cannot settle. Each has a recommendation. Neither blocks U1–U9; both are excluded from those units.

1. **Are lexicon term mappings Morphisms?** **[ADR]** Consequences: "whether type morphisms are the same concept as Morphisms is not yet decided." Consistency does not answer it, because lexicon identities are `canon://lexicon/<name>/<term>` **[code]** `lexiconTermUri`, a different kind. **Recommend:** they are not Morphisms in this phase. No unit maps a lexicon term. A later saga can add them if the decision is that they are the same concept.

2. **What is a representation patch on one mapped term?** **[ADR]** says a Morphism assumes the same representation unless a side is a `RepresentationAxiom` or is "patched with a representation", and that patching is optional. It does not say whether the patch is a `RepresentationAxiom` config, a pair of canon labels, or a function. Phase 2 stored no axiom configs on Theory values, so there is no existing patch field to copy. **Recommend:** no `patch` field in this phase. Apply copies values through. A later unit adds `patch` only after the value type is chosen. U7 states the no-conversion rule so that unit does not invent the field.

## Ledger

The matrix is configuration. Each cell is `required`, `N/A`, or `opt-in`. It is not a checklist and is not ticked as work proceeds.

`commit` is required on every unit. `push` is opt-in until U9, which closes the saga and must be pushed. `scoped tests` is N/A only for U1. `scoped checks` is required everywhere. `full tests` is required where the done check names `check:test` or `check:all` (U3, U4, U7, U8, U9). `full checks` is required where the done check names `check:all` (U8) and on the closing unit (U9). `smoke` is N/A.

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | required | opt-in | N/A | required | opt-in | opt-in | N/A |
| U2 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U3 | required | opt-in | required | required | required | opt-in | N/A |
| U4 | required | opt-in | required | required | required | opt-in | N/A |
| U5 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U6 | required | opt-in | required | required | opt-in | opt-in | N/A |
| U7 | required | opt-in | required | required | required | opt-in | N/A |
| U8 | required | opt-in | required | required | required | required | N/A |
| U9 | required | required | required | required | required | required | N/A |

### Notes

- 2026-11-10 — S002 opened on `feature/phase-3` from `feature/theories` (`61e61a0`). Plan only. Phase 3 is ADR-0018's Morphism and ObjectConstraintAxiom sections. Q1 and Q2 are the only open direction calls. No unit implemented.
