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

  // Process each quadrant in the entries section
  Object.entries(data.entries).forEach(([quadrantKey, quadrantData]) => {
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
 * Convert YAML radar data to HTML format
 */
export function convertYamlToHtml(yamlContent: string): string {
  const data = parse(yamlContent) as RadarData

  // Generate radar entries for the HTML
  const entries: any[] = []
  let quadrantIndex = 0

  // Process each quadrant in the entries section
  Object.entries(data.entries).forEach(([_quadrantKey, quadrantData]) => {
    // Process each ring in the quadrant
    Object.entries(quadrantData).forEach(([ringKey, items]) => {
      const ringIndex = ['adopt', 'trial', 'assess', 'hold'].indexOf(ringKey)

      // Process each item in the ring
      ;(items as any[]).forEach((item: any) => {
        entries.push({
          label: item.name,
          quadrant: quadrantIndex,
          ring: ringIndex,
          moved: item.isNew ? 1 : 0,
        })
      })
    })
    quadrantIndex++
  })

  // Generate HTML content
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Canon Technology Radar</title>
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="https://zalando.github.io/tech-radar/release/radar-0.6.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #fff;
        }
        .radar-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .radar-title {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        .radar-subtitle {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="radar-container">
        <h1 class="radar-title">${data.metadata.title || 'Canon Technology Radar'}</h1>
        <p class="radar-subtitle">${data.metadata.description || 'Technology landscape and recommendations'}</p>
        <div id="radar"></div>
    </div>

    <script>
        const entries = ${JSON.stringify(entries)};
        
        const radar = new Radar({
            container: '#radar',
            width: 1000,
            height: 1000,
            padding: 60,
            colors: {
                background: '#fff',
                grid: '#bbb',
                inactive: '#ddd'
            },
            quadrants: [
                { name: 'Tools & Libraries' },
                { name: 'Techniques & Patterns' },
                { name: 'Features & Capabilities' },
                { name: 'Data Structures, Formats & Standards' }
            ],
            rings: [
                { name: 'Adopt', color: '#93c47d' },
                { name: 'Trial', color: '#93d2c2' },
                { name: 'Assess', color: '#fbdb84' },
                { name: 'Hold', color: '#efafa9' }
            ],
            entries: entries
        });
    </script>
</body>
</html>`
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
    // Success: Converted YAML to CSV
  }
  catch (error) {
    console.error('❌ Error converting YAML to CSV:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

/**
 * Convert radar data from YAML file to HTML file
 */
export function convertYamlFileToHtml(yamlPath: string, htmlPath: string): void {
  try {
    // Read and parse YAML file
    const yamlContent = readFileSync(yamlPath, 'utf8')
    const htmlContent = convertYamlToHtml(yamlContent)

    // Write HTML file
    writeFileSync(htmlPath, htmlContent)
    // Success: Converted YAML to HTML
  }
  catch (error) {
    console.error('❌ Error converting YAML to HTML:', error instanceof Error ? error.message : 'Unknown error')
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
