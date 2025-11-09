# Real-World Business Scenarios Usage Examples

```typescript
import {
  calculateOrderTotal,
  generateOrderSummary,
  processOrderWorkflow,
  updateOrderStatus,
  validateCustomerForOrder,
} from './business-logic.js'

import { sampleCustomer, sampleOrder } from './domain-models.js'
```

**Test: calculates order total correctly** ✅

```typescript
const totals = calculateOrderTotal(sampleOrder)
expect(totals.subtotal).toBe(199.98)
expect(totals.discount).toBeCloseTo(19.998, 2)
expect(totals.tax).toBeCloseTo(14.398, 2)
expect(totals.total).toBeCloseTo(194.38, 2)
expect(totals.currency).toBe('USD')
```

**Test: updates order status with version control** ✅

```typescript
const result = updateOrderStatus(sampleOrder, 'shipped')
expect(result.success).toBe(true)
expect(result.oldStatus).toBe('processing')
expect(result.newVersion).toBe(3)
```

**Test: rejects invalid status transitions** ✅

```typescript
const result = updateOrderStatus(sampleOrder, 'pending')
expect(result.success).toBe(false)
expect(result.error).toContain('Invalid status transition')
```

**Test: generates order summary correctly** ✅

```typescript
const summary = generateOrderSummary(sampleOrder)
expect(summary.orderId).toBe('order-789')
expect(summary.status).toBe('processing')
expect(summary.total).toBe(194.38)
expect(summary.currency).toBe('USD')
expect(summary.itemCount).toBe(1)
expect(summary.customerId).toBe('cust-123')
```

**Test: validates customer for order** ✅

```typescript
const validation = validateCustomerForOrder(sampleCustomer)
expect(validation.valid).toBe(true)
expect(validation.warnings).toHaveLength(0)
expect(validation.errors).toHaveLength(0)
```

**Test: validates customer with missing payment methods** ✅

```typescript
const customerWithoutPayment = { ...sampleCustomer, paymentMethods: [] }
const validation = validateCustomerForOrder(customerWithoutPayment)
expect(validation.valid).toBe(true)
expect(validation.warnings).toContain('Customer has no payment methods')
```

**Test: processes complete order workflow** ✅

```typescript
const pendingOrder = { ...sampleOrder, status: 'pending' }
const workflow = processOrderWorkflow(sampleCustomer, pendingOrder)
expect(workflow.success).toBe(true)
expect(workflow.steps).toHaveLength(4)
expect(workflow.steps.every(step => step.success)).toBe(true)
```

**Test: handles workflow errors gracefully** ✅

```typescript
const invalidCustomer = { id: 'invalid' }
const workflow = processOrderWorkflow(invalidCustomer, sampleOrder)
expect(workflow.success).toBe(false)
expect(workflow.steps.some(step => !step.success)).toBe(true)
```

```typescript
console.log('=== Real-World Business Scenarios ===')
```

```typescript
console.log('\n1. Order Total Calculation:')

const totals = calculateOrderTotal(sampleOrder)

console.log(totals)
```

```typescript
console.log('\n2. Order Status Update:')

const statusUpdate = updateOrderStatus(sampleOrder, 'shipped')

console.log(`Status update result: ${statusUpdate.success ? 'Success' : 'Failed'}`)

if (statusUpdate.success) {
  console.log(`New version: ${statusUpdate.newVersion}`)
}
else {
  console.log(`Error: ${statusUpdate.error}`)
}
```

```typescript
console.log('\n3. Order Summary:')

const summary = generateOrderSummary(sampleOrder)

console.log(summary)
```

```typescript
console.log('\n4. Customer Validation:')

const customerValidation = validateCustomerForOrder(sampleCustomer)

console.log(`Customer valid: ${customerValidation.valid}`)

if (customerValidation.warnings.length > 0) {
  console.log(`Warnings: ${JSON.stringify(customerValidation.warnings)}`)
}

if (customerValidation.errors.length > 0) {
  console.log(`Errors: ${JSON.stringify(customerValidation.errors)}`)
}
```

```typescript
console.log('\n5. Complete Order Workflow:')

const workflow = processOrderWorkflow(sampleCustomer, sampleOrder)

console.log(`Workflow success: ${workflow.success}`)

workflow.steps.forEach((step, index) => {
  console.log(`  Step ${index + 1}: ${step.step} - ${step.success ? 'Success' : 'Failed'}`)
  console.log(`    ${step.message}`)
})
```

---

## References

**Source:** `06-real-world-business-scenarios/usage.ts`
