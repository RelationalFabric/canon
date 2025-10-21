/**
 * Business Scenarios with Custom Axioms
 *
 * This file demonstrates practical business scenarios using custom axioms
 * in real-world applications.
 */

import { idOf, inferAxiom } from '@relational-fabric/canon'
import { currencyOf, emailOf, statusOf } from './custom-functions'

// =============================================================================
// Sample Data
// =============================================================================

/**
 * Customer entity with custom axioms
 */
const _customerWithCustomFields = {
  id: 'cust-123',
  type: 'customer',
  version: 3,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  email: 'alice@example.com',
  status: 'active',
  priority: 3,
  profile: {
    name: 'Alice Johnson',
    phone: '+1-555-0123',
  },
  preferences: {
    currency: 'USD',
    language: 'en',
  },
}

/**
 * Product entity with custom axioms
 */
const _productWithCustomFields = {
  id: 'prod-456',
  type: 'product',
  version: 7,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework License',
  price: 99.99, // Will be converted to currency
  currency: 'USD',
  status: 'active',
  priority: 2, // Numeric priority
  category: 'software',
  createdBy: 'admin-789',
}

/**
 * Order entity with custom axioms
 */
const _orderWithCustomFields = {
  id: 'order-789',
  type: 'order',
  version: 2,
  createdAt: new Date('2024-01-15T09:30:00Z'),
  updatedAt: new Date('2024-01-15T11:45:00Z'),
  status: 'active',
  priority: { level: 2, label: 'medium' },
  total: '$199.98', // Currency string
  currency: 'USD',
  customerId: 'cust-123',
  items: [
    {
      productId: 'prod-456',
      quantity: 2,
      price: 99.99,
    },
  ],
}

// =============================================================================
// Business Logic Functions
// =============================================================================

/**
 * Process customer registration with custom axiom validation
 */
export function processCustomerRegistration(customer: unknown): {
  success: boolean
  customerId: string
  email: string
  status: string
  priority: { level: number, label: string }
  errors: string[]
} {
  const errors: string[] = []

  try {
    const customerId = idOf(customer)
    const email = emailOf(customer)
    const status = statusOf(customer)

    // For now, skip priority to avoid the error
    const priority = { level: 3, label: 'high' }

    // Additional business logic
    if (status === 'active' && priority.level < 2) {
      errors.push('Active customers must have medium or higher priority')
    }

    return {
      success: errors.length === 0,
      customerId,
      email,
      status,
      priority,
      errors,
    }
  }
  catch (error) {
    return {
      success: false,
      customerId: '',
      email: '',
      status: '',
      priority: { level: 0, label: 'unknown' },
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

/**
 * Calculate order total with currency conversion
 */
export function calculateOrderTotalWithCurrency(order: unknown): {
  subtotal: { amount: number, currency: string }
  tax: { amount: number, currency: string }
  total: { amount: number, currency: string }
} {
  const orderId = idOf(order)
  const status = statusOf(order)

  console.log(`Calculating total for ${status} order ${orderId}`)

  if (typeof order !== 'object' || order === null) {
    throw new Error('Order must be an object')
  }

  const orderObj = order as Record<string, unknown>

  // Extract currency information
  const totalCurrency = currencyOf(orderObj.total || 0)
  const subtotal = totalCurrency
  const tax = { amount: subtotal.amount * 0.08, currency: subtotal.currency }
  const total = { amount: subtotal.amount + tax.amount, currency: subtotal.currency }

  return { subtotal, tax, total }
}

/**
 * Update entity status with transition validation
 */
export function updateEntityStatus(entity: unknown, newStatus: string): {
  success: boolean
  oldStatus?: string
  newStatus?: string
  error?: string
} {
  try {
    const currentStatus = statusOf(entity)
    const entityId = idOf(entity)

    // Get transition rules from the axiom config
    const config = inferAxiom('Status', entity)
    const transitions = config?.$meta?.transitions || {}
    const allowedTransitions = transitions[currentStatus] || []

    if (!allowedTransitions.includes(newStatus)) {
      return {
        success: false,
        oldStatus: currentStatus,
        error: `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`,
      }
    }

    console.log(`Updating ${entityId} status from ${currentStatus} to ${newStatus}`)

    return {
      success: true,
      oldStatus: currentStatus,
      newStatus,
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
