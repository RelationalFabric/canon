/**
 * Comprehensive Canon Definition
 *
 * This file defines a comprehensive canon that implements four core axioms
 * (Id, Type, Version, Timestamps) and shows how they work together.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// Comprehensive Canon Definition
// =============================================================================

/**
 * A comprehensive canon that implements four core axioms: Id, Type, Version, Timestamps.
 * This represents a typical internal data format for a modern application.
 */
type ComprehensiveCanon = Canon<{
  Id: {
    $basis: { id: string }
    key: 'id'
    $meta: { type: string, format: string }
  }
  Type: {
    $basis: { type: string }
    key: 'type'
    $meta: { enum: string, discriminator: boolean }
  }
  Version: {
    $basis: { version: number }
    key: 'version'
    $meta: { min: number, max: number }
  }
  Timestamps: {
    $basis: number | string | Date
    isCanonical: (value: unknown) => value is Date
    $meta: { format: string, timezone: string }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    ComprehensiveCanon: ComprehensiveCanon
  }
}

// Register the comprehensive canon
declareCanon('ComprehensiveCanon', {
  axioms: {
    Id: {
      $basis: pojoWithOfType('id', 'string'),
      key: 'id',
      $meta: { type: 'string', format: 'uuid' },
    },
    Type: {
      $basis: pojoWithOfType('type', 'string'),
      key: 'type',
      $meta: { enum: 'entity', discriminator: true },
    },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { min: 1, max: 1000000 },
    },
    Timestamps: {
      $basis: (v: unknown): v is number | string | Date =>
        typeof v === 'number' || typeof v === 'string' || v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'iso8601', timezone: 'UTC' },
    },
  },
})

export type { ComprehensiveCanon }
