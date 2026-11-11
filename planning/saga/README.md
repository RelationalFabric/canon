# S006: Morphism compose and apply as protocols

- **Id:** S006
- **Title:** Morphism compose and apply as protocols
- **Purpose:** Hold [#87](https://github.com/RelationalFabric/canon/pull/87) until composition and application of Morphisms are protocols. Bahul, 11 Nov 2026, London, quoted and not reinterpreted: (1) "hold #87 until compose and apply are protocols" — #87's `composeMorphisms` and `applyMorphism` are not approved names; composition and application of Morphisms must become protocols. (2) "protocols are seperate and more basic then canons types" — protocols are not another definition kind; this plan does not bring them into ADR-0017's shared registry or through define/declare/register. They sit underneath canon's kinds. (3) "give Morphisms their own constructor so protocols dispatch on it" — a Morphism value gets its own constructor; protocol dispatch (`src/protocol.ts`, constructor-based) finds Morphism implementations through it. Bahul, 14:59: "These basic protocols will only work on the type or class of the value, do we not already have an implementation" — reuse `defineProtocol` / `extendProtocol` in `src/protocol.ts` as-is. This plan adds no protocol machinery.
- **Goal:** `defineMorphism` and `declareMorphism` values are instances of a Morphism constructor, still carry `maps`, and still receive their registered `canon://` identity. Composition and application are protocol operations on that constructor, implemented with the existing protocol API. The #87 names `composeMorphisms` and `applyMorphism` are no longer exported.
- **Measure:** A registered Morphism is recognised by `satisfiesProtocol` for the new protocol. Composition of two registered Morphisms whose chain matches, and application of a registered Morphism to a value, behave as the current tests describe, called through the protocol. `composeMorphisms` and `applyMorphism` are absent from `src/index.ts`. No new protocol function is added beside `defineProtocol` and `extendProtocol`. `npm run check:all` passes.
- **ADRs / debt in scope:** ADR-0015 (protocol system, Obsolescent), ADR-0017 (definitions as values; lines 45 and 99 conflict with decision 2), ADR-0018 (Theories and Morphisms; composition and application), `docs/theories.md`. Debt: #87 exports unapproved function names, and a composed Morphism cannot be applied or composed again.
- **Status:** Plan only. No implementation unit has started. #87 stays held for these two operations.

## Plan

Claims are marked [code] (file:line), [doc], or [inference].

### What the code does today

`defineMorphism` returns the config object unchanged. It does not construct a class, register anything, or write metadata [code: `src/morphism.ts:24-26`]. `declareMorphism` and `registerMorphisms` call `defineMorphism`, then `definitionRegistry.register`, which stamps `uri` on the same object [code: `src/shell.ts:187-191`, `src/shell.ts:211-212`, `src/definitions.ts:99-102`]. The public names `applyMorphism`, `composeMorphisms`, and `defineMorphism` are exported from `src/index.ts:35` [code].

`composeMorphisms` reads each side's `canon://morphism/` uri, requires the left target to equal the right source, and returns a new `{ maps }` object [code: `src/morphism.ts:33-56`]. That return value is not registered [code: `src/morphism.test.ts:79-85`]. `applyMorphism` and `composeMorphisms` both refuse a value whose metadata uri is missing or not a morphism uri, with `Unregistered morphism (ADR-0018)` [code: `src/morphism.ts:79-84`, `src/morphism.test.ts:97-101`]. So a composed Morphism cannot be applied, and cannot be composed again: the next call has no uri to read endpoints from [code]. Confirmed.

Dispatch already exists and is constructor-based. `defineProtocol` and `extendProtocol` store implementations on the constructor and look them up from the first argument's constructor [code: `src/protocol.ts:125-156`, `src/protocol.ts:171-173`, `src/protocol.ts:235-254`, `src/protocol.ts:289-306`]. A plain object uses `Object` (or `ObjectFallback` when there is no constructor) [code: `src/protocol.ts:145-152`]. A Morphism config is a plain object today, so an implementation hung on `Object` would apply to every plain object [inference from those lines]. A dedicated constructor is what lets `extendProtocol` target Morphisms alone. `Protocols` is its own interface, not `Axioms` [code: `src/types/protocols.d.ts:142`]. ADR-0015 is Obsolescent and still describes protocols as axioms [doc: `docs/adrs/0015-protocol-system.md`]. ADR-0017 line 45 puts protocols in the shared registry "later". Line 99 says that after Theories, "protocols will be brought into line with this ADR" [doc]. Decision 2 forbids that. `docs/theories.md` still says Morphisms are not implemented [doc: `docs/theories.md:3`], which the #87 code has passed.

### Category and Functor

Bahul, 11 Nov 2026, 15:17–15:18 London, decided:

5. Compose and apply are separate protocols, not one. Composition is what every category has. Application is extra structure (acting on values), so some kinds will compose without applying. Morphisms implement both.

6. The protocols are named after the algebra: `Category` (compose) and `Functor` (apply). Bahul explicitly does not want the Pxyz prefix pattern (`PSeq` and the like).

No new dispatcher, registry, or `defineProtocol` option is in scope.

### Units

Each unit is one commit. Later units stay off this branch until the open questions they need are answered. This saga file is the planning commit; it is not one of the units.

1. **Morphism constructor.** Introduce a constructor and make `defineMorphism` return an instance of it, copying `maps` onto that instance. `declareMorphism` and `registerMorphisms` keep registering that instance so the `canon://morphism/<Source>/<Target>` stamp still lands on the value [code: `src/definitions.ts:99-102`]. Update the `defineMorphism` tests that expect the identical input object [code: `src/morphism.test.ts:48-53`]. Do not add compose or apply behaviour here. Constructor name: open question 1.

2. **Category and Functor for Morphisms.** Define `Category` and `Functor` with the existing `defineProtocol`, and implement both for the Morphism constructor with `extendProtocol`, moving the behaviour that is now in `composeMorphisms` and `applyMorphism` (chain check, map join, key copy, missing-term error, no mutation of the input). Keep calling `defineProtocol` / `extendProtocol` only. Do not export the old function names. Tests in this unit call the protocols. Method names: open question 2. This unit does not register the composed value (unit 4).

3. **Remove the #87 operations.** Delete `composeMorphisms` and `applyMorphism` and their `src/index.ts` exports. Delete their tests from `src/morphism.test.ts` once unit 2's protocol tests cover the same cases. `defineMorphism` stays.

4. **Composed Morphism, second use.** After open question 4 is answered: make a composed Morphism usable as the receiver of a further composition and of application, or keep the current rejection, whichever Bahul chooses. Today the composed value is unregistered and both operations reject it [code: `src/morphism.ts:55`, `src/morphism.ts:79-84`, `src/morphism.test.ts:79-85`]. Constructor dispatch does not restore source and target; those are read only from the uri [code: `src/morphism.ts:33-40`, `src/morphism.ts:87-93`].

5. **ADR-0017 conflict, owned by Architecture.** Do not edit ADR-0017, ADR-0015, or ADR-0018 in the units above. Architecture records that line 45 and line 99 (protocols join the shared registry / are brought into line with ADR-0017) conflict with decision 2, and decides the status text. `docs/theories.md` line 3 is stale against the code; Architecture owns that sentence too. This saga does not treat protocols as a definition kind and does not call define/declare/register for them.

### Open questions

1. What is the exported name of the Morphism constructor? Candidate `Morphism` (unapproved).
2. What are the method names inside each protocol? Candidates `compose` on `Category` and `apply` on `Functor` (unapproved).
3. Do `Category` and `Functor` go into the `Protocols` interface? Unapproved.
4. Must a composed Morphism be registered under `canon://morphism/<Source>/<Target>` before it can be applied or composed again? The code rejects an unregistered result today and does not store endpoints anywhere except the uri. The constructor does not answer this.
5. How should Architecture amend ADR-0017 lines 45 and 99 so they no longer schedule protocols into the shared definition registry? This saga will not make that edit.

## Ledger

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | required | required | required | required | required | required | N/A |
| 2 | required | required | required | required | required | required | N/A |
| 3 | required | required | required | required | required | required | N/A |
| 4 | required | required | required | required | required | required | N/A |
| 5 | required | required | N/A | required | N/A | opt-in | N/A |

### Notes
