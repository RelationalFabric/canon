# S003 — Type-check test fixtures

- **Id:** S003
- **Title:** Type-check test fixtures
- **Purpose:** Make the type-level assertions in `*.test.ts` part of `npm run check:types` and `npm run check:all`. Today those assertions are excluded from the compiler, so CI never checks them.
- **Goal:** `tsc --noEmit --project tsconfig.test.json` is clean, and `check:types:all` runs that project. Measured by `npm run check:all` green after U4, and by the radar entry `Test-file type fixtures` being gone after U5. No new exported name.
- **ADRs in scope:** None. The radar entry `Test-file type fixtures` (`planning/radar/data.yaml`) is the debt this saga closes.
- **Status:** Active. Planning only. No implementation unit has started.

This file is the active saga for `feature/test-typecheck`.

## Plan

Planning only. This file does not change `tsconfig.json`, Vitest, or `src/`.

`npm run check:types:src` is `tsc --noEmit`, which reads `tsconfig.json`. That config includes `src/**/*` and excludes `**/*.test.ts` and `**/*.spec.ts` (`tsconfig.json` lines 6–8). `vitest.config.ts` has no `typecheck` block. `docs/type-testing/README.md` says invariants run under `npm run check:types`. That is true for `src/**/*.ts` that are not tests, and for `examples/`. It is false for every `*.test.ts` fixture, including `src/morphism.test.ts` lines 21–28 and `src/theories/identity.test.ts` lines 24–30.

A previous attempt that type-checked the whole tree in one project reported about 52 errors and blamed `Theories` module augmentation. Reproduced here on TypeScript 5.9.3 (`typescript` in `package.json`): one program including `src/**/*`, `tests/**/*`, and `types/**/*.d.ts`, with the test exclude removed, reports **71** errors (`error TS` lines). The library project with tests excluded reports **0**.

## Diagnosis

Two mechanisms. They stack. A third set of fixture errors is visible only after the first is removed.

### 1. Package augmentations and relative augmentations do not merge

`Theories` is declared in `src/types/theories.d.ts` line 21. Built-in theories augment the package name:

- `src/theories/identity.ts` line 10, `declare module '@relational-fabric/canon'`
- `src/theories/taxonomy.ts` line 10
- `src/theories/typed-entity.ts` line 12

`src/index.ts` line 54 re-exports those types (`export type * from './types/index.js'`). The package `types` condition points at `src/index.ts`.

Three test files augment the original module by relative path instead:

- `src/shell.test.ts` lines 15 and 21, `declare module './types/canons.js'` and `declare module './types/theories.js'`
- `src/theory.test.ts` line 12, `declare module './types/theories.js'`
- `src/registry.test.ts` line 10, `declare module './types/canons.js'`

Probed with the compiler API (`getPropertiesOfType` on the `Theories` interface), same `compilerOptions` as `tsconfig.json`:

| Program | `Theories` keys |
| --- | --- |
| `src` only, tests excluded | `Identity`, `Taxonomy`, `TypedEntity` |
| `src` plus `src/morphism.test.ts` only | `Identity`, `Taxonomy`, `TypedEntity` |
| `src` plus `src/theory.test.ts` only | `Composed` |
| `src` plus `src/shell.test.ts` only | `DeclaredTheory`, `Fresh`, `Other`, `T`, `TheoryConflict` |
| `src` plus `shell.test.ts` and `theory.test.ts` | the union of those two rows, still no `Identity` |

`morphism.test.ts` imports `Theories` from `./types/index.js` and does not augment. Its fixtures type-check (0 errors) in a program that also contains `identity.ts`. The built-in augmentations apply to relative imports until some file in the same program augments `./types/theories.js` directly. That relative augmentation targets `src/types/theories.d.ts`. The `declare module '@relational-fabric/canon'` blocks target the package entry, which only re-exports the interface. TypeScript does not merge those two augmentation sites. `identity.ts` line 20 then fails with `Argument of type '"Identity"' is not assignable to parameter of type 'keyof Theories'`, and `identity.ts` line 24 fails with `Property 'Identity' does not exist on type 'Theories'`. The same split produces the `Taxonomy` and `TypedEntity` errors, the `declareTheory('Identity' | 'Taxonomy' | 'TypedEntity', …)` errors, and the unused `@ts-expect-error` directives (the expected failure never happens because the property is already missing). `keyof Theories` in those messages is the compiler printing the constraint. The resolved keys are the table above, not an empty interface. `shell.test.ts` line 149 (`declareTheory('DeclaredTheory', …)`) is not in the error list, because that key came from the relative augmentation.

