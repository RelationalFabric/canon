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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('The canon uses "_id" as the Id key.', () => {
    expect(mongoDbCanon.axioms.Id.key).toBe('_id')
  })

  it('The canon metadata specifies objectid type and hex format.', () => {
    const meta = mongoDbCanon.axioms.Id.$meta as Record<string, unknown>
    expect(meta.type).toBe('objectid')
    expect(meta.format).toBe('hex')
  })
}
