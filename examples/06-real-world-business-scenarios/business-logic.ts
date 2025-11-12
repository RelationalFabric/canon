/**
 * Business Logic Functions
 *
 * This file contains the core business logic functions that demonstrate
 * how Canon's universal type system enables complex business operations.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { Logging, idOf, typeOf, versionOf } from '@relational-fabric/canon'
const logger = Logging.create('examples:business-logic')


// =============================================================================
// Order Processing Functions
// =============================================================================

/**
 * Calculate order total with tax and discount
 */
export function calculateOrderTotal(order: unknown): {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
} {
  const orderId = idOf(order as Satisfies<'Id'>)
  const orderType = typeOf(order as Satisfies<'Type'>)
  const orderVersion = versionOf(order as Satisfies<'Version'>)

  logger.info(`Calculating total for ${orderType} ${orderId} (v${orderVersion})`)

  if (typeof order !== 'object' || order === null) {
    throw new Error('Order must be an object')
  }

  const orderObj = order as Record<string, unknown>

  // Extract items
  const items
    = (orderObj.items as Array<{ productId: string, quantity: number, price: number }>) || []

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Apply discount (10% for orders over $100)
  const discountRate = subtotal > 100 ? 0.1 : 0
  const discount = subtotal * discountRate

  // Calculate tax (8% on discounted amount)
  const taxRate = 0.08
  const tax = (subtotal - discount) * taxRate

  // Calculate total
  const total = subtotal - discount + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: 'USD',
  }
}

/**
 * Update order status with optimistic concurrency control
 */
export function updateOrderStatus(
  order: unknown,
  newStatus: string,
): {
  success: boolean
  oldStatus?: string
  newVersion?: number | string
  error?: string
} {
  try {
    const orderId = idOf(order as Satisfies<'Id'>)
    const currentVersion = versionOf(order as Satisfies<'Version'>)

    if (typeof order !== 'object' || order === null) {
      throw new Error('Order must be an object')
    }

    const orderObj = order as Record<string, unknown>
    const oldStatus = orderObj.status as string
    const newVersion = typeof currentVersion === 'number' ? currentVersion + 1 : currentVersion

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }

    const allowedTransitions = validTransitions[oldStatus] || []
    if (!allowedTransitions.includes(newStatus)) {
      return {
        success: false,
        oldStatus,
        error: `Invalid status transition from ${oldStatus} to ${newStatus}`,
      }
    }

    logger.success(`Updated order ${orderId} to status "${newStatus}" (v${newVersion})`)

    return {
      success: true,
      oldStatus,
      newVersion,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate order summary
 */
export function generateOrderSummary(order: unknown): {
  orderId: string
  status: string
  total: number
  currency: string
  itemCount: number
  createdAt: Date
  customerId: string
} {
  const orderId = idOf(order as Satisfies<'Id'>)
  typeOf(order as Satisfies<'Type'>)

  if (typeof order !== 'object' || order === null) {
    throw new Error('Order must be an object')
  }

  const orderObj = order as Record<string, unknown>
  const items = (orderObj.items as Array<unknown>) || []
  const totals = (orderObj.totals as { total: number, currency: string }) || {
    total: 0,
    currency: 'USD',
  }
  const customerId = (orderObj.customerId as string) || 'unknown'

  // Handle timestamps manually
  let createdAt = new Date()
  if (orderObj.createdAt instanceof Date) {
    createdAt = orderObj.createdAt
  }

  return {
    orderId,
    status: orderObj.status as string,
    total: totals.total,
    currency: totals.currency,
    itemCount: items.length,
    createdAt,
    customerId,
  }
}

// =============================================================================
// Customer Validation Functions
// =============================================================================

/**
 * Validate customer for order processing
 */
export function validateCustomerForOrder(customer: unknown): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    idOf(customer as Satisfies<'Id'>)
    typeOf(customer as Satisfies<'Type'>)

    if (typeof customer !== 'object' || customer === null) {
      errors.push('Customer must be an object')
      return { valid: false, warnings, errors }
    }

    const customerObj = customer as Record<string, unknown>

    // Check for payment methods
    const paymentMethods = (customerObj.paymentMethods as Array<unknown>) || []
    if (paymentMethods.length === 0) {
      warnings.push('Customer has no payment methods')
    }

    // Check for required profile information
    const profile = customerObj.profile as Record<string, unknown> | undefined
    if (!profile) {
      errors.push('Customer profile is missing')
    } else {
      if (!profile.email) {
        errors.push('Customer email is missing')
      }
      if (!profile.name) {
        errors.push('Customer name is missing')
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    }
  } catch (error) {
    return {
      valid: false,
      warnings,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

// =============================================================================
// Workflow Functions
// =============================================================================

/**
 * Process complete order workflow
 */
export function processOrderWorkflow(
  customer: unknown,
  order: unknown,
): {
  success: boolean
  steps: Array<{
    step: string
    success: boolean
    message: string
  }>
  finalOrder?: unknown
} {
  const steps: Array<{ step: string, success: boolean, message: string }> = []

  try {
    // Step 1: Validate Customer
    const customerValidation = validateCustomerForOrder(customer)
    steps.push({
      step: 'Validate Customer',
      success: customerValidation.valid,
      message: customerValidation.valid
        ? 'Customer is valid'
        : customerValidation.errors.join(', '),
    })

    if (!customerValidation.valid) {
      return { success: false, steps }
    }

    // Step 2: Calculate Total
    const totals = calculateOrderTotal(order)
    steps.push({
      step: 'Calculate Total',
      success: true,
      message: `Order total: ${totals.currency} ${totals.total}`,
    })

    // Step 3: Update Status
    const statusUpdate = updateOrderStatus(order, 'confirmed')
    steps.push({
      step: 'Update Status',
      success: statusUpdate.success,
      message: statusUpdate.success
        ? `Order status updated to confirmed`
        : statusUpdate.error || 'Unknown error',
    })

    if (!statusUpdate.success) {
      return { success: false, steps }
    }

    // Step 4: Generate Summary
    const summary = generateOrderSummary(order)
    steps.push({
      step: 'Generate Summary',
      success: true,
      message: `Order ${summary.orderId} processed with ${summary.itemCount} items`,
    })

    return {
      success: true,
      steps,
      finalOrder: order,
    }
  } catch (error) {
    steps.push({
      step: 'Error Handling',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    })

    return { success: false, steps }
  }
}