A throwaway edit, restored before this commit, retargeted those four `declare module` specifiers to `@relational-fabric/canon` and left every member as it is. The same probe then reported `Identity|Taxonomy|TypedEntity|DeclaredTheory|Fresh|Other|T|TheoryConflict|Composed`. Error count fell from 71 to 5. So the augmentation does apply when every augmentation uses the package specifier the library already uses. No new module name is required.

### 2. `Record<string, never>` on `Canons` makes `Satisfies` `unknown`

`referencesOf` (`src/axioms/references.ts` line 56) and `timestampsOf` (`src/axioms/timestamps.ts` line 49) constrain `T extends Satisfies<'…'>`. `Satisfies` (`src/types/canons.d.ts` lines 55–64) walks `keyof Canons`. With tests excluded, `Canons` has no keys, `Satisfies` is `never`, and both functions type-check.

`registry.test.ts` line 17 and `shell.test.ts` line 17 add a canon whose type is `Record<string, never>`. `keyof Record<string, never>` includes `string`, so `'References'` extends that key. Indexing yields `never`, and `never extends { $basis: infer TBasis } ? TBasis : never` is `unknown` on this compiler (confirmed with a one-file program: that conditional prints `unknown`). `T extends unknown` is not assignable to `string | object` (`references.ts` line 66) or to `string | number | Date` (`timestamps.ts` line 57). The diagnostic text is `Property 'axioms' does not exist on type '{}'` only for the other shell error below. These two are `TS2345`.

`registry.test.ts` alone, with no other test file, is enough to produce both `TS2345` errors. `tests/**` alone produces 0.

Replacing those two canon types with `Record<never, never>` (keyof is `never`) and keeping the package specifiers from diagnosis 1 drops the test program to 3 errors. `Record<string, never>` on `Theories` members does not do this. `Satisfies` does not walk theory keys. Leave the theory placeholders alone.

### 3. Three fixture errors that remain once 1 and 2 are fixed

Counted on the restored tree after the two throwaway edits above. `npm run check:types:src` stays at 0 because these files are excluded.

- `src/theories/identity.test.ts` line 30, `TS2344`: `Type 'false' does not satisfy the constraint 'true'`. Line 24's `@ts-expect-error` is used: the clash is real. The interface that remains has `Id: KeyNameAxiom` (Identity wins). `Expect<Incompatible, WrongIdKind>` is `false`. The invariant asks for `true`.
- `src/shell.test.ts` line 115, `TS2339`: `canonRefFor` returns `KeyRef<…, unknown>` (`src/definitions.ts` line 245). Optional access on `unknown` is reported as `Property 'axioms' does not exist on type '{}'`.
- `src/shell.test.ts` line 177, `TS2352`: `{ distinct: true } as Record<string, never>` is an assertion between types that do not overlap.

`src/theories/modeling.test.ts` line 15 is in the 71 only while `Identity` is missing. With `src/theories/modeling.test.ts` as the only test file, the program has 0 errors. Do not edit it.

## Chosen approach

Follow `check:types:examples` (`package.json` lines 78–80): a second `tsc --noEmit --project` config, called from `check:types:all`. `check:all` and `check:all:fix` already call `check:types`, so they pick up the new script with no further edit.

Do not enable Vitest `typecheck`. `vitest.config.ts` would become a second typecheck path beside `examples/tsconfig.json`, and it would still be one program over `src` plus tests, so it would hit the same merge. The examples project is the pattern already in the repo.

`tsconfig.test.json` extends `tsconfig.json` and replaces `include` / `exclude`. Extending replaces those arrays. It must include `src/**/*` as well as the tests. A project of tests alone cannot see `declare module '@relational-fabric/canon'` inside `src/theories/*.ts`. It excludes nothing but `node_modules`. It does not include `examples/`.

