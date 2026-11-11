# S004 — Deprecate EntityReference and the References axiom

- **Id:** S004
- **Title:** Deprecate EntityReference and the References axiom
- **Purpose:** Carry out the follow-up ADR-0018 records at line 131. `EntityReference` and the `References` axiom describe usage, not what an object can express. `ObjectConstraintAxiom` (ADR-0018 line 84, `src/types/axioms.d.ts` lines 61–71) is how a key says "this value has an identity", via `Theories['Identity']` (`src/theories/identity.ts` lines 12 and 24).
- **Goal:** The exported symbols stay. Each one carries a JSDoc `@deprecated` tag that names `ObjectConstraintAxiom` and `Theories['Identity']`. Docs and examples that a reader would copy no longer tell them to use those symbols. Measured by `npm run check:all` green after U3, and by `git grep` finding no recommending use of `referencesOf`, `isCanonicalReference`, or `EntityReference` outside the definition files, the invariant, and the deprecation notices. No new exported name. No export removed. No runtime or signature change.
- **ADRs in scope:** ADR-0018, the follow-up at `docs/adrs/0018-theories-and-morphisms.md` line 131. The ADR file itself is not edited. It is the decision record.
- **Status:** Active. Planning only. No implementation unit has started.

This file is the active saga for `feature/entity-reference-deprecation`, branched from `feature/test-typecheck`.

## Plan

Deprecate, do not remove. `src/index.ts` line 9 (`export * from './axioms/references.js'`) and `src/types/index.d.ts` line 4 (`export * from './axioms.js'`) stay. There is no `CHANGELOG` in the repo. Radar `hold` entries are third-party libraries and formats (`planning/radar/data.yaml` lines 130–139 and 366–380), not package API deprecations. S002 and S003 used the radar for saga risks, then deleted those entries when the risk was gone. This saga does not add a radar entry and does not add a changelog.

The deprecation tag text, used everywhere a tag or a doc notice is added, is this sentence and nothing longer:

`@deprecated Describes usage, not what an object can express. A key that says its value has an identity uses ObjectConstraintAxiom with Theories['Identity'].`

In Markdown the same sentence is used without the `@deprecated` tag, and the heading or the following line says "Deprecated."

## Inventory

Definitions and exports. These stay exported.

| Symbol | Where |
| --- | --- |
| `EntityReference` | `src/types/axioms.d.ts` lines 93–102. Re-exported by `src/types/index.d.ts` line 4 and `src/index.ts` line 54 (`export type *`). |
| `Axioms['References']` | `src/axioms/references.ts` lines 13–19. The interface member is the axiom. |
| `isCanonicalReference` | `src/axioms/references.ts` lines 22–39. Re-exported by `src/index.ts` line 9. |
| `referencesOf` | `src/axioms/references.ts` lines 41–98. Re-exported by `src/index.ts` line 9. |

In-package uses that are not recommendations. They stay. They are not deleted and not renamed.

- `src/axioms/references.ts` lines 7, 18, 30, 36, 37, 56, 58, 66. The implementation.
- `src/invariants/axioms.ts` lines 8, 15, 16. Compile-time shape check of the existing type.
- `src/index.ts` line 9. The export.

Docs and comments that recommend the symbols. U1 edits these.

- `AGENTS.md` line 74. Lists References as one of five essential axioms.
- `CONTRIBUTING.md` lines 11–12 and 17. Teaches `References` as an axiom key and `referencesOf()` as the function pattern.
- `README.md` line 223. Uses `References` as the plural-key example.
- `docs/axioms.md` lines 67–74 and 88. Defines `EntityReference` and registers `References` as the concept to add.
- `docs/reference/axioms.md` lines 15, 252–323, and 377. Section "5. References Axiom" with a usage example that imports `referencesOf`.
- `docs/reference/api.md` lines 125–143 and 252–262. Presents `referencesOf`, `isCanonicalReference`, and `EntityReference` as the API to call.
- `docs/reference/augmentable-interfaces.md` lines 14–20. Default `Axioms` sample includes `References`.
- `docs/reference/canons.md` lines 49–53 and 89–101. JSON-LD sample implements `References` with `EntityReference`.

Examples that recommend the symbols. U2 edits the TypeScript. Generated Markdown follows the generator.

