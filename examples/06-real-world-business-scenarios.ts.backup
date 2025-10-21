/**
 * Example: Real-World Business Scenarios
 *
 * This example demonstrates practical business scenarios where Canon's
 * universal type system provides real value in production applications.
 */

import type { Canon } from '@relational-fabric/canon'
import { 
  declareCanon, 
  idOf, 
  typeOf, 
  versionOf, 
  timestampsOf, 
  referencesOf,
  pojoWithOfType 
} from '@relational-fabric/canon'

// =============================================================================
// STEP 1: E-commerce Domain Canons
// =============================================================================

/**
 * E-commerce system with multiple data sources
 */
type EcommerceCanon = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { discriminator: true } }
  Version: { $basis: { version: number }, key: 'version', $meta: { optimistic: true } }
  Timestamps: { $basis: number | string | Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'iso8601' } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: 'uuid' } }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    Ecommerce: EcommerceCanon
  }
}

declareCanon('Ecommerce', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { discriminator: true } },
    Version: { $basis: pojoWithOfType('version', 'number'), key: 'version', $meta: { optimistic: true } },
    Timestamps: { $basis: (v: unknown): v is Date => v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'iso8601' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v, $meta: { format: 'uuid' } },
  },
})

// =============================================================================
// STEP 2: Business Domain Models
// =============================================================================

/**
 * Customer entity from internal database
 */
