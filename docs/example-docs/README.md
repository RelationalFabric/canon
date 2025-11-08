# Documentation Source Syntax and Behaviour (Corrected)

This document describes the conventions used for writing source files that are automatically converted into **tutorial-style Markdown documents**.
The goal is to keep examples conversational, idiomatic, and executable while allowing rich commentary and automatic inclusion of related code.

---

## 1. Overview

A source file is written in valid TypeScript (or JavaScript) and annotated with **Markdown-style comments**.
The parser reads these comments and surrounding code to produce a coherent document that reads like a guided walkthrough.

The file is both:
- **Executable**: it can be run or tested as normal.
- **Explanatory**: it contains commentary written for humans that becomes part of the rendered documentation.

---

## 2. File Structure

Each document begins with a JSDoc metadata block followed by normal code and commentary.

```ts
/**
 * @document.title College Schedule Harmonisation
 * @document.description Map remote college schedules into CanonicalCourse format
 * @document.keywords integration, schedule, mapping
 * @document.difficulty introductory
 */
```

The **title** and **description** are used to build an external index and appear at the start of the rendered document.
Other tags are included in the footer metadata table.

### Document Header Behaviour
The generator automatically emits the following at the top of the output:

```markdown
# {{ document.title }}

{{ document.description }}
```

You **do not** include these manually in the source.

---

## 3. Markdown Comments

Comments in the source act as Markdown fragments:

```ts
/*
# Getting started
This section explains how we begin fetching data.
*/
```

Each comment block can contain any valid Markdown.
Headers within comments (`#`, `##`, etc.) set the current nesting level.
The parser keeps track of this and uses it to position included files and examples correctly.

---

## 4. Associating Comments with Code

The code immediately following a comment is treated as belonging to that commentary.
It is inserted verbatim into the rendered document inside a fenced code block.

```ts
/*
# Fetching data
Let’s start by fetching our remote schedule.
*/
const schedule = await fetchSchedule()
```

Becomes:

```markdown
# Fetching data
Let’s start by fetching our remote schedule.

```ts
const schedule = await fetchSchedule()
```
```

---

## 5. JSDoc Blocks for Functions and APIs

JSDoc blocks preceding a function, class, or variable are converted into a Markdown section with a header, body text, and a parameter table.

```ts
/**
 * # Adds two numbers together.
 *
 * This demonstrates how parameter annotations become a table.
 *
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The sum of the operands.
 */
export function add(a: number, b: number) {
  return a + b
}
```

Produces:

```markdown
## Adds two numbers together.

This demonstrates how parameter annotations become a table.

| Name | Type | Description |
|------|------|-------------|
| a | number | The first operand. |
| b | number | The second operand. |
| returns | number | The sum of the operands. |
```

---

## 6. Including Other Files — **exact syntax**

To include another source file at the current nesting level, use a **TypeScript single-line comment**:

```ts
// @include ./path/to/file.ts
```

**Render form:** The included content is wrapped with `--` lines and the included file heading shows the path:

```markdown
--
## Supporting File (`path/to/file.ts`)

<contents of path/to/file.ts>

--
```

> Note: `// @include` is intentionally a valid TypeScript comment so the source file stays runnable.

### 6.1 Header Level Controls (exact markers)

To control how included files nest relative to the current section, use these valid single-line comment markers **before** the include:

```ts
// #+    // increase header depth (e.g. H2 → H3) for the upcoming include
// #-    // decrease header depth (e.g. H3 → H2)
// #!    // reset to document base level
// @include ./supporting/whatever.ts
```

These markers affect only subsequent commentary and includes, not the running code.

Example:

```ts
// #+
// @include ./supporting/deep-helper.ts
// #-
// @include ./supporting/summary-helper.ts
// #!
// @include ./supporting/final-helper.ts
```

---

## 7. Handling Tests

Vitest (or similar) test blocks in the source are treated as **interactive explanations**.

Each `it('...', () => { ... })` block renders as a narrative title and a verbatim code block and the last-run status.

Example source:

```ts
if (import.meta.vitest) {
  it('To see the structure of the schedule, let\'s look at the first entry:', () =>
    expect(remoteSchedule[0]).toEqual({ courseCode: 'CS101', section: '01' }))
}
```

Becomes:

```markdown
### To see the structure of the schedule, let’s look at the first entry:

```ts
expect(remoteSchedule[0]).toEqual({ courseCode: 'CS101', section: '01' })
```

**Status:** ✅ Passed
```

Make test titles read like **micro-narrative steps** (see section 8.3).

---

## 8. Writing Style and Narrative Voice

All examples are **tutorials first** and **reference second**.

### 8.1 Voice
- **Peer voice** by default: “let’s see what happens…”, “we’ll explore…”.
- **Guide/Tutor voice** when revealing invariants: “you’ll notice…”, “this guarantees…”.
- **Reflective voice** to summarise: “so that suggests…”.

### 8.2 Structure
1. **Intent** — short comment explaining what we are about to do.
2. **Code** — the code the comment refers to.
3. **Evidence** — test or console output (treated interchangeably).
4. **Reflection** — what the evidence implies.

### 8.3 Test Titles (`it()` strings)
Make `it()` read like narrative steps:

| Poor | Better |
|------|--------|
| `it('should return 7', ...)` | `it('When we add 3 and 4, we get 7', ...)` |
| `it('fetch returns data', ...)` | `it('To confirm the schedule is loading, inspect the first entry', ...)` |

Guidelines:
- Keep them **short** and **readable**.
- Favor **natural language** and **context** over purely technical wording.
- Each `it` should test a **single behavior** (one narrative step per test).

---

## 9. Metadata and Footer

At the end of the document, the generator appends a metadata block including:
- `@document.keywords`
- `@document.difficulty`
- Referenced files list (from `// @include` usages)

Example footer:

```markdown
---

**References**
- Source: `example-file.ts`
- Referenced files: `supporting/foo.ts`, `supporting/bar.ts`

**Metadata**
- keywords: array, map
- difficulty: introductory
```

---

## 10. Summary

A well-written source example should:
1. Be **valid TypeScript**, runnable without modification.
2. Read as a **narrative** when rendered.
3. Use `/* ... */` comment blocks for prose and `// @include` for includes.
4. Use `// #+`, `// #-`, `// #!` to control include nesting when necessary.
5. Use tests and console logs as interchangeable **evidence**, but make tests’ titles read like narrative steps.
6. Keep metadata in a JSDoc block at the top for indexing, not in the narrative.

---

If you want, I can now:
- Produce a short **cheatsheet** (one-pager) with just the `// @include` and header-control examples for quick reference, or
- Regenerate the three demo files and outputs to explicitly show `// @include` everywhere they appear.

Which would you prefer?
