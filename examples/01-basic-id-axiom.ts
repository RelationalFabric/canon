/**
 * Basic ID Axiom Example
 *
 * Demonstrates the fundamental concept of extracting IDs from
 * different data structures using the Id axiom.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoWithOfType } from '@relational-fabric/canon'

/**
 * First, we define a simple canon that maps the Id axiom to the 'id' field.
 * This tells Canon where to find IDs in our data structures.
 */
type InternalCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id' }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    Internal: InternalCanon
  }
}

declareCanon('Internal', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id' },
  },
})

/**
 * Now we can extract IDs from any entity that has an 'id' field.
 * The idOf function knows how to find it based on our canon configuration.
 */
const user = { id: 'user-123', name: 'John Doe' }
const userId = idOf(user)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Basic ID Axiom', () => {
    it('extracts ID from internal format', () => {
      expect(userId).toBe('user-123')
    })
  })
}

/**
 * Often you'll receive data from external APIs that use different conventions.
 * JSON-LD, for example, uses '@id' instead of 'id'. Let's add support for it.
 */
type JsonLdCanon = Canon<{
  Id: { $basis: { '@id': string }, key: '@id' }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    JsonLd: JsonLdCanon
  }
}

declareCanon('JsonLd', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id' },
  },
})

/**
 * The same idOf() function now works with JSON-LD data too!
 * Canon automatically detects which format you're using.
 */
const jsonLdPerson = {
  '@id': 'https://example.com/users/jane-456',
  '@type': 'Person',
  'name': 'Jane Smith',
}

const personId = idOf(jsonLdPerson)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('JSON-LD Support', () => {
    it('extracts ID from JSON-LD format', () => {
      expect(personId).toBe('https://example.com/users/jane-456')
    })
  })
}

/**
 * The real power: write functions that work with ANY format.
 */
function displayEntity(entity: any): string {
  const id = idOf(entity)
  return `Entity with ID: ${id}`
}

const product = { id: 'product-789', name: 'Widget' }
const productDisplay = displayEntity(product)

const jsonLdProduct = {
  '@id': 'https://example.com/products/gadget-999',
  '@type': 'Product',
  'name': 'Gadget',
}
const jsonLdProductDisplay = displayEntity(jsonLdProduct)

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('Universal Functions', () => {
    it('works across both formats', () => {
      expect(productDisplay).toBe('Entity with ID: product-789')
      expect(jsonLdProductDisplay).toBe('Entity with ID: https://example.com/products/gadget-999')
    })
  })
}

/**
 * Key Takeaways:
 *
 * 1. **Universal ID Access**: Extract IDs regardless of structure
 * 2. **Type Safety**: Full TypeScript inference
 * 3. **Simple Setup**: Minimal configuration required
 * 4. **Format Agnostic**: Same function works with any registered canon
 */
