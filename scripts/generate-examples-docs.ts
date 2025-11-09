#!/usr/bin/env tsx

/**
 * Generate Examples Documentation (Tutorial-First)
 *
 * This script generates tutorial-first narrative documentation from example files.
 * It uses AST parsing, Markdown processing, test integration, and file inclusion
 * to produce pedagogically coherent documentation.
 *
 * Features:
 * - AST-based extraction of metadata, comments, JSDoc, and tests
 * - Markdown processing with explicit heading detection
 * - Test status integration from Vitest JSON report
 * - File inclusion with header depth controls
 * - Atomic publishing with backup/restore
 */

import type { ExampleInfo } from './examples/types.js'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'
import { parseExampleFile } from './examples/parser.js'
import { generateExampleDoc } from './examples/renderer.js'
import { getTestStatusForFile, loadTestReport } from './examples/test-status.js'

const GITHUB_BASE_URL = 'https://github.com/RelationalFabric/canon/tree/main/examples'

/**
 * Discover examples in the examples directory
 *
 * @param examplesDir - Path to examples directory
 * @returns Array of example paths (relative to examples/)
 */
function discoverExamples(examplesDir: string): string[] {
  const entries = readdirSync(examplesDir)
    .filter((file) => {
      const fullPath = join(examplesDir, file)
      const stat = statSync(fullPath)

      // Include *.ts files at root level (single-file examples)
      if (stat.isFile() && file.endsWith('.ts') && !file.includes('README') && !file.includes('CONTRIBUTING')) {
        return true
      }

      // Include directories that have index.ts or usage.ts (folder examples)
      if (stat.isDirectory()) {
        const indexPath = join(fullPath, 'index.ts')
        const usagePath = join(fullPath, 'usage.ts')
        return existsSync(indexPath) || existsSync(usagePath)
      }

      return false
    })
    .sort()

  return entries
}

/**
 * Get entry file for an example
 *
 * @param examplePath - Path to example (file or directory)
 * @param examplesDir - Examples directory
 * @returns Absolute path to entry file
 */
function getEntryFile(examplePath: string, examplesDir: string): string {
  const fullPath = join(examplesDir, examplePath)
  const stat = statSync(fullPath)

  if (stat.isFile()) {
    return fullPath
  }

  // Directory - look for index.ts or usage.ts
  const indexPath = join(fullPath, 'index.ts')
  const usagePath = join(fullPath, 'usage.ts')

  if (existsSync(indexPath)) {
    return indexPath
  }

  if (existsSync(usagePath)) {
    return usagePath
  }

  throw new Error(`No entry file found for example: ${examplePath}`)
}

/**
 * Get example name from path
 *
 * @param examplePath - Path to example
 * @returns Display name
 */
function getExampleName(examplePath: string): string {
  return basename(examplePath, extname(examplePath))
}

/**
 * Format example name as title
 *
 * @param name - Example name
 * @returns Formatted title
 */
function formatTitle(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, match => match.toUpperCase())
}

/**
 * Generate example information
 *
 * @param examplePath - Path to example (relative to examples/)
 * @param examplesDir - Examples directory
 * @param rootDir - Project root directory
 * @param testReport - Vitest test report
 * @returns Example information
 */
async function generateExampleInfo(
  examplePath: string,
  examplesDir: string,
  rootDir: string,
  testReport: ReturnType<typeof loadTestReport>,
): Promise<ExampleInfo> {
  const entryFile = getEntryFile(examplePath, examplesDir)
  const name = getExampleName(examplePath)
  const fullPath = join(examplesDir, examplePath)
  const isDirectory = statSync(fullPath).isDirectory()

  // Parse example to get metadata and referenced files
  const parsed = parseExampleFile(entryFile)

  // Get test status (currently not used in display but available for future use)
  const relativeEntryPath = entryFile.replace(`${examplesDir}/`, '')
  const _testStatusMap = getTestStatusForFile(testReport, relativeEntryPath, rootDir)

  const info: ExampleInfo = {
    name,
    path: examplePath,
    description: parsed.metadata.description || '',
    keywords: parsed.metadata.keywords ? parsed.metadata.keywords.split(',').map(k => k.trim()) : [],
    difficulty: parsed.metadata.difficulty,
    referencedFiles: parsed.referencedFiles,
    isDirectory,
    docFile: `${name}.md`,
  }

  return info
}

/**
 * Generate index page
 *
 * @param examples - Array of example information
 * @returns Markdown content for index
 */
