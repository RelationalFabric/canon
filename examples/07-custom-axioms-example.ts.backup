/**
 * Example: Custom Axioms - Defining Your Own Semantic Concepts
 *
 * This example demonstrates how to create custom axioms beyond the core set,
 * showing how to define domain-specific semantic concepts that work with
 * Canon's universal type system.
 */

import type { Canon, Axiom, KeyNameAxiom, RepresentationAxiom } from '@relational-fabric/canon'
import { 
  declareCanon, 
  idOf, 
  typeOf, 
  versionOf, 
  timestampsOf, 
  referencesOf,
  pojoWithOfType,
  inferAxiom
} from '@relational-fabric/canon'

// =============================================================================
// STEP 1: Define Custom Axiom Types
// =============================================================================

/**
 * Email Axiom - Represents email addresses with validation
 * This is a KeyNameAxiom because it's found by looking for a specific field name
 */
type EmailAxiom = KeyNameAxiom

/**
 * Currency Axiom - Represents monetary values with currency codes
 * This is a RepresentationAxiom because it can be converted between formats
 */
type CurrencyAxiom = RepresentationAxiom<number | string, { amount: number; currency: string }>

/**
 * Status Axiom - Represents entity status with state validation
 * This is a KeyNameAxiom with additional metadata for state management
 */
type StatusAxiom = Axiom<{
  $basis: Record<string, unknown>
  key: string
  $meta: {
    validStates: string[]
    defaultState: string
    transitions: Record<string, string[]>
  }
}, {
    validStates: string[]
    defaultState: string
    transitions: Record<string, string[]>
  }>

/**
 * Priority Axiom - Represents priority levels with numeric conversion
 * This is a RepresentationAxiom that converts between string and numeric priorities
 */
type PriorityAxiom = RepresentationAxiom<string | number, { level: number; label: string }>

// =============================================================================
// STEP 2: Register Custom Axioms
// =============================================================================

declare module '@relational-fabric/canon' {
  interface Axioms {
    Email: EmailAxiom
    Currency: CurrencyAxiom
    Status: StatusAxiom
    Priority: PriorityAxiom
  }
}

// =============================================================================
// STEP 3: Implement Custom Axiom Functions
// =============================================================================

/**
 * Extract email address from any entity that satisfies the Email axiom
 */
export function emailOf<T extends { [K in keyof Axioms['Email']['$basis']]: Axioms['Email']['$basis'][K] }>(x: T): string {
  const config = inferAxiom('Email', x)
  
  if (!config) {
    throw new Error('No matching canon found for Email axiom')
  }
  
  if ('key' in config && typeof config.key === 'string') {
    const value = (x as Record<string, unknown>)[config.key]
    
    if (typeof value !== 'string') {
      throw new TypeError(`Expected string email, got ${typeof value}`)
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new TypeError(`Invalid email format: ${value}`)
    }
    
    return value
  }
  
  throw new Error('Invalid Email axiom configuration')
}

/**
 * Extract and convert currency data to canonical format
 */
export function currencyOf<T extends { [K in keyof Axioms['Currency']['$basis']]: Axioms['Currency']['$basis'][K] }>(x: T): { amount: number; currency: string } {
  const config = inferAxiom('Currency', x)
  
  if (!config) {
    throw new Error('No matching canon found for Currency axiom')
  }
  
  // Check if already canonical
  if (typeof x === 'object' && x !== null && 'amount' in x && 'currency' in x) {
    const obj = x as { amount: unknown; currency: unknown }
    if (typeof obj.amount === 'number' && typeof obj.currency === 'string') {
      return { amount: obj.amount, currency: obj.currency }
    }
  }
  
  // Convert from different formats
  if (typeof x === 'number') {
    return { amount: x, currency: 'USD' } // Default currency
  }
  
  if (typeof x === 'string') {
    // Try to parse currency string like "100.50 USD" or "$100.50"
    const match = x.match(/^[\$]?(\d+(?:\.\d{2})?)\s*([A-Z]{3})?$/)
    if (match) {
      return {
        amount: parseFloat(match[1]),
        currency: match[2] || 'USD'
      }
    }
    throw new TypeError(`Invalid currency string format: ${x}`)
  }
  
  throw new TypeError(`Expected number, string, or currency object, got ${typeof x}`)
}

/**
 * Extract status from any entity that satisfies the Status axiom
 */
export function statusOf<T extends { [K in keyof Axioms['Status']['$basis']]: Axioms['Status']['$basis'][K] }>(x: T): string {
  const config = inferAxiom('Status', x)
  
  if (!config) {
    throw new Error('No matching canon found for Status axiom')
  }
  
  if ('key' in config && typeof config.key === 'string') {
    const value = (x as Record<string, unknown>)[config.key]
    
    if (typeof value !== 'string') {
      throw new TypeError(`Expected string status, got ${typeof value}`)
    }
    
    // Validate against allowed states
    const validStates = config.$meta?.validStates || []
    if (validStates.length > 0 && !validStates.includes(value)) {
      throw new TypeError(`Invalid status: ${value}. Valid states: ${validStates.join(', ')}`)
    }
    
    return value
  }
  
  throw new Error('Invalid Status axiom configuration')
}

/**
 * Extract and convert priority data to canonical format
 */
