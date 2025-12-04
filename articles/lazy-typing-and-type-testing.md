# When Types Become Tests: A Journey from Repetition to Abstraction

*How years of building data systems led to Canon — a library for canonical types, lazy binding, and compile-time verification*

---

## The Long Road to Canon

Every developer has patterns they carry from project to project. Code that gets rewritten, refined, and eventually ossified into muscle memory. For me, that pattern was a set of data abstractions — ways of thinking about identity, types, relationships, and change over time.

After building these abstractions across enough projects, I decided to give them a proper home. That became [Relational Fabric](https://github.com/RelationalFabric) — a family of composable TypeScript libraries for building truly relational, data-driven technologies. The vision: provide foundational libraries where relationships have semantic meaning, different representations can interoperate, and systems can reason about their data relationally.

The approach is rooted in a belief I've written about before: [abstractions serve as the UI of ideas](https://levelup.gitconnected.com/understanding-abstractions-baa3d5347b0d). Good abstractions make complex systems feel natural. They're the interface through which we understand and work with sophisticated concepts. Relational Fabric aims to provide these abstractions for data systems.

The architecture is layered. At the base is **Filament** — meta-level primitives for building domain-specific abstractions. Above it: **Weft** for query construction, **Warp** for data at rest, **Shuttle** for flow and coordination. Each library handles its concerns while integrating naturally with the others.

But when I sat down to build Filament, I realized I was missing something more fundamental.

---

## The Missing Primitive: A Logical Engine

Much of what Relational Fabric needed to do was *metaprogramming* — reasoning about types at compile time, composing claims about data, making the type system do logical work. Filament's job was to provide primitives that preserve meaning, defer implementation decisions, and evolve gracefully. But that required a foundation for type-level reasoning itself.

This led me to [Howard](https://github.com/RelationalFabric/howard) — named after William Alvin Howard, the mathematician who formalized the [Curry-Howard correspondence](https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence) in his 1969 paper.

The Curry-Howard correspondence is a profound insight: **programs are proofs, and types are propositions**. Writing a program that satisfies a type is structurally identical to constructing a proof for a logical proposition. A type that compiles is a theorem that holds.

Since "Curry" has already been immortalized in programming (via currying), naming the library after Howard felt right. Howard would be a computable truth engine — providing the logical backbone for making data meaningful. It would let you define claims about data, compose them into richer propositions, and verify them through the type system.

And then, while sketching Howard's foundations, I noticed something else entirely.

---

## The Empty Room Problem

Every time I started a new TypeScript project — whether for Relational Fabric or anything else — I did the same things:

- Set up the same TypeScript configuration
- Install the same ESLint setup  
- Add the same utility types
- Define the same base interfaces
- Wire up the same scripts

I was solving the same "empty room" problem repeatedly. And more than that, I kept defining the same *semantic concepts* — identity, type classification, versioning, timestamps — just with slightly different field names depending on the project or data source.

What if there was a canonical starting point? A foundation that provided these common elements so every project didn't start from scratch?

That question birthed Canon.

---

## The Insight: Interface Augmentation and Lazy Types

The technical insight came from TypeScript's module augmentation feature. You can extend interfaces across module boundaries:

```typescript
// In library code
export interface Canons {}

// In user code  
declare module '@relational-fabric/canon' {
  interface Canons {
    MyFormat: MyFormatType
  }
}
```

This pattern enables something powerful: **lazy typing** (or late-bound typing). The library doesn't need to know about your specific data shapes at compile time. You register them later, and the type system adapts.

This was the missing piece. I could define semantic concepts — "there exists a notion of identity" — and let individual projects bind those concepts to their specific shapes. The same `idOf()` function could work with `id`, `@id`, or `_id` depending on what canons were registered.

Canon became Relational Fabric's canonical starting point: a curated set of configurations, types, and patterns that every project in the ecosystem would share. And "canonical types" — types bound through interface augmentation — became the mechanism for working with semantic concepts across different data shapes.

---

## Type Testing Finds Its Home

Meanwhile, I had been carrying around type testing utilities for years. Simple helpers for asserting type relationships at compile time:

```typescript
type Expect<A, B> = A extends B ? true : false
function invariant<_ extends true>(): void {}
```

These utilities were my way of exploiting the Curry-Howard correspondence in everyday code. A type assertion that compiles is a proof that holds. An invariant that fails is a theorem that's false. They were, in a sense, a preview of what Howard would provide more comprehensively.

When I was building Canon, these helpers found their natural home. They were too useful to leave scattered across projects, and they aligned perfectly with Canon's mission: providing canonical tools that every TypeScript project needs but few bother to set up properly.

---

## Type Testing in Practice

Let me show you why these utilities matter.

Consider a simple interface:

```typescript
interface Entity {
  id: string
  type: string
  createdAt: Date
}
```

Somewhere in your codebase, functions depend on these types. Maybe `createdAt.getTime()` is called. Maybe `id` is concatenated with a string. These expectations are implicit — they exist in the code's behavior but aren't written anywhere the compiler can verify intentionally.

Now imagine someone changes `createdAt` to `string` (perhaps after a backend migration). TypeScript catches some errors. But if the dependency is indirect, you might not know until runtime.

Type testing makes expectations explicit:

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// These compile only if the expectations hold
void invariant<Expect<Entity['id'], string>>()
void invariant<Expect<Entity['createdAt'], Date>>()

// Negative assertions work too
void invariant<IsFalse<Expect<Entity['createdAt'], string>>>()
```

If someone changes `createdAt` to `string`, the invariant fails to compile:

```typescript
// Error: Type 'false' does not satisfy the constraint 'true'
void invariant<Expect<Entity['createdAt'], Date>>()
```

The expectation is visible. The compiler enforces it. The documentation cannot lie.

### Zero Cost

The `invariant` function compiles to nothing:

```typescript
function invariant<_ extends true>(): void {}
```

It's an empty function with a constrained generic. At runtime, it does nothing. Any bundler eliminates the call. You're adding compile-time verification with zero runtime overhead.

This is the Curry-Howard correspondence made practical: types as propositions, compilation as proof.

---

## Lazy Typing in Practice

Type testing is useful on its own. But combined with lazy typing, something more powerful emerges.

The problem: you're integrating data from multiple sources, each with its own conventions.

```typescript
// Your internal format
{ id: 'user-123', type: 'User' }

// JSON-LD from an external API  
{ '@id': 'https://example.com/users/123', '@type': 'Person' }

// MongoDB documents
{ _id: '507f1f77bcf86cd799439011', _type: 'user' }
```

The semantic concept — "this entity has an identity" — is the same. Only the shape differs. Traditional solutions involve adapter patterns, union types, or conditional logic. Each has drawbacks: rigidity, complexity, or scattered format-specific code.

Lazy typing inverts the approach. You define the semantic concept once, then register shapes that implement it:

```typescript
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// Register your internal format
declareCanon('Internal', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type' },
  },
})

