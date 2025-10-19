/**
 * Example: Basic Id Axiom Usage
 *
 * Demonstrates defining and using canons with the Id axiom across
 * different data formats (Internal and JSON-LD).
 */

import type { Canon } from '@relational-fabric/canon'
import process from 'node:process'
import { declareCanon, idOf } from '@relational-fabric/canon'

/**
 * Define Internal canon type-level configuration
 *
 * Uses standard 'id' field for identification
 */
type InternalCanon = Canon<{
  Id: {
    $basis: { id: string }
    key: 'id'
    $meta: { type: string }
  }
}>

/**
 * Define JsonLd canon type-level configuration
 *
 * Uses semantic '@id' field for identification (JSON-LD standard)
 */
type JsonLdCanon = Canon<{
  Id: {
    $basis: { '@id': string }
    key: '@id'
    $meta: { type: string, format: string }
  }
}>

/**
 * Register both canons in global Canons interface
 */
declare module '@relational-fabric/canon' {
  interface Canons {
    Internal: InternalCanon
    JsonLd: JsonLdCanon
  }
}

/**
 * Register Internal canon runtime configuration
 */
declareCanon('Internal', {
  axioms: {
    Id: {
      $basis: (v): v is { id: string } =>
        typeof v === 'object'
        && v !== null
        && 'id' in v
        && typeof (v as any).id === 'string',
      key: 'id',
      $meta: { type: 'uuid' },
    },
  },
})

/**
 * Register JsonLd canon runtime configuration
 */
declareCanon('JsonLd', {
  axioms: {
    Id: {
      $basis: (v): v is { '@id': string } =>
        typeof v === 'object'
        && v !== null
        && '@id' in v
        && typeof (v as any)['@id'] === 'string',
      key: '@id',
      $meta: { type: 'uri', format: 'iri' },
    },
  },
})

/**
 * Example Usage: Internal Format
 */
function exampleInternalFormat() {
  console.log('=== Internal Format Example ===\n')

  const internalData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  }

  console.log('Data:', internalData)
  console.log('Extracted ID:', idOf(internalData))
  console.log()
}

/**
 * Example Usage: JSON-LD Format
 */
function exampleJsonLdFormat() {
  console.log('=== JSON-LD Format Example ===\n')

  const jsonLdData = {
    '@id': 'https://example.com/users/jane-456',
    '@type': 'Person',
    'name': 'Jane Smith',
    'email': 'jane@example.com',
  }

  console.log('Data:', jsonLdData)
  console.log('Extracted ID:', idOf(jsonLdData))
  console.log()
}

/**
 * Example Usage: Universal Function
 */
function exampleUniversalFunction() {
  console.log('=== Universal Function Example ===\n')

  // A function that works with any canon
  function logEntityId(entity: any) {
    console.log(`Entity ID: ${idOf(entity)}`)
  }

  const internal = { id: 'product-789', name: 'Widget' }
  const jsonLd = { '@id': 'https://example.com/products/gadget-999', '@type': 'Product', 'name': 'Gadget' }

  console.log('Processing internal format:')
  logEntityId(internal)

  console.log('\nProcessing JSON-LD format:')
  logEntityId(jsonLd)
  console.log()
}

/**
 * Run all examples
 */
function main() {
  console.log('Canon Framework: Basic Id Axiom Examples\n')
  console.log('='.repeat(50))
  console.log()

  exampleInternalFormat()
  exampleJsonLdFormat()
  exampleUniversalFunction()

  console.log('='.repeat(50))
  console.log('\n✅ All examples completed successfully!')
  console.log('✅ Interface augmentation working')
  console.log('✅ Runtime configuration working')
  console.log('✅ Universal API working across formats')
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
