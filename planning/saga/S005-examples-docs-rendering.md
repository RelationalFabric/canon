# S005 — Render generated example docs on the docs site

- **Id:** S005
- **Title:** Render generated example docs on the docs site
- **Purpose:** `cli/src/docs/examples-generator.ts` writes `docs/examples/`. The pages are what the VitePress site serves. Several of those pages do not show the example source the way a reader can run it. This saga is the fix for the mismatches confirmed below. It does not add a docs feature.
- **Goal:** The Markdown under `docs/examples/` shows fence bodies with the indentation of the example source, JSDoc descriptions that the parser already reads, included TypeScript run through the same tutorial renderer as the entry file, and the test status line the renderer already knows how to write. Measured on the running docs site, built with `npm run build:docs` and served with `npx vitepress dev` from the repo root (there is no `docs:dev` script in `package.json`). `npm run check:all` is green after the last implementation unit. No new exported name. No new concept.
- **ADRs in scope:** ADR-0010 (`docs/adrs/0010-vitepress-documentation-solution.md`) is the site. ADR-0011 (`docs/adrs/0011-examples-documentation-generation-from-source-files.md`) is the generator. Neither ADR file is edited.
- **Status:** Active. Planning only. No implementation unit has started.

This file is the active saga for `feature/examples-docs-rendering`, branched from `feature/entity-reference-deprecation`.

## Plan

The generator is `cli/src/docs/examples-generator.ts`. It discovers examples, calls `generateExampleDoc` (`cli/src/docs/examples/renderer.ts` line 290), and writes one Markdown file per example plus `docs/examples/README.md`. Parsing rules are in `cli/src/docs/examples/parser.ts`. The author-facing description of those rules is `docs/example-docs/README.md`.

How the site is built and served, from `package.json`:

- `npm run build:docs:examples` (line 62) runs `./bin/canon docs:examples`.
- `npm run build:docs` (line 61) runs `build:docs:examples`, then `./bin/canon docs:rename-readmes`, then `npx vitepress build`, then `./bin/canon docs:rename-readmes --restore`.
- `npm run build:docs:restore` (line 63) is the rename restore alone.
- `package.json` has no script that starts the dev server. The config is `.vitepress/config.js`. From the repo root the VitePress CLI is `npx vitepress dev` for the local site and `npx vitepress preview` after `npm run build:docs`. The judgment of this saga is that local site, not the Markdown files alone.

Every unit that changes generator output runs `npm run build:docs:examples` and commits the `docs/examples/` files it rewrites. Do not hand-edit those Markdown files. `docs/examples/` was regenerated in `0a35687`. That commit is the baseline. Later units keep it regenerated.

`dedent` is removed from rendering. Nothing in this saga adds a package export, a marker syntax, or a section type.

## Inventory

Confirmed from the generator and from `docs/examples/` as it stands after `0a35687`.

### 1. Assertions are the test source, not a result

Confirmed.

`extractTestBlocks` (`cli/src/docs/examples/parser.ts` lines 157–168) stores the `it()` callback body as the section content. `renderTutorialBody` (`cli/src/docs/examples/renderer.ts` lines 122–136) prints that body inside a `ts` fence. The status line under it (lines 138–143) is separate and is omitted when no report is loaded.

`examples/03-multi-axiom-canon/index.ts` lines 71–76:

```ts
it('The user analysis extracts all five axioms correctly.', () => {
  expect(userAnalysis.id).toBe('user-123')
  expect(userAnalysis.type).toBe('user')
  expect(userAnalysis.version).toBe(5)
  expect(userAnalysis.timestamps).toHaveLength(2)
  expect(userAnalysis.references).toHaveLength(1)
})
```

`docs/examples/03-multi-axiom-canon.md` lines 59–67 prints the title and then the `expect` calls in a fence. There is no cell whose content is the value those assertions checked.

`docs/example-docs/README.md` lines 163–184 and `docs/example-docs/sample-2/out.md` lines 24–30 specify this shape: the assertion source in a fence, then a status line. Replacing the fence with a result is a direction call. It is an open question, not a unit.

### 2. Code indentation is flattened

Confirmed.