// Register JSON-LD
declareCanon('JsonLd', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id' },
    Type: { $basis: pojoWithOfType('@type', 'string'), key: '@type' },
  },
})
```

Now write universal functions:

```typescript
import { idOf, typeOf } from '@relational-fabric/canon'

function logEntity(entity) {
  console.log(`[${typeOf(entity)}] ${idOf(entity)}`)
}

// Works with any registered shape
logEntity({ id: 'user-1', type: 'User' })
logEntity({ '@id': 'https://...', '@type': 'Person' })
logEntity({ _id: 'abc123', _type: 'Document' })
```

One function. Multiple shapes. No conditionals.

---

## The Connection

Type testing and lazy typing reinforce each other.

Lazy typing builds a system of type relationships — axioms mapped to shapes, shapes satisfying constraints. These relationships need verification. Type testing provides that:

```typescript
import type { Expect, Satisfies } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// Verify our shapes satisfy the Id axiom correctly
void invariant<Expect<Satisfies<'Id', 'Internal'>, { id: string }>>()
void invariant<Expect<Satisfies<'Id', 'JsonLd'>, { '@id': string }>>()
```

Type tests document exactly what the lazy typing system guarantees. If someone misconfigures a canon, the invariants catch it at compile time.

Both techniques exploit the same insight from the Curry-Howard correspondence: **types are propositions, and compilation is proof**. Type testing makes propositions explicit. Lazy typing makes them configurable. Together, they let you build systems that are both flexible and provably correct.

---

## The Name

Why "Canon"?

The word has two relevant meanings. A **canon** is an authoritative collection — the canonical works, the accepted foundation. Canon is exactly that: a canonical starting point for TypeScript projects, with curated configurations and common patterns.

But "canonical" also means **the standard form** — the way something should properly be represented. Canonical types are the type-level expression of semantic concepts, independent of any particular shape. They're the standard against which specific implementations are measured.

(And in music, a canon is where multiple voices sing the same melody, offset in time. Different voices, same underlying pattern. Different shapes, same semantic meaning.)

---

## Getting Started

```bash
npm install @relational-fabric/canon
```

### Type Testing

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface Config {
  apiUrl: string
  timeout: number
}

// Document and enforce type expectations
void invariant<Expect<Config['apiUrl'], string>>()
void invariant<Expect<Config['timeout'], number>>()
void invariant<IsFalse<Expect<Config['timeout'], string>>>()
```

