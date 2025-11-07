#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const adrsDir = join(rootDir, 'docs', 'adrs')
const readmePath = join(adrsDir, 'README.md')

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

function extractAdrInfo(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // Extract title (first line after #)
    const titleLine = lines.find(line => line.startsWith('# ADR-'))
    if (!titleLine)
      return null

    const title = titleLine.replace('# ADR-', '').trim()

    // Extract status (line with "* Status:")
    const statusLine = lines.find(line => line.includes('* Status:'))
    if (!statusLine)
      return null

    const status = statusLine.split('* Status:')[1]?.trim().toLowerCase()
    if (!status || !statusColors[status])
      return null

    // Extract date (line with "* Date:")
    const dateLine = lines.find(line => line.includes('* Date:'))
    const date = dateLine ? dateLine.split('* Date:')[1]?.trim() : 'Unknown'

    // Extract filename without extension for link
    const filename = filePath.split('/').pop().replace('.md', '')

    return {
      number: title.split(':')[0],
      title: title.split(':').slice(1).join(':').trim(),
      status,
      date,
      filename,
      color: statusColors[status],
      label: statusLabels[status],
    }
  }
  catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
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

function updateReadme(adrTable) {
  try {
    const readmeContent = readFileSync(readmePath, 'utf-8')

    // Find the ADR List section and replace it with the table
    const adrListStart = readmeContent.indexOf('## ADR List')
    const adrProcessStart = readmeContent.indexOf('## ADR Process')

    if (adrListStart === -1 || adrProcessStart === -1) {
      throw new Error('Could not find ADR List section in README')
    }

    const beforeAdrList = readmeContent.substring(0, adrListStart)
    const afterAdrProcess = readmeContent.substring(adrProcessStart)

    const newContent = `${beforeAdrList}## ADR List

${adrTable}

${afterAdrProcess}`

    writeFileSync(readmePath, newContent, 'utf-8')
    console.log('✅ ADR index updated successfully')
  }
  catch (error) {
    console.error('Error updating README:', error.message)
    process.exit(1)
  }
}

function main() {
  console.log('🔍 Scanning ADR files...')

  try {
    const files = readdirSync(adrsDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => join(adrsDir, file))
      .filter(file => statSync(file).isFile())

    console.log(`📁 Found ${files.length} ADR files`)

    const adrs = files.map(extractAdrInfo).filter(adr => adr !== null)

    console.log(`✅ Successfully parsed ${adrs.length} ADRs`)

    if (adrs.length === 0) {
      console.log('⚠️  No valid ADRs found')
      return
    }

    const adrTable = generateAdrTable(adrs)
    updateReadme(adrTable)

    // Log summary
    const statusCounts = adrs.reduce((acc, adr) => {
      acc[adr.status] = (acc[adr.status] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 ADR Status Summary:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${statusColors[status]} ${statusLabels[status]}: ${count}`)
    })
  }
  catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
