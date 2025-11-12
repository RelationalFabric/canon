/**
 * Utility Functions for Multi-Axiom Canon
 *
 * This file contains utility functions that demonstrate how to work with
 * entities that implement multiple axioms.
 */

import type { EntityReference, Satisfies } from '@relational-fabric/canon'
import { createLogger, idOf, referencesOf, typeOf, versionOf } from '@relational-fabric/canon'

type MultiAxiomEntity = Satisfies<'Id'> & Satisfies<'Type'> & Satisfies<'Version'> & Satisfies<'References'> & {
  createdAt?: Date
  updatedAt?: Date
}

function ensureEntity(entity: unknown): MultiAxiomEntity {
  return entity as MultiAxiomEntity
}

const logger = createLogger('examples:multi-axiom:utilities')

// =============================================================================
// Entity Analysis Functions
// =============================================================================

/**
 * Analyze an entity and extract all available axiom data
 */
export function analyzeEntity(input: unknown): {
  id: string
  type: string
  version: string | number
  timestamps: Date[]
  references: Array<{ ref: string, resolved: boolean, value?: unknown }>
} {
  const entity = ensureEntity(input)
  const id = idOf(entity)
  const type = typeOf(entity)
  const version = typeof versionOf(entity) === 'number'
    ? versionOf(entity) as number
    : Number(versionOf(entity))

  // Handle timestamps manually since the canon doesn't know about createdAt/updatedAt
  const timestamps: Date[] = []
  if (entity.createdAt instanceof Date)
    timestamps.push(entity.createdAt)
  if (entity.updatedAt instanceof Date)
    timestamps.push(entity.updatedAt)

  const references = referencesOf(entity)
  const referenceList: EntityReference<string, unknown>[] = Array.isArray(references) ? references : [references]

  return {
    id,
    type,
    version: Number.isFinite(version) ? version : 0,
    timestamps,
    references: referenceList,
  }
}

/**
 * Demonstrate timestamp conversion from different formats
 */
export function demonstrateTimestampConversion(): void {
  logger.info('=== Timestamp Conversion Examples ===')

  // Unix timestamp
  const unixTimestamp = 1640995200000
  const unixConverted = new Date(unixTimestamp)
  logger.log(`Unix timestamp ${unixTimestamp} -> ${unixConverted.toISOString()}`)

  // ISO string
  const isoString = '2024-01-15T10:30:00Z'
  const isoConverted = new Date(isoString)
  logger.log(`ISO string "${isoString}" -> ${isoConverted.toISOString()}`)

  // Date object
  const dateObject = new Date('2024-01-15T10:30:00Z')
  logger.log(`Date object -> ${dateObject.toISOString()}`)
}

/**
 * Demonstrate reference conversion from different formats
 */
export function demonstrateReferenceConversion(): void {
  logger.info('=== Reference Conversion Examples ===')

  // String reference
  const stringRef = 'user-123'
  const stringConverted = { ref: stringRef, resolved: false }
  logger.log(`String reference "${stringRef}" ->`, stringConverted)

  // Object reference
  const objectRef = { ref: 'product-456', resolved: false }
  logger.log('Object reference ->', objectRef)

  // Complex object
  const complexRef = { ref: 'order-789', resolved: false, value: undefined }
  logger.log('Complex object ->', complexRef)
}

/**
 * Process an entity update with version increment
 */
export function processEntityUpdate(input: unknown): {
  id: string
  oldVersion: string | number
  newVersion: string | number
  updatedAt: Date
} {
  const entity = ensureEntity(input)
  const id = idOf(entity)
  const rawVersion = versionOf(entity)
  const numericVersion = typeof rawVersion === 'number' ? rawVersion : Number(rawVersion)
  const oldVersion = Number.isFinite(numericVersion) ? numericVersion : 0
  const newVersion = oldVersion + 1
  const updatedAt = new Date()

  logger.info(`\n=== Processing Update for ${typeOf(entity as Satisfies<'Type'>)} ${id} ===`)
  logger.log(`Current version: ${oldVersion}`)
  logger.log(`New version: ${newVersion}`)
  logger.log(`Updated at: ${updatedAt.toISOString()}`)

  return {
    id,
    oldVersion,
    newVersion,
    updatedAt,
  }
}
