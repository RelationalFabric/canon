# S006: Morphism compose and apply as protocols

- **Id:** S006
- **Title:** Morphism compose and apply as protocols
- **Purpose:** Hold [#87](https://github.com/RelationalFabric/canon/pull/87) until composition and application of Morphisms are protocols. Bahul, 11 Nov 2026, London, quoted and not reinterpreted: (1) "hold #87 until compose and apply are protocols" — #87's `composeMorphisms` and `applyMorphism` are not approved names; composition and application of Morphisms must become protocols. (2) "protocols are seperate and more basic then canons types" — protocols are not another definition kind; this plan does not bring them into ADR-0017's shared registry or through define/declare/register. They sit underneath canon's kinds. (3) "give Morphisms their own constructor so protocols dispatch on it" — a Morphism value gets its own constructor; protocol dispatch (`src/protocol.ts`, constructor-based) finds Morphism implementations through it. Bahul, 14:59: "These basic protocols will only work on the type or class of the value, do we not already have an implementation" — reuse `defineProtocol` / `extendProtocol` in `src/protocol.ts` as-is. This plan adds no protocol machinery.
- **Goal:** `defineTheory` and `defineMorphism` return instances of `Theory` and `Morphism`. A Morphism carries `source`, `target`, and `maps`, and still receives its registered `canon://` identity when it is registered. `SimpleCategory`, `SimpleFunctor`, and `SimpleNode` are protocol operations on those constructors, implemented with the existing protocol API. The #87 names `composeMorphisms` and `applyMorphism` are no longer exported.
- **Measure:** A Morphism is recognised by `satisfiesProtocol` for `SimpleCategory` and `SimpleFunctor`, and a Theory for `SimpleNode`. Composition of two Morphisms whose chain matches, and `map` of a Morphism, behave as the current tests describe, called through the protocols. The output of `compose` is composed and mapped again without registration (decision 11). `SimpleNode.identity(A)` acts as a unit for `compose` on both sides. `composeMorphisms` and `applyMorphism` are absent from `src/index.ts`. No new protocol function is added beside `defineProtocol` and `extendProtocol`. `npm run check:all` passes.
- **ADRs / debt in scope:** ADR-0015 (protocol system, Obsolescent), ADR-0017 (definitions as values; lines 45 and 99 conflict with decision 2), ADR-0018 (Theories and Morphisms; composition and application), `docs/theories.md`. Debt: #87 exports unapproved function names, and a composed Morphism cannot be applied or composed again.
- **Status:** Plan only. No implementation unit has started. #87 stays held for these two operations.

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

No new dispatcher, registry, or `defineProtocol` option is in scope.

### Units

Each unit is one commit. Later units stay off this branch until the open questions they need are answered. This saga file is the planning commit; it is not one of the units.

1. **Theory and Morphism constructors.** Done at `de3564f`. `defineTheory` and `defineMorphism` return instances of `Theory` and `Morphism`. A Morphism carries `source` and `target` (Theory values) and `maps`. This unit only puts those fields on the value. It does not change compose or apply behaviour. Today source and target come only from the uri [code: `src/morphism.ts:33-40`, `src/morphism.ts:87-93`], and `defineTheory` returns its input unchanged [code: `src/theory.ts:22-24`]. Constructor-keyed dispatch is why the constructors are needed: a plain object dispatches as `Object` [code: `src/protocol.ts:145-152`]. `declareMorphism` and `registerMorphisms` derive `canon://morphism/<Source>/<Target>` from the names the two Theories are registered under, and "one registered Morphism per pair" compares the Theory values [code: `src/definitions.ts:99-102`]. Update the `defineMorphism` tests that expect the identical input object [code: `src/morphism.test.ts:48-53`].

2. **SimpleCategory, SimpleFunctor, and SimpleNode.** Define `SimpleCategory` (`compose`) and `SimpleFunctor` (`map`) for `Morphism`, and `SimpleNode` (`identity`) for `Theory`, all via `defineProtocol` and `extendProtocol`. Add the type aliases `PSimpleCategory`, `PSimpleFunctor`, and `PSimpleNode`, and the `Protocols` entries `SimpleCategory: PSimpleCategory`, `SimpleFunctor: PSimpleFunctor`, and `SimpleNode: PSimpleNode`. Fix the existing `Seq` entry to `Seq: PSeq` together with a `PSeq` alias, and update any uses of the old `PSeq` key. `compose` and `map` read `source` and `target` from the value and compare Theory values for the chain. `SimpleNode.identity` dispatches on the Theory constructor. Keep calling `defineProtocol` / `extendProtocol` only. Do not export the old function names. Do not implement Theory mapping beyond this, the rest of dispatch on Theories, or algebraic law checks. Tests in this unit call the protocols. This unit does not remove the registered-only gate (unit 4).

3. **Remove the #87 operations.** Delete `composeMorphisms` and `applyMorphism` and their `src/index.ts` exports. Delete their tests from `src/morphism.test.ts` once unit 2's protocol tests cover the same cases. `defineMorphism` stays.

4. **Composed Morphism, second use.** Remove the registered-only gate and add tests for second use. A Morphism produced by `compose` is usable by `compose` and `map` without being registered. Today the composed value is unregistered and both operations reject it [code: `src/morphism.ts:55`, `src/morphism.ts:79-84`, `src/morphism.test.ts:97-101`].

5. **ADR-0017 conflict, owned by Architecture.** Do not edit ADR-0017, ADR-0015, or ADR-0018 in the units above. The amendment is [#96](https://github.com/RelationalFabric/canon/pull/96), Architecture's draft ADR-0017/0018 amendment into `develop`. The `docs/theories.md` line 3 fix comes after #87 lands. This saga does not treat protocols as a definition kind and does not call define/declare/register for them.

### Open questions

1. Closed by decision 17. `SimpleCategory`, `SimpleFunctor`, and `SimpleNode` go into the `Protocols` interface under unprefixed keys, mapped to `PSimpleCategory`, `PSimpleFunctor`, and `PSimpleNode`. `Protocols` is protocol-only type augmentation [code: `src/types/protocols.d.ts:142`], not the definition registry.
2. Closed. The ADR-0017/0018 amendment is in hand via [#96](https://github.com/RelationalFabric/canon/pull/96).

## Ledger

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | required | required | required | required | required | required | N/A |
| 2 | required | required | required | required | required | required | N/A |
| 3 | required | required | required | required | required | required | N/A |
| 4 | required | required | required | required | required | required | N/A |
| 5 | required | required | N/A | required | N/A | opt-in | N/A |

### Notes

- `de3564f`: unit 1 done (Theory and Morphism constructors).