Fence text is `lines.slice(start + 1, end).join('\n').trim()` (`cli/src/docs/examples/parser.ts` line 262). The renderer then runs `dedent` on code, JSDoc, and test sections (`cli/src/docs/examples/renderer.ts` lines 88, 116, and 134). `dedent` deletes the shortest leading indent of any non-empty line. The opening line of a fence is often at column 0, and the lines inside a brace are indented, so one indent level is removed and only the extra indent past that level remains.

`examples/08-protocol-system/index.ts` lines 17–24 indent the import specifiers by two spaces. `docs/examples/08-protocol-system.md` lines 12–19 shows those specifiers at column 0.

`examples/03-multi-axiom-canon/index.ts` lines 31–42 indent `id` by two spaces and `name` by four. `docs/examples/03-multi-axiom-canon.md` lines 24–33 shows `id` at column 0 and `name` at two spaces.

`examples/08-protocol-system/index.ts` lines 162–165 indent the `rest` callback body by four spaces inside a two-space object. `docs/examples/08-protocol-system.md` lines 151–157 shows `first` at column 0 and `const entries` at two spaces.

### 3. Code outside the slash-slash fence marker is not in the page

Confirmed as behavior. Not scheduled.

`cli/src/docs/examples/parser.ts` lines 8–14 say unmarked source stays out of the docs. The code sections are only the lines between the fence markers (a comment of `//` plus three backticks) (lines 203–216 and 260–267). A node is emitted only when it is a vitest `if` or a JSDoc-decorated function, class, interface, type, or variable (lines 310–336). `docs/example-docs/README.md` lines 58–76 and the summary table at lines 260–268 say the same thing: loose code is fenced on purpose.

`examples/02-module-style-canon/index.ts` line 43 is `import type { MongoDbCanon } from './mongodb-canon.js'`, and the fence starts at line 44. `docs/examples/02-module-style-canon.md` lines 91–101 contain the fenced imports and do not contain `import type { MongoDbCanon }`.

`examples/05-error-handling-and-edge-cases/index.ts` lines 8–22 are imports with no fence and no JSDoc. `docs/examples/05-error-handling-and-edge-cases.md` begins the first code fence at line 5 with `const validEntity`. Those imports are absent.

Whether that omission is the bug to fix is a direction call. It is an open question, not a unit.

### 4. Included files are dumped raw

Confirmed.

`renderInclude` (`cli/src/docs/examples/includes.ts` lines 171–187) puts the file bytes, after `trimEnd`, in one fence. `processInclude` (lines 198–211) does not call `parseExampleFile`. The `// #+` before an include updates `depthState` in the parent (`cli/src/docs/examples/renderer.ts` lines 168–175) and the include case (lines 148–165) never passes that state into the included file.

`examples/02-module-style-canon/index.ts` lines 33–35 are `// #+`, `// @include ./mongodb-canon.ts`, `// #-`. `docs/examples/02-module-style-canon.md` lines 28–85 wrap the raw module, including `if (import.meta.vitest)` at line 71 and the `expect` calls at lines 75–80. `docs/example-docs/README.md` lines 207–234 say the included file is rendered as Markdown between the `--` delimiters.

### 5. `docs/examples/` must stay regenerated

`0a35687` regenerated `docs/examples/`. The generator still writes that directory (`cli/src/docs/examples-generator.ts` lines 283 and 326–336). No unit edits those files by hand. Each unit that changes output commits a fresh `npm run build:docs:examples` run. There is no separate unit for this.

### 6. Small fixes confirmed while reading the generator

JSDoc prose is parsed and then dropped. `parseJSDocInfo` returns `description` (`cli/src/docs/examples/parser.ts` lines 91–134). The jsdoc section stores only `params` and `returns` (lines 327–333). The renderer prints the table, the returns line, and the code (`cli/src/docs/examples/renderer.ts` lines 94–118) and never prints `description`. `docs/example-docs/README.md` lines 80–120 show the description before the table.

`examples/05-error-handling-and-edge-cases/index.ts` lines 28–37:

```ts
/**
 * Valid entity with all required fields
 */
const validEntity = {
  id: 'user-123',
}
```

