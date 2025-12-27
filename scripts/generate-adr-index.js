#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import consola from 'consola'

const logger = consola.withTag('adr')

// Status color mapping
const statusColors = {
  proposed: '🟡',
  accepted: '🟢',
  deprecated: '🔴',
  superseded: '🟠',
}

// Status labels
const statusLabels = {
  proposed: 'Proposed',
  accepted: 'Accepted',
  deprecated: 'Deprecated',
  superseded: 'Superseded',
}

function findMetadataValue(lines, key) {
  const pattern = new RegExp(`^\\s*[-*]\\s*${key}\\s*:\\s*(.+)$`, 'i')
  for (const line of lines) {
    const match = line.match(pattern)
    if (match)
      return match[1].trim()
  }
  return null
}

function extractAdrInfo(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // Extract title (first line after #)
    const titleLine = lines.find(line => line.startsWith('# ADR-'))
    if (!titleLine)
      return null

    const title = titleLine.replace('# ADR-', '').trim()

    // Extract status (line with "- Status:" or "* Status:")
    const rawStatus = findMetadataValue(lines, 'Status')
    if (!rawStatus)
      return null

    const status = rawStatus.toLowerCase()
    if (!statusColors[status])
      return null

    // Extract date (line with "- Date:" or "* Date:")
    const date = findMetadataValue(lines, 'Date') ?? 'Unknown'

    // Extract filename for link
    const filename = filePath.split('/').pop()

    return {
      number: title.split(':')[0],
      title: title.split(':').slice(1).join(':').trim(),
      status,
      date,
      filename,
      color: statusColors[status],
      label: statusLabels[status],
    }
  } catch (error) {
    logger.error(`Error reading ${filePath}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

function generateAdrTable(adrs) {
  // Sort by ADR number
  adrs.sort((a, b) => Number.parseInt(a.number) - Number.parseInt(b.number))

  const tableHeader = `| ADR | Title | Status | Date |\n|-----|-------|--------|------|`

  const tableRows = adrs
    .map(
      adr =>
        `| [ADR-${adr.number}](./${adr.filename}) | ${adr.title} | ${adr.color} ${adr.label} | ${adr.date} |`,
    )
    .join('\n')

  return `${tableHeader}\n${tableRows}`
}

function buildDefaultReadme(adrTable) {
  return `# Architecture Decision Records

## ADR List

${adrTable}

## ADR Process

1. Use \`cd docs/adrs && npx adr-tools new "Meaningful Decision Title"\` to draft a new record.
2. Update the table with \`npm run build:adr\` so the index stays in sync.
3. Commit the new ADR together with any code or documentation changes it describes.
`
}

function updateReadme(adrTable, readmePath) {
  let readmeContent = ''

  try {
    readmeContent = readFileSync(readmePath, 'utf-8')
  } catch (readError) {
    logger.warn(
      'ℹ️  ADR README not found, generating a fresh one.',
      readError instanceof Error ? readError.message : String(readError),
    )
  }

  if (!readmeContent) {
    writeFileSync(readmePath, buildDefaultReadme(adrTable), 'utf-8')
    logger.success('✅ ADR README created with fresh index')
    return
  }

  const adrListStart = readmeContent.indexOf('## ADR List')
  const adrProcessStart = readmeContent.indexOf('## ADR Process')

  if (adrListStart === -1 || adrProcessStart === -1) {
    logger.warn('ℹ️  ADR README missing expected sections, regenerating full content.')
    writeFileSync(readmePath, buildDefaultReadme(adrTable), 'utf-8')
    logger.success('✅ ADR README regenerated with index and process guidance')
    return
  }

  const beforeAdrList = readmeContent.substring(0, adrListStart)
  const afterAdrProcess = readmeContent.substring(adrProcessStart)

  const newContent = `${beforeAdrList}## ADR List

${adrTable}

${afterAdrProcess}`

  writeFileSync(readmePath, newContent, 'utf-8')
  logger.success('✅ ADR index updated successfully')
}

export async function generateAdrIndex(options = {}) {
  const rootDir = process.cwd()
  const adrsDir = options.adrsDir ?? join(rootDir, 'docs', 'adrs')
  const readmePath = options.readmePath ?? join(adrsDir, 'README.md')

  logger.info('🔍 Scanning ADR files...')

  try {
    const files = readdirSync(adrsDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => join(adrsDir, file))
      .filter(file => statSync(file).isFile())

    logger.info(`📁 Found ${files.length} ADR files`)

    const adrs = files.map(extractAdrInfo).filter(adr => adr !== null)

    logger.success(`✅ Successfully parsed ${adrs.length} ADRs`)

    if (adrs.length === 0) {
      logger.warn('⚠️  No valid ADRs found')
      return
    }

    const adrTable = generateAdrTable(adrs)
    updateReadme(adrTable, readmePath)

    // Log summary
    const statusCounts = adrs.reduce((acc, adr) => {
      acc[adr.status] = (acc[adr.status] || 0) + 1
      return acc
    }, {})

    logger.info('\n📊 ADR Status Summary:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      logger.info(`  ${statusColors[status]} ${statusLabels[status]}: ${count}`)
    })
  } catch (error) {
    logger.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

function main() {
  const rootDir = process.cwd()
  const adrsDir = join(rootDir, 'docs', 'adrs')
  const readmePath = join(adrsDir, 'README.md')

  generateAdrIndex({ adrsDir, readmePath }).catch((error) => {
    logger.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
