# Lazy Typing: When Types Learn to Wait

*How Canon enables type-safe code that works across any data shape, and why compile-time testing is the ultimate form of documentation*

---

## Foreword

This post began, as many of my explorations do, with a frustration. I was building a data integration layer that needed to consume data from three different sources: our internal API (using `id`), a JSON-LD endpoint (using `@id`), and MongoDB (using `_id`). The semantic concept was identical — a unique identifier for an entity — yet I found myself writing the same logic three times with slight variations for each field name.

The conventional wisdom would have me reach for adapter patterns, factory methods, or perhaps a clever union type. But each solution felt like it was fighting the type system rather than working with it. I kept asking: *why can't TypeScript understand that these are the same concept, just wearing different clothes?*

That question led to Canon, and to a pattern I've come to call **lazy typing**.

---

## The Shape Problem

In the real world, the same semantic concept manifests in different shapes. An "identifier" might be:

```typescript
{ id: 'user-123' }           // Internal format
{ '@id': 'https://...' }     // JSON-LD
{ _id: '507f1f77bcf86c' }    // MongoDB
```

These are all expressing the same idea: *this entity has a unique identity*. Yet from TypeScript's perspective, they are entirely different types. If you want a function that extracts the ID from any of these, you're immediately pushed toward:

```typescript
function getId(entity: unknown): string {
  if ('id' in entity) return entity.id
  if ('@id' in entity) return entity['@id']
  if ('_id' in entity) return entity._id
  throw new Error('No ID found')
}
```

This is ugly, but more importantly, it's **eagerly coupled**. The function has to know, at the moment of writing, every possible shape it might encounter. Add a new format, and you're back to modifying the function. This is the antithesis of extensibility.

---

## Enter Lazy Typing

Lazy typing inverts this relationship. Instead of writing code that knows about all possible shapes upfront, you write code against **semantic concepts** and defer the shape-specific implementation to configuration.

The term "lazy" here borrows from lazy evaluation in functional programming. Just as lazy evaluation defers computation until the result is needed, lazy typing defers shape binding until runtime — while maintaining full type safety at compile time.

Canon implements lazy typing through three complementary components:

### 1. Axioms: The "What"

An axiom defines a semantic concept independent of any specific shape. It's the abstract declaration that says "there exists a concept called 'Id' that represents unique identity."

```typescript
// Axioms define the semantic contract
interface Axioms {
  Id: KeyNameAxiom    // "Id" exists as a concept
  Type: KeyNameAxiom  // "Type" exists as a concept
}
```

Axioms don't say *how* to find the ID. They simply assert that ID-ness is a meaningful property that some data structures possess.

### 2. Canons: The "How"

A canon provides the shape-specific implementation of axioms. It's the bridge between abstract concept and concrete data structure.

```typescript
// Canon for internal format
declareCanon('Internal', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
    },
  },
})

// Canon for JSON-LD
declareCanon('JsonLd', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('@id', 'string'),
      key: '@id',
    },
  },
})
```

Multiple canons can coexist. Each knows about its own shape, but your business logic doesn't need to know about any of them.

### 3. Universal APIs: The Interface

Universal APIs are functions that work across all registered canons. They're the payoff — the code you actually write day-to-day:

```typescript
function idOf<T extends Satisfies<'Id'>>(x: T): string {
  const config = inferAxiom('Id', x)
  return x[config.key]
}
```

This single function works with *any* shape that has an Id axiom defined. The `Satisfies<'Id'>` constraint ensures compile-time type safety, while `inferAxiom` handles runtime shape detection.

---

## The Magic in Action

Here's where it gets interesting. With lazy typing, you write code once and it just works:

```typescript
const internalUser = { id: 'user-123', name: 'Alice' }
const jsonLdPerson = { '@id': 'https://example.com/person/456', name: 'Bob' }
const mongoDoc = { _id: '507f1f77bcf86cd799439011', name: 'Carol' }

idOf(internalUser)   // "user-123"
idOf(jsonLdPerson)   // "https://example.com/person/456"
idOf(mongoDoc)       // "507f1f77bcf86cd799439011"
```

No conditionals. No type narrowing. No explicit format detection. Canon infers the correct canon at runtime based on which axioms match the data shape.