`docs/examples/05-error-handling-and-edge-cases.md` lines 5–13 are the `const` fence. The sentence "Valid entity with all required fields" is not in that file.

The status line is implemented and not fed. `formatTestStatus` (`cli/src/docs/examples/test-status.ts` lines 155–170) returns `✅ pass` or `❌ fail`. The renderer writes `_Status:_` only when `testStatusMap[testTitle]` is set (`cli/src/docs/examples/renderer.ts` lines 138–143). `generateExamplesDocs` loads `.scratch/vitest-report.json` (`cli/src/docs/examples-generator.ts` lines 284 and 295–300). `npm run build:docs:examples` does not run `npm run check:test:json` (`package.json` lines 62 and 73). A search of `docs/examples/` finds no `_Status:_` line. `docs/example-docs/README.md` lines 178–184 include the status line.

The examples sidebar stops at example 07. `.vitepress/config.js` lines 68–84 list `01` through `07`. `docs/examples/README.md` lines 94 and 106 link `08-protocol-system` and `09-lazy-module-pattern`, and those two Markdown files exist. The overview page can open them. The examples sidebar cannot.

Left as they are. They are not units.

- `describe()` titles are not sections. `extractTestBlocks` matches `it` only (`cli/src/docs/examples/parser.ts` lines 146–147). `examples/08-protocol-system/index.ts` line 178 is `describe('ObjectFallback for plain objects', ...)`. `docs/examples/08-protocol-system.md` has no line "ObjectFallback for plain objects". The example syntax guide does not mention `describe`. See open questions.
- The bold test line always appends `:` (`cli/src/docs/examples/renderer.ts` line 128). Titles that already end with `.` render as `correctly.:` (`docs/examples/03-multi-axiom-canon.md` line 59). See open questions.
- GitHub links are hardcoded to `tree/main` (`cli/src/docs/examples-generator.ts` line 36 and `cli/src/docs/examples/renderer.ts` line 24). See open questions.
- `getTestSummary` (`cli/src/docs/examples/test-status.ts` lines 179–195) is not called. The index page does not show a summary.
- `renderTutorialBody` has no `default` arm (`cli/src/docs/examples/renderer.ts` lines 74–177). Every current `TutorialSection['type']` has an arm. Adding an arm is not part of a rendering fix.
- ADR-0011 still names `scripts/generate-examples-docs.ts` (line 35). The script now lives under `cli/src/docs/`. This saga does not edit the ADR.

## Units

Each unit is one commit. **S** is Grok 4.7. **M** is Composer 2.5. Fast mode stays off. A unit that cannot be done as written stops. It does not improvise. No unit adds an exported name or a new marker, section type, or docs concept.

### U1 — Keep the indentation of fenced source

**Rating:** S

**Depends on:** none.

**Files:** `cli/src/docs/examples/parser.ts`, `cli/src/docs/examples/renderer.ts`, and the `docs/examples/` files `npm run build:docs:examples` rewrites.

**Work:**

- `cli/src/docs/examples/renderer.ts` lines 88, 116, and 134. Stop calling `dedent`. Print `section.content` as the fence body. Remove the `dedent` import if nothing else uses it.
- `cli/src/docs/examples/parser.ts` line 262. Stop running `trim()` on the joined fence. Keep the lines between the two fence-marker comments. Drop leading and trailing empty lines only. Do not strip a shorter indent from the first line than from the rest.
- `cli/src/docs/examples/parser.ts` line 160. The test body is the text inside the callback block. Remove a leading indent only when every non-empty line has it. Do not `trim()` the whole block in a way that leaves the first line with less indent than the next line.

**Out of scope:** included-file rendering, JSDoc description text, the Vitest report, `.vitepress/config.js`, `docs/example-docs/`.

**Done check:** `npm run check:all` passes. `npm run build:docs:examples` has been run and its `docs/examples/` diff is in this commit. `docs/examples/08-protocol-system.md` shows the import specifiers at the same two-space indent as `examples/08-protocol-system/index.ts` lines 18–23. `docs/examples/03-multi-axiom-canon.md` shows `id:` two spaces in from `const userEntity`, and `name:` two spaces in from `profile:`, matching `examples/03-multi-axiom-canon/index.ts` lines 31–39. `git grep -n "from 'dedent'" cli/src/docs` finds nothing.

