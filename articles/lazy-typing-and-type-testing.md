# When Types Become Tests: A Journey from Assertions to Abstractions

*How documenting type expectations led me to rethink TypeScript's relationship with data*

---

## Foreword

I want to tell you about a rabbit hole. It started with a simple question — "how do I prove this type is correct?" — and ended with me building a library that changed how I think about TypeScript.

The journey began during a code review. A colleague had changed an interface, and something downstream broke. Not at compile time. At runtime. In production. TypeScript had checked the types, but the *expectations* about those types — the implicit contracts scattered across our codebase — were invisible to the compiler.

I wanted to write those expectations down. To make them explicit. To have the compiler enforce them.

That desire led me to type testing. And type testing, somewhat unexpectedly, led me to lazy typing. This post traces that journey.

---

## The Problem: A Migration Gone Wrong

Let me show you the kind of code that started this. We had an entity system with a simple interface:

```typescript
interface Entity {
  id: string
  type: string
  createdAt: Date
}
```

Scattered throughout the codebase were functions that depended on these types:

```typescript
function logEntity(entity: Entity) {
  console.log(`[${entity.type}] ${entity.id} created at ${entity.createdAt.toISOString()}`)
}

function findById(entities: Entity[], id: string): Entity | undefined {
  return entities.find(e => e.id === id)
}

function sortByCreation(entities: Entity[]): Entity[] {
  return [...entities].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}
```

One day, we migrated to a new backend. The new system returned timestamps as ISO strings, not Date objects. Someone updated the interface:

```typescript
interface Entity {
  id: string
  type: string
  createdAt: string  // Changed from Date
}
```

TypeScript caught some errors. But `sortByCreation` still compiled — `getTime()` doesn't exist on strings, but the error only surfaced at runtime. The implicit expectation that `createdAt` was a Date with methods like `getTime()` and `toISOString()` wasn't written anywhere the compiler could check.

---

## The First Insight: Type Testing

What if we could write down our type expectations explicitly?

I built a small utility:

```typescript
type Expect<A, B> = A extends B ? true : false

function invariant<_ extends true>(): void {}
```

That's it. `Expect<A, B>` returns `true` if A extends B. `invariant` requires its type parameter to be `true`, or it won't compile. Together, they let you write assertions about types:

```typescript
interface Entity {
  id: string
  type: string
  createdAt: Date
}

// Document our expectations explicitly
void invariant<Expect<Entity['id'], string>>()
void invariant<Expect<Entity['type'], string>>()
void invariant<Expect<Entity['createdAt'], Date>>()
```

Now if someone changes `createdAt` to `string`, the invariant fails:

```typescript
// Error: Type 'false' does not satisfy the constraint 'true'
void invariant<Expect<Entity['createdAt'], Date>>()
```

The expectation is visible. The compiler enforces it. The documentation cannot lie.

### Zero Runtime Cost

Here's the beautiful part: `invariant` compiles to nothing. It's an empty function. Any decent bundler eliminates the call entirely. You're adding compile-time checks with zero runtime overhead.

```typescript
// What you write
void invariant<Expect<Entity['id'], string>>()

// What ships to production
// (nothing)
```

### A Testing Vocabulary

Canon (the library this became) provides a small vocabulary for type testing:

```typescript
import type { Expect, IsTrue, IsFalse } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// Positive assertions
void invariant<Expect<string, string>>()           // string extends string ✓
void invariant<Expect<'hello', string>>()          // literal extends string ✓
void invariant<IsTrue<Expect<number, number>>>()   // explicit "must be true"

// Negative assertions  
void invariant<IsFalse<Expect<string, number>>>()  // string does NOT extend number ✓
void invariant<IsFalse<Expect<Date, string>>>()    // Date does NOT extend string ✓
```

I started using these everywhere. Documenting API contracts. Verifying utility types worked correctly. Catching regressions before they reached runtime.

---

## The Second Problem: Same Expectations, Different Shapes

Type testing solved my documentation problem. But it revealed a new pattern.

Our system grew. We started consuming data from external sources. A JSON-LD API. A MongoDB database. A legacy REST endpoint. Each had entities with IDs, types, and timestamps — but expressed differently:

```typescript
// Our internal format
interface InternalEntity {
  id: string
  type: string
  createdAt: Date
}

// JSON-LD from external API
interface JsonLdEntity {
  '@id': string
  '@type': string
  'dcterms:created': string
}

// MongoDB documents
interface MongoEntity {
  _id: string
  _type: string
  created_at: number  // Unix timestamp
}
```

I wrote type tests for each:

```typescript
// Internal
void invariant<Expect<InternalEntity['id'], string>>()
void invariant<Expect<InternalEntity['type'], string>>()

// JSON-LD
void invariant<Expect<JsonLdEntity['@id'], string>>()
void invariant<Expect<JsonLdEntity['@type'], string>>()

// MongoDB
void invariant<Expect<MongoEntity['_id'], string>>()
void invariant<Expect<MongoEntity['_type'], string>>()
```

And then I wrote functions for each:

```typescript
function getInternalId(entity: InternalEntity): string {
  return entity.id
}

function getJsonLdId(entity: JsonLdEntity): string {
  return entity['@id']
}

function getMongoId(entity: MongoEntity): string {
  return entity._id
}
```

I was writing the same expectation three times. The same function three times. The *semantic concept* — "this entity has an identity" — was identical. Only the *shape* differed.

My type tests were telling me something: these types share a deeper structure that TypeScript couldn't see.

---

## The Second Insight: Lazy Typing

What if I could express the semantic expectation once, and let the shape-specific details be configured separately?

This is lazy typing. The term borrows from lazy evaluation — just as lazy evaluation defers computation until needed, lazy typing defers shape binding until runtime, while maintaining compile-time type safety.

