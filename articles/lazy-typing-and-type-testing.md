# Lazy Typing and Type Testing: Two Ideas That Changed How I Write TypeScript

*Introducing Canon — a library for writing type-safe code against semantic concepts, and proving your types are correct at compile time*

---

## Foreword

This post is about two ideas that emerged from the same frustration but solve different problems. Both changed how I think about TypeScript.

The first idea — **lazy typing** — came from building a data integration layer that consumed data from three sources: our internal API (using `id`), a JSON-LD endpoint (using `@id`), and MongoDB (using `_id`). The semantic concept was identical — a unique identifier — yet I was writing the same logic three times with slight variations for each field name.

The second idea — **type testing** — came later, when I realized that the type relationships I was building were invisible. They existed only in my head and in TypeScript's compiler. If someone broke them, we wouldn't know until something failed at runtime. I wanted a way to write down type expectations and have the compiler enforce them.

Both ideas are now part of Canon, a TypeScript library I built to address these frustrations. This post introduces both.

---

## Part One: The Shape Problem and Lazy Typing

### The Problem

If you've worked with TypeScript on any non-trivial project, you've encountered this tension: TypeScript wants to know the exact shape of your data, but the real world keeps handing you the same information in different shapes.

Consider something as fundamental as an identifier:

```typescript
{ id: 'user-123' }           // Your internal format
{ '@id': 'https://...' }     // JSON-LD from an external API
{ _id: '507f1f77bcf86c' }    // MongoDB documents
```

These are all expressing the same idea: *this entity has a unique identity*. Yet from TypeScript's perspective, they are entirely different types. If you want a function that extracts the ID from any of these, you're pushed toward:

```typescript
function getId(entity: unknown): string {
  if ('id' in entity) return entity.id
  if ('@id' in entity) return entity['@id']
  if ('_id' in entity) return entity._id
  throw new Error('No ID found')
}
```

This is **eagerly coupled**. The function must know, at the moment of writing, every possible shape it might encounter. Add a new data source, and you're back modifying the function. This doesn't scale.

### The Solution: Lazy Typing

Lazy typing inverts this relationship. Instead of writing code that knows about all possible shapes upfront, you write code against **semantic concepts** and defer the shape-specific details to configuration.

The term "lazy" borrows from lazy evaluation in functional programming. Just as lazy evaluation defers computation until needed, lazy typing defers shape binding until runtime — while maintaining full type safety at compile time.

**Traditional (eager) typing**: "This function accepts objects with an `id` field that is a string."

**Lazy typing**: "This function accepts any object that has the concept of identity, however that might be expressed."

### How Canon Implements Lazy Typing

Canon implements lazy typing through three ideas:

**Axioms** declare that semantic concepts exist. They don't say how to find them — they just establish the vocabulary. Canon provides core axioms like `Id`, `Type`, `Version`, `Timestamps`, and `References`.

**Canons** teach shapes to speak the language. Each canon describes how a particular data format implements the axioms:

```typescript
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// Your internal format uses 'id'
declareCanon('Internal', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
    },
  },
})

// JSON-LD uses '@id'
declareCanon('JsonLd', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('@id', 'string'),
      key: '@id',
    },
  },
})
```

**Universal functions** work with any registered canon:

```typescript
import { idOf } from '@relational-fabric/canon'

idOf({ id: 'user-123' })                              // "user-123"
idOf({ '@id': 'https://example.com/person/456' })     // "https://..."  
idOf({ _id: '507f1f77bcf86cd799439011' })             // "507f1f..."
```

One function. Three shapes. No conditionals. Canon detects which canon matches and extracts the value accordingly — with full type safety at compile time.

---

## Part Two: The Invisible Contract Problem and Type Testing

### A Different Problem

Lazy typing solved my shape problem, but building it surfaced a new frustration: type relationships are invisible.

Consider a simple interface:

```typescript
interface User {
  id: string
  email: string
  role: 'admin' | 'user' | 'guest'
}
```

Somewhere in your codebase, you might have logic that depends on `role` being one of those three values. Maybe a function that routes admin users differently. Maybe a type guard. Maybe a conditional render.

Now imagine someone adds `'superadmin'` to the union. Or changes `id` from `string` to `number`. TypeScript will catch some errors — but only where the types flow directly. If the dependency is implicit or indirect, you might not know until runtime.

The problem is that **type expectations are invisible**. They exist in the compiler's analysis, but they're not written down anywhere a human (or the compiler) can verify intentionally.

### The Solution: Type Testing

Type testing makes type expectations explicit and verifiable. Canon provides utilities that let you write assertions about types that are checked at compile time:

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface User {
  id: string
  role: 'admin' | 'user' | 'guest'
}

// Assert: User's id must be a string
void invariant<Expect<User['id'], string>>()