### U2 — Print the JSDoc description the parser already reads

**Rating:** S

**Depends on:** U1.

**Files:** `cli/src/docs/examples/parser.ts`, `cli/src/docs/examples/renderer.ts`, `cli/src/docs/examples/types.ts`, and the `docs/examples/` files `npm run build:docs:examples` rewrites.

**Work:**

- `parseJSDocInfo` already returns `description`. Store that string on the existing jsdoc section metadata. The metadata object in `cli/src/docs/examples/types.ts` gains an optional `description` string next to `params` and `returns`. Do not add a type, a function, or an export.
- In the jsdoc arm of `renderTutorialBody`, when `description` is non-empty, print it as a paragraph before the parameter table. Do not turn it into a heading. The parameter table, the returns line, and the code fence stay.

**Out of scope:** unmarked source, includes, test status, the sidebar.

**Done check:** `npm run check:all` passes. `npm run build:docs:examples` output is committed. `docs/examples/05-error-handling-and-edge-cases.md` contains the sentence `Valid entity with all required fields` before the `const validEntity` fence. The fence still contains `id: 'user-123'`.

### U3 — Render an included TypeScript file with the tutorial renderer

**Rating:** M

**Depends on:** U2.

**Files:** `cli/src/docs/examples/renderer.ts`, `cli/src/docs/examples/includes.ts` only if the existing loaders need a caller from the renderer, and the `docs/examples/` files `npm run build:docs:examples` rewrites.

**Work:**

- In the `include` arm of `renderTutorialBody`, keep the `--` delimiters and the `Supporting File (\`name\`)` label from `renderInclude` (`cli/src/docs/examples/includes.ts` lines 179–185).
- When the included path ends in `.ts`, build the body with `parseExampleFile` and `renderTutorialBody`, using the parent's `depthState` and the included file's directory as `exampleRoot`. Do not put the raw file in a `ts` fence.
- Call that from `renderer.ts`. Do not import `renderer.ts` from `includes.ts`.
- When the included path does not end in `.ts`, keep `renderInclude` as it is.
- Do not emit unmarked lines. The open question on unmarked code still applies inside an included file. Imports that sit outside a fence marker and outside JSDoc stay out, the same way they stay out of an entry file.

**Out of scope:** a new wrapper heading, `docs/example-docs/README.md`, non-TypeScript includes, the decision about unmarked code.

**Done check:** `npm run check:all` passes. `npm run build:docs:examples` output is committed. In `docs/examples/02-module-style-canon.md` the supporting-file region still starts with `--` and `Supporting File (\`mongodb-canon.ts\`)`. That region contains the rendered test title `The canon uses "_id" as the Id key.` and does not contain the source line `if (import.meta.vitest)`. `git grep -n "export function" cli/src/docs/examples/includes.ts` still matches only the functions that exist on this branch before this commit.

### U4 — Load the Vitest report so the status line is written

**Rating:** S

**Depends on:** U3.

**Files:** `package.json`, and the `docs/examples/` files the generation rewrites.

**Work:**

- Change the `build:docs:examples` script so it runs `npm run check:test:json` and then `./bin/canon docs:examples`. `check:test:json` already writes `.scratch/vitest-report.json` (`package.json` line 73), which is the path `generateExamplesDocs` reads.
- Do not change `getTestStatusForFile` or `formatTestStatus`.
- If a regenerated page has an `it()` title and no `_Status:_` line for it, stop. A likely cause is `assertion.title` inside `describe()` not equaling the `it()` string. Do not rewrite the matcher in this unit.

**Out of scope:** `cli/src/docs/examples/test-status.ts`, assertion result cells, `describe` titles.

**Done check:** `npm run check:all` passes. After `npm run build:docs:examples`, `docs/examples/03-multi-axiom-canon.md` has `_Status:_ ✅ pass` on the line after the fence for `The user analysis extracts all five axioms correctly.` The `docs/examples/` diff is in this commit. `.scratch/` is not committed.

### U5 — List examples 08 and 09 in the examples sidebar

**Rating:** S