But crucially, this isn't runtime trickery at the expense of type safety. TypeScript knows, at compile time, that all three calls are valid because all three types satisfy the Id axiom.

---

## Type Testing: Documentation That Cannot Lie

Once you embrace lazy typing, a new challenge emerges: how do you verify that your type relationships remain correct as your codebase evolves?

Traditional unit tests verify runtime behavior. But type relationships exist at compile time — they're erased before your code ever runs. You need a different kind of test.

Canon provides **type testing utilities** that let you write compile-time assertions:

```typescript
import type { Expect, IsTrue, IsFalse } from '@relational-fabric/canon'
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

The `invariant` function is a no-op at runtime — it compiles to nothing. But its generic constraint `<_ extends true>` means TypeScript will refuse to compile if the type assertion fails.

This is documentation that cannot lie. If someone later changes `User['id']` to `number`, the invariant fails to compile. The type contract is enforced automatically.

### Self-Documenting Invariants

The pattern becomes particularly powerful when documenting complex type relationships:

```typescript
// Document that Satisfies<'Id'> produces the expected basis types
void invariant<Expect<Satisfies<'Id', 'Internal'>, { id: string }>>()
void invariant<Expect<Satisfies<'Id', 'JsonLd'>, { '@id': string }>>()

// Document that TypeGuard preserves the target type
type ExampleGuard = TypeGuard<{ id: string }>
type GuardTarget<T> = T extends TypeGuard<infer Target> ? Target : never
void invariant<Expect<GuardTarget<ExampleGuard>, { id: string }>>()
```

These invariants serve triple duty:
1. **Compile-time verification** — They catch type regressions immediately
2. **Documentation** — They explicitly state the expected type relationships
3. **Test coverage** — They run every time you run `tsc`

---

## The Philosophical Shift

There's something deeper happening here than just a clever pattern. Lazy typing represents a shift in how we think about types.

Traditional static typing is **prescriptive** — you declare the exact shape upfront, and the compiler enforces it. This works well for closed systems where you control all the data.

Lazy typing is **descriptive** — you declare semantic properties that data *might* have, and the system discovers which properties apply at runtime. This works better for open systems where data arrives in varied shapes.

It's analogous to the difference between object-oriented and duck typing, but with a crucial addition: the "duck typing" happens at the *semantic* level, not the structural level. You're not asking "does this object have an `id` property?" You're asking "does this object have an identity concept, however it might be expressed?"

---

## When to Use Lazy Typing

Lazy typing isn't always the right choice. Like any abstraction, it has costs:

**Use lazy typing when:**
- You integrate data from multiple external sources
- You need to support multiple API versions
- You're building libraries that must work with diverse data shapes
- You want to write format-agnostic business logic

**Stick with traditional typing when:**
- You control both producer and consumer of the data
- Performance is critical and you can't afford runtime shape detection
- The added indirection would obscure simple logic

The sweet spot is integration boundaries — places where your internal world meets external data. There, lazy typing lets you maintain internal consistency while gracefully handling external variety.

---

## Conclusion

Lazy typing is, at its core, an act of patience. Instead of demanding that all data conform to a single shape immediately, you define what matters semantically and let the binding happen when it's needed.

Combined with compile-time type testing, you get a system that is both flexible and rigorous. Flexible because new shapes can be added without modifying existing code. Rigorous because the type system still catches errors at compile time, and invariants document the contracts that must hold.

This is the vision behind Canon: types that adapt without sacrificing safety. Code that works with data as it is, not as you wish it were. And documentation that proves itself every time you compile.

---

## Getting Started

```bash
npm install @relational-fabric/canon
```

```typescript
import { declareCanon, idOf, Satisfies } from '@relational-fabric/canon'
import type { Canon, Expect } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// Define your canon
type MyCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
}>

declareCanon('My', {
  axioms: {
    Id: {
      $basis: (v: unknown): v is { id: string } => 
        typeof v === 'object' && v !== null && 'id' in v,
      key: 'id',
    },
  },
})

// Write universal code
function processEntity<T extends Satisfies<'Id'>>(entity: T) {
  console.log('Processing:', idOf(entity))
}

// Document your expectations
void invariant<Expect<ReturnType<typeof idOf>, string>>()
```

---

*Canon is part of the [Relational Fabric](https://github.com/RelationalFabric/canon) project. Contributions and feedback are welcome.*