The file is not added to `package.json` `files` or `exports`. `tsconfig.base.json` stays the published config. No new public name.

Order: change the test augmentations first, then the two canon types, then the three fixtures, and only then wire the project into `check:types:all`. Wiring earlier turns `check:all` red. U1–U3 keep today's `check:all` green because `tsconfig.json` still excludes tests. Each of U1–U3 still runs the test project and records the error count named in that unit. The config file arrives in U4, so U1–U3 use a throwaway tsconfig that is deleted before the commit. Do not commit it.

## Units

Each unit is one commit. **S** is Grok 4.7. **M** is Composer 2.5. Fast mode stays off. A unit that cannot be done as written stops. It does not improvise.

### U1 — Augment tests through `@relational-fabric/canon`

**Rating:** S

**Files:** `src/shell.test.ts`, `src/theory.test.ts`, `src/registry.test.ts`.

**Work:** Replace these specifiers and nothing else.

- `src/shell.test.ts` line 15: `declare module './types/canons.js'` becomes `declare module '@relational-fabric/canon'`.
- `src/shell.test.ts` line 21: `declare module './types/theories.js'` becomes `declare module '@relational-fabric/canon'`.
- `src/theory.test.ts` line 12: `declare module './types/theories.js'` becomes `declare module '@relational-fabric/canon'`.
- `src/registry.test.ts` line 10: `declare module './types/canons.js'` becomes `declare module '@relational-fabric/canon'`.

**Out of scope:** `Record<string, never>`, `identity.test.ts`, `package.json`, any tsconfig that is committed.

**Done check:** `npm run check:all` passes. A throwaway project with this saga's `tsconfig.test.json` contents (deleted before commit) reports `Theories` keys including both `Identity` and `Composed`, and does not report `Property 'Identity' does not exist on type 'Theories'` in `src/theories/identity.ts`. The remaining errors are the five named in diagnosis sections 2 and 3.

### U2 — Canon placeholders must not be string-indexed

**Rating:** S

**Depends on:** U1.

**Files:** `src/shell.test.ts`, `src/registry.test.ts`.

**Work:**

- In the `Canons` augmentation in `src/shell.test.ts`, `DeclaredCanon`'s type becomes `Record<never, never>`.
- In the `Canons` augmentation in `src/registry.test.ts`, `Canon1`'s type becomes `Record<never, never>`.

Do not change `Record<string, never>` on `Theories` members. Do not add a helper type.

**Out of scope:** `src/axioms/references.ts`, `src/axioms/timestamps.ts`, `src/types/canons.d.ts`.

**Done check:** `npm run check:all` passes. The throwaway test project no longer reports `src/axioms/references.ts` or `src/axioms/timestamps.ts`. Three errors remain, at `src/shell.test.ts` lines 115 and 177 and `src/theories/identity.test.ts` line 30.

### U3 — Fix the three fixtures the test project rejects

**Rating:** S

**Depends on:** U2.

**Files:** `src/theories/identity.test.ts`, `src/shell.test.ts`.

**Work:**

1. `src/theories/identity.test.ts`. Add `IsFalse` to the existing type import from `../testing.js`. Replace line 30 with `invariant<IsFalse<Expect<Incompatible, WrongIdKind>>>()`. Leave the `@ts-expect-error` on line 24.
2. `src/shell.test.ts` line 115. `canonRefFor('DeclaredCanon').value` stays the source. Give it a local type in that test file, not exported:

```ts
interface RegisteredCanon {
  axioms?: {
    Owner?: {
      models?: unknown
    }
  }
}
```

Read models as `(canonRefFor('DeclaredCanon').value as RegisteredCanon | undefined)?.axioms?.Owner?.models`. Keep the following `expect(Array.isArray(models) ? models : []).toEqual(['Identity'])`.

3. `src/shell.test.ts` line 177. Change the assertion to `{ distinct: true } as unknown as Record<string, never>`.

**Out of scope:** `src/theories/modeling.test.ts`, `src/morphism.test.ts`, production files.

**Done check:** `npm run check:all` passes. The throwaway test project reports 0 errors.

### U4 — Wire the test project into `check:types`

