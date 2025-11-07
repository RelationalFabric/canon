/**
 * Custom Axiom Definitions
 *
 * This file defines custom axioms beyond the core set, showing how to create
 * domain-specific semantic concepts that work with Canon's universal type system.
 */

import type { Axiom, Canon, KeyNameAxiom, RepresentationAxiom } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// Custom Axiom Type Definitions
// =============================================================================

/**
 * Email Axiom - Represents email addresses with validation
 * This is a KeyNameAxiom because it's found by looking for a specific field name
 */
type EmailAxiom = KeyNameAxiom

/**
 * Currency Axiom - Represents monetary values with currency codes
 * This is a RepresentationAxiom because it can be converted between formats
 */
type CurrencyAxiom = RepresentationAxiom<
  (v: unknown) => v is number | string | object,
  { amount: number, currency: string }
>

/**
 * Status Axiom - Represents entity status with state validation
 * This is a KeyNameAxiom with additional metadata for state management
 */
type StatusAxiom = Axiom<
  {
    $basis: Record<string, unknown>
    key: string
    $meta: {
      validStates: string[]
      defaultState: string
      transitions: Record<string, string[]>
    }
  },
  {
    validStates: string[]
    defaultState: string
    transitions: Record<string, string[]>
  }
>

/**
 * Priority Axiom - Represents priority levels with numeric conversion
 * This is a RepresentationAxiom that converts between string and numeric priorities
 */
type PriorityAxiom = RepresentationAxiom<
  (v: unknown) => v is string | number | object,
  { level: number, label: string }
>

// =============================================================================
// Register Custom Axioms
// =============================================================================

declare module '@relational-fabric/canon' {
  interface Axioms {
    Email: EmailAxiom
    Currency: CurrencyAxiom
    Status: StatusAxiom
    Priority: PriorityAxiom
  }
}

// =============================================================================
// E-commerce Canon with Custom Axioms
// =============================================================================

type EcommerceWithCustomAxioms = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { discriminator: true } }
  Version: { $basis: { version: number }, key: 'version', $meta: { optimistic: true } }
  Timestamps: { $basis: Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'iso8601' } }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'uuid' }
  }
  Email: { $basis: { email: string }, key: 'email', $meta: { validation: 'strict' } }
  Currency: {
    $basis: (v: unknown) => v is number | string | object
    isCanonical: (v: unknown) => v is { amount: number, currency: string }
    $meta: { defaultCurrency: 'USD' }
  }
  Status: {
    $basis: { status: string }
    key: 'status'
    $meta: { validStates: string[], defaultState: string, transitions: Record<string, string[]> }
  }
  Priority: {
    $basis: (v: unknown) => v is string | number | object
    isCanonical: (v: unknown) => v is { level: number, label: string }
    $meta: { levels: string[] }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    EcommerceWithCustomAxioms: EcommerceWithCustomAxioms
  }
}

declareCanon('EcommerceWithCustomAxioms', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { discriminator: true } },
    Version: {
      $basis: pojoWithOfType('version', 'number'),
      key: 'version',
      $meta: { optimistic: true },
    },
    Timestamps: {
      $basis: (v: unknown): v is Date => v instanceof Date,
      isCanonical: (v: unknown): v is Date => v instanceof Date,
      $meta: { format: 'iso8601' },
    },
    References: {
      $basis: (v: unknown): v is string | object =>
        typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { ref: string, resolved: boolean } =>
        typeof v === 'object' && v !== null && 'ref' in v && 'resolved' in v,
      $meta: { format: 'uuid' },
    },
    Email: {
      $basis: pojoWithOfType('email', 'string'),
      key: 'email',
      $meta: { validation: 'strict' },
    },
    Currency: {
      $basis: (v: unknown): v is number | string | object =>
        typeof v === 'number' || typeof v === 'string' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { amount: number, currency: string } =>
        typeof v === 'object' && v !== null && 'amount' in v && 'currency' in v,
      $meta: { defaultCurrency: 'USD' },
    },
    Status: {
      $basis: pojoWithOfType('status', 'string'),
      key: 'status',
      $meta: {
        validStates: ['draft', 'active', 'inactive', 'archived', 'processing'],
        defaultState: 'draft',
        transitions: {
          draft: ['active'],
          active: ['inactive', 'archived', 'processing'],
          inactive: ['active', 'archived'],
          archived: [],
          processing: ['active', 'inactive'],
        },
      },
    },
    Priority: {
      $basis: (v: unknown): v is string | number | object =>
        typeof v === 'string' || typeof v === 'number' || (typeof v === 'object' && v !== null),
      isCanonical: (v: unknown): v is { level: number, label: string } =>
        typeof v === 'object' && v !== null && 'level' in v && 'label' in v,
      $meta: { levels: ['low', 'medium', 'high', 'critical'] },
    },
  },
})

export type { CurrencyAxiom, EcommerceWithCustomAxioms, EmailAxiom, PriorityAxiom, StatusAxiom }
