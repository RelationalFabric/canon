/**
 * Utility Functions for Multi-Axiom Canon
 *
 * This file contains utility functions that demonstrate how to work with
 * entities that implement multiple axioms.
 */

import type { Satisfies } from '@relational-fabric/canon'
import { idOf, referencesOf, typeOf, versionOf } from '@relational-fabric/canon'

// =============================================================================
// Entity Analysis Functions
// =============================================================================

/**
 * Analyze an entity and extract all available axiom data
 */
export function analyzeEntity(entity: unknown): {
  id: string
  type: string
  version: string | number
  timestamps: Date[]
  references: Array<{ ref: string, resolved: boolean, value?: unknown }>
} {
  const id = idOf(entity as Satisfies<'Id'>)
  const type = typeOf(entity as Satisfies<'Type'>)
  const version = versionOf(entity as Satisfies<'Version'>)

  // Handle timestamps manually since the canon doesn't know about createdAt/updatedAt
  const timestamps: Date[] = []
  if (typeof entity === 'object' && entity !== null) {
    const obj = entity as Record<string, unknown>
    if (obj.createdAt instanceof Date)
      timestamps.push(obj.createdAt)
    if (obj.updatedAt instanceof Date)
      timestamps.push(obj.updatedAt)
  }

  const references = referencesOf(entity as Satisfies<'References'>)

  return {
    id,
    type,
    version,
    timestamps,
    references: Array.isArray(references) ? references : [references],
  }
}

/**
 * Demonstrate timestamp conversion from different formats
 */
export function demonstrateTimestampConversion(): void {
  console.log('=== Timestamp Conversion Examples ===')

  // Unix timestamp
  const unixTimestamp = 1640995200000
  const unixConverted = new Date(unixTimestamp)
  console.log(`Unix timestamp ${unixTimestamp} -> ${unixConverted.toISOString()}`)

  // ISO string
  const isoString = '2024-01-15T10:30:00Z'
  const isoConverted = new Date(isoString)
  console.log(`ISO string "${isoString}" -> ${isoConverted.toISOString()}`)

  // Date object
  const dateObject = new Date('2024-01-15T10:30:00Z')
  console.log(`Date object -> ${dateObject.toISOString()}`)
}

/**
 * Demonstrate reference conversion from different formats
 */
export function demonstrateReferenceConversion(): void {
  console.log('=== Reference Conversion Examples ===')

  // String reference
  const stringRef = 'user-123'
  const stringConverted = { ref: stringRef, resolved: false }
  console.log(`String reference "${stringRef}" ->`, stringConverted)

  // Object reference
  const objectRef = { ref: 'product-456', resolved: false }
  console.log(`Object reference ->`, objectRef)

  // Complex object
  const complexRef = { ref: 'order-789', resolved: false, value: undefined }
  console.log(`Complex object ->`, complexRef)
}

/**
 * Process an entity update with version increment
 */
export function processEntityUpdate(entity: unknown): {
  id: string
  oldVersion: string | number
  newVersion: string | number
  updatedAt: Date
} {
  const id = idOf(entity as Satisfies<'Id'>)
  const oldVersion = versionOf(entity as Satisfies<'Version'>)
  const newVersion = typeof oldVersion === 'number' ? oldVersion + 1 : oldVersion
  const updatedAt = new Date()

  console.log(`\n=== Processing Update for ${typeOf(entity as Satisfies<'Type'>)} ${id} ===`)
  console.log(`Current version: ${oldVersion}`)
  console.log(`New version: ${newVersion}`)
  console.log(`Updated at: ${updatedAt.toISOString()}`)

  return {
    id,
    oldVersion,
    newVersion,
    updatedAt,
  }
}