const customer = {
  id: 'cust-123',
  type: 'customer',
  version: 3,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  profile: {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    phone: '+1-555-0123',
  },
  preferences: {
    newsletter: true,
    smsNotifications: false,
    currency: 'USD',
  },
  addresses: [
    {
      id: 'addr-1',
      type: 'billing',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
  ],
}

/**
 * Product entity from product catalog API
 */
const product = {
  id: 'prod-456',
  type: 'product',
  version: 7,
  createdAt: new Date('2024-01-05T00:00:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  name: 'Canon Framework License',
  description: 'Universal type primitives for TypeScript applications',
  price: 99.99,
  currency: 'USD',
  category: 'software',
  tags: ['typescript', 'framework', 'types'],
  inventory: {
    inStock: true,
    quantity: 100,
    reserved: 5,
  },
  // References to related entities
  createdBy: 'admin-789',
  categoryId: 'cat-software',
  relatedProducts: ['prod-789', 'prod-101'],
}

/**
 * Order entity from order management system
 */
const order = {
  id: 'order-789',
  type: 'order',
  version: 2,
  createdAt: new Date('2024-01-15T09:30:00Z'),
  updatedAt: new Date('2024-01-15T11:45:00Z'),
  status: 'processing',
  total: 199.98,
  currency: 'USD',
  // References to other entities
  customerId: 'cust-123',
  items: [
    {
      productId: 'prod-456',
      quantity: 2,
      price: 99.99,
    },
  ],
  shippingAddress: 'addr-1',
  billingAddress: 'addr-1',
  paymentMethod: 'card-123',
}

// =============================================================================
// STEP 3: Business Logic Functions
// =============================================================================

/**
 * Calculate order total with discounts and taxes
 */
function calculateOrderTotal(order: unknown): {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
} {
  const orderId = idOf(order)
  const orderType = typeOf(order)
  const orderVersion = versionOf(order)
  
  console.log(`Calculating total for ${orderType} ${orderId} (v${orderVersion})`)
  
  if (typeof order !== 'object' || order === null) {
    throw new Error('Order must be an object')
  }
  
  const orderObj = order as Record<string, unknown>
  
  // Extract order data
  const subtotal = (orderObj.total as number) || 0
  const currency = (orderObj.currency as string) || 'USD'
  
  // Apply business rules
  const discount = subtotal > 100 ? subtotal * 0.1 : 0 // 10% discount for orders over $100
  const tax = (subtotal - discount) * 0.08 // 8% tax
  const total = subtotal - discount + tax
  
  return {
    subtotal,
    discount,
    tax,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    currency,
  }
}

/**
 * Process order status update with optimistic concurrency control
 */
function updateOrderStatus(order: unknown, newStatus: string, expectedVersion: number): {
  success: boolean
  order?: unknown
  error?: string
} {
  const orderId = idOf(order)
  const currentVersion = versionOf(order)
  
  // Check optimistic concurrency control
  if (currentVersion !== expectedVersion) {
    return {
      success: false,
      error: `Version mismatch: expected ${expectedVersion}, got ${currentVersion}`,
    }
  }
  
  // Update the order
  const updatedOrder = {
    ...(order as Record<string, unknown>),
    status: newStatus,
    version: (currentVersion as number) + 1,
    updatedAt: new Date(),
  }
  
  console.log(`Updated order ${orderId} to status "${newStatus}" (v${versionOf(updatedOrder)})`)
  
  return {
    success: true,
    order: updatedOrder,
  }
}

/**
 * Generate order summary for customer
 */
function generateOrderSummary(order: unknown): {
  orderId: string
  status: string
  total: number
  currency: string
  itemCount: number
  createdAt: Date
  customerId: string
} {
  const orderId = idOf(order)
  const orderType = typeOf(order)
  const createdAt = timestampsOf((order as Record<string, unknown>).createdAt)
  
  if (typeof order !== 'object' || order === null) {
    throw new Error('Order must be an object')
  }
  
  const orderObj = order as Record<string, unknown>
  
  // Extract order data
  const status = (orderObj.status as string) || 'unknown'
  const total = (orderObj.total as number) || 0
  const currency = (orderObj.currency as string) || 'USD'
  const customerId = (orderObj.customerId as string) || 'unknown'
  
  // Count items
  const items = (orderObj.items as unknown[]) || []
  const itemCount = items.length
  
  return {
    orderId,
    status,
    total,
    currency,
    itemCount,
    createdAt,
    customerId,
  }
}

/**
 * Validate customer data for order processing
 */
function validateCustomerForOrder(customer: unknown, order: unknown): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    const customerId = idOf(customer)
    const customerType = typeOf(customer)
    
    if (customerType !== 'customer') {
      errors.push('Entity is not a customer')
      return { isValid: false, errors, warnings }
    }
    
    // Check if customer has required data
    if (typeof customer === 'object' && customer !== null) {
      const customerObj = customer as Record<string, unknown>
      
      // Check for email
      if (!customerObj.profile || typeof customerObj.profile !== 'object') {
        errors.push('Customer profile is missing')
      } else {
        const profile = customerObj.profile as Record<string, unknown>
        if (!profile.email || typeof profile.email !== 'string') {
          errors.push('Customer email is missing or invalid')
        }
      }
      
      // Check for addresses
      if (!customerObj.addresses || !Array.isArray(customerObj.addresses)) {
        warnings.push('Customer has no addresses')
      } else if (customerObj.addresses.length === 0) {
        warnings.push('Customer has no addresses')
      }
      
      // Check for payment methods
      if (!customerObj.paymentMethods || !Array.isArray(customerObj.paymentMethods)) {
        warnings.push('Customer has no payment methods')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Customer validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    }
  }
}

// =============================================================================
// STEP 4: Cross-Entity Operations
// =============================================================================

/**
 * Process complete order workflow
 */
function processOrderWorkflow(customer: unknown, order: unknown): {
  success: boolean
  steps: Array<{
    step: string
    success: boolean
    message: string
  }>
  finalOrder?: unknown
} {
  const steps: Array<{ step: string; success: boolean; message: string }> = []
  
  try {
    // Step 1: Validate customer
    const customerValidation = validateCustomerForOrder(customer, order)
    if (!customerValidation.isValid) {
      steps.push({
        step: 'Validate Customer',
        success: false,
        message: `Customer validation failed: ${customerValidation.errors.join(', ')}`,
      })
      return { success: false, steps }
    }
    steps.push({
      step: 'Validate Customer',
      success: true,
      message: 'Customer is valid',
    })
    
    // Step 2: Calculate order total
    const orderTotal = calculateOrderTotal(order)
    steps.push({
      step: 'Calculate Total',
      success: true,
      message: `Order total: ${orderTotal.currency} ${orderTotal.total}`,
    })
    
    // Step 3: Update order status
    const orderId = idOf(order)
    const currentVersion = versionOf(order)
    const statusUpdate = updateOrderStatus(order, 'confirmed', currentVersion as number)
    
    if (!statusUpdate.success) {
      steps.push({
        step: 'Update Status',
        success: false,
        message: statusUpdate.error || 'Status update failed',
      })
      return { success: false, steps }
    }
    
    steps.push({
      step: 'Update Status',
      success: true,
      message: 'Order status updated to confirmed',
    })
    
    // Step 4: Generate summary
    const summary = generateOrderSummary(statusUpdate.order!)
    steps.push({
      step: 'Generate Summary',
      success: true,
      message: `Order ${summary.orderId} processed with ${summary.itemCount} items`,
    })
    
    return {
      success: true,
      steps,
      finalOrder: statusUpdate.order,
    }
  } catch (error) {
    steps.push({
      step: 'Error Handling',
      success: false,
      message: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    return { success: false, steps }
  }
}

// =============================================================================
// STEP 5: Run Examples and Tests
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Real-World Business Scenarios', () => {
    it('calculates order total correctly', () => {
      const total = calculateOrderTotal(order)
      
      expect(total.subtotal).toBe(199.98)
      expect(total.discount).toBe(19.998) // 10% of 199.98
      expect(total.tax).toBeCloseTo(14.398, 2) // 8% of (199.98 - 19.998)
      expect(total.total).toBe(194.38) // 199.98 - 19.998 + 14.398
      expect(total.currency).toBe('USD')
    })

    it('updates order status with version control', () => {
      const currentVersion = versionOf(order)
      const result = updateOrderStatus(order, 'shipped', currentVersion as number)
      
      expect(result.success).toBe(true)
      expect(result.order).toBeDefined()
      expect(versionOf(result.order!)).toBe((currentVersion as number) + 1)
    })

    it('handles version mismatch in status update', () => {
      const result = updateOrderStatus(order, 'shipped', 999) // Wrong version
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Version mismatch')
    })

    it('generates order summary correctly', () => {
      const summary = generateOrderSummary(order)
      
      expect(summary.orderId).toBe('order-789')
      expect(summary.status).toBe('processing')
      expect(summary.total).toBe(199.98)
      expect(summary.currency).toBe('USD')
      expect(summary.itemCount).toBe(1)
      expect(summary.customerId).toBe('cust-123')
    })

    it('validates customer for order processing', () => {
      const validation = validateCustomerForOrder(customer, order)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.warnings).toContain('Customer has no payment methods')
    })

    it('processes complete order workflow', () => {
      const workflow = processOrderWorkflow(customer, order)
      
      expect(workflow.success).toBe(true)
      expect(workflow.steps).toHaveLength(4)
      expect(workflow.steps[0].step).toBe('Validate Customer')
      expect(workflow.steps[0].success).toBe(true)
      expect(workflow.finalOrder).toBeDefined()
    })

    it('handles workflow errors gracefully', () => {
      const invalidCustomer = { id: 'invalid', type: 'not-customer' }
      const workflow = processOrderWorkflow(invalidCustomer, order)
      
      expect(workflow.success).toBe(false)
      expect(workflow.steps[0].success).toBe(false)
      expect(workflow.steps[0].message).toContain('Entity is not a customer')
    })
  })
}

