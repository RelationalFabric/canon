# Contributing to Canon Examples

This guide establishes the standards and patterns for writing examples in the Canon project. Examples serve triple duty as **executable documentation**, **integration tests**, and **learning resources**.

## Core Principles

### 1. Documentation-First Mindset

Every example file will be transformed into documentation. Write with this in mind:

- **Clear narrative structure** - Guide the reader through concepts progressively
- **Explanatory comments** - Use JSDoc and inline comments liberally
- **Meaningful names** - Variables, functions, and files should be self-documenting
- **Complete examples** - Show working code, not fragments
- **Key Takeaways** - End with a summary comment block

### 2. In-Source Testing Pattern

The main example file (entry point) uses [Vitest's in-source testing](https://vitest.dev/guide/in-source):

```typescript
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Order calculations', () => {
    it('calculates order total correctly', () => {
      const result = calculateTotal(order)
      expect(result.total).toBe(100)
    })
  })
}
```

**Console.logs** are fine for demonstrating output to readers - just ensure you also have proper tests.

**Supporting files** that implement complex features may have their own `.test.ts` files if needed.

### 3. Clear Entry Point

- Every folder example must have `usage.ts` as the entry point (legacy `index.ts` is still supported, but new examples should use `usage.ts`)
- This file contains the main narrative and demonstrates the concepts
- Tests for the example concepts go here using in-source testing
- Supporting files provide the infrastructure to make the example work

## Example Structure

### Single File Examples

For simple, focused examples that fit in one file:

```
examples/
  └── 01-basic-id-axiom.ts
```

**Narrative flow:**

The structure should follow the story you're telling, not a rigid template. Typically:

1. **File-level JSDoc** - What is this example about?
2. **Imports** - Always use `@relational-fabric/canon`
3. **Concept → Test → Concept → Test** - Interleave implementation and tests
   - Introduce a concept (types, axiom, canon)
   - Demonstrate it with in-source tests
   - Build on it with the next concept
   - Test the new behavior
4. **Key Takeaways** - Summary comment block at the end

**The order depends on your narrative**, not a fixed structure. Progressive complexity with tests along the way makes examples easier to follow.

**Referencing supporting files:**

Reference supporting files inline at the narrative point where you introduce them.

When you need to introduce a supporting file and explain what it provides:

```typescript
/**
 * First, we'll define the **Email axiom**. This creates a semantic concept
 * for email addresses that works across different field naming conventions.
 *
 * @file axioms/email.ts
 *
 * This exports the `emailOf()` function, which extracts email addresses
 * from any entity. Let's try it with a customer from a REST API.
 */
import { emailOf } from './axioms/email.js'

const email = emailOf(customer)
```

When the file reference is simple and purpose is clear from context:

```typescript
// We need a canon that maps our axioms to REST API field names.
// @file canons/rest-api.ts

import './canons/rest-api.js'
```

The documentation generator discovers and orders files based on where you reference them in the narrative.

### Folder-Based Examples

For complex examples requiring multiple files:

```
  examples/
    └── 07-defining-axioms/
        ├── usage.ts          # Main entry point with tests
        ├── axioms/
        │   ├── email.ts      # Email axiom: types + API (emailOf)
        │   ├── currency.ts   # Currency axiom: types + API (currencyOf)
        │   └── status.ts     # Status axiom: types + API (statusOf)
        └── canons/
            ├── rest-api.ts   # REST API notation (id, email, status)
            └── json-ld.ts    # JSON-LD notation (@id, @email, @status)
```

**Required files:**
- `usage.ts` - Main entry point with narrative and tests (`index.ts` remains valid for legacy examples)

**Axioms and Canons:**
- `axioms/{concept}.ts` - Complete axiom: type definition + API functions
  - Each axiom is a complete unit in its own file
  - Contains the axiom type AND the `*Of` function(s)
- `canons/{notation}.ts` - Complete canon: type definition + runtime registration
  - Contains the canon type AND the `declareCanon()` call

**Supporting files:**

Beyond axioms and canons, supporting files should only exist for one of these reasons:

1. **The code implements infrastructure unrelated to what you're teaching**
    - Example: You're teaching axioms, but need a mock database adapter to make the example realistic
    - The database adapter goes in a supporting file; the axiom usage stays in `usage.ts`

2. **The code is reused across multiple examples in the same directory**
    - Shared test fixtures, domain models, or utilities
    - If it's only used in one place, keep it in `usage.ts`

3. **The implementation is long enough to break the narrative flow**
    - Rule of thumb: If extracting it makes `usage.ts` easier to follow, extract it
   - If extracting it requires the reader to jump between files, keep it inline

**Testing supporting files:**

If you create a supporting file that implements complex features, you may write tests for it:
- Use separate `.test.ts` files for complex supporting code
  - Example: `mock-db.ts` with complex logic can have `mock-db.test.ts`
  - The main example concepts should still be tested in `usage.ts` using in-source tests

**If you're unsure:** Start with everything in `usage.ts`. Only extract when it clearly helps.

## Naming Conventions

### Example Directories

```
{number}-{descriptive-name}/
```

- **Number prefix**: Two digits for ordering (01, 02, etc.)
- **Descriptive name**: Lowercase, hyphen-separated, concise
- **NO suffixes**: Avoid `-example`, `-demo`, etc.

**Examples:**
- ✅ `01-basic-id-axiom`
- ✅ `02-module-style-canon`
- ✅ `07-defining-axioms`
- ❌ `07-custom-axioms` (implies Canon's axioms are "standard")
- ❌ `07-domain-axioms` ("domain" is vague)
- ❌ `07-defining-axioms-example` (redundant suffix)

### File Names

| Pattern | Usage |
|---------|-------|
| `usage.ts` | Main entry point - required for folder examples (`index.ts` allowed for legacy examples) |
| `canons/{name}.ts` | Complete canon: types + runtime config |
| `axioms/{name}.ts` | Complete axiom: types + runtime config + API |

**Simple cases:**
- Single canon? Use `canon.ts`
- Single axiom? Use `axiom.ts`

**Canon naming:**
Name canons based on what's meaningful in your context:
- Specific notation: `rest-api.ts`, `mongodb.ts`, `json-ld.ts`
- Your convention: `internal.ts`, `preferred.ts`
- Domain + notation: `ecommerce-rest.ts`, `crm-graphql.ts`

**Axiom naming:**
Name axioms after the semantic concept: `email.ts`, `currency.ts`, `status.ts`

**Other supporting files:**
Name them based on what they do. The structure should serve the narrative.

### Function Names

Use the established `*Of` pattern for axiom extraction:

```typescript
// Extracting from axioms
idOf(entity) // Get ID
typeOf(entity) // Get type
versionOf(entity) // Get version
emailOf(customer) // Get email

// Avoid imperative names
getEntityId(entity) // ❌ Don't use this pattern
```

## File Organization

### Axiom Organization

Each axiom file is a complete, cohesive unit:

```typescript
// axioms/email.ts

import type { KeyNameAxiom, Satisfies } from '@relational-fabric/canon'
import { inferAxiom } from '@relational-fabric/canon'

/**
 * Email Axiom
 *
 * Different systems store email addresses under different field names.
 * REST APIs might use 'email', CRM systems might use 'emailAddress',
 * legacy databases might use 'contact_email'. The Email axiom lets you
 * work with email addresses regardless of which field name is used.
 *
 * This is a KeyNameAxiom because we find the email by looking for a
 * specific field name that's configured in each canon.
 */
type EmailAxiom = KeyNameAxiom

declare module '@relational-fabric/canon' {
  interface Axioms {
    Email: EmailAxiom
  }
}

/**
 * Once you've defined the Email axiom in your canons, you can extract
 * email addresses from any entity using this function. It doesn't matter
 * if the field is called 'email', 'emailAddress', or something else -
 * the function knows how to find it based on your canon configuration.
 */
export function emailOf<T extends Satisfies<'Email'>>(x: T): string {
  const config = inferAxiom('Email', x) // Find the canon configuration

  if (!config || !('key' in config)) {
    throw new Error('No matching canon found for Email axiom')
  }

  const value = (x as Record<string, unknown>)[config.key]
  if (typeof value !== 'string') {
    throw new TypeError(`Expected string email, got ${typeof value}`)
  }

  return value
}
```

### Canon Organization

Canon files contain type definition and runtime registration. **Canons represent different notational/implementation conventions**, not different domains:

```typescript
// canons/rest-api.ts

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

/**
 * REST API Canon
 *
 * Most REST APIs follow a common convention: use simple field names like
 * 'id', 'type', and 'version'. This canon maps those conventional field
 * names to Canon's semantic axioms.
 *
 * When you work with data from a REST API, this canon tells the system
 * "the Id axiom maps to the 'id' field, the Type axiom maps to the 'type'
 * field," and so on. Now you can use idOf(), typeOf(), etc. on your
 * REST API data.
 */
type RestApiCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
  Type: { $basis: { type: string }, key: 'type' }
  Email: { $basis: { email: string }, key: 'email' }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    RestApiCanon: RestApiCanon
  }
}

// Now we register the runtime configuration that matches our type definition
declareCanon('RestApiCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type' },
    Email: { $basis: pojoWithOfType('email', 'string'), key: 'email' },
  },
})
```

**Canon names should be meaningful in your context:**

Specific notation/implementation:
- `RestApiCanon` - REST API conventions (id, type, version)
- `MongoDbCanon` - MongoDB conventions (_id, _type, _version)
- `JsonLdCanon` - JSON-LD conventions (@id, @type, @version)

Your preferred style:
- `InternalCanon` - Your organization's internal conventions
- `PreferredCanon` - Your preferred field naming style

Domain + notation (when you need multiple canons for the same notation):
- `EcommerceRestCanon` - REST API for ecommerce domain
- `CrmGraphQLCanon` - GraphQL for CRM domain

**Avoid pure domain names** (canons are about notation, not domain):
- ❌ `EcommerceCanon` - Which notation? REST? MongoDB?
- ❌ `UserCanon` - What makes this different from other canons?

### When to Create Supporting Files

Supporting files exist to keep the main example clear and focused.

**Create a supporting file when:**
- The code would obscure what you're teaching in `usage.ts`
- You need to implement complex infrastructure that enables the example
- Multiple parts of the example need to share the same code
- Separating the concern makes the narrative flow better

**Keep it in `usage.ts` when:**
- It's used only once
- It's simple enough not to distract
- Including it helps the narrative flow

**Testing supporting files:**
- If a supporting file implements complex logic, it can have its own `.test.ts` file
- The main example concepts should still be tested in `usage.ts` using in-source tests
- The goal is clarity and correctness, not bureaucracy

**Remember:** The structure serves the narrative. Don't split things up just to split them up.

## Documentation Standards

### Comment Style: Narrative Markdown

Write comments as **narrative prose with Markdown** - these become your documentation:

```typescript
// ❌ Bad - Technical, no formatting
/**
 * Email Axiom - KeyNameAxiom for email field
 * @type {KeyNameAxiom}
 */

// ✅ Good - Narrative with Markdown
/**
 * ## Email Axiom
 *
 * Different systems store email addresses under different field names.
 * REST APIs might use `email`, CRM systems might use `emailAddress`,
 * legacy databases might use `contact_email`. The Email axiom lets you
 * work with email addresses **regardless of which field name** is used.
 */
```

**Markdown formatting in comments:**
- Use `##` and `###` for section headers
- Use `**bold**` for emphasis
- Use `` `code` `` for field names, function names, values
- Use lists, links, and other Markdown as needed

**Inline comments for signposting code:**

```typescript
const config = inferAxiom('Email', x) // Find the canon configuration
```

**Block comments for teaching concepts:**

```typescript
/**
 * Now we can extract email addresses from any entity using `emailOf()`.
 * The function knows how to find the email field based on your canon -
 * you don't need to know whether it's called `email`, `emailAddress`,
 * or something else entirely.
 */
export function emailOf<T extends Satisfies<'Email'>>(x: T): string {
  // ...
}
```

### File-Level Documentation

Every file starts with a comprehensive narrative comment:

```typescript
/**
 * Module-Style Canon Example
 *
 * This example demonstrates how to create reusable, exportable canons
 * that can be shared across projects. We'll create a MongoDB-specific
 * canon that handles MongoDB's unique field naming conventions.
 *
 * Key Concepts:
 * - Module-style canon definition
 * - Exportable canon patterns
 * - MongoDB field mapping (_id, _type, etc.)
 */
```

### Avoid Section Header Comments

Don't use mechanical section headers. Instead, let the narrative flow naturally:

```typescript
// ❌ Bad - Code organization markers
// =============================================================================
// Type Definitions
// =============================================================================

// ✅ Good - Narrative flow
/**
 * We'll start by defining the Email axiom. This creates a semantic
 * concept that can work across different field names.
 */
type EmailAxiom = KeyNameAxiom

/**
 * Now we register it in Canon's global type system so it can be
 * used with any canon that implements it.
 */
declare module '@relational-fabric/canon' {
  interface Axioms {
    Email: EmailAxiom
  }
}
```

### Key Takeaways

End each example with a comprehensive summary:

```typescript
/**
 * Key Takeaways:
 *
 * 1. **Module-Style Canons**: Use `defineCanon()` to create exportable canons
 * 2. **Type Safety**: Full TypeScript inference for canon configurations
 * 3. **Field Mapping**: Handle different naming conventions transparently
 * 4. **Reusability**: Export and import canons across projects
 * 5. **Testing**: In-source tests validate and document behavior
 */
```

## Testing Standards

### Test Organization

Tests live exclusively in the main entry point (`usage.ts` or single file):

```typescript
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Example Name', () => {
    describe('Feature 1', () => {
      it('demonstrates specific behavior', () => {
        // Arrange
        const input = createTestData()

        // Act
        const result = performAction(input)

        // Assert
        expect(result).toEqual(expectedOutput)
      })
    })
  })
}
```

### Test Coverage Requirements

Every example must test:
1. **Happy path** - Normal, expected usage
2. **Edge cases** - Boundary conditions and special cases
3. **Error cases** - Invalid inputs and error handling (using `@ts-expect-error`)
4. **Integration** - Complete workflows end-to-end

### Using @ts-expect-error

For tests demonstrating type system correctness:

```typescript
it('rejects invalid data at compile time', () => {
  const invalidData = { name: 'Invalid User' }

  // @ts-expect-error - Demonstrating type system correctly rejects invalid structure
  expect(() => idOf(invalidData)).toThrow('Expected string ID')
})
```

## Import Guidelines

### Always Use Package Imports

Examples demonstrate real-world usage, so always import from the package:

```typescript
import type { Canon, Satisfies } from '@relational-fabric/canon'
// ✅ Good - Shows how users will import
import { declareCanon, idOf, typeOf } from '@relational-fabric/canon'

// ❌ Bad - Internal imports not visible to users
import { idOf } from '../../src/axioms/id.js'
```

### Relative Imports for Example Files

Within an example folder, use relative imports with `.js` extensions:

```typescript
import type { Order } from './models.js'
// ❌ Bad - Missing .js extension
import { calculateTotal } from './api'

// ✅ Good - ESM-compliant relative imports
import { calculateTotal } from './api.js'
```

## Common Patterns

### Progressive Complexity with Interwoven Tests

Build examples from simple to complex, testing as you go:

```typescript
// Start simple - introduce the concept
const user = { id: 'user-123', type: 'user', version: 1 }
const id = idOf(user)

// Test it immediately
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Basic ID extraction', () => {
    it('extracts ID from user', () => {
      expect(idOf(user)).toBe('user-123')
    })
  })
}

// Build on it - add complexity
const customer = {
  id: 'cust-123',
  type: 'customer',
  version: 5,
  email: 'customer@example.com',
}

// Test the new concept
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Email axiom', () => {
    it('extracts email from customer', () => {
      expect(emailOf(customer)).toBe('customer@example.com')
    })
  })
}

// Show complete workflow
const result = processCustomerRegistration(customer)

// Test the workflow
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Customer registration', () => {
    it('processes customer successfully', () => {
      expect(result.success).toBe(true)
    })
  })
}
```

### Type Safety Demonstrations

Show how Canon maintains type safety:

```typescript
// Demonstrate compile-time type checking
const validEntity = { id: 'valid', type: 'user', version: 1 }
const id: string = idOf(validEntity) // ✅ Types inferred correctly

// Demonstrate runtime validation
// @ts-expect-error - Invalid structure rejected by type system
const invalidEntity = { name: 'invalid' }
expect(() => idOf(invalidEntity)).toThrow()
```

### Real-World Scenarios

Use realistic domain models:

```typescript
// ✅ Good - Realistic scenario
interface Order {
  id: string
  type: 'order'
  version: number
  customerId: string
  items: Array<{ productId: string, quantity: number, price: number }>
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
}

// ❌ Bad - Toy example
interface Thing {
  id: string
  data: unknown
}
```

## Checklist for New Examples

Before submitting an example, verify:

- [ ] Single file OR folder with `usage.ts` entry point (legacy `index.ts` accepted)
- [ ] Supporting files referenced with inline `@file` comments where introduced
- [ ] Markdown formatting in comments (`##` headers, `**bold**`, `` `code` ``)
- [ ] Main concepts tested with in-source testing in entry point
- [ ] Tests interleaved with concepts (teach → test → teach → test)
- [ ] Imports from `@relational-fabric/canon` (not relative paths to src)
- [ ] Relative imports within example have `.js` extensions
- [ ] Narrative prose that teaches, not technical API docs
- [ ] Uses `@ts-expect-error` when demonstrating type system behavior
- [ ] Follows naming: `axioms/{concept}.ts`, `canons/{notation}.ts`
- [ ] Axiom files contain type + API (complete unit)
- [ ] Canon files contain type + runtime (complete unit)
- [ ] Realistic domain models and scenarios
- [ ] Key Takeaways summary at end

## Examples of Good Structure

### Simple Single File

```typescript
/**
 * Basic ID Axiom Example
 *
 * Demonstrates the fundamental concept of extracting IDs from
 * different data structures using the Id axiom.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

/**
 * First, we define a simple canon that maps the Id axiom to the 'id' field.
 * This tells Canon where to find IDs in our data structures.
 */
type SimpleCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    SimpleCanon: SimpleCanon
  }
}

declareCanon('SimpleCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
  },
})

/**
 * Now we can extract IDs from any entity that has an 'id' field.
 * The idOf function knows how to find it based on our canon configuration.
 */
const entity = { id: 'user-123', name: 'Alice' }
const id = idOf(entity) // Returns: 'user-123'

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Basic ID Axiom', () => {
    it('extracts ID from entity', () => {
      const entity = { id: 'user-123', name: 'Alice' }
      expect(idOf(entity)).toBe('user-123')
    })
  })
}

/**
 * Key Takeaways:
 *
 * 1. **Universal ID Access**: Extract IDs regardless of structure
 * 2. **Type Safety**: Full TypeScript inference
 * 3. **Simple Setup**: Minimal configuration required
 */
```

### Folder-Based Example with Inline @file References

Entry point (`usage.ts`):

```typescript
/**
 * ## Defining Your Own Axioms
 *
 * This example demonstrates defining **domain-specific axioms** for your application.
 * Canon provides axioms like `Id` and `Type`, and you can define your own
 * axioms for concepts like Email, Currency, and Status.
 */

/**
 * ### The Currency Axiom
 *
 * Next, let's handle monetary values. We want to work with currencies
 * in different formats: plain numbers like `99.99`, strings like `"$99.99 USD"`,
 * or structured objects like `{ amount: 99.99, currency: 'USD' }`.
 *
 * @file axioms/currency.ts
 *
 * This exports `currencyOf()`, which converts any format to a canonical
 * structure with amount and currency code. Let's convert the customer's balance.
 */
import { currencyOf } from './axioms/currency.js'

/**
 * ### The Email Axiom
 *
 * First, we'll define an axiom for email addresses. This creates a semantic
 * concept that works across different field naming conventions - whether your
 * data uses `email`, `emailAddress`, or `contact_email`.
 *
 * @file axioms/email.ts
 *
 * This gives us the `emailOf()` function. Now we can extract email addresses
 * from any entity, and the function will know how to find them based on our
 * canon configuration.
 */
import { emailOf } from './axioms/email.js'

/**
 * ### Defining the Canon
 *
 * Finally, we need a canon that tells Canon how to map our axioms to
 * REST API field names.
 *
 * @file canons/rest-api.ts
 *
 * With this canon registered, our axiom functions know that in REST API data,
 * the Email axiom maps to the `email` field, and so on.
 */
import './canons/rest-api.js'

const customer = {
  id: 'cust-123',
  email: 'customer@example.com',
  balance: 99.99,
}

const email = emailOf(customer)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Email Axiom', () => {
    it('extracts email from customer', () => {
      expect(emailOf(customer)).toBe('customer@example.com')
    })
  })
}

const currency = currencyOf(customer.balance)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Currency Axiom', () => {
    it('converts number to canonical format', () => {
      expect(currencyOf(99.99)).toEqual({ amount: 99.99, currency: 'USD' })
    })
  })
}

/**
 * **Key Takeaways:**
 *
 * 1. Define axioms for your domain-specific concepts
 * 2. Each axiom is a complete unit: type definition + API function
 * 3. Use Markdown in comments for rich documentation
 * 4. Reference files inline where they're introduced in the narrative
 */
```

Directory structure:
```
examples/07-defining-axioms/
  ├── index.ts              # Entry point (shown above)
  ├── axioms/
  │   ├── email.ts         # EmailAxiom type + emailOf() function
  │   ├── currency.ts      # CurrencyAxiom type + currencyOf() function
  │   └── status.ts        # StatusAxiom type + statusOf() function
  └── canons/
      └── rest-api.ts      # RestApiCanon type + declareCanon()
```

## Getting Help

- Review existing examples for patterns and style
- Check [TESTING.md](../TESTING.md) for testing strategy
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for general guidelines
- Ask questions in PRs if structure is unclear

## Summary

Examples are **living documentation**. They must be:
- **Clear** - Easy to read and understand
- **Correct** - Fully tested and type-safe
- **Complete** - Show real-world usage
- **Consistent** - Follow established patterns

When in doubt, prioritize clarity and learnability over cleverness.