**Depends on:** U4.

**Files:** `.vitepress/config.js`.

**Work:** In the `/docs/examples/` sidebar items (`.vitepress/config.js` lines 68–84), after the Custom Axioms item, add an item for Protocol System linking to `/docs/examples/08-protocol-system` and an item for Lazy Module Pattern linking to `/docs/examples/09-lazy-module-pattern`. Match the object shape of the existing items. Do not add a heading, a nav entry, or any other sidebar key.

**Out of scope:** `docs/examples/`, `cli/`, `package.json`.

**Done check:** `npm run check:all` passes. `git diff` for this commit touches only `.vitepress/config.js`. The examples sidebar items include `/docs/examples/08-protocol-system` and `/docs/examples/09-lazy-module-pattern`.

### U6 — Close the saga

**Rating:** S

**Depends on:** U5.

**Files:** `planning/saga/S005-examples-docs-rendering.md`.

**Work:** Delete this file. Do not edit `planning/README.md`. Do not edit `planning/radar/data.yaml`. This is the same close S004 used (`7a75288` deleted `planning/saga/S004-entity-reference-deprecation.md` and nothing else).

**Out of scope:** `cli/`, `docs/`, `examples/`, `.vitepress/`, `planning/radar/`.

**Done check:** `npm run check:all` passes. `git status` shows `planning/saga/` empty. `git grep -n "S005"` finds nothing.

## Open questions

- What an assertion result cell contains. The review says the page should show the result, not the `expect` call. `docs/example-docs/README.md` lines 163–184 and `docs/example-docs/sample-2/out.md` lines 24–30 say the page shows the `expect` call and a status line. No unit replaces the fence. U4 only turns on the status line the renderer already writes.
- Whether source that sits outside a fence marker (`//` followed by three backticks) should be emitted. The parser comment (`cli/src/docs/examples/parser.ts` lines 8–14) and `docs/example-docs/README.md` lines 58–76 say it stays in the source file and out of the page. The review calls that drop a bug. Confirmed drops are `examples/02-module-style-canon/index.ts` line 43 and `examples/05-error-handling-and-edge-cases/index.ts` lines 8–22. No unit emits those lines. U3 applies the same rule inside an included `.ts` file.
- Whether a `describe()` title is printed. The guide does not say. `extractTestBlocks` ignores it. No unit adds a describe section.
- Whether the bold test label should keep the extra `:` when the `it()` title already ends with punctuation (`cli/src/docs/examples/renderer.ts` line 128). No unit changes that punctuation.
- Whether example links should keep `https://github.com/RelationalFabric/canon/tree/main/examples` (`cli/src/docs/examples-generator.ts` line 36, `cli/src/docs/examples/renderer.ts` line 24). No unit changes the URL.
- Editing ADR-0010 or ADR-0011, including the stale script path in ADR-0011 line 35. Not this saga.

## Ledger

Gates are configuration. They are not a progress tick.

| unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | required | required | N/A | required | required | required | required |
| U2 | required | required | N/A | required | required | required | required |
| U3 | required | required | N/A | required | required | required | required |
| U4 | required | required | N/A | required | required | required | required |
| U5 | required | required | N/A | required | required | required | required |
| U6 | required | required | N/A | required | required | required | N/A |

Scoped checks for every unit are `npm run check:all`. U1, U2, U3, and U4 also run `npm run build:docs:examples` and commit its output. Smoke for U1 through U5 is the local site: `npm run build:docs`, then `npx vitepress dev` from the repo root, and the changed example page read there. `package.json` has no serve script. `npx vitepress preview` is the check against the production build when the dev server is not the surface under test.

### Notes

- U2: printed each parsed JSDoc description as a paragraph before the declaration fence. Regenerated `docs/examples/`. The Markdown diff is those description lines only. Removed unused `dedent`.
- U1: stopped `dedent` and the fence `trim()` that flattened indent. Regenerated `docs/examples/`. The Markdown diff is indentation only.
- Planning commit. Inventory is in this file. No implementation unit started. No source file changed. Findings 1 and 3 are confirmed and are not units, because the example syntax guide describes the current behavior and this saga does not choose against that guide.
