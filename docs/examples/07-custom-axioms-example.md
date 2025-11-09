# Custom Axioms

Creating and using custom axioms (Email, Currency, Status, Priority) for domain-specific requirements

```ts
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

```ts
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

```ts
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

**extracts email from customer entity:**

```ts
const email = emailOf(customerWithCustomFields)
      expect(email).toBe('alice@example.com')
```

_Status:_ ✅ pass

**validates email format:**

```ts
const invalidCustomer = { ...customerWithCustomFields, email: 'invalid-email' }
      expect(() => emailOf(invalidCustomer)).toThrow('Invalid email format')
```

_Status:_ ✅ pass

**converts currency from different formats:**

```ts
// Test number conversion
      const currency1 = currencyOf(99.99)
      expect(currency1).toEqual({ amount: 99.99, currency: 'USD' })

      // Test string conversion
      const currency2 = currencyOf('$150.50 USD')
      expect(currency2).toEqual({ amount: 150.5, currency: 'USD' })

      // Test object (already canonical)
      const currency3 = currencyOf({ amount: 200, currency: 'EUR' })
      expect(currency3).toEqual({ amount: 200, currency: 'EUR' })
```

_Status:_ ✅ pass

**extracts and validates status:**

```ts
const status = statusOf(customerWithCustomFields)
      expect(status).toBe('active')
```

_Status:_ ✅ pass

**validates status transitions:**

```ts
const invalidStatus = { ...customerWithCustomFields, status: 'invalid' }
      expect(() => statusOf(invalidStatus)).toThrow('Invalid status')
```

_Status:_ ✅ pass

**converts priority from different formats:**

```ts
// Test string conversion
      const priority1 = priorityOf('high')
      expect(priority1).toEqual({ level: 3, label: 'high' })

      // Test number conversion
      const priority2 = priorityOf(2)
      expect(priority2).toEqual({ level: 2, label: 'medium' })

      // Test object (already canonical)
      const priority3 = priorityOf({ level: 4, label: 'critical' })
      expect(priority3).toEqual({ level: 4, label: 'critical' })
```

_Status:_ ✅ pass

**processes customer registration with custom validation:**

```ts
const result = processCustomerRegistration(customerWithCustomFields)

      expect(result.success).toBe(true)
      expect(result.customerId).toBe('cust-123')
      expect(result.email).toBe('alice@example.com')
      expect(result.status).toBe('active')
      expect(result.priority.level).toBe(3)
```

_Status:_ ✅ pass

**calculates order total with currency conversion:**

```ts
const result = calculateOrderTotalWithCurrency(orderWithCustomFields)

      expect(result.subtotal.amount).toBe(199.98)
      expect(result.tax.amount).toBeCloseTo(15.998, 2)
      expect(result.total.amount).toBeCloseTo(215.978, 2)
      expect(result.subtotal.currency).toBe('USD')
```

_Status:_ ✅ pass

**validates status transitions:**

```ts
const result = updateEntityStatus(customerWithCustomFields, 'inactive')

      expect(result.success).toBe(true)
      expect(result.oldStatus).toBe('active')
      expect(result.newStatus).toBe('inactive')
```

_Status:_ ✅ pass

**rejects invalid status transitions:**

```ts
const result = updateEntityStatus(customerWithCustomFields, 'draft')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid transition')
```

_Status:_ ✅ pass

---

## References

**Source:** `/Users/bahulneel/Projects/RelationalFabric/canon/examples/07-custom-axioms-example/index.ts`

## Metadata

**Keywords:** custom-axioms, domain-specific, email, currency, status, priority
**Difficulty:** advanced
