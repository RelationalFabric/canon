# Basic Id Axiom Usage

Learn how Canon enables universal code that works across different data formats using the Id axiom

Canon enables you to write universal code that works across different data formats. The same `idOf()` function extracts IDs regardless of whether your data uses `id`, `@id`, `_id`, or any other field name.

In this example, we'll explore how to define canons for different data formats, use universal axiom functions, and write format-agnostic business logic.

```ts
import type { Canon, Satisfies } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'
```

## Defining Your Internal Data Format

Most applications have their own internal data format. Here we'll define a canon for data that uses the standard `id` field.

A canon definition has two parts:

1. **Type-level** - Tells TypeScript about the structure
2. **Runtime** - Tells Canon how to actually find and extract values

```ts
type InternalCanon = Canon<{
Id: {
  $basis: { id: string }
  key: 'id'
  $meta: { type: string }
}
}>

declare module '@relational-fabric/canon' {
interface Canons {
  Internal: InternalCanon
}
}

declareCanon('Internal', {
axioms: {
  Id: {
    $basis: pojoWithOfType('id', 'string'),
    key: 'id',
    $meta: { type: 'uuid' },
  },
},
})
```

Now we can use `idOf()` with our internal data format. The function automatically knows to look for the `id` field.

```ts
const user = {
id: 'user-123',
name: 'John Doe',
email: 'john@example.com',
}

const userId = idOf(user)
```

**The userId variable contains "user-123".:**

```ts
expect(userId).toBe('user-123')
```

_Status:_ ✅ pass

## Supporting External Data Formats

Often you'll receive data from external APIs that use different conventions. JSON-LD, for example, uses `@id` instead of `id`. Let's add support for it.

```ts
type JsonLdCanon = Canon<{
Id: {
  $basis: { '@id': string }
  key: '@id'
  $meta: { type: string, format: string }
}
}>

declare module '@relational-fabric/canon' {
interface Canons {
  JsonLd: JsonLdCanon
}
}

declareCanon('JsonLd', {
axioms: {
  Id: {
    $basis: pojoWithOfType('@id', 'string'),
    key: '@id',
    $meta: { type: 'uri', format: 'iri' },
  },
},
})
```

The magic: the **SAME** `idOf()` function now works with JSON-LD data too! Canon automatically detects which format you're using and extracts the ID from the correct field.

```ts
const jsonLdPerson = {
'@id': 'https://example.com/users/jane-456',
'@type': 'Person',
'name': 'Jane Smith',
'email': 'jane@example.com',
}

const personId = idOf(jsonLdPerson)
```

**The personId variable contains the full IRI.:**

```ts
expect(personId).toBe('https://example.com/users/jane-456')
```

_Status:_ ✅ pass

## Writing Universal Code

The real power: write functions that work with **any** format. You don't need to check which format the data is in or write conditional logic. Canon handles it for you.

```ts
function displayEntity<T extends Satisfies<'Id'>>(entity: T): string {
const id = idOf(entity)
return `Entity with ID: ${id}`
}

// Works with internal format
const internalProduct = { id: 'product-789', name: 'Widget' }
const internalDisplay = displayEntity(internalProduct)

// Works with JSON-LD format
const jsonLdProduct = {
'@id': 'https://example.com/products/gadget-999',
'@type': 'Product',
'name': 'Gadget',
}
const jsonLdDisplay = displayEntity(jsonLdProduct)
```

**The function returns "Entity with ID: product-789" for the internal format.:**

```ts
expect(internalDisplay).toBe('Entity with ID: product-789')
```

_Status:_ ✅ pass

**The same function returns the full IRI for the JSON-LD format.:**

```ts
expect(jsonLdDisplay).toBe('Entity with ID: https://example.com/products/gadget-999')
```

_Status:_ ✅ pass

## Key Takeaways

- **Define canons** for each data format you work with (internal, JSON-LD, MongoDB, etc.)
- **Use universal functions** like `idOf()` that work across all formats
- **Write business logic once** - it works with any registered canon
- **Add new formats anytime** without changing existing code
- Canon provides **type safety** throughout the entire system

---

## References

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/01-basic-id-axiom.ts)

## Metadata

**Keywords:** axiom, canon, id, json-ld, universal functions
**Difficulty:** introductory
