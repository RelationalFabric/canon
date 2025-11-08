# Contributing to Canon Examples

This guide establishes the standards and patterns for writing examples in the Canon project. Examples serve triple duty as **executable documentation**, **integration tests**, and **learning resources**.

## Core Principles

### 1. Documentation-First Mindset

Every example file is transformed into documentation. Write with this in mind:

- **Clear narrative structure** – Guide the reader progressively through concepts.
- **Explanatory comments** – Use JSDoc and inline comments liberally to explain the “why.”
- **Meaningful names** – Variables, functions, and files should be self-documenting.
- **Complete examples** – Show working code, not fragments.
- **Key Takeaways** – End with a summary comment block highlighting lessons.

### 2. In-Source Testing Pattern

All examples rely on **in-source tests** rather than `console.log` because only tests are captured in the generated Markdown.

- Use Vitest in-source tests with concise, narrative-friendly `it()` statements.
- Keep tests **small and frequent**: interleave them **little and often** with each concept so readers see immediate evidence.
- Each `it()` should describe a **step in the story**, not internal mechanics or intermediate variables.

```ts
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('When we add 3 and 4, we get 7', () => {
    expect(add(3, 4)).toBe(7)
  })
}
```

**Guidelines for all tests:**

- **Narrative focus** – the `it()` title is part of the story.
- **Evidence over mechanics** – do not describe internal declarations in titles.
- **Frequent, small tests** – place them immediately after the concept they verify.
- **Console.logs are not used** – tests are the only captured evidence.

Supporting files may have their own `.test.ts` only if they implement complex logic unrelated to the main narrative.

### 3. Clear Entry Point

- Every example should have a **clear starting point** where the narrative begins and tests are interleaved.
- The entry point contains the main story and demonstrates the key concepts.
- Supporting files provide infrastructure only, not narrative content.

---

## Example Structure

### Single File Examples

For simple, focused examples that fit in one file:

```
examples/
  └── 01-basic-id-axiom.ts
```

**Narrative flow:**

1. **File-level JSDoc** – Describe the purpose of the example.
2. **Imports** – Always import from `@relational-fabric/canon`.
3. **Concept → Test → Concept → Test** – Interleave implementation and tests:
   - Introduce a concept (types, axiom, canon).
   - Demonstrate it with an in-source test.
   - Build on it with the next concept.
   - Test the new behavior.
4. **Key Takeaways** – Include a summary comment block at the end.

**Referencing supporting files:**

Introduce supporting files inline at the narrative point:

```ts
/**
 * First, we'll define the **Email axiom**.
 *
 * @file axioms/email.ts
 *
 * Exports `emailOf()`, which extracts email addresses from any entity.
 */
import { emailOf } from './axioms/email.js'

const email = emailOf(customer)
```

If the file reference is obvious:

```ts
// Map axioms to REST API fields
// @file canons/rest-api.ts
import './canons/rest-api.js'
```

### Folder-Based Examples

For examples requiring multiple files:

```
examples/
  └── 07-defining-axioms/
      ├── index.ts          # Main entry point with narrative and tests
      ├── axioms/
      │   ├── email.ts      # Email axiom: type + API (`emailOf`)
      │   ├── currency.ts   # Currency axiom: type + API (`currencyOf`)
      │   └── status.ts     # Status axiom: type + API (`statusOf`)
      └── canons/
          ├── rest-api.ts   # REST API notation (id, email, status)
          └── json-ld.ts    # JSON-LD notation (@id, @email, @status)
```

**Entry point rules:**

- Every folder example **must have `index.ts` as the entry point** (legacy `usage.ts` is still accepted).
- `index.ts` contains the main narrative and interleaved in-source tests.

**Supporting files:**

Use supporting files only when:

1. The code implements infrastructure unrelated to the example’s teaching point.
2. The code is reused across multiple examples in the same folder.
3. The implementation is long enough to disrupt the narrative flow.

**Testing supporting files:**

- Complex supporting files may have their own `.test.ts`.
- Main example concepts must be tested **inline** in `index.ts`.
- Interleave tests **little and often** with the narrative for clarity.

> **Guideline:** Start with everything in `index.ts`. Extract supporting files only when it clearly improves readability or reduces clutter.

---

## Naming Conventions

### Example Directories

```
{number}-{descriptive-name}/
```

- Two-digit number for ordering.
- Lowercase, hyphen-separated descriptive name.
- Avoid redundant suffixes like `-example` or `-demo`.

### File Names

| Pattern | Usage |
|---------|-------|
| `index.ts` | Main entry point (required) |
| `axioms/{concept}.ts` | Complete axiom (type + API) |
| `canons/{notation}.ts` | Complete canon (type + runtime registration) |

### Function Names

Use `*Of` for axiom extractors:

```ts
idOf(entity)
typeOf(entity)
emailOf(customer)
```

Avoid imperative names:

```ts
getEntityId(entity) // ❌
```

---

## Summary

- Maintain a **clear narrative** that teaches progressively.
- Interleave **small, frequent tests** to provide evidence of each concept.
- Tests are the **only form of captured evidence**; do not use `console.log`.
- Use **supporting files sparingly**, only when they improve clarity.
- Follow **folder, file, and function naming conventions**.

These practices ensure examples are **readable, executable, testable, and educational**.
