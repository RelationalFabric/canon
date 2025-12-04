# Late-Bound Types and Compile-Time Proofs: The Canon Way

*A canonical foundation for building data-centric applications*

---

## The Long Road to Canon

Every developer has patterns they carry from project to project. Code that gets rewritten, refined, and eventually ossified into muscle memory. For me, that pattern was a set of data abstractions: ways of thinking about identity, types, relationships, and change over time.

After building these abstractions across enough projects, I decided to give them a proper home. That became [Relational Fabric](https://github.com/RelationalFabric), an organization dedicated to unlocking the composable pieces that make sophisticated data systems accessible. The core belief: the true power of data lies in its relationships, its interconnectedness, and its ability to be composed into something greater.

The vision crystallized around a metaphor: **weaving**. Just as fabric emerges from the interplay of threads, meaningful data systems emerge from the interplay of relationships. The plan is a family of libraries named for the parts of a loom:

- **Filament**: the thin threads that form the basis, providing meta-level primitives for building domain-specific abstractions
- **Weft**: the horizontal threads, handling navigation and query construction  
- **Warp**: the vertical threads, managing data at rest
- **Shuttle**: the device that carries thread through the loom, coordinating flow between systems

But when I sat down to start building Filament (the foundational layer) I realized I was missing something more fundamental.

---

## The Missing Primitive: A Logical Engine

Much of what Relational Fabric needed to do was *logical reasoning at runtime*: making claims about data, composing those claims, and verifying them. Filament's job was to provide primitives that preserve meaning, defer implementation decisions, and evolve gracefully. But that required a foundation for logical reasoning itself.

This led me to [Howard](https://github.com/RelationalFabric/howard), named after William Alvin Howard, the mathematician who formalized the [Curry-Howard correspondence](https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence) in his 1969 paper.

The Curry-Howard correspondence is a profound insight: **programs are proofs, and types are propositions**. Writing a program that satisfies a type is structurally identical to constructing a proof for a logical proposition. A type that compiles is a theorem that holds.

Since "Curry" has already been immortalized in programming (via currying), naming the library after Howard felt right. Howard would be a computable truth engine: the logical backbone for making data meaningful.

But Howard isn't just about types. It's about **claims**: first-class objects that formalize assertions about data:

```typescript
// Howard lets you define claims that compose
const HasCart = claims({ guards: { hasCart } })
const AUserWithCart = aUser.and(HasCart)

// And prove them, getting explanations not just booleans
const proof = prove(AUserWithCart, myUser)
console.log(proof.result)           // true or false
console.log(proof.explanation.human()) // why
```

Howard transforms simple boolean checks into verifiable, composable, cacheable proofs. When you prove a claim, you get an immutable record of the evaluation: not just the result, but the reasoning. This is Curry-Howard made practical for runtime logic.

But as I sketched Howard's foundations, I hit a problem.

---

## The Reusable Claims Problem

Consider writing an `isUser` claim that checks whether something has an identity and an email address:

```typescript
const isUser = hasIdentity.and(hasEmail)
```

Simple enough. But then you realize your system has multiple data representations:

```typescript
{ id: 'user-123', email: 'alice@example.com' }        // internal
{ '@id': 'https://...', 'schema:email': 'alice@...' } // JSON-LD
{ _id: '507f1f77bcf86c', email: 'alice@example.com' } // MongoDB
```

Now what? The `hasIdentity` claim needs to check for `id` in one format, `@id` in another, `_id` in a third. You have two options:

1. Make the claims equivalent (write format-aware claims that handle all variations)
2. Make the data equivalent (normalize to canonical concepts)

Option one leads to claims riddled with conditionals, or separate claims for each format. Neither composes well. Option two means establishing canonical representations that claims can target uniformly.

I chose the latter. But "make the data equivalent" can mean two different things:

**Canonical form** (normalised notation): Transform all data to a single representation. Every object gets an `id` field, period. This requires conversion at system boundaries and loses information about origin.

**Canonical API** (normalised access): Keep data in its original shape, but provide uniform access to semantically equivalent concepts. The data stays as `@id` or `_id`, but `idOf(obj)` works on all of them.

In some languages, function application and associative access are equivalent: `(:id obj)` in Clojure, for instance, blurs the line between "get the id property" and "apply the id function." That equivalence hints at something deeper: if access can be a function, then normalising access is as good as normalising data.

Canon takes the second path. It provides canonical APIs, not canonical forms. The data stays native to its source; only the access is unified.

---

## The Empty Room Problem

There was another frustration running in parallel. Every time I started a new TypeScript project, whether for Relational Fabric or anything else, I did the same things:

- Set up the same TypeScript configuration
- Install the same ESLint setup  
- Add the same utility types
- Define the same base interfaces
- Wire up the same scripts

I was solving the same "empty room" problem repeatedly. And more than that, I kept defining the same *semantic concepts*: identity, type classification, versioning, timestamps. Just with slightly different field names depending on the project or data source.

The reusable claims problem and the empty room problem pointed to the same solution: a canonical starting point that established shared semantic concepts across different data shapes.

That's what birthed Canon.

---

## Canon: The Canonical Starting Point

Canon's description says it plainly: *"The foundational library for a useful type ecosystem. A canonical source of truth that solves common design problems and enables seamless composition for any project."*

Canon provides:

- **Curated configurations**: TypeScript and ESLint setups that embody best practices
- **Canon Kit**: A curated set of third-party libraries (object-hash, immutable.js, defu, consola, fs-extra, ts-morph, and more) with an opinionated API surface, plus transparent access to the underlying libraries when you need it
- **Type testing utilities**: Compile-time assertions that exploit Curry-Howard at the type level
- **Lazy typing**: Late-bound types through interface augmentation

The Kit means you're not just getting configurations; you're getting a known-good set of dependencies with consistent versioning and a thoughtfully curated API. Canon itself uses the Kit internally whenever it needs these capabilities, so you're getting what we actually use, not just what we think might be useful. The transparent access paths (`@relational-fabric/canon/_/immutable`, etc.) ensure you can always reach the full library when the opinionated surface isn't enough.

But for this article, the focus is on lazy typing and type testing. That's where the conceptual weight lies.

---

## The Insight: Interface Augmentation and Lazy Types

TypeScript's module augmentation lets you extend interfaces across module boundaries:

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

This enables **lazy typing** (or late-bound typing). The library doesn't need to know about your specific data shapes at compile time. You register them later, and the type system adapts.

I could define semantic concepts ("there exists a notion of identity") and let individual projects bind those concepts to their specific shapes. The same `idOf()` function could work with `id`, `@id`, or `_id` depending on what canons were registered.

Canon became Relational Fabric's canonical starting point. And "canonical types" (types bound through interface augmentation) became the mechanism for working with semantic concepts across different data shapes.

---

## Type Testing: Curry-Howard at Compile Time

Howard applies Curry-Howard at runtime: claims about data become proofs you can inspect. Canon applies the same insight at compile time: type assertions become propositions the compiler proves.

The utilities are simple:

```typescript
type Expect<A, B> = A extends B ? true : false
function invariant<_ extends true>(): void {}
```

`Expect<A, B>` returns `true` if A extends B. `invariant` requires its type parameter to be `true`, or it won't compile. Together, they let you write assertions about types:

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface Entity {
  id: string
  createdAt: Date
}

// These compile only if the expectations hold
void invariant<Expect<Entity['id'], string>>()
void invariant<Expect<Entity['createdAt'], Date>>()

// Negative assertions
void invariant<IsFalse<Expect<Entity['createdAt'], string>>>()
```

If someone changes `createdAt` to `string`, the invariant fails to compile. The expectation is visible. The compiler enforces it. The documentation cannot lie.

### Zero Cost

The `invariant` function compiles to nothing:

```typescript
function invariant<_ extends true>(): void {}
```

At runtime, it does nothing. Any bundler eliminates the call. You're adding compile-time verification with zero runtime overhead.

This is the same Curry-Howard insight that drives Howard, but applied at the type level: types as propositions, compilation as proof.

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

The semantic concept ("this entity has an identity") is the same. Only the shape differs.

Lazy typing lets you define the semantic concept once, then register shapes that implement it:

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
```

One function. Multiple shapes. No conditionals.

---

## The Connection

Type testing and lazy typing reinforce each other.

Lazy typing builds a system of type relationships: axioms mapped to shapes, shapes satisfying constraints. Type testing verifies those relationships:

```typescript
import type { Expect, Satisfies } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// Verify our shapes satisfy the Id axiom correctly
void invariant<Expect<Satisfies<'Id', 'Internal'>, { id: string }>>()
void invariant<Expect<Satisfies<'Id', 'JsonLd'>, { '@id': string }>>()
```

Type tests document exactly what the lazy typing system guarantees. If someone misconfigures a canon, the invariants catch it at compile time.

---

## The Names Tell the Story

The names in Relational Fabric aren't arbitrary. They form a coherent metaphor:

**Canon**: the authoritative collection, the canonical starting point. Also the standard form against which variations are measured. And in music, multiple voices singing the same melody, offset in time. Different shapes, same semantic meaning.

**Howard**: William Alvin Howard, who formalized the correspondence between logic and types. The logical engine that makes claims first-class.

**Filament**: the thin threads that form the basis of fabric. The meta-level primitives everything else builds on.

**Weft** and **Warp**: the horizontal and vertical threads in weaving. Query and storage.

**Shuttle**: the device that carries thread through the loom. Coordination and flow.

You're weaving a fabric of data relationships. Canon provides the starting thread.

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

[Howard](https://github.com/RelationalFabric/howard) is the logical engine: a computable truth engine where claims about data become first-class objects that can be composed, proven, and cached. It's Curry-Howard made practical for runtime logic.

[Relational Fabric](https://github.com/RelationalFabric/relational-fabric) weaves it all together: Filament for meta-level primitives, Weft for queries, Warp for storage, Shuttle for coordination. Each library handles its concerns while integrating naturally with the others.

Canon is where it starts. The canonical thread from which the fabric is woven.

---

## Conclusion

Canon emerged from years of building the same foundations across different projects. It crystallized when I realized that interface augmentation could enable lazy typing: late-bound types that adapt to registered shapes while maintaining compile-time safety.

Type testing came along because those utilities embody the same insight that drives Howard: types are propositions, and compilation is proof. They're the practical application of Curry-Howard at the type level.

The result is a library that provides two things every TypeScript project needs:

1. **Type testing**: Write down your type expectations. Let the compiler enforce them. Zero runtime cost.

2. **Lazy typing**: Define semantic concepts. Register shapes that implement them. Write universal code.

Both are expressions of the same philosophy that runs through Relational Fabric: good abstractions serve as [the UI of ideas](https://levelup.gitconnected.com/understanding-abstractions-baa3d5347b0d). They make complex systems feel natural. Canon is my attempt to provide that for TypeScript's type system.

---

*Canon is open source at [github.com/RelationalFabric/canon](https://github.com/RelationalFabric/canon). It's part of the [Relational Fabric](https://github.com/RelationalFabric) ecosystem. Feedback and contributions welcome.*