// Assert: User's role must NOT be a number
void invariant<IsFalse<Expect<User['role'], number>>>()

// Assert: User's role must extend this exact union
void invariant<Expect<User['role'], 'admin' | 'user' | 'guest'>>()
```

### How It Works

The magic is in `invariant`'s signature:

```typescript
function invariant<_ extends true>(): void {}
```

The generic parameter must extend `true`. If you pass anything else — including `false` — TypeScript refuses to compile.

`Expect<A, B>` returns `true` if `A extends B`, otherwise `false`. So `invariant<Expect<User['id'], string>>()` compiles only if `User['id']` extends `string`.

At runtime, `invariant` does nothing. It compiles to an empty function call that any bundler will eliminate. The cost is zero. But at compile time, it enforces your type expectations.

### Why This Matters

Traditional unit tests verify runtime behavior. But type relationships exist only at compile time — they're erased before your code runs. You need a different kind of test.

Type tests give you:

**Verification** — They catch type regressions immediately. Change `User['id']` to `number`, and every invariant that expects `string` fails to compile.

**Documentation** — They explicitly state what must be true. Reading `void invariant<Expect<User['id'], string>>()` tells you exactly what the code expects.

**Continuous enforcement** — They run every time you run `tsc`. Not when someone remembers to run tests. Every compile. Automatically.

### Practical Patterns

**Documenting API contracts:**

```typescript
interface ApiResponse {
  data: User[]
  meta: { total: number; page: number }
}

// These expectations are now explicit and enforced
void invariant<Expect<ApiResponse['data'], User[]>>()
void invariant<Expect<ApiResponse['meta']['total'], number>>()
```

**Verifying type utilities work correctly:**

```typescript
type NonEmptyArray<T> = [T, ...T[]]
type ElementOf<T> = T extends Array<infer E> ? E : never

// Prove the utility types behave as expected
void invariant<Expect<ElementOf<string[]>, string>>()
void invariant<Expect<NonEmptyArray<number>, [number, ...number[]]>>()
```

**Guarding against accidental `any`:**

```typescript
type IsAny<T> = 0 extends 1 & T ? true : false

// Fail compilation if this type becomes 'any'
void invariant<IsFalse<IsAny<User['id']>>>()
```

**Negative assertions:**

```typescript
// Prove these types are NOT compatible
void invariant<IsFalse<Expect<string, number>>>()
void invariant<IsFalse<Expect<{ id: string }, { id: number }>>>()
```

---

## Why "Canon"?

The name comes from **canonical forms** — the authoritative, standard representation of something. In music, a canon is a piece where multiple voices sing the same melody, offset in time. Each voice is different, yet they're all expressions of the same underlying pattern.

That's exactly what we're doing with data shapes: different structures, same semantic meaning.

---

## When to Reach for Canon

**For lazy typing:**
- You integrate data from multiple external sources
- You support multiple API versions simultaneously  
- You're building libraries that work with diverse data shapes
- You want format-agnostic business logic

**For type testing:**
- You want to document type expectations explicitly
- You're building a library where type contracts matter
- You've been burned by type regressions
- You want compile-time verification, not just runtime tests

**Consider alternatives when:**
- You control all data producers and consumers
- Performance is critical and you can't afford runtime detection
- The added indirection would obscure simple logic

---

## Getting Started

```bash
npm install @relational-fabric/canon
```

### Lazy Typing Example

```typescript
import type { Canon, Satisfies } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

// Define and register your canon
type MyCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    My: MyCanon
  }
}

declareCanon('My', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
    },
  },
})

// Write universal code
function processEntity<T extends Satisfies<'Id'>>(entity: T) {
  return `Processing: ${idOf(entity)}`
}

processEntity({ id: 'user-123' })  // Works!
```

### Type Testing Example

```typescript
import type { Expect, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface Config {
  apiUrl: string
  timeout: number
  retries: number
}

// Document and enforce your type expectations
void invariant<Expect<Config['apiUrl'], string>>()
void invariant<Expect<Config['timeout'], number>>()
void invariant<IsFalse<Expect<Config['retries'], string>>>()

// If anyone changes these types incorrectly, compilation fails
```

---

## Conclusion

Lazy typing and type testing emerged from different frustrations but share a common theme: making the implicit explicit.

Lazy typing makes the relationship between semantic concepts and data shapes explicit and configurable. Instead of scattering format-specific logic throughout your codebase, you declare it once and write universal code.

Type testing makes type expectations explicit and verifiable. Instead of hoping type relationships hold, you write them down and the compiler enforces them on every build.

Together, they give you TypeScript code that's more flexible, more robust, and more honest about what it expects. That's what I wanted when I started building Canon. I hope it helps you too.

---

*Canon is open source at [github.com/RelationalFabric/canon](https://github.com/RelationalFabric/canon). Contributions and feedback are welcome.*