- `examples/03-multi-axiom-canon/comprehensive-canon.ts` lines 2–3, 16, 40–44, 77–83.
- `examples/03-multi-axiom-canon/utility-functions.ts` lines 8–11, 50–51.
- `examples/03-multi-axiom-canon/index.ts` lines 4, 9, 76, 84, 112, 133.
- `examples/04-format-conversion-examples/canons.ts` lines 24, 52, 75, 107, 130, 158.
- `examples/04-format-conversion-examples/conversion-utilities.ts` lines 9, 23, 51, 75, 100.
- `examples/05-error-handling-and-edge-cases/basic-canon.ts` lines 19–23 and 46–52.
- `examples/05-error-handling-and-edge-cases/safe-functions.ts` lines 9, 81–85.
- `examples/05-error-handling-and-edge-cases/validation-utilities.ts` lines 11 and 62. Calls `safeReferencesOf`. It does not import the package symbols.
- `examples/06-real-world-business-scenarios/domain-models.ts` lines 20–24 and 47–53.
- `examples/07-custom-axioms-example/custom-axioms.ts` lines 82–86 and 125–129.
- Generated from those examples: `docs/examples/03-multi-axiom-canon.md` lines 3 and 102, `docs/examples/README.md` line 36. Other `## References` headings under `docs/examples/` are bibliography headings from the generator, not the axiom.

Left as they are. They are not recommendations to use the deprecated API.

- `docs/adrs/0018-theories-and-morphisms.md` lines 14, 84, and 131. The decision record. Line 14 states what is registered today, which stays true.
- `docs/example-docs/README.md` line 242. The word "References" labels contributing files.
- `docs/adrs/0004-typescript-configuration-separation.md` line 78. TypeScript project references.
- `docs/adrs/0009-node-js-version-requirement.md` line 29, `docs/adrs/0011-examples-documentation-generation-from-source-files.md` line 111, and the `## References` bibliography headings in `docs/examples/01-basic-id-axiom.md`, `02-module-style-canon.md`, `04-format-conversion-examples.md`, `05-error-handling-and-edge-cases.md`, `06-real-world-business-scenarios.md`, `07-custom-axioms-example.md`.
- `src/shell.test.ts` line 439. The word "references" is English, not the axiom.
- `examples/06-real-world-business-scenarios/domain-models.ts` and `examples/07-custom-axioms-example/` fields named `preferences` or `createdBy`. Those are domain fields.

Replacement symbols already in the tree. No unit adds another.

- `ObjectConstraintAxiom`, `src/types/axioms.d.ts` lines 61–71.
- `Theories['Identity']`, declared in `src/theories/identity.ts` lines 12–20, checked at line 24.
- Worked use: `src/theories/object-constraint.ts` lines 5–8.

## Units

Each unit is one commit. **S** is Grok 4.7. **M** is Composer 2.5. Fast mode stays off. A unit that cannot be done as written stops. It does not improvise. No unit adds an exported name, removes an export, or changes a signature or a runtime branch in `src/axioms/references.ts`.

### U1 — Stop the docs from recommending the deprecated API

**Rating:** S

**Depends on:** none.

**Files:** `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/axioms.md`, `docs/reference/axioms.md`, `docs/reference/api.md`, `docs/reference/augmentable-interfaces.md`, `docs/reference/canons.md`.

**Work:**

- `AGENTS.md` line 74. Replace the sentence with: "The core axioms are Id, Type, Version, and Timestamps. A key that says its value has an identity uses `ObjectConstraintAxiom` and `Theories['Identity']`. The `References` axiom and `EntityReference` remain exported and are deprecated. See [docs/reference/axioms.md](./docs/reference/axioms.md)."
- `CONTRIBUTING.md` line 11. The PascalCase examples become `Id`, `Type`, `Version`, `Timestamps`. Delete `, `References``.
- `CONTRIBUTING.md` line 12. The plural example is only `Timestamps` (not `Timestamp`). Delete the `References` (not `Reference`) clause.
- `CONTRIBUTING.md` line 17. The function examples become `idOf()`, `typeOf()`, `timestampsOf()`. Delete `, `referencesOf()``.
- `README.md` line 223. The plural example is only `` `Timestamps` ``. Delete `, `References``.
- `docs/axioms.md` lines 67–74. Insert one line immediately above the `EntityReference` comment: `// Deprecated. A key that says its value has an identity uses ObjectConstraintAxiom with Theories['Identity'].` Leave the interface and `ReferencesAxiom` alias in the snippet so the deprecated shape is still visible.
- `docs/axioms.md` line 88. Replace the trailing comment with `// Deprecated. Do not register References.`
- `docs/reference/axioms.md` line 15. Delete the list item `5. **References** - Entity relationships and references`.
- `docs/reference/axioms.md` heading at line 252. Change it to `### 5. References axiom (deprecated)`.
- `docs/reference/axioms.md` line 254. Replace the purpose sentence with the deprecation sentence from the Plan section.
- `docs/reference/axioms.md` lines 310–323. Delete the "Usage Example" heading and its code block. Do not replace it with a new example that calls `referencesOf`.
- `docs/reference/axioms.md` line 377. The parenthetical becomes `(like Timestamps)`. Delete `and References`.
- `docs/reference/api.md`. Under each of the headings `referencesOf` (line 125), `isCanonicalReference` (line 135), and `EntityReference` (line 252), add one line before the code fence: `Deprecated. A key that says its value has an identity uses ObjectConstraintAxiom with Theories['Identity'].` Leave the signatures.
- `docs/reference/augmentable-interfaces.md` lines 14–20. Delete the `References:` member from the Default sample. Under the sample add: "The `References` member still exists on `Axioms` and is deprecated. Do not add it to a new canon."
- `docs/reference/canons.md`. Delete the `References` property at lines 49–53 and the `References` property at lines 89–101, including their trailing commas' cleanup so the surrounding object stays valid as a snippet. Do not insert a new property.

