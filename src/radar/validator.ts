/**
 * Technology Radar data validation utilities
 */

import type { QuadrantKey, RadarData, RingKey } from '../types/radar.js'

const VALID_QUADRANTS: QuadrantKey[] = ['tools-libraries', 'techniques-patterns', 'features-capabilities', 'data-structures-formats']
const VALID_RINGS: RingKey[] = ['adopt', 'trial', 'assess', 'hold']

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

  // Validate the entries section
  if (!data.entries) {
    errors.push({
      type: 'missing_field',
      message: 'Missing entries section',
      path: 'entries',
    })
  } else {
    validateEntries(data.entries, errors, warnings)
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
function _validateQuadrants(quadrants: any[], errors: ValidationError[]): void {
  const quadrantIds = new Set<string>()

  quadrants.forEach((quadrant, index) => {
    if (!quadrant.id || typeof quadrant.id !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid id in quadrant ${index}`,
        path: `quadrants[${index}].id`,
      })
    }
    else if (quadrantIds.has(quadrant.id)) {
      errors.push({
        type: 'duplicate_entry',
        message: `Duplicate quadrant id: ${quadrant.id}`,
        path: `quadrants[${index}].id`,
      })
    }
    else {
      quadrantIds.add(quadrant.id)
    }

    if (!quadrant.name || typeof quadrant.name !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid name in quadrant ${index}`,
        path: `quadrants[${index}].name`,
      })
    }

    if (!quadrant.description || typeof quadrant.description !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid description in quadrant ${index}`,
        path: `quadrants[${index}].description`,
      })
    }
  })
}

/**
 * Validate rings section
 */
function _validateRings(rings: any[], errors: ValidationError[]): void {
  const ringIds = new Set<string>()

  rings.forEach((ring, index) => {
    if (!ring.id || typeof ring.id !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid id in ring ${index}`,
        path: `rings[${index}].id`,
      })
    }
    else if (ringIds.has(ring.id)) {
      errors.push({
        type: 'duplicate_entry',
        message: `Duplicate ring id: ${ring.id}`,
        path: `rings[${index}].id`,
      })
    }
    else {
      ringIds.add(ring.id)
    }

    if (!ring.name || typeof ring.name !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid name in ring ${index}`,
        path: `rings[${index}].name`,
      })
    }

    if (!ring.description || typeof ring.description !== 'string') {
      errors.push({
        type: 'missing_field',
        message: `Missing or invalid description in ring ${index}`,
        path: `rings[${index}].description`,
      })
    }

    if (!ring.color || typeof ring.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(ring.color)) {
      errors.push({
        type: 'invalid_value',
        message: `Invalid color format in ring ${index}. Should be hex color (e.g., #93c47d)`,
        path: `rings[${index}].color`,
      })
    }
  })
}

/**
 * Validate entries section
 */
function validateEntries(entries: any, errors: ValidationError[], warnings: string[]): void {
  const entryNames = new Set<string>()

  Object.entries(entries).forEach(([quadrantKey, quadrantData]) => {
    if (quadrantKey === 'metadata')
      return // Skip metadata

    if (!VALID_QUADRANTS.includes(quadrantKey as QuadrantKey)) {
      warnings.push(`Unknown quadrant: ${quadrantKey}`)
    }

    if (typeof quadrantData !== 'object' || quadrantData === null) {
      errors.push({
        type: 'invalid_structure',
        message: `Invalid quadrant data for ${quadrantKey}`,
        path: `entries.${quadrantKey}`,
      })
      return
    }

    Object.entries(quadrantData).forEach(([ringKey, items]) => {
      if (!VALID_RINGS.includes(ringKey as RingKey)) {
        warnings.push(`Unknown ring: ${ringKey} in quadrant ${quadrantKey}`)
      }

      if (!Array.isArray(items)) {
        errors.push({
          type: 'invalid_structure',
          message: `Invalid ring data for ${ringKey} in quadrant ${quadrantKey}`,
          path: `entries.${quadrantKey}.${ringKey}`,
        })
        return
      }

      items.forEach((item: any, index: number) => {
        validateRadarEntry(item, errors, warnings, `${quadrantKey}.${ringKey}[${index}]`)

        // Check for duplicate names
        if (item.name && entryNames.has(item.name)) {
          errors.push({
            type: 'duplicate_entry',
            message: `Duplicate entry name: ${item.name}`,
            path: `entries.${quadrantKey}.${ringKey}[${index}].name`,
          })
        }
        else if (item.name) {
          entryNames.add(item.name)
        }
      })
    })
  })
}

/**
 * Validate individual radar entry
 */
function validateRadarEntry(entry: any, errors: ValidationError[], warnings: string[], path: string): void {
  if (!entry.name || typeof entry.name !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid name',
      path: `entries.${path}.name`,
    })
  }

  if (!entry.description || typeof entry.description !== 'string') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid description',
      path: `entries.${path}.description`,
    })
  }

  if (typeof entry.isNew !== 'boolean') {
    errors.push({
      type: 'missing_field',
      message: 'Missing or invalid isNew field',
      path: `entries.${path}.isNew`,
    })
  }

  if (entry.justification && typeof entry.justification !== 'string') {
    errors.push({
      type: 'invalid_value',
      message: 'Justification must be a string',
      path: `entries.${path}.justification`,
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
