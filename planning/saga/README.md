# S006: Morphism compose and apply as protocols

- **Id:** S006
- **Title:** Morphism compose and apply as protocols
- **Purpose:** [#87](https://github.com/RelationalFabric/canon/pull/87) merged at `a610c26`. Composition and application of Morphisms are still the unapproved names `composeMorphisms` and `applyMorphism`; they become protocols. Bahul, 11 Nov 2026, London, quoted and not reinterpreted: (1) "hold #87 until compose and apply are protocols". (2) "protocols are seperate and more basic then canons types" — protocols are not another definition kind; this plan does not bring them into ADR-0017's shared registry or through define/declare/register. They sit underneath canon's kinds. (3) "give Morphisms their own constructor so protocols dispatch on it" — protocol dispatch (`src/protocol.ts`, constructor-based) finds Morphism implementations through it. Bahul, 14:59: "These basic protocols will only work on the type or class of the value, do we not already have an implementation" — reuse `defineProtocol` / `extendProtocol` in `src/protocol.ts` as-is. This plan adds no protocol machinery.
- **Goal:** `defineTheory` and `defineMorphism` return instances of `Theory` and `Morphism`. A Morphism carries `source`, `target`, and `maps`, and still receives its registered `canon://` identity when it is registered. `SimpleCategory`, `SimpleFunctor`, and `SimpleNode` are protocol operations on those constructors, implemented with the existing protocol API. The #87 names `composeMorphisms` and `applyMorphism` are no longer exported.
- **Measure:** A Morphism is recognised by `satisfiesProtocol` for `SimpleCategory` and `SimpleFunctor`, and a Theory for `SimpleNode`. Composition of two Morphisms whose chain matches, and `map` of a Morphism, behave as the current tests describe, called through the protocols. The output of `compose` is composed and mapped again without registration (decision 11). `SimpleNode.identity(A)` acts as a unit for `compose` on both sides. `composeMorphisms` and `applyMorphism` are absent from `src/index.ts`. No new protocol function is added beside `defineProtocol` and `extendProtocol`. `npm run check:all` passes.
- **ADRs / debt in scope:** ADR-0015 (protocol system, Obsolescent), ADR-0017 (definitions as values; lines 45 and 99 conflict with decision 2), ADR-0018 (Theories and Morphisms; composition and application), `docs/theories.md`. Debt: #87 exports unapproved function names, and a composed Morphism cannot be applied or composed again.
- **Status:** Unit 1 is done (`de3564f`, follow-ups `74acbbe`, `56be5d8`). #87 merged at `a610c26`. Open questions below are closed except the protocol-ADR question.

## Plan

Claims are marked [code] (file:line), [doc], or [inference].

### What the code does today

`defineMorphism` returns the config object unchanged. It does not construct a class, register anything, or write metadata [code: `src/morphism.ts:24-26`]. `declareMorphism` and `registerMorphisms` call `defineMorphism`, then `definitionRegistry.register`, which stamps `uri` on the same object [code: `src/shell.ts:187-191`, `src/shell.ts:211-212`, `src/definitions.ts:99-102`]. The public names `applyMorphism`, `composeMorphisms`, and `defineMorphism` are exported from `src/index.ts:35` [code].

`composeMorphisms` reads each side's `canon://morphism/` uri, requires the left target to equal the right source, and returns a new `{ maps }` object [code: `src/morphism.ts:33-56`]. That return value is not registered [code: `src/morphism.test.ts:79-85`]. `applyMorphism` and `composeMorphisms` both refuse a value whose metadata uri is missing or not a morphism uri, with `Unregistered morphism (ADR-0018)` [code: `src/morphism.ts:79-84`, `src/morphism.test.ts:97-101`]. So a composed Morphism cannot be applied, and cannot be composed again: the next call has no uri to read endpoints from [code]. Confirmed.

Dispatch already exists and is constructor-based. `defineProtocol` and `extendProtocol` store implementations on the constructor and look them up from the first argument's constructor [code: `src/protocol.ts:125-156`, `src/protocol.ts:171-173`, `src/protocol.ts:235-254`, `src/protocol.ts:289-306`]. A plain object uses `Object` (or `ObjectFallback` when there is no constructor) [code: `src/protocol.ts:145-152`]. A Morphism config is a plain object today, so an implementation hung on `Object` would apply to every plain object [inference from those lines]. A dedicated constructor is what lets `extendProtocol` target Morphisms alone. `Protocols` is its own interface, not `Axioms` [code: `src/types/protocols.d.ts:142`]. ADR-0015 is Obsolescent and still describes protocols as axioms [doc: `docs/adrs/0015-protocol-system.md`]. ADR-0017 line 45 puts protocols in the shared registry "later". Line 99 says that after Theories, "protocols will be brought into line with this ADR" [doc]. Decision 2 forbids that. `docs/theories.md` still says Morphisms are not implemented [doc: `docs/theories.md:3`], which the #87 code has passed.

### SimpleCategory and SimpleFunctor

Bahul, 11 Nov 2026, 15:17–15:18 London, decided:

5. Compose and apply are separate protocols, not one. Composition is what every category has. Application is extra structure (acting on values), so some kinds will compose without applying. Morphisms implement both.

6. The protocols are named after the algebra. Bahul explicitly does not want the Pxyz prefix pattern (`PSeq` and the like). The ban on a P prefix for the type aliases is superseded by decision 17. The values you call stay unprefixed.

Bahul, 11 Nov 2026, 15:19 London, decided:

7. "Theoretical dispatch comes later." For S006, `SimpleCategory` and `SimpleFunctor` dispatch only on the value's constructor via the existing `defineProtocol`. Deferred, out of S006 scope: mapping Theories (the object side of a functor), dispatch on Theories, and algebraic law checks.

Bahul, 11 Nov 2026, 15:20 London, decided:

8. The S006 protocols are `SimpleCategory` (compose) and `SimpleFunctor` (map). The names `Category` and `Functor` are reserved for the later, Theory-aware versions, deferred with theoretical dispatch.

9. `SimpleCategory` has an identity method as well as compose. Superseded by decision 13: `identity` leaves `SimpleCategory`.

Bahul, 11 Nov 2026, 15:22 London, decided:

10. Method names are decided. `SimpleCategory` has `compose` and `identity`. `SimpleFunctor` has `map` (not apply). The `identity` part is superseded by decision 13. `compose` and `map` stand.

Bahul, 11 Nov 2026, 15:23 London, decided:

11. Morphisms produced by `compose` are usable by `compose` and `map` without registering. The registered-only check must not block them. The earlier wording that also named `identity` on that Morphism is superseded by decisions 13 and 14. Bahul approved the registration guidelines (15:40 London). Registration is required only where things will not work without it: (1) resolving a name, (2) canon inference, (3) a list-form ref to a nameless value, which must be bound in map form or registered first, and (4) finding a Morphism by its Theory pair when it is not already held. Otherwise an operation must not refuse a value only because it has no uri. A composed Morphism is never registered automatically, because that would clash with one Morphism per pair. The guidelines cover canon's definition registry, not protocol implementations, which are registered through `extendProtocol`.

12. The constructor is named `Morphism`, matching `defineMorphism`. (Relational Fabric consistency call.) Superseded by decision 15: Bahul approved `Morphism`, and approved `Theory` as well.

Bahul, 11 Nov 2026, 15:49–15:54 London, decided:

13. `identity` leaves `SimpleCategory`, which now has only `compose`. This replaces the identity part of decisions 9 and 10. In a category, identities belong to objects, not arrows.

14. Identities live in a separate object-side protocol named `SimpleNode`, with method `identity`, called as `SimpleNode.identity(theory)`, and dispatching on the Theory's constructor. Bahul avoided `SimpleIdentity.identity` as redundant, and avoided shadowing JS `Object`. This does not lift decision 7: mapping Theories, the rest of dispatch on Theories, and algebraic law checks stay deferred.

15. The constructors are `Morphism` and `Theory`, approved by Bahul. This replaces decision 12, which was a consistency call and is now Bahul's approval. `Theory` needs a constructor so `SimpleNode` can dispatch on it, because `defineTheory` returns its input unchanged today [code: `src/theory.ts:22-24`].

16. A Morphism has fields `source` and `target` holding Theory values, not labels. `declareMorphism` and `registerMorphisms` derive `canon://morphism/<Source>/<Target>` from the names the two Theories are registered under. "One registered Morphism per pair" compares the Theory values. `compose` checks the chain by comparing values.

Bahul, 11 Nov 2026, 15:57–16:00 London, decided:

17. The protocol types are P-prefixed: `PSimpleCategory`, `PSimpleFunctor`, `PSimpleNode`. Each is a type alias, for example `type PSimpleCategory = Protocol<SimpleCategory>`, following the intended `PSeq` pattern `type PSeq = Protocol<Seq>`. The implementations you call are unprefixed: `SimpleCategory`, `SimpleFunctor`, `SimpleNode`. The keys in the `Protocols` interface are unprefixed and map to the P type: `SimpleCategory: PSimpleCategory`, `SimpleFunctor: PSimpleFunctor`, `SimpleNode: PSimpleNode`. Likewise `Seq`'s entry should be `Seq: PSeq`. Today `src/types/protocols.d.ts` has `PSeq: Protocol<Seq>` [code: `src/types/protocols.d.ts:136-137`], which departs from this intent. This closes open question 1.

Bahul, 11 Nov 2026, 16:18–23:53 London, decided:

18. A Theory carries its terms at runtime as an optional config field `terms: { [name]: string }`, mapping each term's name to its description. Types are not part of the runtime value; they stay in the TypeScript layer, and protocols and morphisms handle a value's shape. ADR-0018 (merged in #96) holds the strategic decision.
19. A Theory's runtime value carries only its own terms. The registry regularises a missing `terms` to `{}`, so every registered Theory has terms.
20. `termsOf(theory)` returns the Theory's own terms plus those inherited through `extends`, cached on the instance. The registry fills a missing `terms` with `{}` before hashing, so the fill-in is part of the clash comparison [doc: ADR-0018]. Only the `termsOf` cache is outside equality and hashing. This replaces the earlier wording that also excluded the fill-in.
21. Identity gains the term `Id` and Taxonomy gains the term `Type`, each with a description. Typed Entity is unchanged.
22. Theory and Morphism are themselves Theories ("a Theory is just a type"), registered by a bootstrap seed in the registry, so canon describes itself.
23. Registering a Morphism replaces its `source` and `target` with the registered Theory instances when they are not already the same objects, so comparison by reference holds.
24. `SimpleNode.identity(A)` returns a Morphism A→A whose maps send each term in `termsOf(A)` to itself. `SimpleCategory.compose` composes maps by substitution and returns a Morphism A→C. Identity is the unit of compose on both sides.

No new dispatcher, registry, or `defineProtocol` option is in scope.

### Units

Each unit is one commit. Later units stay off this branch until the open questions they need are answered. This saga file is the planning commit; it is not one of the units.

Units 1–3 land together. ADR-0018 says the seed lands with the constructors.

1. **Theory and Morphism constructors.** Done at `de3564f` (plus follow-ups `74acbbe`, `56be5d8`). `defineTheory` and `defineMorphism` return instances of `Theory` and `Morphism`. A Morphism carries `source` and `target` (Theory values) and `maps`. This unit only puts those fields on the value. It does not change compose or apply behaviour. Before `de3564f`, source and target came only from the uri and `defineTheory` returned its input unchanged. `composeMorphisms` still reads them from the uri [code: `src/morphism.ts:61-64`, `src/morphism.ts:114-120`]. Constructor-keyed dispatch is why the constructors are needed: a plain object dispatches as `Object` [code: `src/protocol.ts:145-152`]. `declareMorphism` and `registerMorphisms` derive `canon://morphism/<Source>/<Target>` from the names the two Theories are registered under, and "one registered Morphism per pair" compares the Theory values [code: `src/definitions.ts:99-102`]. Update the `defineMorphism` tests that expect the identical input object [code: `src/morphism.test.ts:48-53`].

2. **Runtime terms.** Add the optional `terms` field to Theory config (decision 18). The registry fills a missing `terms` with `{}` before hashing (decision 19, decision 20). `termsOf` caches on the instance, and that cache is outside the clash hash (decision 20). `Id` on Identity and `Type` on Taxonomy (21). Tests: missing terms read as `{}`; a Theory without `terms` and one with `terms: {}` compare equal; `termsOf` unions inherited terms through `extends`; the cached value is reused; re-registering an identical Theory with and without the cache populated does not clash.

3. **Bootstrap seed.** Register `Theory` and `Morphism` as Theories (decision 22). The seeded labels and terms are **TBD: needs Bahul (new names)**.

4. **Registration swap.** On Morphism registration, replace `source` and `target` with the registered Theory instances when they are not already the same objects (decision 23).

5. **Reject `/` in Theory labels.** `canon://morphism/A/B/C` is ambiguous otherwise (Architecture review of #87). Thrown from theory declare and register, before the registry write. `src` has no error class, only `throw new Error`, so the error type and the message are **TBD for Bahul**.

6. **SimpleCategory, SimpleFunctor and SimpleNode.** Blocked on open question 3. Define `SimpleCategory` (`compose`) and `SimpleFunctor` (`map`) for `Morphism`, and `SimpleNode` (`identity`) for `Theory`, all via `defineProtocol` and `extendProtocol`. Add the type aliases `PSimpleCategory`, `PSimpleFunctor`, and `PSimpleNode`, and the `Protocols` entries `SimpleCategory: PSimpleCategory`, `SimpleFunctor: PSimpleFunctor`, and `SimpleNode: PSimpleNode`. The existing `Seq` entry is a comment edit only: `src/types/protocols.d.ts:134-138` shows `PSeq: Protocol<Seq>` in JSDoc. Change that example to `Seq: PSeq` together with a `PSeq` alias, and update any uses of the old `PSeq` key. Also update `examples/08`, the `src/protocol.ts` JSDoc, and the article, because decision 17 flips today's PSeq-as-value convention. `compose` and `map` read `source` and `target` from the value and compare Theory values for the chain. `SimpleNode.identity` dispatches on the Theory constructor and uses `termsOf` (decision 24). `compose` is substitution and throws when a middle term is missing, because ADR-0018 requires complete Morphisms. Today a missing middle term is dropped [code: `src/morphism.ts:74-78`]. Acceptance: `compose` and `map` work on an unregistered composed Morphism, and the identity laws hold on both sides. `identity(A)` is unregistered (decisions 11 and 24). Keep calling `defineProtocol` / `extendProtocol` only. Do not export the old function names. Do not implement Theory mapping beyond this, the rest of dispatch on Theories, or algebraic law checks.

7. **Remove the #87 operations.** Delete `composeMorphisms` and `applyMorphism` and their `src/index.ts` exports, including the registered-only gate [code: `src/morphism.ts:106-110`]. Delete their tests from `src/morphism.test.ts` once unit 6's protocol tests cover the same cases. `defineMorphism` stays. `compose` throwing on a missing middle term closes the radar item "composeMorphisms silent term drop" [code: `planning/radar/data.yaml:191`]. `composeMorphisms` and `applyMorphism` were never released (added 10 Nov, last tag `v1.2.0`), so there is no deprecation step.

### Open questions

1. Closed by decision 17. `SimpleCategory`, `SimpleFunctor`, and `SimpleNode` go into the `Protocols` interface under unprefixed keys, mapped to `PSimpleCategory`, `PSimpleFunctor`, and `PSimpleNode`. `Protocols` is protocol-only type augmentation [code: `src/types/protocols.d.ts:142`], not the definition registry.
2. Closed. [#96](https://github.com/RelationalFabric/canon/pull/96) merged into `develop` as `63239c0`. ADR-0017 and ADR-0018 are Accepted.
3. Do the public protocol names (`SimpleCategory`, `SimpleFunctor`, `SimpleNode`, `compose`, `map`, `identity`, and the P-prefix on the type) need a protocol ADR before they ship? They are in no ADR, and ADR-0015 is Obsolescent. For Bahul. Unit 6 is blocked on this answer.
4. Inherited term override rule: when a theory's own `terms` and an inherited term share a name with different descriptions, runtime behaviour uses own terms for `termsOf` today; the long-term override rule is undecided. For Bahul.

## Ledger

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | required | required | required | required | required | required | N/A |
| 2 | required | required | required | required | required | required | N/A |
| 3 | required | required | required | required | required | required | N/A |
| 4 | required | required | required | required | required | required | N/A |
| 5 | required | required | required | required | required | required | N/A |
| 6 | required | required | required | required | required | required | N/A |
| 7 | required | required | required | required | required | required | N/A |

### Notes

- Release gate, owner RF: no release is cut from `develop` while `composeMorphisms` and `applyMorphism` are exported. It lifts when unit 7 is merged to `develop`.
- ADR docs item, for Architecture: [#96](https://github.com/RelationalFabric/canon/pull/96) merged into `develop` as `63239c0`, with ADR-0017 and ADR-0018 Accepted. The `docs/theories.md` line 3 fix, and the stale text in `docs/definitions.md` and `docs/theories.md`, remain.
- Follow-ups outside S006, from Architecture's #87/#92 review: (a) after a double rollback failure followed by a successful outer repair, `definitions.ts` throws 'rollback incomplete' instead of rethrowing the original error (use `error.cause`; add a test); (b) `clear()` rescans `stampLog` for each value, which is quadratic; (c) in `registerCanons`, a theory that refers to a sibling listed later in the same batch may still fail preflight. (d) Closed: `tsconfig.test.json` includes `src/**`, and #88 covers `morphism.test.ts`.
- `de3564f`: unit 1 done (Theory and Morphism constructors). Follow-ups `74acbbe`, `56be5d8`.
- `df48dea`: unit 2 done (runtime terms).
- `802015a` unit 2 review fixes
- `3b002b3`: unit 4 done (registration swap)
- `f7c2950`: unit 4 swap waits until register succeeds
- `24e4941`: unit 4 clash view is an argument to register