**Out of scope:** `src/`, `examples/`, `docs/examples/`, `docs/adrs/0018-theories-and-morphisms.md`, `planning/radar/`.

**Done check:** `npm run check:all` passes. `git diff` for this commit does not touch `src/` or `examples/`. A search for `referencesOf` under `docs/` hits only `docs/reference/api.md` and `docs/reference/axioms.md`, and each hit sits in a section whose heading or previous line says "Deprecated".

### U2 — Stop the examples from recommending the deprecated API

**Rating:** S

**Depends on:** U1.

**Files:** the example files named in the inventory, `examples/04-format-conversion-examples/index.ts`, plus whatever `npm run build:docs:examples` rewrites under `docs/examples/`.

**Work:**

Delete every `References:` member from the canon type and from the matching `declareCanon` `axioms` object in:

- `examples/03-multi-axiom-canon/comprehensive-canon.ts` (type lines 40–44, runtime lines 77–83). Update the file comment on lines 2–3 and the comment on line 16 so they list four axioms: Id, Type, Version, Timestamps.
- `examples/04-format-conversion-examples/canons.ts` (lines 24, 52, 75, 107, 130, 158, each the whole property).
- `examples/05-error-handling-and-edge-cases/basic-canon.ts` (lines 19–23 and 46–52).
- `examples/06-real-world-business-scenarios/domain-models.ts` (lines 20–24 and 47–53).
- `examples/07-custom-axioms-example/custom-axioms.ts` (lines 82–86 and 125–129).

Do not add a key in their place.

`examples/03-multi-axiom-canon/utility-functions.ts`:

- Drop `EntityReference` from the type import and `referencesOf` from the value import.
- Drop `& Satisfies<'References'>` from line 11.
- Replace lines 50–51 with a local read. If `entity.createdBy` is a `string`, the list is one object `{ ref: entity.createdBy, resolved: false }`. Otherwise the list is empty. The return field stays `references`. Do not mention `EntityReference` or `referencesOf`.

`examples/03-multi-axiom-canon/index.ts`:

- Line 4 keywords: delete `, references`.
- Line 9: end the sentence at "timestamps."
- Lines 76 and 84 stay `toHaveLength(1)`. The sample entities on lines 41 and 53 have `createdBy`, so the local read still yields one entry.
- Lines 112 and 133: delete " and references" / " and references support multiple formats" so the sentences speak only about timestamps.

`examples/04-format-conversion-examples/conversion-utilities.ts`:

- Drop `referencesOf` from the import on line 9.
- Delete lines 23 and 75.
- Where line 51 and line 100 read `references.ref`, read a local `createdBy` instead: when the input is a non-null object and its `createdBy` property is a `string`, use that string; otherwise use `'unknown'`.

`examples/05-error-handling-and-edge-cases/safe-functions.ts`:

- Drop `referencesOf` from the import on line 9. Keep `timestampsOf`.
- Keep the exported name `safeReferencesOf`. Replace the body so it does not call `referencesOf`. When the input is a non-null object and `createdBy` is a `string`, return `{ ref: createdBy, resolved: false }`. Otherwise return `undefined`. Update the comment on line 79 so it says the function reads `createdBy` and does not use the References axiom.
- `validation-utilities.ts` stays, including the call on line 62.

Then run `npm run build:docs:examples` and commit the `docs/examples/` files it rewrites. Do not hand-edit those Markdown files.

