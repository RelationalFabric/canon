# Canon Example Syntax Guide

This guide explains how Canon example source files are parsed into Markdown documentation.
All meaningful constructs are shown as **source TypeScript** and **rendered Markdown output**.

> Note: All headers in JSDoc blocks are **optional**. Authors should provide headers where appropriate.
> Except for the file-level header (`@document.title`), **all other headers are relative to the document base**, which is considered level 1 in the generated document.

---

## 1. File-Level Metadata

File-level JSDoc defines document-level metadata like title, description, difficulty, and keywords.

````ts
/**
 * @document.title College Schedule Harmonisation
 * @document.description Map remote college schedules into CanonicalCourse format
 * @document.keywords integration, schedule, mapping
 * @document.difficulty introductory
 */
````

Rendered Markdown:

`````markdown
# College Schedule Harmonisation

Map remote college schedules into CanonicalCourse format
```

Metadata such as `keywords` and `difficulty` appear automatically in the footer.

---

## 2. Narrative Comments

Use block comments to provide narrative prose in Markdown.

````ts
/*
# Fetching the Schedule

We start by importing the schedule client to mirror production usage.
*/
````

Rendered Markdown:

`````markdown
# Fetching the Schedule

We start by importing the schedule client to mirror production usage.
```

---

## 3. Loose Code Blocks

Use `// ``` ... // ``` ` fences for **loose or grouped code** that is not a definition.

````ts
// ```
import { fetchCollegeSchedule } from './college-schedule-client.js'
const schedule = await fetchCollegeSchedule({ term: '2024-fall' })
// ```
````

Rendered Markdown:

`````markdown
```ts
import { fetchCollegeSchedule } from './college-schedule-client.js'
const schedule = await fetchCollegeSchedule({ term: '2024-fall' })
```
````

---

## 4. Function, Type, and Class Definitions

Use **JSDoc** for functions, types, classes, and interfaces.
Headers in JSDoc blocks are **optional**. If omitted, the description text will still be rendered.
All headers (except the file-level header) are **relative to the document base** and should be considered level 1.

### With Header

````ts
/**
 * # Adds two numbers together.
 *
 * Demonstrates addition in JSDoc.
 *
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The sum of `a` and `b`.
 */
export function add(a: number, b: number): number {
  return a + b
}
````

Rendered Markdown:

`````markdown
# Adds two numbers together.

Demonstrates addition in JSDoc.

| Param | Type | Description |
|-------|------|-------------|
| `a` | number | The first operand. |
| `b` | number | The second operand. |

**Returns:** `number` — The sum of `a` and `b`.

```ts
export function add(a: number, b: number): number {
  return a + b
}
```

### Without Header

````ts
/**
 * Adds two numbers together.
 *
 * Demonstrates addition in JSDoc without an explicit header.
 *
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} Sum of a and b
 */
export function addNoHeader(a: number, b: number): number {
  return a + b
}
````

Rendered Markdown:

`````markdown
Adds two numbers together.

Demonstrates addition in JSDoc without an explicit header.

| Param | Type | Description |
|-------|------|-------------|
| `a` | number | First operand |
| `b` | number | Second operand |

**Returns:** `number` — Sum of a and b

```ts
export function addNoHeader(a: number, b: number): number {
  return a + b
}
```
````

---

## 5. Tests (Vitest `it()` blocks)

Tests are the only form of captured evidence. Place **small tests immediately after the concept** they verify.

````ts
if (import.meta.vitest) {
  it('Adding 2 and 5 gives 7', () =>
    expect(add(2, 5)).toBe(7)
  )
}
````

Rendered Markdown:

`````markdown
Adding 2 and 5 gives 7:

```ts
expect(add(2, 5)).toBe(7)
```

Status: ✅ pass
```

---

## 6. Header Level Controls

Adjust heading depth for included files or nested content:

````ts
// #+   // Increase heading level by 1
// #-   // Decrease heading level by 1
// #!   // Reset to base document level
````

Rendered Markdown:

`````markdown
*(These directives adjust the heading level of subsequent sections and included files.)*
```

---

## 7. Including Supporting Files

Embed files inline using `// @include` at the narrative point where they are relevant.

````ts
/*
# Transforming Courses
Include a helper that formats course meeting times.
*/

// #+
 // @include ./format-times.ts
````

Rendered Markdown:

`````markdown
# Transforming Courses

Include a helper that formats course meeting times.

--
# Supporting File (`format-times.ts`)

<contents of format-times.ts rendered as Markdown>

--
```

---

## 8. Footer and Metadata

At the end of the generated document, the generator appends:

- **References:** all contributing files
- **Metadata:** keywords, difficulty, etc. from the file-level JSDoc

These are handled automatically.

---

## 9. Summary Table of Constructs

````ts
/*
Constructs Summary
*/
````

Rendered Markdown:

`````markdown
| Construct | Source Form | Output Form |
|------------|------------|-------------|
| File Metadata | JSDoc `@document.*` | Title, description, footer metadata |
| Narrative Comment | `/* markdown */` | Markdown prose |
| Loose Code Block | `// ``` ... // ``` ` | Fenced `ts` code block |
| Function/Type/Class | JSDoc | Header + description + parameter/return table + code |
| Test | `it()` in `import.meta.vitest` | Paragraph + fenced code block + status |
| Include | `// @include path` | Embedded file content |
| Header Control | `// #+`, `// #-`, `// #!` | Adjust heading depth for Markdown |
````

---

## 10. Best Practices

- Headers in JSDoc **are optional**; description text is always rendered.
- All headers (except the file-level header) should be **provided by the author** and **relative to the document base**, which is considered level 1.
- Keep narrative **peer-first**, switch to tutor/sage only when revealing invariants.
- Place tests **little and often**, immediately after the concept they verify.
- Use JSDoc for definitions; `// ``` fences` for loose code blocks.
- Tests are the **primary evidence** — do not use `console.log`.
- Include supporting files inline at the relevant narrative point with `// @include`.
- Adjust heading levels for nested includes with `// #+`, `// #-`, `// #!`.

This ensures examples are **readable, executable, and pedagogically coherent**.
