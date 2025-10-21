/**
 * Using the MongoDB Canon Module
 *
 * This file demonstrates how a consumer would import and use
 * the MongoDB canon in their application.
 */

import { declareCanon, idOf } from '@relational-fabric/canon'
import { mongoDbCanon, type MongoDbCanon } from './mongodb-canon.js'

/**
 * Step 1: Register the canon type globally
 *
 * This augments TypeScript's type system so it knows about the MongoDb canon.
 */
declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDb: MongoDbCanon
  }
}

/**
 * Step 2: Register the runtime configuration
 *
 * Use declareCanon() to register the imported canon in the global shell.
 */
declareCanon('MongoDb', mongoDbCanon)

/**
 * Step 3: Use it in your application!
 *
 * Now idOf() automatically works with MongoDB documents.
 */
const userDocument = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15'),
}

const userId = idOf(userDocument)
// Returns: "507f1f77bcf86cd799439011"

// Test: Verify MongoDB canon works after registration
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('extracts _id from MongoDB documents', () => {
    expect(userId).toBe('507f1f77bcf86cd799439011')
  })

  it('works with any MongoDB document structure', () => {
    const productDocument = {
      _id: 'abc123def456',
      title: 'Product Name',
      price: 29.99,
    }

    expect(idOf(productDocument)).toBe('abc123def456')
  })
}