**Rating:** M

**Depends on:** U3.

**Files:** `tsconfig.test.json` (new), `package.json`.

**Work:** Add `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*", "tests/**/*", "types/**/*.d.ts", "eslint.js"],
  "exclude": ["node_modules"]
}
```

Add script `check:types:tests`: `tsc --noEmit --project tsconfig.test.json`.

Change `check:types:all` to `npm-run-all check:types:src check:types:examples check:types:tests`.

Do not add the file to `files` or `exports`. Do not edit `vitest.config.ts`. Do not edit `tsconfig.json` or `docs/type-testing/README.md`.

**Done check:** `npm run check:types` passes, including the new script. `npm run check:all` passes. `git diff` for this commit does not touch `src/`.

### U5 — Drop the parked radar risk

**Rating:** S

**Depends on:** U4.

**Files:** `planning/radar/data.yaml`.

**Work:** Delete the `Test-file type fixtures` entry under `techniques-patterns` → `assess` (the entry whose description starts with `tsconfig.json excludes *.test.ts`). Do not edit `metadata`, other entries, or `planning/README.md`.

**Done check:** `npm run check:radar` passes. `npm run check:all` passes. `git grep -n "Test-file type fixtures"` finds nothing.

## Open questions

None. The approach uses the existing package specifier `@relational-fabric/canon` and the existing `check:types:*` script shape. It adds no exported name.

## Ledger

Gates are configuration. They are not a progress tick.

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | required | required | N/A | required | required | required | N/A |
| U2 | required | required | N/A | required | required | required | N/A |
| U3 | required | required | N/A | required | required | required | N/A |
| U4 | required | required | N/A | required | required | required | N/A |
| U5 | required | required | N/A | required | required | required | N/A |

Scoped checks for U1–U3 are `npm run check:all` plus the throwaway `tsc --noEmit` described in the unit. The throwaway file is not committed. Scoped checks for U4 are `npm run check:types`. Scoped checks for U5 are `npm run check:radar`.

### Notes

- U3 done. `src/theories/identity.test.ts` asserts `IsFalse<Expect<Incompatible, WrongIdKind>>`. `src/shell.test.ts` reads `models` through an unexported `RegisteredCanon`, and the conflicting theory config is asserted through `unknown`. Throwaway `tsc --noEmit --project tsconfig.test.json` reported 0 errors. The throwaway file was deleted before commit. `npm run check:all` is the full-check gate for this pause.
- U2 done. `DeclaredCanon` in `src/shell.test.ts` and `Canon1` in `src/registry.test.ts` are `Record<never, never>`. Theory placeholders stay `Record<string, never>`. Throwaway `tsc --noEmit --project tsconfig.test.json` reported 3 errors: `src/shell.test.ts:115`, `src/shell.test.ts:177`, `src/theories/identity.test.ts:30`. `src/axioms/references.ts` and `src/axioms/timestamps.ts` were absent. The throwaway file was deleted before commit. `npm run check:all` is the full-check gate for this pause.
- U1 done. The four `declare module` specifiers in `src/shell.test.ts`, `src/theory.test.ts`, and `src/registry.test.ts` now target `@relational-fabric/canon`. Throwaway `tsc --noEmit --project tsconfig.test.json` reported 5 errors: `src/axioms/references.ts:66`, `src/axioms/timestamps.ts:57`, `src/shell.test.ts:115`, `src/shell.test.ts:177`, `src/theories/identity.test.ts:30`. `Theories` keys were `Identity|Taxonomy|TypedEntity|DeclaredTheory|Fresh|Other|T|TheoryConflict|Composed`. The throwaway file was deleted before commit. `npm run check:all` is the full-check gate for this pause.
- Planning commit. Diagnosis is in this file. No implementation unit started. Test-project error counts, measured on TypeScript 5.9.3 and not committed: 71 with tests included as they are; 5 after the four specifiers point at `@relational-fabric/canon`; 3 after the two `Canons` placeholders are `Record<never, never>`; those 3 are `shell.test.ts:115`, `shell.test.ts:177`, and `identity.test.ts:30`. `npm run check:types:src` on the unmodified tree is 0 errors.
