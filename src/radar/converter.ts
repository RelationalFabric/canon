/**
 * Technology Radar data conversion utilities
 */

import type { CsvRow, QuadrantKey, RadarData, RingKey } from '../types/radar.js'

import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { parse } from 'yaml'

// Quadrant mapping for CSV output
const QUADRANT_MAP: Record<QuadrantKey, string> = {
  'tools-libraries': 'Tools & Libraries',
  'techniques-patterns': 'Techniques & Patterns',
  'features-capabilities': 'Features & Capabilities',
  'data-structures-formats': 'Data Structures, Formats & Standards',
}

// Ring mapping for CSV output
const RING_MAP: Record<RingKey, string> = {
  adopt: 'Adopt',
  trial: 'Trial',
  assess: 'Assess',
  hold: 'Hold',
}

/**
 * Convert YAML radar data to CSV format
 */
export function convertYamlToCsv(yamlContent: string): string {
  const data = parse(yamlContent) as RadarData

  // Generate CSV content
  const csvRows: string[] = ['name,ring,quadrant,isNew,description']

  // Process each quadrant
  Object.entries(data).forEach(([quadrantKey, quadrantData]) => {
    if (quadrantKey === 'metadata')
      return // Skip metadata

    const quadrantName = QUADRANT_MAP[quadrantKey as QuadrantKey] || quadrantKey

    // Process each ring in the quadrant
    Object.entries(quadrantData).forEach(([ringKey, items]) => {
      const ringName = RING_MAP[ringKey as RingKey] || ringKey

      // Process each item in the ring
      ;(items as any[]).forEach((item: any) => {
        const row: CsvRow = {
          name: item.name,
          ring: ringName,
          quadrant: quadrantName,
          isNew: item.isNew,
          description: item.description,
        }

        csvRows.push(formatCsvRow(row))
      })
    })
  })

  return csvRows.join('\n')
}

/**
 * Convert radar data from file paths
 */
export function convertYamlFileToCsv(yamlPath: string, csvPath: string): void {
  try {
    // Read and parse YAML file
    const yamlContent = readFileSync(yamlPath, 'utf8')
    const csvContent = convertYamlToCsv(yamlContent)

    // Write CSV file
    writeFileSync(csvPath, csvContent)
    console.log(`✅ Converted ${yamlPath} to ${csvPath}`)

    // Count entries
    const entryCount = csvContent.split('\n').length - 1
    console.log(`📊 Generated ${entryCount} radar entries`)
  }
  catch (error) {
    console.error('❌ Error converting YAML to CSV:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

/**
 * Format a CSV row with proper escaping
 */
function formatCsvRow(row: CsvRow): string {
  return [
    escapeCsvField(row.name),
    escapeCsvField(row.ring),
    escapeCsvField(row.quadrant),
    row.isNew ? 'true' : 'false',
    escapeCsvField(row.description),
  ].join(',')
}

/**
 * Escape CSV field values
 */
function escapeCsvField(field: string): string {
  if (typeof field !== 'string')
    return String(field)

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (field.includes('"') || field.includes(',') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }

  return field
}

/**
 * Parse YAML radar data
 */
export function parseRadarYaml(yamlContent: string): RadarData {
  return parse(yamlContent) as RadarData
}

/**
 * Read and parse radar YAML file
 */
export function readRadarYaml(yamlPath: string): RadarData {
  const yamlContent = readFileSync(yamlPath, 'utf8')
  return parseRadarYaml(yamlContent)
}