The idea has three parts:

### 1. Axioms: Name the Concept

First, declare that a semantic concept exists. Don't say how to find it — just name it.

```typescript
// "There exists a concept called 'Id' that represents identity"
// "There exists a concept called 'Type' that represents classification"
```

Canon provides these as built-in axioms: `Id`, `Type`, `Version`, `Timestamps`, `References`. You can add your own.

### 2. Canons: Teach Shapes the Vocabulary

Next, teach each data shape how it implements the concepts:

```typescript
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// Internal format: 'id' field
declareCanon('Internal', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type' },
  },
})

// JSON-LD: '@id' field
declareCanon('JsonLd', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id' },
    Type: { $basis: pojoWithOfType('@type', 'string'), key: '@type' },
  },
})

// MongoDB: '_id' field
declareCanon('Mongo', {
  axioms: {
    Id: { $basis: pojoWithOfType('_id', 'string'), key: '_id' },
    Type: { $basis: pojoWithOfType('_type', 'string'), key: '_type' },
  },
})
```

### 3. Universal Functions: Write Once

Now write functions that work with the concept, not any specific shape:

```typescript
import { idOf, typeOf } from '@relational-fabric/canon'

// One function that works with ALL shapes
function logEntity(entity) {
  console.log(`[${typeOf(entity)}] ${idOf(entity)}`)
}

logEntity({ id: 'user-1', type: 'User' })           // [User] user-1
logEntity({ '@id': 'https://...', '@type': 'Person' })  // [Person] https://...
logEntity({ _id: 'abc123', _type: 'Document' })     // [Document] abc123
```

No conditionals. No adapters. Canon detects which shape you have and extracts values accordingly.

---

## The Connection: Type Tests for Lazy Types

Here's where it comes together. Type testing and lazy typing reinforce each other.

With lazy typing, you're building a system of type relationships — axioms that map to shapes, shapes that satisfy constraints. These relationships need verification. Type testing provides exactly that:

```typescript
import type { Expect, Satisfies } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

// Verify that our shapes satisfy the Id axiom
void invariant<Expect<Satisfies<'Id', 'Internal'>, { id: string }>>()
void invariant<Expect<Satisfies<'Id', 'JsonLd'>, { '@id': string }>>()
void invariant<Expect<Satisfies<'Id', 'Mongo'>, { _id: string }>>()

// Verify that idOf returns a string
void invariant<Expect<ReturnType<typeof idOf>, string>>()
```

The type tests document exactly what the lazy typing system guarantees. If someone misconfigures a canon or changes an axiom, the invariants catch it at compile time.

---

## Why "Canon"?

The name comes from **canonical forms** — the authoritative representation of something. In mathematics, you reduce expressions to canonical form to compare them. In music, a canon is where multiple voices sing the same melody, offset in time — different voices, same underlying pattern.

That's the core idea: different data shapes expressing the same semantic meaning, with a system that understands the equivalence.

---

## Practical Patterns

### Type Testing Without Lazy Typing

You don't need lazy typing to benefit from type testing. Use it anywhere you have implicit type expectations:

```typescript
// API contract documentation
interface UserResponse {
  user: { id: string; email: string }
  token: string
}

void invariant<Expect<UserResponse['token'], string>>()
void invariant<Expect<UserResponse['user']['id'], string>>()

// Utility type verification
type NonEmpty<T> = [T, ...T[]]
void invariant<Expect<NonEmpty<string>, [string, ...string[]]>>()

// Guard against accidental 'any'
type IsAny<T> = 0 extends 1 & T ? true : false
void invariant<IsFalse<IsAny<UserResponse>>>()
```

### Lazy Typing for Integration Boundaries

Lazy typing shines at integration boundaries — where your internal world meets external data:

```typescript
import { idOf, typeOf, Satisfies } from '@relational-fabric/canon'

// This function works with data from ANY registered source
async function syncEntity<T extends Satisfies<'Id'> & Satisfies<'Type'>>(
  entity: T,
  destination: Database
) {
  const id = idOf(entity)
  const type = typeOf(entity)
  
  await destination.upsert(type, id, entity)
}

// Call it with any shape
await syncEntity(internalUser, db)
await syncEntity(jsonLdPerson, db)
await syncEntity(mongoDocument, db)
```

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

// Document and enforce expectations
void invariant<Expect<Config['apiUrl'], string>>()
void invariant<Expect<Config['timeout'], number>>()
void invariant<IsFalse<Expect<Config['timeout'], string>>>()
```

### Lazy Typing

```typescript
import type { Canon, Satisfies } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

type MyCanon = Canon<{
  Id: { $basis: { id: string }; key: 'id' }
}>

declare module '@relational-fabric/canon' {
  interface Canons { My: MyCanon }
}

declareCanon('My', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
  },
})

// Now idOf works with your shape
idOf({ id: 'user-123' })  // "user-123"
```

---

## Conclusion

This journey started with a runtime error that should have been caught at compile time. It led me to type testing — making type expectations explicit and verifiable. And type testing revealed a deeper pattern: semantic expectations repeated across different shapes, begging to be unified.

Lazy typing is that unification. It separates what you mean (semantic concepts) from how data expresses it (shapes), letting you write universal code that works across all of them.

The two ideas reinforce each other. Type testing documents expectations. Lazy typing abstracts them. Together, they give you TypeScript code that's more honest about what it assumes and more flexible about what it accepts.

That's Canon: a library born from wanting types that could be tested and abstractions that could adapt. I hope it proves useful in your own journey.

---

*Canon is open source at [github.com/RelationalFabric/canon](https://github.com/RelationalFabric/canon). Feedback and contributions welcome.*
