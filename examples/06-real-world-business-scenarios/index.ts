/**
 * @document.title Real-World Business Scenarios
 * @document.description Practical business logic implementation using Canon for order processing, customer management, and workflows
 * @document.keywords business-logic, order-processing, workflow, e-commerce, domain-models
 * @document.difficulty advanced
 */

import { Consola } from '@relational-fabric/canon'
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
Consola.info('=== Real-World Business Scenarios ===')

// 1. Order Total Calculation
Consola.info('\n1. Order Total Calculation:')
const totals = calculateOrderTotal(sampleOrder)
Consola.log(totals)

// 2. Order Status Update
Consola.info('\n2. Order Status Update:')
const statusUpdate = updateOrderStatus(sampleOrder, 'shipped')
Consola.log(`Status update result: ${statusUpdate.success ? 'Success' : 'Failed'}`)
if (statusUpdate.success) {
  Consola.log(`New version: ${statusUpdate.newVersion}`)
} else {
  Consola.error(`Error: ${statusUpdate.error}`)
}

// 3. Order Summary
Consola.info('\n3. Order Summary:')
const summary = generateOrderSummary(sampleOrder)
Consola.log(summary)

// 4. Customer Validation
Consola.info('\n4. Customer Validation:')
const customerValidation = validateCustomerForOrder(sampleCustomer)
Consola.log(`Customer valid: ${customerValidation.valid}`)
if (customerValidation.warnings.length > 0) {
  Consola.warn(`Warnings: ${JSON.stringify(customerValidation.warnings)}`)
}
if (customerValidation.errors.length > 0) {
  Consola.error(`Errors: ${JSON.stringify(customerValidation.errors)}`)
}

// 5. Complete Workflow
Consola.info('\n5. Complete Order Workflow:')
const workflow = processOrderWorkflow(sampleCustomer, sampleOrder)
Consola.log(`Workflow success: ${workflow.success}`)
workflow.steps.forEach((step, index) => {
  Consola.log(`  Step ${index + 1}: ${step.step} - ${step.success ? 'Success' : 'Failed'}`)
  Consola.log(`    ${step.message}`)
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