### Lazy Typing

```typescript
import type { Canon, Satisfies } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

// Define your canon type
type MyCanon = Canon<{
  Id: { $basis: { id: string }; key: 'id' }
}>

// Register with module augmentation
declare module '@relational-fabric/canon' {
  interface Canons { My: MyCanon }
}

// Declare runtime configuration  
declareCanon('My', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
  },
})

// Write universal code
function process<T extends Satisfies<'Id'>>(entity: T) {
  return `Processing: ${idOf(entity)}`
}
```

---

## What's Next

Canon is the foundation, but it's part of a larger vision.

[Howard](https://github.com/RelationalFabric/howard) will provide a full computable truth engine — tools for defining claims about data, composing them into richer propositions, and making the Curry-Howard correspondence practical for everyday TypeScript. It's the logical backbone for making data meaningful.

[Filament](https://github.com/RelationalFabric/relational-fabric) will build on both, providing meta-level primitives for domain-specific abstractions — programming against interfaces that can be implemented later, composing graphs algebraically, preserving semantics across representations.

And the rest of Relational Fabric — Weft, Warp, Shuttle — will provide the higher-level abstractions for queries, data at rest, and coordination.

Canon is where it starts. A canonical beginning.

---

## Conclusion

Canon emerged from years of building the same foundations across different projects. It crystallized when I realized that interface augmentation could enable lazy typing — late-bound types that adapt to registered shapes while maintaining compile-time safety.

Type testing came along because I'd been carrying those utilities for years, and they finally found their proper home. They're the practical application of a deep idea: that types are propositions and compilation is proof.

The result is a library that provides two things every TypeScript project needs:

1. **Type testing** — Write down your type expectations. Let the compiler enforce them. Zero runtime cost.

2. **Lazy typing** — Define semantic concepts. Register shapes that implement them. Write universal code.

Both are expressions of the same philosophy that runs through Relational Fabric: good abstractions serve as the UI of ideas. They make complex systems feel natural. Canon is my attempt to provide that for TypeScript's type system.

---

*Canon is open source at [github.com/RelationalFabric/canon](https://github.com/RelationalFabric/canon). It's part of the [Relational Fabric](https://github.com/RelationalFabric) ecosystem. Feedback and contributions welcome.*
