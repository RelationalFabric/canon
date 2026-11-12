/**
 * Format-Specific Canon Definitions
 *
 * This file defines canons for different data formats (REST API, MongoDB, JSON-LD)
 * to demonstrate Canon's cross-format compatibility.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// REST API Canon - Standard camelCase format
// =============================================================================

type RestApiCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { format: 'camelCase' } }
  Version: { $basis: { version: number }, key: 'version', $meta: { format: 'integer' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'Date' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    RestApiCanon: RestApiCanon
  }
}

declareCanon('RestApiCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { format: 'camelCase' } },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { format: 'integer' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'Date' },
    },
  },
})

// =============================================================================
// MongoDB Canon - Underscore prefix format
// =============================================================================

type MongoDbCanon = Canon<{
  Id: { $basis: { _id: string }, key: '_id', $meta: { format: 'ObjectId' } }
  Type: { $basis: { _type: string }, key: '_type', $meta: { format: 'underscore' } }
  Version: { $basis: { _version: number }, key: '_version', $meta: { format: 'integer' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'mixed' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    MongoDbCanon: MongoDbCanon
  }
}

declareCanon('MongoDbCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('_id', 'string'), key: '_id', $meta: { format: 'ObjectId' } },
    Type: {
      $basis: pojoWithOfType('_type', 'string'),
      key: '_type',
      $meta: { format: 'underscore' },
    },
    Version: {
      $basis: pojoWithOfType('_version', 'number'),
      key: '_version',
      $meta: { format: 'integer' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'mixed' },
    },
  },
})

// =============================================================================
// JSON-LD Canon - Semantic web format
// =============================================================================

type JsonLdCanon = Canon<{
  Id: { $basis: { '@id': string }, key: '@id', $meta: { format: 'URI' } }
  Type: { $basis: { '@type': string }, key: '@type', $meta: { format: 'URI' } }
  Version: { $basis: { '@version': string }, key: '@version', $meta: { format: 'string' } }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (v: unknown) => v is Date
    $meta: { format: 'iso8601' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    JsonLdCanon: JsonLdCanon
  }
}

declareCanon('JsonLdCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('@id', 'string'), key: '@id', $meta: { format: 'URI' } },
    Type: { $basis: pojoWithOfType('@type', 'string'), key: '@type', $meta: { format: 'URI' } },
    Version: {
      $basis: pojoWithOfType('@version', 'string'),
      key: '@version',
      $meta: { format: 'string' },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'iso8601' },
    },
  },
})

export type { JsonLdCanon, MongoDbCanon, RestApiCanon }
