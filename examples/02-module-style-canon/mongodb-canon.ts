/**
 * MongoDB Canon Module
 *
 * This file shows how you'd define a shareable canon that could be
 * published as its own npm package (e.g., '@my-org/canon-mongodb').
 */

import type { Canon } from '@relational-fabric/canon'
import { defineCanon, pojoWithOfType } from '@relational-fabric/canon'

/**
 * Type-level configuration for MongoDB documents
 *
 * MongoDB uses '_id' as its primary key field
 */
export type MongoDbCanon = Canon<{
  Id: {
    $basis: { _id: string }
    key: '_id'
    $meta: { type: string, format: string }
  }
}>

/**
 * Runtime configuration for MongoDB canon
 *
 * This is the actual configuration that gets registered.
 * Export it so other projects can import and use it.
 */
export const mongoDbCanon = defineCanon({
  axioms: {
    Id: {
      $basis: pojoWithOfType('_id', 'string'),
      key: '_id',
      $meta: { type: 'objectid', format: 'hex' },
    },
  },
})

// Test: defineCanon creates the expected structure
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('creates a reusable MongoDB canon configuration', () => {
    expect(mongoDbCanon.axioms.Id.key).toBe('_id')
    expect((mongoDbCanon.axioms.Id.$meta as any).type).toBe('objectid')
    expect((mongoDbCanon.axioms.Id.$meta as any).format).toBe('hex')
  })
}
