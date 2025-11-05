/**
 * Custom Axiom Functions
 *
 * This file implements the custom axiom functions that work with the
 * domain-specific semantic concepts defined in custom-axioms.ts.
 */

import { inferAxiom } from '@relational-fabric/canon'

// =============================================================================
// Custom Axiom Functions
// =============================================================================

/**
 * Extract email address from any entity that satisfies the Email axiom
 */
export function emailOf<
  T extends { [K in keyof Axioms['Email']['$basis']]: Axioms['Email']['$basis'][K] },
>(x: T): string {
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
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
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
export function currencyOf<
  T extends { [K in keyof Axioms['Currency']['$basis']]: Axioms['Currency']['$basis'][K] },
>(x: T): { amount: number, currency: string } {
  const config = inferAxiom('Currency', x)

  if (!config) {
    throw new Error('No matching canon found for Currency axiom')
  }

  // Check if already canonical
  if (typeof x === 'object' && x !== null && 'amount' in x && 'currency' in x) {
    const obj = x as { amount: unknown, currency: unknown }
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
    const match = x.match(/^\$?(\d+(?:\.\d{2})?)\s*([A-Z]{3})?$/)
    if (match) {
      return {
        amount: Number.parseFloat(match[1]),
        currency: match[2] || 'USD',
      }
    }
    throw new TypeError(`Invalid currency string format: ${x}`)
  }

  throw new TypeError(`Expected number, string, or currency object, got ${typeof x}`)
}

/**
 * Extract status from any entity that satisfies the Status axiom
 */
export function statusOf<
  T extends { [K in keyof Axioms['Status']['$basis']]: Axioms['Status']['$basis'][K] },
>(x: T): string {
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
export function priorityOf<
  T extends { [K in keyof Axioms['Priority']['$basis']]: Axioms['Priority']['$basis'][K] },
>(x: T): { level: number, label: string } {
  const config = inferAxiom('Priority', x)

  if (!config) {
    throw new Error('No matching canon found for Priority axiom')
  }

  // Extract the priority value from the entity
  let priorityValue: unknown
  if ('key' in config && typeof config.key === 'string') {
    priorityValue = (x as Record<string, unknown>)[config.key]
  }
  else {
    priorityValue = x
  }

  // Check if already canonical
  if (
    typeof priorityValue === 'object'
    && priorityValue !== null
    && 'level' in priorityValue
    && 'label' in priorityValue
  ) {
    const obj = priorityValue as { level: unknown, label: unknown }
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
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
      urgent: 4,
      normal: 2,
      lowest: 0,
      highest: 5,
    }

    const level = priorityMap[priorityValue.toLowerCase()] ?? 2
    return { level, label: priorityValue.toLowerCase() }
  }

  // Handle object with level and label properties
  if (
    typeof priorityValue === 'object'
    && priorityValue !== null
    && 'level' in priorityValue
    && 'label' in priorityValue
  ) {
    const obj = priorityValue as { level: unknown, label: unknown }
    if (typeof obj.level === 'number' && typeof obj.label === 'string') {
      return { level: obj.level, label: obj.label }
    }
  }

  throw new TypeError(`Expected number, string, or priority object, got ${typeof priorityValue}`)
}
