# Lazy Typing: When Types Learn to Wait

*Introducing Canon — a TypeScript library that lets you write type-safe code against semantic concepts, not rigid shapes*

---

## Foreword

This post began, as many of my explorations do, with a frustration. I was building a data integration layer that needed to consume data from three different sources: our internal API (using `id`), a JSON-LD endpoint (using `@id`), and MongoDB (using `_id`). The semantic concept was identical — a unique identifier for an entity — yet I found myself writing the same logic three times with slight variations for each field name.

The conventional wisdom would have me reach for adapter patterns, factory methods, or perhaps a clever union type. But each solution felt like it was fighting the type system rather than working with it. I kept asking: *why can't TypeScript understand that these are the same concept, just wearing different clothes?*

That question led me to build Canon, and to discover a pattern I've come to call **lazy typing**.

---

## The Shape Problem

If you've worked with TypeScript on any non-trivial project, you've encountered this tension: TypeScript wants to know the exact shape of your data, but the real world keeps handing you the same information in different shapes.

Consider something as fundamental as an identifier. In the real world, "this entity has a unique ID" is a single concept. But in code:

```typescript
{ id: 'user-123' }           // Your internal format
{ '@id': 'https://...' }     // JSON-LD from an external API
{ _id: '507f1f77bcf86c' }    // MongoDB documents
```

These are all expressing the same idea. Yet from TypeScript's perspective, they are entirely different types. If you want a function that extracts the ID from any of these, you're immediately pushed toward something like:

```typescript
function getId(entity: unknown): string {
  if ('id' in entity) return entity.id
  if ('@id' in entity) return entity['@id']
  if ('_id' in entity) return entity._id
  throw new Error('No ID found')
}
```

This works, but it has a fundamental problem: it's **eagerly coupled**. The function has to know, at the moment of writing, every possible shape it might encounter. Add a new data source with a different ID field, and you're back here modifying the function. This is the antithesis of extensibility — and it only gets worse as you add more concepts (types, timestamps, versions, references).

---

## What is Canon?

Canon is a TypeScript library I built to solve this problem. At its core, it provides a way to:

1. **Define semantic concepts** (like "identity" or "type") independently of how they appear in data
2. **Register different data shapes** that implement those concepts
3. **Write universal functions** that work across all registered shapes

The result is code that's both type-safe and shape-agnostic. You write your business logic once, and it works with data from any source — without conditionals, without adapters, without knowing which format you're dealing with.

The pattern that makes this possible is what I call **lazy typing**.

---

## Lazy Typing Explained

The term "lazy" borrows from lazy evaluation in functional programming. Just as lazy evaluation defers computation until the result is needed, lazy typing defers shape binding until runtime — while maintaining full type safety at compile time.

Here's what that means in practice:

**Traditional (eager) typing**: "This function accepts objects with an `id` field that is a string."

**Lazy typing**: "This function accepts any object that has the semantic concept of identity, however that might be expressed."

The key insight is separating the **semantic concept** from the **structural implementation**. Canon gives you the vocabulary to express this separation.

---

## The Three Parts of Lazy Typing

Canon implements lazy typing through three complementary ideas:

### 1. Axioms: Declaring That Concepts Exist

An axiom is simply a declaration that a semantic concept exists. It doesn't say how to find it in any particular data structure — it just says "there is a concept called 'Id' that represents unique identity."

Think of axioms as the vocabulary of your domain. Before you can talk about identity across different data shapes, you need a shared name for what identity *means*.

```typescript
// Canon provides these core axioms out of the box:
// - Id: unique identity
// - Type: classification/kind
// - Version: change tracking
// - Timestamps: temporal data
// - References: relationships between entities
```

### 2. Canons: Teaching Shapes to Speak the Language

A canon tells Canon how a particular data shape implements the axioms. It's the bridge between abstract concept and concrete structure.

```typescript
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// Teach Canon about your internal format
declareCanon('Internal', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
    },
  },
})

// Teach Canon about JSON-LD
declareCanon('JsonLd', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('@id', 'string'),
      key: '@id',
    },
  },
})
```

Multiple canons coexist peacefully. Each knows about its own shape, but your business logic doesn't need to know about any of them.

### 3. Universal Functions: Writing Code Once

With axioms defined and canons registered, you can write functions that work with the semantic concept rather than any specific shape:

```typescript
import { idOf } from '@relational-fabric/canon'

const internalUser = { id: 'user-123', name: 'Alice' }
const jsonLdPerson = { '@id': 'https://example.com/person/456', name: 'Bob' }
const mongoDoc = { _id: '507f1f77bcf86cd799439011', name: 'Carol' }

idOf(internalUser)   // "user-123"
idOf(jsonLdPerson)   // "https://example.com/person/456"  
idOf(mongoDoc)       // "507f1f77bcf86cd799439011"
```

