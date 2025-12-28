# Protocols and Lazy Modules: Decoupling Operations and Implementations

## Two foundational patterns that bridge shape independence and runtime selection. How Canon enables universal APIs that work across structures and environments.

I promised two follow-up articles to my recent work on [Howard's claims system](https://github.com/RelationalFabric/howard) and [Canon's lazy typing](https://levelup.gitconnected.com/the-end-of-disposable-code-how-i-built-universal-apis-in-typescript-618b3ed38302). I promised Fast Value Hashing and Object Metadata—the pieces that make proofs persistent and eliminate what I called the "Logical Tax."

This isn't those articles.

Instead, I want to introduce two patterns that emerged naturally from building those foundations: **Protocols** and **Lazy Modules**. They're precursors to the promised work, and understanding them is essential for what comes next. Protocols solve operation independence—writing code that works across different data structures. Lazy modules solve implementation selection—choosing the best available implementation across different runtime environments.

Together, they enable a class of universal APIs that I believe will become central to how we build composable systems.

### The Problem: Decoupling Operations from Structures

In my article on [the logic of claims](https://github.com/RelationalFabric/howard), I wrote about the "infrastructure of suspicion"—every layer of the stack re-interrogating data because it doesn't trust previous layers. Canon's lazy typing addresses part of this: it lets you write code that works with different data shapes through canonical APIs.

But there's another dimension to this problem. Canons solve *shape matching*—knowing where to find semantic concepts like identity or timestamps in different formats. What about *operation matching*—performing the same operation across different data structures?

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

The inspiration comes from Clojure's protocol system, which I referenced when building Howard. Clojure protocols define sets of operations that types can implement. They dispatch based on the type of the first argument, allowing you to extend types without modifying their original definitions.

Canon's protocol system brings this pattern to TypeScript. Protocols define operations, not data extraction. Think of them as interfaces that can be implemented by any type after the fact—you don't need to modify the original type to add protocol support.

#### Defining a Protocol

Protocols are defined using `defineProtocol()`. Each method gets a documentation string that describes its purpose:

```typescript
import { defineProtocol, extendProtocol } from '@relational-fabric/canon'

const PSeq = defineProtocol('PSeq', {
  first: 'Returns the first item of the sequence',
  rest: 'Returns the rest of the sequence after the first item',
  empty: 'Returns true if the sequence is empty',
})
```

The naming convention uses a `P` prefix for protocol values (like `PSeq` for a sequence protocol). This distinguishes them from TypeScript interfaces (which would be `Seq`) and avoids confusion with other naming patterns.

#### Extending Protocols

Use `extendProtocol()` to add implementations for specific types. Here we extend the sequence protocol for arrays and strings:

```typescript
extendProtocol(PSeq, Array, {
  first: (arr: unknown) => (arr as unknown[])[0],
  rest: (arr: unknown) => (arr as unknown[]).slice(1),
  empty: (arr: unknown) => (arr as unknown[]).length === 0,
})

extendProtocol(PSeq, String, {
  first: (str: unknown) => (str as string)[0],
  rest: (str: unknown) => (str as string).slice(1),
  empty: (str: unknown) => (str as string).length === 0,
})
```

Now we can write polymorphic code that works with any sequence type:

```typescript
const numbers = [1, 2, 3, 4, 5]
const firstNumber = PSeq.first(numbers) // 1

const greeting = 'Hello'
const firstChar = PSeq.first(greeting) // 'H'

function take<T>(seq: T, n: number): unknown[] {
  const result: unknown[] = []
  let current: unknown = seq

  for (let i = 0; i < n && !PSeq.empty(current); i++) {
    result.push(PSeq.first(current))
    current = PSeq.rest(current)
  }

  return result
}

take([1, 2, 3, 4, 5], 3) // [1, 2, 3]
take('Hello', 3) // ['H', 'e', 'l']
```

The `take` function works with arrays, strings, and any other type that implements the sequence protocol. No conditional logic. No type checking. Just polymorphic dispatch.

#### Dispatch Efficiency

Protocol dispatch is O(1). Each protocol gets a unique identifier, and implementations are stored directly on constructor prototypes. When you call `PSeq.first(value)`, the system:

1. Gets the protocol identifier
2. Looks up the implementation on the value's constructor prototype
3. Calls the implementation with the value as the first argument

No iteration through implementations. No runtime type checking. Just direct property access.

This design is inspired by [Cosy Lang's protocol implementation](https://raw.githubusercontent.com/getcosy/lang/refs/heads/master/src/protocol.coffee), which demonstrated that efficient protocol dispatch is achievable in dynamic languages.

---

### The Next Problem: Implementation Selection

Protocols solve operation independence. But there's another problem: sometimes you need multiple implementations of the same operation with different characteristics.

You might need native bindings for performance, but they're only available on specific platforms. You might need WASM modules that work in browsers but not Node.js. You might need x86-optimised code that breaks on ARM architectures.

I've lost count of how many times I've built something on my Mac, watched it work perfectly, then had CI fail because the build environment is different. Native bindings that work on ARM don't exist for x86. WASM modules that work locally can't be found in a serverless environment. "It worked on my machine" becomes "it literally can't work on that machine."

This is especially painful with bundlers like Rollup or Vite. Everything works locally because your machine has the native bindings. Then you deploy, and the production environment doesn't have them. The build fails, or worse, it succeeds but the runtime crashes when it tries to load a missing native module.

The challenge: how do you select the best available implementation while guaranteeing something always works?

---

### Lazy Modules: Capability-Based Selection

Lazy modules solve this by providing a capability-based selection system. They guarantee there's always a pure JavaScript fallback that works everywhere, while allowing implementations to register themselves and compete based on their capabilities.

The pattern is inspired by plugin systems: implementations register themselves without modifying the core module, and selection happens based on what each implementation claims to support.

#### The Solution: Always Have a Fallback

Every lazy module must provide a pure JavaScript implementation that scores -0.1. This ensures:

- There's always something that works (pure JavaScript runs everywhere)
- Better implementations win (anything that returns 0.0 or higher beats the fallback)
- The fallback only wins when nothing else supports the requested options

The scoring system is simple:

- `undefined` → not supported (excluded from selection)
- `-1.0` → works but risky or unstable (last resort only)
- `-0.1` → pure JS fallback (functional but suboptimal)
- `0.0` → baseline (thoughtful implementations that haven't measured performance)
- `> 0` → better (up to `1.0` = optimal)

Selection happens once per unique set of options and is cached. The first call selects the best available implementation, and subsequent calls reuse that selection.

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
const PAssoc = defineProtocol('PAssoc', {
  get: 'Get value by key',
  set: 'Set value by key, returning new collection',
  has: 'Check if key exists',
})

extendProtocol(PAssoc, Object, {
  get: (obj: unknown, key: string) => (obj as Record<string, unknown>)[key],
  set: (obj: unknown, key: string, value: unknown) => ({ ...(obj as Record<string, unknown>), [key]: value }),
  has: (obj: unknown, key: string) => key in (obj as Record<string, unknown>),
})

extendProtocol(PAssoc, Map, {
  get: (map: unknown, key: string) => (map as Map<string, unknown>).get(key),
  set: (map: unknown, key: string, value: unknown) => {
    const newMap = new Map(map as Map<string, unknown>)
    newMap.set(key, value)
    return newMap
  },
  has: (map: unknown, key: string) => (map as Map<string, unknown>).has(key),
})
```

Now we can write universal access functions:

```typescript
function getOf<T>(collection: T, key: string): unknown {
  return PAssoc.get(collection, key)
}

function setOf<T>(collection: T, key: string, value: unknown): T {
  return PAssoc.set(collection, key, value) as T
}
```

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
  const header = getOf(token, 'header') as object
  const payload = getOf(token, 'payload') as object

  const signature = signJWT(header, payload, secret, { algorithm })

  return setOf(token, 'signature', signature)
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

Protocols and lazy modules are foundational patterns. They solve two orthogonal problems: shape independence (protocols) and runtime independence (lazy modules). Together, they enable universal APIs that work consistently across different structures and optimally across different environments.

These patterns are precursors to the work I promised: Fast Value Hashing and Object Metadata. Protocols will enable content-based hashing that works across different data structures. Lazy modules will ensure we always have a working hash implementation, even when native bindings aren't available.

The vision is semantic integrity: a system where data carries verifiable claims, proofs persist across boundaries, and the cost of verification approaches zero. Protocols and lazy modules are the infrastructure that makes this possible.

The logical foundation is laid. Making it fast and making it stick comes next.

---

*Protocols and lazy modules are available in [Canon](https://github.com/RelationalFabric/canon), part of the Relational Fabric ecosystem. For examples and documentation, see the [Canon repository](https://github.com/RelationalFabric/canon).*
