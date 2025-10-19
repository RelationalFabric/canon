/**
 * Example: Module-Style Canon Definition
 *
 * Demonstrates the module-style pattern for defining and exporting
 * canons that can be shared across projects.
 */

import type { Canon } from '@relational-fabric/canon'
import process from 'node:process'
import { defineCanon, idOf, registerCanons } from '@relational-fabric/canon'

/**
 * Define MongoDB canon type-level configuration
 */
type MongoDbCanon = Canon<{
  Id: {
    $basis: { _id: string }
    key: '_id'
    $meta: { type: string, format: string }
  }
}>

/**
 * Define and export MongoDB canon runtime configuration
 *
 * This can be imported and registered in other projects
 */
const mongoDbCanon = defineCanon({
  axioms: {
    Id: {
      $basis: (v): v is { _id: string } =>
        typeof v === 'object'
        && v !== null
        && '_id' in v
        && typeof (v as any)._id === 'string',
      key: '_id',
      $meta: { type: 'objectid', format: 'hex' },
    },
  },
})

/**
 * Register the canon in global interface
 */
declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDb: MongoDbCanon
  }
}

/**
 * Register the canon at runtime
 */
registerCanons({
  MongoDb: mongoDbCanon,
})

/**
 * Example Usage
 */
function main() {
  console.log('Canon Framework: Module-Style Canon Example\n')
  console.log('='.repeat(50))
  console.log()

  const mongoDocument = {
    _id: '507f1f77bcf86cd799439011',
    name: 'MongoDB Document',
    createdAt: new Date(),
  }

  console.log('MongoDB Document:', mongoDocument)
  console.log('Extracted ID:', idOf(mongoDocument))
  console.log()

  console.log('='.repeat(50))
  console.log('\n✅ Module-style canon working!')
  console.log('✅ defineCanon() creates reusable config')
  console.log('✅ registerCanons() batch registration working')
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