function generateIndexPage(examples: ExampleInfo[]): string {
  const lines: string[] = []

  lines.push('# Examples')
  lines.push('')
  lines.push('This directory contains practical examples demonstrating how to use the @relational-fabric/canon package.')
  lines.push('')
  lines.push('## Available Examples')
  lines.push('')

  for (const example of examples) {
    const docLink = `./${example.docFile}`
    const title = example.description || formatTitle(example.name)
    const githubUrl = `${GITHUB_BASE_URL}/${example.path}`

    lines.push(`### [${example.name}](${docLink})`)
    lines.push('')
    lines.push(title)
    lines.push('')

    if (example.keywords.length > 0) {
      lines.push(`**Keywords:** ${example.keywords.join(', ')}`)
      lines.push('')
    }

    if (example.difficulty) {
      lines.push(`**Difficulty:** ${example.difficulty}`)
      lines.push('')
    }

    lines.push(`**Pattern:** ${example.isDirectory ? 'Multi-file example' : 'Single-file example'}`)
    lines.push('')
    lines.push(`**Source:** [View on GitHub](${githubUrl})`)
    lines.push('')

    if (example.referencedFiles.length > 0) {
      lines.push('**Referenced files:**')
      for (const file of example.referencedFiles) {
        lines.push(`- \`${file}\``)
      }
      lines.push('')
    }
  }

  lines.push('## Getting Started')
  lines.push('')
  lines.push('Each example includes:')
  lines.push('- **Narrative documentation** that teaches concepts through prose')
  lines.push('- **Complete code samples** with full TypeScript typing')
  lines.push('- **In-source tests** that demonstrate and validate behavior')
  lines.push('- **Real-world scenarios** showing practical applications')
  lines.push('')

  lines.push('## Running Examples')
  lines.push('')
  lines.push('You can run examples directly using tsx:')
  lines.push('')
  lines.push('```bash')
  lines.push('# Run a single-file example')
  lines.push('npx tsx examples/01-basic-id-axiom.ts')
  lines.push('')
  lines.push('# Run a folder example')
  lines.push('npx tsx examples/02-module-style-canon/index.ts')
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

/**
 * Atomically replace directory
 *
 * @param tempDir - Temporary staging directory
 * @param targetDir - Target directory to replace
 */
function replaceDirectory(tempDir: string, targetDir: string): void {
  const parentDir = dirname(targetDir)
  mkdirSync(parentDir, { recursive: true })

  const backupDir = `${targetDir}.backup-${Date.now()}`

  try {
    if (existsSync(targetDir)) {
      renameSync(targetDir, backupDir)
    }

    renameSync(tempDir, targetDir)

    if (existsSync(backupDir)) {
      rmSync(backupDir, { recursive: true, force: true })
    }
  }
  catch (error) {
    if (!existsSync(targetDir) && existsSync(backupDir)) {
      renameSync(backupDir, targetDir)
    }

    throw error
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔍 Scanning examples directory...')

  const rootDir = process.cwd()
  const examplesDir = join(rootDir, 'examples')

  if (!existsSync(examplesDir) || !statSync(examplesDir).isDirectory()) {
    console.error('❌ Examples directory not found.')
    process.exitCode = 1
    return
  }

  // Discover examples
  const examplePaths = discoverExamples(examplesDir)
  console.log(`📁 Found ${examplePaths.length} examples`)

  // Load test report
  const testReportPath = join(rootDir, '.scratch', 'vitest-report.json')
  const testReport = existsSync(testReportPath) ? loadTestReport(testReportPath) : null

  if (!testReport) {
    console.warn('⚠️ No Vitest JSON report found. Test status will be omitted.')
    console.warn('   Run `npm run check:test:json` before generating documentation to include test status.')
  }

  // Create temporary staging directory
  const tmpBaseDir = mkdtempSync(join(tmpdir(), 'canon-examples-'))
  const tmpOutputDir = join(tmpBaseDir, 'examples-docs')
  mkdirSync(tmpOutputDir, { recursive: true })

  try {
    // Generate example information and documents
    const examples: ExampleInfo[] = []

    for (const examplePath of examplePaths) {
      console.log(`📄 Processing: ${examplePath}`)

      const info = await generateExampleInfo(examplePath, examplesDir, rootDir, testReport)
      examples.push(info)

      // Generate example document
      const entryFile = getEntryFile(examplePath, examplesDir)
      const relativeEntryPath = entryFile.replace(`${examplesDir}/`, '')
      const testStatusMap = getTestStatusForFile(testReport, relativeEntryPath, rootDir)
      const exampleRoot = dirname(entryFile)

      const docContent = await generateExampleDoc(entryFile, testStatusMap, exampleRoot)
      const docPath = join(tmpOutputDir, info.docFile)

      writeFileSync(docPath, docContent)
      console.log(`  ✅ Generated: ${info.docFile}`)
    }

    // Generate index page
    console.log('📝 Generating index page...')
    const indexContent = generateIndexPage(examples)
    writeFileSync(join(tmpOutputDir, 'README.md'), indexContent)

    // Atomically replace docs/examples/
    const outputDir = join(rootDir, 'docs', 'examples')
    console.log('📦 Publishing documentation...')
    replaceDirectory(tmpOutputDir, outputDir)

    console.log(`✅ Documentation generated: ${outputDir}`)
    console.log(`📊 Processed ${examples.length} examples`)

    // Print summary
    for (const example of examples) {
      const description = example.description || 'No description'
      console.log(`  - ${example.name}: ${description}`)
    }
  }
  finally {
    if (existsSync(tmpBaseDir)) {
      rmSync(tmpBaseDir, { recursive: true, force: true })
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Error generating documentation:', error)
    process.exitCode = 1
  })
}
