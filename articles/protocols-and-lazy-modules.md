# The Return to Canon: Why Your Code is Too Structure-Aware

## Moving from "Infrastructures of Suspicion" to the Universal API

I promised two follow-up articles to my recent work on [Howard's claims system](https://github.com/RelationalFabric/howard) and [Canon's lazy typing](https://levelup.gitconnected.com/the-end-of-disposable-code-how-i-built-universal-apis-in-typescript-618b3ed38302). I promised Fast Value Hashing and Object Metadata—the pieces that make proofs persistent and eliminate what I called the "Logical Tax."

This isn't those articles. Instead, I've realized we need to address a deeper architectural debt. Before we can talk about hashing or metadata, we have to talk about the two patterns that emerged from their foundations: Protocols and Lazy Modules. I've spent years wishing for a way to write code that doesn't care if it's looking at a Map, a JSON-LD object, or a SQL Row. These aren't just 'features'; they are the infrastructure required to stop writing disposable code.

Together, they enable a class of universal APIs that I believe will become central to how we build composable systems.

### The Problem: Decoupling Operations from Structures

There's a specific 'ick' in our industry: Structure-Awareness. We write a 'Validator' (a term that gives me the ick) that knows exactly where an id field is in a POJO. Then we want to use that same logic on a Map. Suddenly, we're writing `if (data instanceof Map) ... else ...` all over the codebase. Greenspun's Tenth Rule isn't just a joke to me; it's been the roadmap of my career. When I built Cosy Lang 13 years ago, I was explicitly trying to avoid the 'ad-hoc' trap by bringing formal protocols and lazy sequences to CoffeeScript. Today, seeing developers still manually re-implementing sequence logic for every new data structure gives me the ick. We've had the answer for decades—it's time we brought it to our core TypeScript infrastructure.

Consider key-based access. You might have:

```typescript
const obj = { name: 'Alice', age: 30 }
const map = new Map([['name', 'Alice'], ['age', 30]])
const immutable = Immutable.Map({ name: 'Alice', age: 30 })
```

Accessing a value requires different APIs: `obj.name`, `map.get('name')`, `immutable.get('name')`. You end up writing:

```typescript
function getName(data: unknown): string | undefined {
  if (data instanceof Map) {
    return data.get('name')
  }
  if (Immutable.Map.isMap(data)) {
    return data.get('name')
  }
  if (typeof data === 'object' && data !== null) {
    return (data as Record<string, unknown>).name
  }
  return undefined
}
```

This is the same problem Canons solve, but for operations rather than data extraction. We need a way to define operations that multiple types can implement, enabling polymorphic code that works across structures.

---

### Protocols: Operations as First-Class Citizens

I've always viewed the Curry-Howard Correspondence as a guiding principle: programs are proofs, and types are propositions. If a type is a proposition, then an operation should be a Protocol. By moving to `Satisfies<Protocol<Associative>>`, your logic for extracting an ID doesn't care if it's hitting a key in a JSON object or a method on a Class. We move from an 'Infrastructure of Suspicion'—constantly checking types—to a 'Fabric of Proof' where the behavior is guaranteed by the protocol dispatch.

The inspiration comes from Clojure's protocol system, which I referenced when building Howard. Clojure protocols define sets of operations that types can implement. They dispatch based on the type of the first argument, allowing you to extend types without modifying their original definitions.

Canon's protocol system brings this pattern to TypeScript. Protocols define operations, not data extraction. Think of them as interfaces that can be implemented by any type after the fact—you don't need to modify the original type to add protocol support.

#### Defining a Protocol

Protocols are defined using `defineProtocol()`. Each method gets a documentation string that describes its purpose. The type parameter is required—it defines the protocol interface.

Protocol definitions should be separated from their implementations. Here's how to define a protocol in its own module:

```typescript
// path/to/seq.ts
import { defineProtocol } from '@relational-fabric/canon'
import type { Protocol, Satisfies } from '@relational-fabric/canon'

export interface Seq<T = unknown> {
  first: (seq: Seq<T>) => T | undefined
  rest: (seq: Seq<T>) => Seq<T>
  isEmpty: (seq: Seq<T>) => boolean
}

export const PSeq = defineProtocol<Seq>({
  first: 'Returns the first item of the sequence',
  rest: 'Returns the rest of the sequence after the first item',
  isEmpty: 'Returns true if the sequence is empty',
})

export type SeqProtocol<T = unknown> = Protocol<Seq<T>>
export type Seqable<T = unknown> = Satisfies<SeqProtocol<T>>

// Register PSeq as an axiom for use with Satisfies
declare module '@relational-fabric/canon' {
  interface Axioms {
    PSeq: SeqProtocol
  }
}
```

The naming convention uses a `P` prefix for protocol values (like `PSeq` for a sequence protocol). This distinguishes them from TypeScript interfaces (which would be `Seq`) and avoids confusion with other naming patterns. The protocol identifier is the source of truth for the protocol's identity.

#### Extending Protocols

Use `extendProtocol()` to add implementations for specific types. Implementations are typically defined in separate modules that import the protocol:

```typescript
// path/to/seq-implementations.ts
import { PSeq } from 'path/to/seq'
import { extendProtocol } from '@relational-fabric/canon'

// Extend Array to implement PSeq
extendProtocol(PSeq, Array, {
  first: arr => arr[0],
  rest: arr => arr.slice(1),
  isEmpty: arr => arr.length === 0,
})

// Extend String to implement PSeq
extendProtocol(PSeq, String, {
  first: str => str[0],
  rest: str => str.slice(1),
  isEmpty: str => str.length === 0,
})

// Extend Object (for Iterables) to implement PSeq
extendProtocol(PSeq, Object, {
  first: iter => {
    const result = (iter as Iterable<unknown>)[Symbol.iterator]().next()
    return result.done ? undefined : result.value
  },
  rest: iter => {
    const iterator = (iter as Iterable<unknown>)[Symbol.iterator]()
    iterator.next() // skip first
    return Array.from(iterator)
  },
  isEmpty: iter => {
    const result = (iter as Iterable<unknown>)[Symbol.iterator]().next()
    return result.done === true
  },
})
```

Now we can write polymorphic code that works with any sequence type. Usage code imports the protocol and types:

```typescript
// path/to/usage.ts
import { PSeq } from 'path/to/seq'
import type { Seqable } from 'path/to/seq'

const { first, rest, isEmpty } = PSeq

const numbers = [1, 2, 3, 4, 5]
const firstNumber = first(numbers) // 1

const greeting = 'Hello'
const firstChar = first(greeting) // 'H'

const set = new Set([1, 2, 3, 4, 5])
const firstSetItem = first(set) // 1

function take<T extends Seqable>(seq: T, n: number): unknown[] {
  const result: unknown[] = []
  let current: unknown = seq

  for (let i = 0; i < n && !isEmpty(current); i++) {
    result.push(first(current))
    current = rest(current)
  }

  return result
}

take([1, 2, 3, 4, 5], 3) // [1, 2, 3]
take('Hello', 3) // ['H', 'e', 'l']
take(new Set([1, 2, 3, 4, 5]), 3) // [1, 2, 3]
```

The `take` function works with arrays, strings, and any other type that implements the sequence protocol. No conditional logic. No type checking. Just polymorphic dispatch.

Notice that in the `extendProtocol` calls, we don't need to manually type the parameters. TypeScript infers the method signatures from the protocol interface, so we can write `arr => arr[0]` instead of `(arr: unknown) => (arr as unknown[])[0]`. The type system does the work for us.

#### Dispatch Efficiency

Protocol dispatch is O(1). Each protocol gets a unique identifier, and implementations are stored directly on constructor prototypes. When you call `PSeq.first(value)`, the system:

1. Gets the protocol identifier
2. Looks up the implementation on the value's constructor prototype
3. Calls the implementation with the value as the first argument

No iteration through implementations. No runtime type checking. Just direct property access.

I didn't arrive at this realization yesterday. In an amusingly over-engineered chapter of my past, I actually tried to solve this 13 years ago with something called Cosy Lang—a project where I tried to force-feed Clojure's soul into CoffeeScript. It was a hell of a learning experience, but it was also a perfect example of Greenspun's Tenth Rule in action: I was building an ad-hoc, informally-specified implementation of the very logic I'm finally formalizing now. It's a bit of a laugh now, but the fact that I'm still using those implementation notes today tells you how persistent this 'Structure-Awareness' problem really is.

This design is inspired by [Cosy Lang's protocol implementation](https://raw.githubusercontent.com/getcosy/lang/refs/heads/master/src/protocol.coffee), which demonstrated that efficient protocol dispatch is achievable in dynamic languages. The difference is that Canon formalizes what Cosy Lang stumbled into.

---

### The Next Problem: Implementation Selection

Protocols solve operation independence. But there's another problem: sometimes you need multiple implementations of the same operation with different characteristics.

Lazy Modules extend the "lazy" philosophy: if a sequence is 'lazy' because it defers the work, a module is 'lazy' because it defers the implementation. We wait until the very last second to decide how to execute a proof, ensuring we use the most efficient 'loom' the environment provides.

You might need native bindings for performance, but they're only available on specific platforms. You might need WASM modules that work in browsers but not Node.js. You might need x86-optimised code that breaks on ARM architectures.

I've lost count of how many times I've built something on my Mac, watched it work perfectly, then had CI fail because the build environment is different. Native bindings that work on ARM don't exist for x86. WASM modules that work locally can't be found in a serverless environment. "It worked on my machine" becomes "it literally can't work on that machine."

This is especially painful with bundlers like Rollup or Vite. Everything works locally because your machine has the native bindings. Then you deploy, and the production environment doesn't have them. The build fails, or worse, it succeeds but the runtime crashes when it tries to load a missing native module.

The challenge: how do you select the best available implementation while guaranteeing something always works?

### Lazy Modules: Capability-Based Selection

As my colleagues will tell you, the 'Logical Tax'—the computational cost of proving a claim at runtime—is the biggest barrier to adoption. To eliminate this tax, we need the fastest possible implementations: WASM for the browser, native C++ for Node.js. But I refuse to make the developer manually select these. The Lazy Module Pattern introduces a capability-based selection system. A pure JS fallback always scores a -0.1—it's the choice of last resort. We aren't just asserting types; we are asserting that the environment can handle the proof at peak efficiency.

The pattern is inspired by plugin systems: implementations register themselves without modifying the core module, and selection happens based on what each implementation claims to support.

#### The Solution: Capability-Based Selection

Each implementation returns a score representing both capability and quality. The system picks the highest-scoring implementation that can satisfy the request.

The scoring values:

- `undefined` → not supported (excluded from selection)
- `-1.0` to `<-0.1` → works but risky or unstable (last resort only)
- `-0.1` → pure JS fallback (always available)
- `0.0` → baseline
- `0.0` to `1.0` → better (higher is better, `1.0` = optimal)

Every lazy module must provide a pure JavaScript fallback scoring `-0.1`. This guarantees something always works. Better implementations (≥ `0.0`) win when they can handle the request, but the system falls back to whatever can if they can't.

For example, a native implementation scores `1.0` for standard algorithms but returns `undefined` for experimental features. The `-0.1` fallback handles everything. Requesting an experimental feature automatically selects the fallback.

Scores below `-0.1` are for risky implementations that should only be used when even the fallback can't handle the request. Gotcha: scoring at `-0.2` beats the `-0.1` fallback, so use this range sparingly.

Selection is cached per unique set of options.

#### Creating a Lazy Module

Here's how you create a lazy module for encryption:

```typescript
import { createLazyModule, CapabilityScores } from '@relational-fabric/canon'

type EncryptOpts = {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305'
}

type EncryptFn = (data: Uint8Array, key: Uint8Array, opts: EncryptOpts) => Uint8Array

const { module: encrypt, register } = createLazyModule<EncryptFn, EncryptOpts>({
  name: 'encrypt',
  defaultOptions: { algorithm: 'AES-256-GCM' },
  fallback: () => (data, key, opts) => {
    // Pure JavaScript encryption implementation
    // Works everywhere, but slower
    return pureJsEncrypt(data, key, opts)
  },
})

// Register native implementation (if available)
register({
  name: 'native-crypto',
  supports: (opts) => {
    if (opts.algorithm === 'AES-256-GCM' && hasNodeCrypto()) {
      return 1.0 // Optimal
    }
    return undefined // Not supported
  },
  implementation: () => {
    const { createCipheriv } = require('crypto')
    return (data, key, opts) => {
      // Use Node.js native crypto
      return nativeEncrypt(data, key, opts, createCipheriv)
    }
  },
})

// Use the module
const encrypted = encrypt(data, key, { algorithm: 'AES-256-GCM' })
// Uses native crypto on Node.js, pure JS fallback elsewhere
```

The module automatically selects the best available implementation based on the options. On Node.js with native crypto available, it uses the native implementation. In a browser or edge runtime, it falls back to pure JavaScript. The same code works everywhere.

---

### Integration: Protocols + Lazy Modules in Practice

The real power emerges when protocols and lazy modules work together. Consider JWT token signing—a common need in systems that require verifiable claims (like Howard's proof persistence).

JWT tokens have three parts: header, payload, and signature. You might receive them in different shapes:

- Plain objects: `{ header: {...}, payload: {...}, signature: '...' }`
- Map structures: `new Map([['header', {...}], ['payload', {...}], ['signature', '...']])`
- Immutable structures: `Immutable.Map({ header: {...}, payload: {...}, signature: '...' })`

You need to:
1. Access these parts consistently regardless of structure (protocols)
2. Sign them using the best available crypto implementation (lazy modules)

#### Associative Protocol for Shape Independence

First, we define an Associative protocol for key-based access:

```typescript
// path/to/assoc.ts
import { defineProtocol } from '@relational-fabric/canon'
import type { Protocol, Satisfies } from '@relational-fabric/canon'

export interface Assoc<T = unknown> {
  get: (collection: T, key: string) => unknown
  set: (collection: T, key: string, value: unknown) => T
  has: (collection: T, key: string) => boolean
}

export const PAssoc = defineProtocol<Assoc>({
  get: 'Get value by key',
  set: 'Set value by key, returning new collection',
  has: 'Check if key exists',
})

export type AssocProtocol<T = unknown> = Protocol<Assoc<T>>
export type Associative<T = unknown> = Satisfies<AssocProtocol<T>>

// Register PAssoc as an axiom for use with Satisfies
declare module '@relational-fabric/canon' {
  interface Axioms {
    PAssoc: AssocProtocol
  }
}
```

Then we extend it with implementations:

```typescript
// path/to/assoc-implementations.ts
import { PAssoc } from 'path/to/assoc'
import { extendProtocol } from '@relational-fabric/canon'

extendProtocol(PAssoc, Object, {
  get: (obj, key) => (obj as Record<string, unknown>)[key],
  set: (obj, key, value) => ({ ...(obj as Record<string, unknown>), [key]: value }),
  has: (obj, key) => key in (obj as Record<string, unknown>),
})

extendProtocol(PAssoc, Map, {
  get: (map, key) => (map as Map<string, unknown>).get(key),
  set: (map, key, value) => {
    const newMap = new Map(map as Map<string, unknown>)
    newMap.set(key, value)
    return newMap
  },
  has: (map, key) => (map as Map<string, unknown>).has(key),
})
```

I've spent years fighting the 'imperative smuggle' in our APIs. `get` and `set` give me the ick because they assume we are 'reaching into' a container to twist a knob. We don't 'set' fields in a Fabric of Proof; we patch a proposition with novelty. This isn't semantic hairsplitting; it's a commitment to the idea that data is a series of immutable propositions. We aren't changing the past; we are declaring a new version of the truth.

Now we can write universal access functions. These move us from imperative accessors to relational operations:

```typescript
// The Identity-Preserving Evolution: maintains the container type
function patch<T>(collection: T, novelty: Record<string, unknown>): T {
  return Object.entries(novelty).reduce(
    (acc, [key, value]) => PAssoc.set(acc, key, value) as T,
    collection
  )
}

// The Relational Projection: returns a Normal Form (plain object) for destructuring
function select<T, K extends string>(collection: T, ...keys: K[]): Record<K, unknown> {
  return keys.reduce(
    (acc, key) => patch(acc, { [key]: PAssoc.get(collection, key) }),
    {} as Record<K, unknown>
  )
}
```

Unlike imperative `get`/`set` operations, `select` performs a relational projection—always returning a destructurable Normal Form. `patch` applies novelty while preserving the original container's identity and type-specific behavior.

#### Lazy Module for Runtime Independence

Next, we create a lazy module for JWT signing:

```typescript
type SignOpts = {
  algorithm: 'HS256' | 'RS256' | 'ES256'
}

type SignFn = (header: object, payload: object, secret: string, opts: SignOpts) => string

const { module: signJWT, register: registerSigner } = createLazyModule<SignFn, SignOpts>({
  name: 'signJWT',
  defaultOptions: { algorithm: 'HS256' },
  fallback: () => (header, payload, secret, opts) => {
    // Pure JavaScript JWT signing
    return pureJsSign(header, payload, secret, opts)
  },
})

// Register Node.js native implementation
registerSigner({
  name: 'node-crypto',
  supports: (opts) => {
    if (typeof require !== 'undefined' && require.resolve('crypto')) {
      return 1.0
    }
    return undefined
  },
  implementation: () => {
    const crypto = require('crypto')
    return (header, payload, secret, opts) => {
      return crypto.createSign(opts.algorithm).update(JSON.stringify({ header, payload })).sign(secret, 'base64')
    }
  },
})

// Register Web Crypto API implementation
registerSigner({
  name: 'web-crypto',
  supports: (opts) => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      return 0.8 // Good, but not as fast as Node.js native
    }
    return undefined
  },
  implementation: () => {
    return async (header, payload, secret, opts) => {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: opts.algorithm === 'HS256' ? 'SHA-256' : 'SHA-512' }, false, ['sign'])
      const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(JSON.stringify({ header, payload })))
      return btoa(String.fromCharCode(...new Uint8Array(signature)))
    }
  },
})
```

#### Bringing It Together

Now we can write a universal JWT signing function:

```typescript
function signToken<T>(token: T, secret: string, algorithm: 'HS256' | 'RS256' | 'ES256' = 'HS256'): T {
  const { header, payload } = select(token, 'header', 'payload')
  
  const signature = signJWT(header as object, payload as object, secret, { algorithm })

  return patch(token, { signature })
}

// Works with any structure
const objToken = { header: { alg: 'HS256' }, payload: { sub: 'user123' } }
const signedObj = signToken(objToken, 'secret')

const mapToken = new Map([
  ['header', { alg: 'HS256' }],
  ['payload', { sub: 'user123' }],
])
const signedMap = signToken(mapToken, 'secret')

const immutableToken = Immutable.Map({
  header: { alg: 'HS256' },
  payload: { sub: 'user123' },
})
const signedImmutable = signToken(immutableToken, 'secret')
```

The same code works with different data structures (protocols) and automatically selects the best crypto implementation for the environment (lazy modules). This is exactly what Howard needs for proof persistence: signed tokens that can be verified, regardless of how the data is structured or where the code is running.

---

### The Path Forward

This is how we end the cycle of disposable code. We stop building 'Validators' and start building Semantics. We are moving toward a world where data carries verifiable claims, proofs persist across boundaries, and the cost of verification approaches zero. Protocols and Lazy Modules are the loom. Making it fast and making it stick comes next.

### Postscript: What's Next

I'm sharing these patterns now because they are the tax-collectors for the 'Logical Tax.' You can't have universal fast hashing if your hashing logic is coupled to a POJO. You can't have persistent metadata if your data structures can't handle a patch. We're starting with the Associative protocol because it's the DML (Data Manipulation Language) of the Universal API. The speed and the persistence come next.

Over the next few releases, we'll be adding all the foundational protocols you would expect to find—Associative, Sequential, Countable, and more. These aren't just convenience APIs; they're the building blocks that make universal operations possible across any data structure.

---

*Protocols and lazy modules are available in [Canon](https://github.com/RelationalFabric/canon), part of the Relational Fabric ecosystem. For examples and documentation, see the [Canon documentation site](https://relationalfabric.github.io/canon/) or the [Canon repository](https://github.com/RelationalFabric/canon).*
