# 06 Real World Business Scenarios

Real-World Business Scenarios Usage Examples

## Key Concepts

- **Real-World Applications**: Canon enables complex business logic with type safety
- **Domain Modeling**: Rich domain models with proper entity relationships
- **Business Rules**: Encode business rules directly into the type system
- **Workflow Management**: Complete business workflows with error handling
- **Version Control**: Optimistic concurrency control for data consistency
- **Validation**: Comprehensive validation with detailed error reporting
- **Type Safety**: Full TypeScript type safety across complex business operations
- **Error Handling**: Graceful error handling with detailed error messages
- **Modularity**: Clean separation of concerns with focused modules
- **Maintainability**: Easy to maintain and extend business logic

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios)

## Files

- `06-real-world-business-scenarios/business-logic.ts`
- `06-real-world-business-scenarios/domain-models.ts`
- `06-real-world-business-scenarios/usage.ts`

## File: `06-real-world-business-scenarios/business-logic.ts`

```typescript
/**
 * Business Logic Functions
 *
 * This file contains the core business logic functions that demonstrate
 * how Canon's universal type system enables complex business operations.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { idOf, typeOf, versionOf } from '@relational-fabric/canon'

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

  console.log(`Calculating total for ${orderType} ${orderId} (v${orderVersion})`)

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

    console.log(`Updated order ${orderId} to status "${newStatus}" (v${newVersion})`)

    return {
      success: true,
      oldStatus,
      newVersion,
    }
  }
  catch (error) {
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
    }
    else {
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
  }
  catch (error) {
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
  }
  catch (error) {
    steps.push({
      step: 'Error Handling',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    })

    return { success: false, steps }
  }
}
```
## File: `06-real-world-business-scenarios/domain-models.ts`

```typescript
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
```
## File: `06-real-world-business-scenarios/usage.ts`

```typescript
/**
 * Real-World Business Scenarios Usage Examples
 *
 * This file demonstrates practical business scenarios using Canon's
 * universal type system in real-world applications.
 */

import {
  calculateOrderTotal,
  generateOrderSummary,
  processOrderWorkflow,
  updateOrderStatus,
  validateCustomerForOrder,
} from './business-logic.js'
import { sampleCustomer, sampleOrder } from './domain-models.js'

// =============================================================================
// Example Usage
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Real-World Business Scenarios', () => {
    it('calculates order total correctly', () => {
      const totals = calculateOrderTotal(sampleOrder)

      expect(totals.subtotal).toBe(199.98)
      expect(totals.discount).toBeCloseTo(19.998, 2)
      expect(totals.tax).toBeCloseTo(14.398, 2)
      expect(totals.total).toBeCloseTo(194.38, 2)
      expect(totals.currency).toBe('USD')
    })

    it('updates order status with version control', () => {
      const result = updateOrderStatus(sampleOrder, 'shipped')

      expect(result.success).toBe(true)
      expect(result.oldStatus).toBe('processing')
      expect(result.newVersion).toBe(3)
    })

    it('rejects invalid status transitions', () => {
      const result = updateOrderStatus(sampleOrder, 'pending')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid status transition')
    })

    it('generates order summary correctly', () => {
      const summary = generateOrderSummary(sampleOrder)

      expect(summary.orderId).toBe('order-789')
      expect(summary.status).toBe('processing')
      expect(summary.total).toBe(194.38)
      expect(summary.currency).toBe('USD')
      expect(summary.itemCount).toBe(1)
      expect(summary.customerId).toBe('cust-123')
    })

    it('validates customer for order', () => {
      const validation = validateCustomerForOrder(sampleCustomer)

      expect(validation.valid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
      expect(validation.errors).toHaveLength(0)
    })

    it('validates customer with missing payment methods', () => {
      const customerWithoutPayment = { ...sampleCustomer, paymentMethods: [] }
      const validation = validateCustomerForOrder(customerWithoutPayment)

      expect(validation.valid).toBe(true)
      expect(validation.warnings).toContain('Customer has no payment methods')
    })

    it('processes complete order workflow', () => {
      // Create a new order with 'pending' status for the workflow test
      const pendingOrder = { ...sampleOrder, status: 'pending' }
      const workflow = processOrderWorkflow(sampleCustomer, pendingOrder)

      expect(workflow.success).toBe(true)
      expect(workflow.steps).toHaveLength(4)
      expect(workflow.steps.every(step => step.success)).toBe(true)
    })

    it('handles workflow errors gracefully', () => {
      const invalidCustomer = { id: 'invalid' }
      const workflow = processOrderWorkflow(invalidCustomer, sampleOrder)

      expect(workflow.success).toBe(false)
      expect(workflow.steps.some(step => !step.success)).toBe(true)
    })
  })
}

// Run the examples
console.log('=== Real-World Business Scenarios ===')

// 1. Order Total Calculation
console.log('\n1. Order Total Calculation:')
const totals = calculateOrderTotal(sampleOrder)
console.log(totals)

// 2. Order Status Update
console.log('\n2. Order Status Update:')
const statusUpdate = updateOrderStatus(sampleOrder, 'shipped')
console.log(`Status update result: ${statusUpdate.success ? 'Success' : 'Failed'}`)
if (statusUpdate.success) {
  console.log(`New version: ${statusUpdate.newVersion}`)
}
else {
  console.log(`Error: ${statusUpdate.error}`)
}

// 3. Order Summary
console.log('\n3. Order Summary:')
const summary = generateOrderSummary(sampleOrder)
console.log(summary)

// 4. Customer Validation
console.log('\n4. Customer Validation:')
const customerValidation = validateCustomerForOrder(sampleCustomer)
console.log(`Customer valid: ${customerValidation.valid}`)
if (customerValidation.warnings.length > 0) {
  console.log(`Warnings: ${JSON.stringify(customerValidation.warnings)}`)
}
if (customerValidation.errors.length > 0) {
  console.log(`Errors: ${JSON.stringify(customerValidation.errors)}`)
}

// 5. Complete Workflow
console.log('\n5. Complete Order Workflow:')
const workflow = processOrderWorkflow(sampleCustomer, sampleOrder)
console.log(`Workflow success: ${workflow.success}`)
workflow.steps.forEach((step, index) => {
  console.log(`  Step ${index + 1}: ${step.step} - ${step.success ? 'Success' : 'Failed'}`)
  console.log(`    ${step.message}`)
})

/**
 * Key Takeaways:
 *
 * 1. **Real-World Applications**: Canon enables complex business logic with type safety
 * 2. **Domain Modeling**: Rich domain models with proper entity relationships
 * 3. **Business Rules**: Encode business rules directly into the type system
 * 4. **Workflow Management**: Complete business workflows with error handling
 * 5. **Version Control**: Optimistic concurrency control for data consistency
 * 6. **Validation**: Comprehensive validation with detailed error reporting
 * 7. **Type Safety**: Full TypeScript type safety across complex business operations
 * 8. **Error Handling**: Graceful error handling with detailed error messages
 * 9. **Modularity**: Clean separation of concerns with focused modules
 * 10. **Maintainability**: Easy to maintain and extend business logic
 */
```
