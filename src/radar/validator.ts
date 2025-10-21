/**
 * Technology Radar data validation utilities
 */

import type { RadarData } from '../types/radar.js'

export interface ValidationError {
  type: 'missing_field' | 'invalid_value' | 'duplicate_entry' | 'invalid_structure'
  message: string
  path?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: string[]
}

/**
 * Validate radar data structure
 */
export function validateRadarData(data: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // Validate metadata
  if (!data.metadata) {
    errors.push({
      type: 'missing_field',
      message: 'Missing metadata section',
      path: 'metadata',
    })
  }
  else {
    validateMetadata(data.metadata, errors)
  }

  // Validate quadrants array
  if (!data.quadrants) {
    errors.push({
      type: 'missing_field',
      message: 'Missing quadrants section',
      path: 'quadrants',
    })
  }
  else if (!Array.isArray(data.quadrants)) {
    errors.push({
      type: 'invalid_structure',
      message: 'Quadrants must be an array of strings',
      path: 'quadrants',
    })
  }
  else {
    validateQuadrants(data.quadrants, errors)
  }

  // Validate rings array
  if (!data.rings) {
    errors.push({
      type: 'missing_field',
      message: 'Missing rings section',
      path: 'rings',
    })
  }
  else if (!Array.isArray(data.rings)) {
    errors.push({
      type: 'invalid_structure',
      message: 'Rings must be an array of strings',
      path: 'rings',
    })
  }
  else {
    validateRings(data.rings, errors)
  }

  // Validate items array
  if (!data.items) {
    errors.push({
      type: 'missing_field',
      message: 'Missing items section',
      path: 'items',
    })
  }
  else if (!Array.isArray(data.items)) {
    errors.push({
      type: 'invalid_structure',
      message: 'Items must be an array',
      path: 'items',
    })
  }
  else {
    validateItems(data.items, data.quadrants, data.rings, errors, warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate metadata section
 */
function validateMetadata(metadata: any, errors: ValidationError[]): void {
  const requiredFields = ['title', 'subtitle', 'version', 'lastUpdated']

  for (const field of requiredFields) {
    if (!metadata[field] || typeof metadata[field] !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid ${field} in metadata`,
        path: `metadata.${field}`,
      })
    }
  }

  // Validate version format
  if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
    errors.push({
      type: 'invalid_value',
      message: 'Version should follow semantic versioning (e.g., 1.0.0)',
      path: 'metadata.version',
    })
  }

  // Validate date format
  if (metadata.lastUpdated && !/^\d{4}-\d{2}-\d{2}/.test(metadata.lastUpdated)) {
    errors.push({
      type: 'invalid_value',
      message: 'Last updated should be in YYYY-MM-DD format',
      path: 'metadata.lastUpdated',
    })
  }
}

/**
 * Validate quadrants section
 */
function validateQuadrants(quadrants: any[], errors: ValidationError[]): void {
  const quadrantNames = new Set<string>()

  quadrants.forEach((quadrant, index) => {
    if (typeof quadrant !== 'string') {
      errors.push({
        type: 'invalid_value',
        message: `Quadrant ${index} must be a string`,
        path: `quadrants[${index}]`,
      })
    }
    else if (quadrantNames.has(quadrant)) {
      errors.push({
        type: 'duplicate_entry',
        message: `Duplicate quadrant: ${quadrant}`,
        path: `quadrants[${index}]`,
      })
    }
    else {
      quadrantNames.add(quadrant)
    }
  })
}

/**
 * Validate rings section
 */
function validateRings(rings: any[], errors: ValidationError[]): void {
  const ringNames = new Set<string>()

  rings.forEach((ring, index) => {
    if (typeof ring !== 'string') {
      errors.push({
        type: 'invalid_value',
        message: `Ring ${index} must be a string`,
        path: `rings[${index}]`,
      })
    }
    else if (ringNames.has(ring)) {
      errors.push({
        type: 'duplicate_entry',
        message: `Duplicate ring: ${ring}`,
        path: `rings[${index}]`,
      })
    }
    else {
      ringNames.add(ring)
    }
  })
}

/**
 * Validate items section
 */
function validateItems(items: any[], quadrants: string[], rings: string[], errors: ValidationError[], warnings: string[]): void {
  const itemNames = new Set<string>()

  items.forEach((item: any, index: number) => {
    validateRadarItem(item, quadrants, rings, errors, warnings, `items[${index}]`)

    // Check for duplicate names
    if (item.name && itemNames.has(item.name)) {
      errors.push({
        type: 'duplicate_entry',
        message: `Duplicate item name: ${item.name}`,
        path: `items[${index}].name`,
      })
    }
    else if (item.name) {
      itemNames.add(item.name)
    }
  })
}

/**
 * Validate individual radar item
 */
function validateRadarItem(item: any, quadrants: string[], rings: string[], errors: ValidationError[], warnings: string[], path: string): void {
  if (!item.name || typeof item.name !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid name',
      path: `${path}.name`,
    })
  }

  if (!item.description || typeof item.description !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid description',
      path: `${path}.description`,
    })
  }

  if (!item.quadrant || typeof item.quadrant !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid quadrant',
      path: `${path}.quadrant`,
    })
  }
  else if (!quadrants.includes(item.quadrant)) {
    warnings.push(`Unknown quadrant: ${item.quadrant} in item ${item.name || 'unnamed'}`)
  }

  if (!item.ring || typeof item.ring !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid ring',
      path: `${path}.ring`,
    })
  }
  else if (!rings.includes(item.ring)) {
    warnings.push(`Unknown ring: ${item.ring} in item ${item.name || 'unnamed'}`)
  }

  if (typeof item.isNew !== 'boolean') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid isNew field',
      path: `${path}.isNew`,
    })
  }

  if (item.justification && typeof item.justification !== 'string') {
    errors.push({
      type: 'invalid_value',
      message: 'Justification must be a string',
      path: `${path}.justification`,
    })
  }
}

/**
 * Validate radar data from file
 */
export async function validateRadarFile(filePath: string): Promise<ValidationResult> {
  try {
    const fs = await import('node:fs')
    const yaml = await import('yaml')

    const yamlContent = fs.readFileSync(filePath, 'utf8')
    const data = yaml.parse(yamlContent) as RadarData

    return validateRadarData(data)
  }
  catch (error) {
    return {
      isValid: false,
      errors: [{
        type: 'invalid_structure',
        message: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: filePath,
      }],
      warnings: [],
    }
  }
}
