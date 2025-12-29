import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { createLogger } from '@relational-fabric/canon'

const logger = createLogger('canon:adr:index')

// Status color mapping
const statusColors = {
  proposed: '🟡',
  accepted: '🟢',
  deprecated: '🔴',
  superseded: '🟠',
} as const

// Status labels
const statusLabels = {
  proposed: 'Proposed',
  accepted: 'Accepted',
  deprecated: 'Deprecated',
  superseded: 'Superseded',
} as const

interface GenerateAdrIndexOptions {
  rootDir: string
  adrsDir?: string
  readmePath?: string
}

function findMetadataValue(lines: readonly string[], key: string): string | null {
  const pattern = new RegExp(`^\\s*[-*]\\s*${key}\\s*:\\s*(.+)$`, 'i')
  for (const line of lines) {
    const match = line.match(pattern)
    if (match)
      return match[1]!.trim()
  }
  return null
}

function extractAdrInfo(filePath: string): {
  number: string
  title: string
  status: keyof typeof statusColors
  date: string
  filename: string
  color: string
  label: string
} | null {
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

    const status = rawStatus.toLowerCase() as keyof typeof statusColors
    if (!statusColors[status])
      return null

    // Extract date (line with "- Date:" or "* Date:")
    const date = findMetadataValue(lines, 'Date') ?? 'Unknown'

    // Extract filename for link
    const filename = filePath.split('/').pop() ?? ''

    return {
      number: title.split(':')[0]!,
      title: title.split(':').slice(1).join(':').trim(),
      status,
      date,
      filename,
      color: statusColors[status]!,
      label: statusLabels[status]!,
    }
  } catch (error) {
    logger.error(`Error reading ${filePath}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

function generateAdrTable(adrs: Array<{
  number: string
  title: string
  status: keyof typeof statusColors
  date: string
  filename: string
  color: string
  label: string
}>): string {
  // Sort by ADR number
  adrs.sort((a, b) => Number.parseInt(a.number) - Number.parseInt(b.number))

  const tableHeader = '| ADR | Title | Status | Date |\n|-----|-------|--------|------|'

  const tableRows = adrs
    .map(
      adr =>
        `| [ADR-${adr.number}](./${adr.filename}) | ${adr.title} | ${adr.color} ${adr.label} | ${adr.date} |`,
    )
    .join('\n')

  return `${tableHeader}\n${tableRows}`
}

function buildDefaultReadme(adrTable: string): string {
  return `# Architecture Decision Records

## ADR List

${adrTable}

## ADR Process

1. Use \`cd docs/adrs && npx adr-tools new "Meaningful Decision Title"\` to draft a new record.
2. Update the table with \`npm run build:adr\` so the index stays in sync.
3. Commit the new ADR together with any code or documentation changes it describes.
`
}

function updateReadme(adrTable: string, readmePath: string): void {
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

/**
 * Generate ADR index table
 *
 * @param options - Configuration options
 * @param options.rootDir - Root directory of the project
 * @param options.adrsDir - Directory containing ADR files (relative to rootDir)
 * @param options.readmePath - Path to ADR README file (relative to rootDir)
 */
export async function generateAdrIndex(options: GenerateAdrIndexOptions): Promise<void> {
  const adrsDir = options.adrsDir ?? join(options.rootDir, 'docs', 'adrs')
  const readmePath = options.readmePath ?? join(adrsDir, 'README.md')

  logger.info('🔍 Scanning ADR files...')

  try {
    const files = readdirSync(adrsDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => join(adrsDir, file))
      .filter(file => statSync(file).isFile())

    logger.info(`📁 Found ${files.length} ADR files`)

    const adrs = files.map(extractAdrInfo).filter((adr): adr is NonNullable<typeof adr> => adr !== null)

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
    }, {} as Record<string, number>)

    logger.info('\n📊 ADR Status Summary:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      logger.info(`  ${statusColors[status as keyof typeof statusColors]} ${statusLabels[status as keyof typeof statusLabels]}: ${count}`)
    })
  } catch (error) {
    logger.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}
