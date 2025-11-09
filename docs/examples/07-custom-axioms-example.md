# Custom Axioms Usage Examples

```typescript
import {
  calculateOrderTotalWithCurrency,
  processCustomerRegistration,
  updateEntityStatus,
} from './business-scenarios.js'

import { currencyOf, emailOf, priorityOf, statusOf } from './custom-functions.js'

import './custom-axioms'
```

Customer entity with custom axioms

```typescript
const customerWithCustomFields = {
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
```

Product entity with custom axioms

```typescript
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
```

Order entity with custom axioms

```typescript
const orderWithCustomFields = {
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
```

**Test: extracts email from customer entity** ✅

```typescript
const email = emailOf(customerWithCustomFields)
expect(email).toBe('alice@example.com')
```

**Test: validates email format** ✅

```typescript
const invalidCustomer = { ...customerWithCustomFields, email: 'invalid-email' }
expect(() => emailOf(invalidCustomer)).toThrow('Invalid email format')
```

**Test: converts currency from different formats** ✅

```typescript
const currency1 = currencyOf(99.99)
expect(currency1).toEqual({ amount: 99.99, currency: 'USD' })
const currency2 = currencyOf('$150.50 USD')
expect(currency2).toEqual({ amount: 150.5, currency: 'USD' })
const currency3 = currencyOf({ amount: 200, currency: 'EUR' })
expect(currency3).toEqual({ amount: 200, currency: 'EUR' })
```

**Test: extracts and validates status** ✅

```typescript
const status = statusOf(customerWithCustomFields)
expect(status).toBe('active')
```

**Test: validates status transitions** ✅

```typescript
const invalidStatus = { ...customerWithCustomFields, status: 'invalid' }
expect(() => statusOf(invalidStatus)).toThrow('Invalid status')
```

**Test: converts priority from different formats** ✅

```typescript
const priority1 = priorityOf('high')
expect(priority1).toEqual({ level: 3, label: 'high' })
const priority2 = priorityOf(2)
expect(priority2).toEqual({ level: 2, label: 'medium' })
const priority3 = priorityOf({ level: 4, label: 'critical' })
expect(priority3).toEqual({ level: 4, label: 'critical' })
```

**Test: processes customer registration with custom validation** ✅

```typescript
const result = processCustomerRegistration(customerWithCustomFields)
expect(result.success).toBe(true)
expect(result.customerId).toBe('cust-123')
expect(result.email).toBe('alice@example.com')
expect(result.status).toBe('active')
expect(result.priority.level).toBe(3)
```

**Test: calculates order total with currency conversion** ✅

```typescript
const result = calculateOrderTotalWithCurrency(orderWithCustomFields)
expect(result.subtotal.amount).toBe(199.98)
expect(result.tax.amount).toBeCloseTo(15.998, 2)
expect(result.total.amount).toBeCloseTo(215.978, 2)
expect(result.subtotal.currency).toBe('USD')
```

**Test: validates status transitions** ✅

```typescript
const result = updateEntityStatus(customerWithCustomFields, 'inactive')
expect(result.success).toBe(true)
expect(result.oldStatus).toBe('active')
expect(result.newStatus).toBe('inactive')
```

**Test: rejects invalid status transitions** ✅

```typescript
const result = updateEntityStatus(customerWithCustomFields, 'draft')
expect(result.success).toBe(false)
expect(result.error).toContain('Invalid transition')
```

```typescript
console.log('=== Custom Axioms Examples ===')

console.log('\n1. Customer Registration:')

const customerResult = processCustomerRegistration(customerWithCustomFields)

console.log('Customer registration result:', customerResult)

console.log('\n2. Order Total Calculation:')

const orderTotal = calculateOrderTotalWithCurrency(orderWithCustomFields)

console.log('Order total:', orderTotal)

console.log('\n3. Status Update:')

const statusUpdate = updateEntityStatus(customerWithCustomFields, 'inactive')

console.log('Status update result:', statusUpdate)

console.log('\n4. Currency Conversion Examples:')

const currencyExamples = [
  currencyOf(99.99),
  currencyOf('$150.50 USD'),
  currencyOf({ amount: 200, currency: 'EUR' }),
]

console.log('Currency conversions:', currencyExamples)

console.log('\n5. Priority Conversion Examples:')

const priorityExamples = [
  priorityOf('high'),
  priorityOf(2),
  priorityOf({ level: 4, label: 'critical' }),
]

console.log('Priority conversions:', priorityExamples)
```

---

## References

**Source:** `07-custom-axioms-example/usage.ts`
