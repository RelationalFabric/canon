/**
 * Technology Radar data conversion utilities
 */

import type { CsvRow, RadarData, RadarItem } from '../types/radar.js'

import { readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { parse } from 'yaml'

/**
 * Convert YAML radar data to CSV format
 */
export function convertYamlToCsv(yamlContent: string): string {
  const data = parse(yamlContent) as RadarData

  // Generate CSV content
  const csvRows: string[] = ['name,ring,quadrant,isNew,description']

  // Process each item in the flat items array
  data.items.forEach((item: RadarItem) => {
    const row: CsvRow = {
      name: item.name,
      ring: item.ring,
      quadrant: item.quadrant,
      isNew: item.isNew,
      description: item.description,
    }

    csvRows.push(formatCsvRow(row))
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