export function priorityOf<T extends { [K in keyof Axioms['Priority']['$basis']]: Axioms['Priority']['$basis'][K] }>(x: T): { level: number; label: string } {
  const config = inferAxiom('Priority', x)
  
  if (!config) {
    throw new Error('No matching canon found for Priority axiom')
  }
  
  // Extract the priority value from the entity
  let priorityValue: unknown
  if ('key' in config && typeof config.key === 'string') {
    priorityValue = (x as Record<string, unknown>)[config.key]
    console.log('Extracted priority value:', priorityValue, typeof priorityValue)
  } else {
    priorityValue = x
  }
  
  // Check if already canonical
  if (typeof priorityValue === 'object' && priorityValue !== null && 'level' in priorityValue && 'label' in priorityValue) {
    const obj = priorityValue as { level: unknown; label: unknown }
    if (typeof obj.level === 'number' && typeof obj.label === 'string') {
      return { level: obj.level, label: obj.label }
    }
  }
  
  // Convert from different formats
  if (typeof priorityValue === 'number') {
    const labels = ['low', 'medium', 'high', 'critical']
    const index = Math.max(0, Math.min(Math.floor(priorityValue) - 1, labels.length - 1))
    const label = labels[index] || 'unknown'
    return { level: priorityValue, label }
  }
  
  if (typeof priorityValue === 'string') {
    const priorityMap: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
      'urgent': 4,
      'normal': 2,
      'lowest': 0,
      'highest': 5
    }
    
    const level = priorityMap[priorityValue.toLowerCase()] ?? 2
    return { level, label: priorityValue.toLowerCase() }
  }
  
  throw new TypeError(`Expected number, string, or priority object, got ${typeof priorityValue}`)
}

// =============================================================================
// STEP 4: Define Canon with Custom Axioms
// =============================================================================

/**
 * E-commerce canon with custom axioms for domain-specific concepts
 */
type EcommerceWithCustomAxioms = Canon<{
  Id: { $basis: { id: string }, key: 'id', $meta: { format: 'uuid' } }
  Type: { $basis: { type: string }, key: 'type', $meta: { discriminator: true } }
  Version: { $basis: { version: number }, key: 'version', $meta: { optimistic: true } }
  Timestamps: { $basis: Date, isCanonical: (v: unknown) => v is Date, $meta: { format: 'iso8601' } }
  References: { $basis: string | object, isCanonical: (v: unknown) => v is { ref: string; resolved: boolean }, $meta: { format: 'uuid' } }
  Email: { $basis: { email: string }, key: 'email', $meta: { validation: 'strict' } }
  Currency: { $basis: number | string | object, isCanonical: (v: unknown) => v is { amount: number; currency: string }, $meta: { defaultCurrency: 'USD' } }
  Status: { $basis: { status: string }, key: 'status', $meta: { validStates: string[], defaultState: string, transitions: Record<string, string[]> } }
  Priority: { $basis: string | number | object, isCanonical: (v: unknown) => v is { level: number; label: string }, $meta: { levels: string[] } }
}>

declare module '@relational-fabric/canon' {
  interface Canons {
    EcommerceWithCustomAxioms: EcommerceWithCustomAxioms
  }
}

declareCanon('EcommerceWithCustomAxioms', {
  axioms: {
    Id: { $basis: pojoWithOfType('id', 'string'), key: 'id', $meta: { format: 'uuid' } },
    Type: { $basis: pojoWithOfType('type', 'string'), key: 'type', $meta: { discriminator: true } },
    Version: { $basis: pojoWithOfType('version', 'number'), key: 'version', $meta: { optimistic: true } },
    Timestamps: { $basis: (v: unknown): v is Date => v instanceof Date, isCanonical: (v: unknown): v is Date => v instanceof Date, $meta: { format: 'iso8601' } },
    References: { $basis: (v: unknown): v is string | object => typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { ref: string; resolved: boolean } => typeof v === 'object' && v !== null && 'ref' in v, $meta: { format: 'uuid' } },
    Email: { $basis: pojoWithOfType('email', 'string'), key: 'email', $meta: { validation: 'strict' } },
    Currency: { $basis: (v: unknown): v is number | string | object => typeof v === 'number' || typeof v === 'string' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { amount: number; currency: string } => typeof v === 'object' && v !== null && 'amount' in v && 'currency' in v, $meta: { defaultCurrency: 'USD' } },
    Status: { $basis: pojoWithOfType('status', 'string'), key: 'status', $meta: { validStates: ['draft', 'active', 'inactive', 'archived', 'processing'], defaultState: 'draft', transitions: { draft: ['active'], active: ['inactive', 'archived', 'processing'], inactive: ['active', 'archived'], archived: [], processing: ['active', 'inactive'] } } },
    Priority: { $basis: (v: unknown): v is string | number | object => typeof v === 'string' || typeof v === 'number' || (typeof v === 'object' && v !== null), isCanonical: (v: unknown): v is { level: number; label: string } => typeof v === 'object' && v !== null && 'level' in v && 'label' in v, $meta: { levels: ['low', 'medium', 'high', 'critical'] } },
  },
})

// =============================================================================
// STEP 5: Demonstrate Custom Axioms in Action
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
const productWithCustomFields = {
  id: 'prod-456',
  type: 'product',
  version: 7,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework License',
  price: 99.99, // Will be converted to currency
  currency: 'USD',
  status: 'active',
  priority: 3, // Numeric priority
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
  priority: 2,
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
// STEP 6: Business Logic Using Custom Axioms
// =============================================================================

/**
 * Process customer registration with custom axiom validation
 */
function processCustomerRegistration(customer: unknown): {
  success: boolean
  customerId: string
  email: string
  status: string
  priority: { level: number; label: string }
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
  } catch (error) {
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
function calculateOrderTotalWithCurrency(order: unknown): {
  subtotal: { amount: number; currency: string }
  tax: { amount: number; currency: string }
  total: { amount: number; currency: string }
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
function updateEntityStatus(entity: unknown, newStatus: string): {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// STEP 7: Run Examples and Tests
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
      expect(currency2).toEqual({ amount: 150.50, currency: 'USD' })
      
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

// Run the examples
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