One function. Three completely different shapes. No conditionals. Canon automatically detects which canon matches the data and extracts the value accordingly.

And here's the crucial part: this isn't runtime magic at the expense of type safety. TypeScript knows, at compile time, that all three calls are valid because all three types satisfy the Id axiom.

---

## Why "Canon"?

The name comes from the idea of **canonical forms** — the authoritative, standard representation of something. In music, a canon is a piece where multiple voices sing the same melody, but offset in time. Each voice is different, yet they're all expressions of the same underlying pattern.

That's exactly what we're doing with data: different shapes, same semantic meaning.

---

## Type Testing: Documentation That Cannot Lie

Building Canon surfaced another challenge: how do you verify that type relationships remain correct as your codebase evolves?

Traditional unit tests verify runtime behavior. But type relationships exist at compile time — they're erased before your code ever runs. You need a different kind of test.

Canon includes **type testing utilities** that let you write compile-time assertions:

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface User {
  id: string
  role: 'admin' | 'user'
}

// Assert that id is a string
void invariant<Expect<User['id'], string>>()

// Assert that role is NOT a number  
void invariant<IsFalse<Expect<User['role'], number>>>()
```

The `invariant` function compiles to nothing at runtime — it's a no-op. But its generic constraint means TypeScript refuses to compile if the assertion fails.

This is documentation that cannot lie. If someone changes `User['id']` to `number`, the invariant fails to compile. The type contract is enforced automatically, every time you run `tsc`.

### Why This Matters

Type tests serve triple duty:

1. **Verification** — They catch type regressions immediately
2. **Documentation** — They explicitly state what type relationships must hold
3. **Confidence** — They run on every compile, not just when someone remembers to run tests

In a lazy typing system where the relationship between concepts and shapes is configured rather than hard-coded, these guarantees become essential.

---

## The Philosophical Shift

There's something deeper happening here than just a clever library. Lazy typing represents a shift in how we think about types.

Traditional static typing is **prescriptive** — you declare the exact shape upfront, and the compiler enforces it. This works beautifully for closed systems where you control all the data.

Lazy typing is **descriptive** — you declare semantic properties that data *might* have, and the system discovers which properties apply at runtime. This works better for open systems where data arrives in varied shapes from sources you don't control.

It's analogous to the difference between nominal and structural typing, but at a higher level. You're not asking "does this object have an `id` property?" You're asking "does this object have the concept of identity, however it might be expressed?"

---

## When to Reach for Canon

Lazy typing isn't always the right choice. Like any abstraction, it has costs — there's runtime detection involved, and the indirection can obscure simple code.

**Consider Canon when:**
- You integrate data from multiple external sources
- You need to support multiple API versions simultaneously
- You're building libraries that must work with diverse data shapes
- You want to write format-agnostic business logic

**Stick with traditional typing when:**
- You control both producer and consumer of the data
- Performance is critical and you can't afford runtime detection
- The added indirection would obscure simple logic

The sweet spot is integration boundaries — places where your internal world meets external data. There, Canon lets you maintain internal consistency while gracefully handling external variety.

---

## Getting Started

```bash
npm install @relational-fabric/canon
```

Here's a minimal example that puts it all together:

```typescript
import type { Canon, Satisfies } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

// 1. Define your canon type
type MyCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
}>

// 2. Register with the module augmentation pattern
declare module '@relational-fabric/canon' {
  interface Canons {
    My: MyCanon
  }
}

// 3. Declare the runtime configuration
declareCanon('My', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
    },
  },
})

// 4. Write universal code
function processEntity<T extends Satisfies<'Id'>>(entity: T) {
  const id = idOf(entity)
  return `Processing entity: ${id}`
}

// Works with any shape that has an Id axiom
processEntity({ id: 'user-123' })
```

---

## Conclusion

Lazy typing is, at its core, an act of patience. Instead of demanding that all data conform to a single shape immediately, you define what matters semantically and let the binding happen when it's needed.

Canon makes this possible in TypeScript without sacrificing type safety. Combined with compile-time type testing, you get a system that is both flexible and rigorous — flexible because new shapes can be added without modifying existing code, rigorous because the type system still catches errors before your code runs.

This is what I wanted when I started: types that adapt without sacrificing safety. Code that works with data as it is, not as I wish it were. And documentation that proves itself every time I compile.

I hope Canon helps you build the same.

---

*Canon is open source and available at [github.com/RelationalFabric/canon](https://github.com/RelationalFabric/canon). Contributions, feedback, and questions are welcome.*
