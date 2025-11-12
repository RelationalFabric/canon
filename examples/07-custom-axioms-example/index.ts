/**
 * @document.title Custom Axioms
 * @document.description Creating and using custom axioms (Email, Currency, Status, Priority) for domain-specific requirements
 * @document.keywords custom-axioms, domain-specific, email, currency, status, priority
 * @document.difficulty advanced
 */

import { createLogger } from '@relational-fabric/canon'
import {
  calculateOrderTotalWithCurrency,
  processCustomerRegistration,
  updateEntityStatus,
} from './business-scenarios.js'
import { currencyOf, emailOf, priorityOf, statusOf } from './custom-functions.js'
import './custom-axioms' // Import canon definitions

// =============================================================================
// Sample Data
// =============================================================================

/**
 * Customer entity with custom axioms
 */
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

// =============================================================================
// Example Usage
// =============================================================================

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Custom Axioms Examples', () => {
    it('extracts email from customer entity', () => {
      const email = emailOf(customerWithCustomFields)
      expect(email).toBe('alice@example.com')
    })

    it('validates email format', () => {
      const invalidCustomer = { ...customerWithCustomFields, email: 'invalid-email' }
      expect(() => emailOf(invalidCustomer)).toThrow('Invalid email format')
    })

    it('converts currency from different formats', () => {
      // Test number conversion
      const currency1 = currencyOf(99.99)
      expect(currency1).toEqual({ amount: 99.99, currency: 'USD' })

      // Test string conversion
      const currency2 = currencyOf('$150.50 USD')
      expect(currency2).toEqual({ amount: 150.5, currency: 'USD' })

      // Test object (already canonical)
      const currency3 = currencyOf({ amount: 200, currency: 'EUR' })
      expect(currency3).toEqual({ amount: 200, currency: 'EUR' })
    })

    it('extracts and validates status', () => {
      const status = statusOf(customerWithCustomFields)
      expect(status).toBe('active')
    })

    it('validates status transitions', () => {
      const invalidStatus = { ...customerWithCustomFields, status: 'invalid' }
      expect(() => statusOf(invalidStatus)).toThrow('Invalid status')
    })

    it('converts priority from different formats', () => {
      // Test string conversion
      const priority1 = priorityOf('high')
      expect(priority1).toEqual({ level: 3, label: 'high' })

      // Test number conversion
      const priority2 = priorityOf(2)
      expect(priority2).toEqual({ level: 2, label: 'medium' })

      // Test object (already canonical)
      const priority3 = priorityOf({ level: 4, label: 'critical' })
      expect(priority3).toEqual({ level: 4, label: 'critical' })
    })

    it('processes customer registration with custom validation', () => {
      const result = processCustomerRegistration(customerWithCustomFields)

      expect(result.success).toBe(true)
      expect(result.customerId).toBe('cust-123')
      expect(result.email).toBe('alice@example.com')
      expect(result.status).toBe('active')
      expect(result.priority.level).toBe(3)
    })

    it('calculates order total with currency conversion', () => {
      const result = calculateOrderTotalWithCurrency(orderWithCustomFields)

      expect(result.subtotal.amount).toBe(199.98)
      expect(result.tax.amount).toBeCloseTo(15.998, 2)
      expect(result.total.amount).toBeCloseTo(215.978, 2)
      expect(result.subtotal.currency).toBe('USD')
    })

    it('validates status transitions', () => {
      const result = updateEntityStatus(customerWithCustomFields, 'inactive')

      expect(result.success).toBe(true)
      expect(result.oldStatus).toBe('active')
      expect(result.newStatus).toBe('inactive')
    })

    it('rejects invalid status transitions', () => {
      const result = updateEntityStatus(customerWithCustomFields, 'draft')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })
  })
}

const logger = createLogger('examples:custom-axioms:index')

// Run the examples
logger.info('=== Custom Axioms Examples ===')

logger.info('\n1. Customer Registration:')
const customerResult = processCustomerRegistration(customerWithCustomFields)
logger.log('Customer registration result:', customerResult)

logger.info('\n2. Order Total Calculation:')
const orderTotal = calculateOrderTotalWithCurrency(orderWithCustomFields)
logger.log('Order total:', orderTotal)

logger.info('\n3. Status Update:')
const statusUpdate = updateEntityStatus(customerWithCustomFields, 'inactive')
logger.log('Status update result:', statusUpdate)

logger.info('\n4. Currency Conversion Examples:')
const currencyExamples = [
  currencyOf(99.99),
  currencyOf('$150.50 USD'),
  currencyOf({ amount: 200, currency: 'EUR' }),
]
logger.log('Currency conversions:', currencyExamples)

logger.info('\n5. Priority Conversion Examples:')
const priorityExamples = [
  priorityOf('high'),
  priorityOf(2),
  priorityOf({ level: 4, label: 'critical' }),
]
logger.log('Priority conversions:', priorityExamples)

/**
 * Key Takeaways:
 *
 * 1. **Custom Axiom Types**: Define your own axiom types using KeyNameAxiom, RepresentationAxiom, or custom Axiom types
 * 2. **Axiom Registration**: Register custom axioms in the global Axioms interface
 * 3. **Custom Functions**: Implement your own universal functions (emailOf, currencyOf, etc.)
 * 4. **Domain-Specific Logic**: Add validation, conversion, and business logic specific to your domain
 * 5. **Type Safety**: Maintain full TypeScript type safety with custom axioms
 * 6. **Canon Integration**: Use custom axioms in your canon definitions
 * 7. **Real-World Applications**: Custom axioms enable domain-specific semantic concepts
 * 8. **Validation**: Add custom validation logic for your specific use cases
 * 9. **Conversion**: Implement format conversion for your custom data types
 * 10. **Business Rules**: Encode business rules directly into your axiom implementations
 */
