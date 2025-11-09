/**
 * Example: Basic Id Axiom Usage
 *
 * This example demonstrates how Canon enables you to write universal code
 * that works across different data formats. The same `idOf()` function
 * extracts IDs regardless of whether your data uses 'id' or '@id' fields.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

/**
 * Most applications have their own internal data format. Here we define
 * a canon for data that uses the standard 'id' field.
 */
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

/**
 * Now we can use idOf() with our internal data format.
 * The function automatically knows to look for the 'id' field.
 */
const user = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
}

const userId = idOf(user)

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('extracts ID from internal format using standard "id" field', () => {
    expect(userId).toBe('user-123')
  })
}

/**
 * Often you'll receive data from external APIs that use different conventions.
 * JSON-LD, for example, uses '@id' instead of 'id'. Let's add support for it.
 */
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

/**
 * The magic: the SAME idOf() function now works with JSON-LD data too!
 * Canon automatically detects which format you're using and extracts
 * the ID from the correct field.
 */
const jsonLdPerson = {
  '@id': 'https://example.com/users/jane-456',
  '@type': 'Person',
  'name': 'Jane Smith',
  'email': 'jane@example.com',
}

const personId = idOf(jsonLdPerson)

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('extracts ID from JSON-LD format using "@id" field', () => {
    expect(personId).toBe('https://example.com/users/jane-456')
  })
}

/**
 * The real power: write functions that work with ANY format.
 * You don't need to check which format the data is in or write
 * conditional logic. Canon handles it for you.
 */
function displayEntity(entity: any): string {
  const id = idOf(entity)
  return `Entity with ID: ${id}`
}

const internalProduct = { id: 'product-789', name: 'Widget' }
const internalDisplay = displayEntity(internalProduct)

const jsonLdProduct = {
  '@id': 'https://example.com/products/gadget-999',
  '@type': 'Product',
  'name': 'Gadget',
}
const jsonLdDisplay = displayEntity(jsonLdProduct)

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('writes universal functions that work across both formats', () => {
    expect(internalDisplay).toBe('Entity with ID: product-789')
    expect(jsonLdDisplay).toBe('Entity with ID: https://example.com/products/gadget-999')
  })
}

/**
 * Key Takeaways:
 *
 * 1. Define canons for each data format you work with (internal, JSON-LD, etc.)
 * 2. Use universal functions like idOf() that work across all formats
 * 3. Write your business logic once - it works with any registered canon
 * 4. Add new formats anytime without changing existing code
 * 5. Use Canon's utility functions (pojoHasString, isPojo) for clean type guards
 */
