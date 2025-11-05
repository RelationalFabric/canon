/**
 * Domain Models for Business Scenarios
 *
 * This file defines the domain models and entities used in real-world
 * business scenarios, demonstrating Canon's practical applications.
 */

import type { Canon } from '@relational-fabric/canon'
import { declareCanon, pojoWithOfType } from '@relational-fabric/canon'

// =============================================================================
// E-commerce Domain Canon
// =============================================================================

type EcommerceCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { discriminator: true } }
  Version: { $basis: { version: number }, key: 'version', $meta: { optimistic: true } }
  Timestamps: { $basis: Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'iso8601' } }
  References: {
    $basis: string | object
    isCanonical: (v: unknown) => v is { ref: string, resolved: boolean }
    $meta: { format: 'uuid' }
  }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    EcommerceCanon: EcommerceCanon
  }
}

declareCanon('EcommerceCanon', {
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
  },
})

// =============================================================================
// Domain Entity Types
// =============================================================================

/**
 * Customer entity
 */
export interface Customer {
  id: string
  type: 'customer'
  version: number
  createdAt: Date
  updatedAt: Date
  profile: {
    name: string
    email: string
    phone?: string
  }
  preferences: {
    currency: string
    language: string
  }
  paymentMethods: Array<{
    id: string
    type: 'credit_card' | 'paypal' | 'bank_transfer'
    last4?: string
  }>
  createdBy: string
}

/**
 * Product entity
 */
export interface Product {
  id: string
  type: 'product'
  version: number
  createdAt: Date
  updatedAt: Date
  name: string
  description: string
  price: number
  currency: string
  category: string
  inventory: {
    available: number
    reserved: number
  }
  createdBy: string
}

/**
 * Order entity
 */
export interface Order {
  id: string
  type: 'order'
  version: number
  createdAt: Date
  updatedAt: Date
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customerId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  totals: {
    subtotal: number
    discount: number
    tax: number
    total: number
    currency: string
  }
  shipping: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    method: 'standard' | 'express' | 'overnight'
    cost: number
  }
  createdBy: string
}

// =============================================================================
// Sample Data
// =============================================================================

/**
 * Sample customer data
 */
export const sampleCustomer: Customer = {
  id: 'cust-123',
  type: 'customer',
  version: 3,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0123',
  },
  preferences: {
    currency: 'USD',
    language: 'en',
  },
  paymentMethods: [
    {
      id: 'pm-456',
      type: 'credit_card',
      last4: '1234',
    },
  ],
  createdBy: 'admin-789',
}

/**
 * Sample product data
 */
export const sampleProduct: Product = {
  id: 'prod-456',
  type: 'product',
  version: 7,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework License',
  description: 'Professional license for Canon framework',
  price: 99.99,
  currency: 'USD',
  category: 'software',
  inventory: {
    available: 100,
    reserved: 5,
  },
  createdBy: 'admin-789',
}

/**
 * Sample order data
 */
export const sampleOrder: Order = {
  id: 'order-789',
  type: 'order',
  version: 2,
  createdAt: new Date('2024-01-15T09:30:00Z'),
  updatedAt: new Date('2024-01-15T11:45:00Z'),
  status: 'processing',
  customerId: 'cust-123',
  items: [
    {
      productId: 'prod-456',
      quantity: 2,
      price: 99.99,
    },
  ],
  totals: {
    subtotal: 199.98,
    discount: 19.998,
    tax: 14.39856,
    total: 194.38,
    currency: 'USD',
  },
  shipping: {
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA',
    },
    method: 'standard',
    cost: 9.99,
  },
  createdBy: 'cust-123',
}

export type { EcommerceCanon }