// Run the examples
console.log('=== Real-World Business Scenarios ===')

console.log('\n1. Order Total Calculation:')
const orderTotal = calculateOrderTotal(order)
console.log(orderTotal)

console.log('\n2. Order Status Update:')
const currentVersion = versionOf(order)
const statusUpdate = updateOrderStatus(order, 'shipped', currentVersion as number)
console.log('Status update result:', statusUpdate.success ? 'Success' : 'Failed')
if (statusUpdate.success) {
  console.log('New version:', versionOf(statusUpdate.order!))
}

console.log('\n3. Order Summary:')
const summary = generateOrderSummary(order)
console.log(summary)

console.log('\n4. Customer Validation:')
const customerValidation = validateCustomerForOrder(customer, order)
console.log('Customer valid:', customerValidation.isValid)
if (customerValidation.warnings.length > 0) {
  console.log('Warnings:', customerValidation.warnings)
}

console.log('\n5. Complete Order Workflow:')
const workflow = processOrderWorkflow(customer, order)
console.log('Workflow success:', workflow.success)
workflow.steps.forEach((step, index) => {
  console.log(`  Step ${index + 1}: ${step.step} - ${step.success ? 'Success' : 'Failed'}`)
  console.log(`    ${step.message}`)
})

/**
 * Key Takeaways:
 *
 * 1. **Domain Modeling**: Use canons to model business domains with semantic concepts
 * 2. **Business Logic**: Write business logic that works with semantic concepts, not field names
 * 3. **Cross-Entity Operations**: Process relationships between entities using universal functions
 * 4. **Workflow Processing**: Build complex workflows that work across different data formats
 * 5. **Error Handling**: Handle business logic errors gracefully
 * 6. **Version Control**: Use version axioms for optimistic concurrency control
 * 7. **Real-World Value**: Examples show practical business value of the universal type system
 */