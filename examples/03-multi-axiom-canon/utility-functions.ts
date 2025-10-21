/**
 * Utility Functions for Multi-Axiom Canon
 *
 * This file contains utility functions that demonstrate how to work with
 * entities that implement multiple axioms.
 */

import { 
  idOf, 
  typeOf, 
  versionOf, 
  timestampsOf, 
  referencesOf 
} from '@relational-fabric/canon'

// =============================================================================
// Entity Analysis Functions
// =============================================================================

/**
 * Analyze an entity and extract all available axiom data
 */
export function analyzeEntity(entity: unknown): {
  id: string
  type: string
  version: number
  timestamps: Date[]
  references: Array<{ ref: string; resolved: boolean; value?: unknown }>
} {
  const id = idOf(entity)
  const type = typeOf(entity)
  const version = versionOf(entity)
  const timestamps = timestampsOf(entity)
  const references = referencesOf(entity)

  return {
    id,
    type,
    version,
    timestamps,
    references,
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
  oldVersion: number
  newVersion: number
  updatedAt: Date
} {
  const id = idOf(entity)
  const oldVersion = versionOf(entity)
  const newVersion = oldVersion + 1
  const updatedAt = new Date()

  console.log(`\n=== Processing Update for ${typeOf(entity)} ${id} ===`)
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