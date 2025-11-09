# Real-World Business Scenarios

Practical business logic implementation using Canon for order processing, customer management, and workflows

**calculates order total correctly:**

```ts
const totals = calculateOrderTotal(sampleOrder)

expect(totals.subtotal).toBe(199.98)
expect(totals.discount).toBeCloseTo(19.998, 2)
expect(totals.tax).toBeCloseTo(14.398, 2)
expect(totals.total).toBeCloseTo(194.38, 2)
expect(totals.currency).toBe('USD')
```

**updates order status with version control:**

```ts
const result = updateOrderStatus(sampleOrder, 'shipped')

expect(result.success).toBe(true)
expect(result.oldStatus).toBe('processing')
expect(result.newVersion).toBe(3)
```

**rejects invalid status transitions:**

```ts
const result = updateOrderStatus(sampleOrder, 'pending')

expect(result.success).toBe(false)
expect(result.error).toContain('Invalid status transition')
```

**generates order summary correctly:**

```ts
const summary = generateOrderSummary(sampleOrder)

expect(summary.orderId).toBe('order-789')
expect(summary.status).toBe('processing')
expect(summary.total).toBe(194.38)
expect(summary.currency).toBe('USD')
expect(summary.itemCount).toBe(1)
expect(summary.customerId).toBe('cust-123')
```

**validates customer for order:**

```ts
const validation = validateCustomerForOrder(sampleCustomer)

expect(validation.valid).toBe(true)
expect(validation.warnings).toHaveLength(0)
expect(validation.errors).toHaveLength(0)
```

**validates customer with missing payment methods:**

```ts
const customerWithoutPayment = { ...sampleCustomer, paymentMethods: [] }
const validation = validateCustomerForOrder(customerWithoutPayment)

expect(validation.valid).toBe(true)
expect(validation.warnings).toContain('Customer has no payment methods')
```

**processes complete order workflow:**

```ts
// Create a new order with 'pending' status for the workflow test
const pendingOrder = { ...sampleOrder, status: 'pending' }
const workflow = processOrderWorkflow(sampleCustomer, pendingOrder)

expect(workflow.success).toBe(true)
expect(workflow.steps).toHaveLength(4)
expect(workflow.steps.every(step => step.success)).toBe(true)
```

**handles workflow errors gracefully:**

```ts
const invalidCustomer = { id: 'invalid' }
const workflow = processOrderWorkflow(invalidCustomer, sampleOrder)

expect(workflow.success).toBe(false)
expect(workflow.steps.some(step => !step.success)).toBe(true)
```

---

## References

**Source:** `/home/runner/work/canon/canon/examples/06-real-world-business-scenarios/index.ts`

## Metadata

**Keywords:** business-logic, order-processing, workflow, e-commerce, domain-models
**Difficulty:** advanced
