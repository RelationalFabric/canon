/**
 * Example: Basic Id Axiom Usage
 *
 * This example demonstrates how Canon enables you to write universal code
 * that works across different data formats. The same `idOf()` function
 * extracts IDs regardless of whether your data uses 'id' or '@id' fields.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, idOf, pojoHasString } from '@relational-fabric/canon'

// =============================================================================
// STEP 1: Define Your Internal Data Format
// =============================================================================

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

// Register the type globally so TypeScript knows about it
declare module '@relational-fabric/canon' {
  interface Canons {
    Internal: InternalCanon
  }
}

// Register the runtime behavior - how to actually find and extract IDs
declareCanon('Internal', {
  axioms: {
    Id: {
      // Clean type guard using pojoHasString utility
      $basis: (v: unknown): v is { id: string } => pojoHasString(v, 'id'),
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

const userId = idOf(user) // Returns: "user-123"

// Let's verify this works as expected
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('extracts ID from internal format using standard "id" field', () => {
    expect(userId).toBe('user-123')
  })
}

// =============================================================================
// STEP 2: Add Support for External Data (JSON-LD)
// =============================================================================

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
      // Clean type guard for JSON-LD '@id' field
      $basis: (v: unknown): v is { '@id': string } => pojoHasString(v, '@id'),
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

const personId = idOf(jsonLdPerson) // Returns: "https://example.com/users/jane-456"

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('extracts ID from JSON-LD format using "@id" field', () => {
    expect(personId).toBe('https://example.com/users/jane-456')
  })
}

// =============================================================================
// STEP 3: Write Universal Code
// =============================================================================

/**
 * The real power: write functions that work with ANY format.
 * You don't need to check which format the data is in or write
 * conditional logic. Canon handles it for you.
 */

function displayEntity(entity: any): string {
  const id = idOf(entity)
  return `Entity with ID: ${id}`
}

// Works with internal format
const internalProduct = { id: 'product-789', name: 'Widget' }
const internalDisplay = displayEntity(internalProduct)
// Returns: "Entity with ID: product-789"

// Works with JSON-LD format
const jsonLdProduct = {
  '@id': 'https://example.com/products/gadget-999',
  '@type': 'Product',
  'name': 'Gadget',
}
const jsonLdDisplay = displayEntity(jsonLdProduct)
// Returns: "Entity with ID: https://example.com/products/gadget-999"

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
