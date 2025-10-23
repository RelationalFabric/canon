/**
 * Basic Canon for Error Handling Examples
 *
 * This file defines a basic canon for testing error handling scenarios.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// Basic Canon Definition
// =============================================================================

type BasicCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'string' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { format: 'string' } }
  Version: { $basis: { version: number }, key: 'version', $meta: { format: 'number' } }
  Timestamps: { $basis: Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'Date' } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }, $meta: { format: 'string' } }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    BasicCanon: BasicCanon
  }
}

declareCanon('BasicCanon', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'string' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { format: 'string' } },
    Version: { $basis: pojoWithOfType('version', 'number'), key: 'version', $meta: { format: 'number' } },
    Timestamps: { $basis: (v: unknown): v is Date => v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'Date' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string, resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v, $meta: { format: 'string' } },
  },
})

export type { BasicCanon }