**Out of scope:** `src/`, ADR-0018, radar, `safeReferencesOf`'s name, any new package export.

**Done check:** `npm run check:all` passes. `git grep -n referencesOf` and `git grep -n EntityReference` and `git grep -n "Satisfies<'References'>"` under `examples/` find nothing. `git grep -n isCanonicalReference` under `examples/` finds nothing.

### U3 — Mark the exported symbols deprecated

**Rating:** M

**Depends on:** U2.

**Files:** `src/types/axioms.d.ts`, `src/axioms/references.ts`.

**Work:** Add the Plan's `@deprecated` sentence as a JSDoc line on:

- `EntityReference` in `src/types/axioms.d.ts`, inside the block that starts at line 93.
- The `References` member in `src/axioms/references.ts`, inside the block that starts at line 15.
- `isCanonicalReference`, inside the block that starts at line 22.
- `referencesOf`, inside the block that starts at line 41.

Do not change a parameter, a return type, a function body, or an export. Do not add `@deprecated` to `src/invariants/axioms.ts`. Do not add an ESLint rule. Do not edit `src/index.ts`.

**Out of scope:** every file except the two named above.

**Done check:** `npm run check:all` passes. `git diff` for this commit touches only `src/types/axioms.d.ts` and `src/axioms/references.ts`, and the only added lines are the four `@deprecated` lines. `git grep -n "export interface EntityReference"` and `git grep -n "export function referencesOf"` and `git grep -n "export function isCanonicalReference"` and `git grep -n "References:"` in `src/axioms/references.ts` still match.

### U4 — Close the saga

**Rating:** S

**Depends on:** U3.

**Files:** `planning/saga/S004-entity-reference-deprecation.md`.

**Work:** Delete this file. Do not edit `planning/README.md`. Do not edit `planning/radar/data.yaml`. Do not add a changelog. This is the same close S003 used (`d9ce9c9` deleted `planning/saga/S003-test-typecheck.md` and nothing else once its radar entry was already gone) and the saga-file half of the S002 close (`6a502a8` deleted `planning/saga/README.md`). S002 also wrote radar risks; this saga has none to write.

**Out of scope:** `src/`, `docs/`, `examples/`, `planning/radar/`.

**Done check:** `npm run check:all` passes. `git status` shows `planning/saga/` empty. `git grep -n "S004"` finds nothing.

## Open questions

- Whether the current ESLint config treats `@deprecated` as a lint error. Unknown until U3 runs `npm run check:all`. If that command fails only because a deprecation rule reports the remaining uses in `src/axioms/references.ts` or `src/invariants/axioms.ts`, U3 stops. It does not add an eslint-disable, and it does not delete those uses.
- Removing `Axioms['References']`, `EntityReference`, `referencesOf`, or `isCanonicalReference` in a later major. Not this saga.
- A new name for any of those symbols, or for `safeReferencesOf`. Not this saga.
- A runtime change to `referencesOf` or `isCanonicalReference`, including throwing on use. Not this saga.
- Editing ADR-0018 so line 131 no longer says the follow-up is outstanding. Not this saga. The ADR stays the decision record.

## Ledger

Gates are configuration. They are not a progress tick.

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | required | required | N/A | required | required | required | N/A |
| U2 | required | required | N/A | required | required | required | N/A |
| U3 | required | required | N/A | required | required | required | N/A |
| U4 | required | required | N/A | required | required | required | N/A |

Scoped checks for every unit are `npm run check:all`. U2 also runs `npm run build:docs:examples` and commits its output.

### Notes

- U2 done. `npm run check:all` passed: lint, `check:types:src`, `check:types:examples`, `check:types:tests`, 240 tests passed and 2 skipped, radar valid. The four `examples/` greps for `referencesOf`, `EntityReference`, `Satisfies<'References'>`, and `isCanonicalReference` are empty. Stale example docs were refreshed first in `0a35687`. Expectations changed because `{ name: 'Invalid User' }` used to match only through the wide `References` basis: `examples/04-format-conversion-examples/index.ts:134` now expects `No matching canon found for Id axiom`, and `:136` now expects `No matching canon found for Type axiom`.
- U1 done. `npm run check:all` passed: lint, `check:types:src`, `check:types:examples`, `check:types:tests`, 240 tests passed and 2 skipped, radar valid. `referencesOf` under `docs/` is only `docs/reference/api.md` and `docs/reference/axioms.md`, in the deprecated sections.
- Planning commit. Inventory is in this file. No implementation unit started. No source file changed. No radar entry and no changelog: the repo has no changelog, and radar hold entries are not package API deprecations.
