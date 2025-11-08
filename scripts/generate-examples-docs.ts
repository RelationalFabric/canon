#!/usr/bin/env tsx

/**
 * Generate Examples Documentation
 *
 * This script generates documentation from the example files in the /examples directory.
 * It extracts metadata, descriptions, and creates links to the source files on GitHub.
 *
 * The generated documentation maintains the testability of examples while providing
 * comprehensive documentation that's always up-to-date with the source code.
 */

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'

interface ExampleInfo {
  name: string
  path: string
  description: string
  keyConcepts: string[]
  prerequisites?: string[]
  githubUrl: string
  isDirectory: boolean
  subExamples?: ExampleInfo[]
  sourceFiles: string[]
  testStatus?: TestStatus
}

interface TestStatus {
  status: 'passed' | 'failed' | 'unknown'
  total: number
  passed: number
  failed: number
  examples: Array<{
    title: string
    status: 'passed' | 'failed'
    failureMessages: string[]
  }>
}

interface VitestAssertionResult {
  title: string
  status: 'passed' | 'failed' | 'pending' | 'todo'
  failureMessages: string[]
}

interface VitestFileResult {
  name: string
  status: 'passed' | 'failed'
  assertionResults: VitestAssertionResult[]
}

interface VitestJsonReport {
  testResults: VitestFileResult[]
}

const GITHUB_BASE_URL = 'https://github.com/RelationalFabric/canon/tree/main/examples'

/**
 * Extract metadata from a TypeScript file
 */
function extractMetadata(filePath: string): Partial<ExampleInfo> & { files?: string[] } {
  const content = readFileSync(filePath, 'utf-8')

  // Extract description from JSDoc comments (first comment block)
  const descriptionMatch = content.match(
    /\/\*\*[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*\*\s*([^*\n]+)/,
  )
  const description = descriptionMatch ? descriptionMatch[1].trim() : ''

  // Extract key concepts from comments
  const keyConceptsMatch = content.match(/Key Concepts?:[\s\S]*?(- [^\n]+)/g)
  const keyConcepts: string[] = []
  if (keyConceptsMatch) {
    keyConceptsMatch.forEach((match) => {
      const concepts = match.match(/- ([^\n]+)/g)
      if (concepts) {
        concepts.forEach((concept) => {
          keyConcepts.push(concept.replace('- ', '').trim())
        })
      }
    })
  }

  // Extract key takeaways as additional concepts (simplified regex)
  const takeawaysSection = content.match(/Key Takeaways?:[\s\S]*?(?=\n\n|\n\*\*|$)/)
  if (takeawaysSection) {
    const takeaways = takeawaysSection[0].match(/\d+\.\s+([^\n]+)/g)
    if (takeaways) {
      takeaways.forEach((takeaway) => {
        keyConcepts.push(takeaway.replace(/\d+\.\s+/, '').trim())
      })
    }
  }

  // Extract prerequisites
  const prerequisitesMatch = content.match(/Prerequisites?:[\s\S]*?(- [^\n]+)/g)
  const prerequisites: string[] = []
  if (prerequisitesMatch) {
    prerequisitesMatch.forEach((match) => {
      const prereqs = match.match(/- ([^\n]+)/g)
      if (prereqs) {
        prereqs.forEach((prereq) => {
          prerequisites.push(prereq.replace('- ', '').trim())
        })
      }
    })
  }

  // Extract referenced files from @file comments
  // Pattern 1: @file axioms/email.ts - In block comments
  // Pattern 2: // @file axioms/email.ts - Description - Standalone
  const filesMatch = content.match(/@file\s+(\S+)(?:\s+-\s+(.+))?/g)
  const files: string[] = []
  if (filesMatch) {
    filesMatch.forEach((match) => {
      const fileMatch = match.match(/@file\s+(\S+)/)
      if (fileMatch) {
        files.push(fileMatch[1])
      }
    })
  }

  return {
    description,
    keyConcepts,
    prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
    files: files.length > 0 ? files : undefined,
  }
}

function formatTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\.ts$/u, '')
    .replace(/\b\w/gu, match => match.toUpperCase())
}

function determineCodeFenceLanguage(filePath: string): string {
  const extension = extname(filePath).toLowerCase()
  if (extension === '.ts') {
    return 'typescript'
  }
  if (extension === '.js') {
    return 'javascript'
  }
  if (extension === '.json') {
    return 'json'
  }
  if (extension === '.md') {
    return 'markdown'
  }
  return ''
}

function normalizeRelativePath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/')
}

function resolveExamplesFilePath(examplesDir: string, relativeFile: string): string {
  const segments = relativeFile.split('/').filter(Boolean)
  return join(examplesDir, ...segments)
}

function loadTestResults(reportPath: string): VitestJsonReport | null {
  try {
    const raw = readFileSync(reportPath, 'utf-8')
    const data = JSON.parse(raw) as VitestJsonReport
    if (!Array.isArray(data.testResults)) {
      return null
    }
    return data
  }
  catch (error) {
    console.warn(`⚠️ Unable to read Vitest JSON report at ${reportPath}:`, error instanceof Error ? error.message : error)
    return null
  }
}
function collectSourceFiles(baseDir: string, relativeDir: string): string[] {
  const fullDirPath = join(baseDir, relativeDir)
  if (!existsSync(fullDirPath)) {
    return []
  }

  const stats = statSync(fullDirPath)
  if (!stats.isDirectory()) {
    return [normalizeRelativePath(relativeDir)]
  }

  const entries = readdirSync(fullDirPath).sort()
  const collected: string[] = []

  entries.forEach((entry) => {
    const fsRelativePath = join(relativeDir, entry)
    const normalizedRelativePath = normalizeRelativePath(fsRelativePath)
    const entryFullPath = join(baseDir, fsRelativePath)
    const entryStats = statSync(entryFullPath)

    if (entryStats.isDirectory()) {
      collected.push(...collectSourceFiles(baseDir, normalizedRelativePath))
      return
    }

    if (entryStats.isFile() && entry.endsWith('.ts')) {
      collected.push(normalizedRelativePath)
    }
  })

  return collected
}

function aggregateTestStatus(assertions: VitestAssertionResult[]): TestStatus {
  const relevantAssertions = assertions.filter(assertion =>
    assertion.status === 'passed' || assertion.status === 'failed',
  )

  if (relevantAssertions.length === 0) {
    return {
      status: 'unknown',
      total: 0,
      passed: 0,
      failed: 0,
      examples: [],
    }
  }

  const failedAssertions = relevantAssertions.filter(assertion => assertion.status === 'failed')
  const passedAssertions = relevantAssertions.length - failedAssertions.length

  return {
    status: failedAssertions.length > 0 ? 'failed' : 'passed',
    total: relevantAssertions.length,
    passed: passedAssertions,
    failed: failedAssertions.length,
    examples: relevantAssertions.map(assertion => ({
      title: assertion.title,
      status: assertion.status === 'failed' ? 'failed' : 'passed',
      failureMessages: assertion.failureMessages,
    })),
  }
}

function augmentExampleWithTestResults(example: ExampleInfo, report: VitestJsonReport): ExampleInfo {
  const cwdPrefix = `${process.cwd()}/`
  const matchingResults = report.testResults.filter((result) => {
    const normalizedName = normalizeRelativePath(result.name.replace(cwdPrefix, ''))
    const possibleMatches = new Set<string>([normalizedName])
    if (normalizedName.startsWith('examples/')) {
      possibleMatches.add(normalizedName.slice('examples/'.length))
    }
    return Array.from(possibleMatches).some((candidate) => {
      if (candidate === example.path) {
        return true
      }
      return example.sourceFiles.includes(candidate)
    })
  })

  if (matchingResults.length === 0) {
    return {
      ...example,
      testStatus: { status: 'unknown', total: 0, passed: 0, failed: 0, examples: [] },
    }
  }

  const assertionResults = matchingResults.flatMap(result => result.assertionResults)
  const testStatus = aggregateTestStatus(assertionResults)
  return { ...example, testStatus }
}

function formatTestStatus(testStatus: TestStatus | undefined): string | null {
  if (!testStatus) {
    return null
  }

  const { status, total, passed, failed } = testStatus

  if (status === 'unknown' || total === 0) {
    return '⚠️ Tests: status unknown (run `npm run check:test:json` to update)'
  }

  if (status === 'passed') {
    return `✅ Tests: ${passed}/${total} passed`
  }

  return `❌ Tests: ${passed}/${total} passed (${failed} failing)`
}

function formatTestStatusSummary(testStatus: TestStatus | undefined): string | null {
  if (!testStatus) {
    return null
  }

  const { status, total, passed, failed } = testStatus

  if (status === 'unknown' || total === 0) {
    return '_Tests:_ ⚠️ status unknown (run `npm run check:test:json` to update)'
  }

  if (status === 'passed') {
    return `_Tests:_ ✅ ${passed}/${total} passed`
  }

  return `_Tests:_ ❌ ${passed}/${total} passed (${failed} failing)`
}

function formatFailureMessage(message: string): string {
  const normalized = message.trim()
  if (normalized.length === 0) {
    return '(no failure message provided)'
  }
  return normalized.replace(/\r?\n/g, '\n    ')
}

/**
 * Process a single example file or directory
 */
function processExample(examplePath: string, relativePath: string, baseDir: string): ExampleInfo {
  const fullPath = join(baseDir, examplePath)
  const stat = statSync(fullPath)
  const isDirectory = stat.isDirectory()

  const name = basename(examplePath, extname(examplePath))
  const normalizedRelativePath = normalizeRelativePath(relativePath)
  const githubUrl = `${GITHUB_BASE_URL}/${normalizedRelativePath}`

  const exampleInfo: ExampleInfo = {
    name,
    path: normalizedRelativePath,
    description: '',
    keyConcepts: [],
    githubUrl,
    isDirectory,
    sourceFiles: [],
  }

  if (isDirectory) {
    // Process directory - look for index.ts, usage.ts, or README.md as entry point
    const indexPath = join(fullPath, 'index.ts')
    const usagePath = join(fullPath, 'usage.ts')
    const readmePath = join(fullPath, 'README.md')

    // Try to get metadata from index.ts first, then usage.ts, then README.md
    let metadata: Partial<ExampleInfo> & { files?: string[] } = {}
    let entryFileRelative: string | undefined

    if (existsSync(indexPath) && statSync(indexPath).isFile()) {
      metadata = extractMetadata(indexPath)
      entryFileRelative = normalizeRelativePath(join(normalizedRelativePath, 'index.ts'))
    }
    else if (existsSync(usagePath) && statSync(usagePath).isFile()) {
      metadata = extractMetadata(usagePath)
      entryFileRelative = normalizeRelativePath(join(normalizedRelativePath, 'usage.ts'))
    }
    else if (existsSync(readmePath) && statSync(readmePath).isFile()) {
      const readmeContent = readFileSync(readmePath, 'utf-8')
      const descriptionMatch = readmeContent.match(/^#\s+([^\n]+)/)
      if (descriptionMatch) {
        metadata.description = descriptionMatch[1].trim()
      }
    }

    exampleInfo.description = metadata.description || ''
    exampleInfo.keyConcepts = metadata.keyConcepts || []
    exampleInfo.prerequisites = metadata.prerequisites

    // Process referenced files from @file comments
    if (metadata.files && metadata.files.length > 0) {
      const subFiles = metadata.files
        .map((file) => {
          const nestedExamplePath = join(examplePath, file)
          const nestedRelativePath = normalizeRelativePath(join(normalizedRelativePath, file))
          const nestedFullPath = join(baseDir, nestedExamplePath)
          if (existsSync(nestedFullPath) && statSync(nestedFullPath).isFile()) {
            return processExample(nestedExamplePath, nestedRelativePath, baseDir)
          }
          return null
        })
        .filter((f): f is ExampleInfo => f !== null)

      if (subFiles.length > 0) {
        exampleInfo.subExamples = subFiles
      }
    }

    const referencedFiles = metadata.files?.map(file =>
      normalizeRelativePath(join(normalizedRelativePath, file)),
    ) ?? []
    const discoveredFiles = referencedFiles.length > 0
      ? referencedFiles
      : collectSourceFiles(baseDir, normalizedRelativePath)

    const sourceFiles = new Set<string>(discoveredFiles)
    if (entryFileRelative) {
      sourceFiles.add(entryFileRelative)
    }

    exampleInfo.sourceFiles = Array.from(sourceFiles).sort()
  }
  else {
    // Process single file
    const metadata = extractMetadata(fullPath)
    exampleInfo.description = metadata.description || ''
    exampleInfo.keyConcepts = metadata.keyConcepts || []
    exampleInfo.prerequisites = metadata.prerequisites
    exampleInfo.sourceFiles = [normalizedRelativePath]
  }

  return exampleInfo
}

function generateExamplePage(example: ExampleInfo, examplesDir: string): string {
  const lines: string[] = []
  lines.push(`# ${formatTitle(example.name)}`)
  lines.push('')

  if (example.description) {
    lines.push(example.description)
    lines.push('')
  }

  if (example.keyConcepts.length > 0) {
    lines.push('## Key Concepts')
    lines.push('')
    example.keyConcepts.forEach((concept) => {
      lines.push(`- ${concept}`)
    })
    lines.push('')
  }

  if (example.prerequisites && example.prerequisites.length > 0) {
    lines.push('## Prerequisites')
    lines.push('')
    example.prerequisites.forEach((prerequisite) => {
      lines.push(`- ${prerequisite}`)
    })
    lines.push('')
  }

  lines.push(`**Pattern:** ${example.isDirectory ? 'Multi-file example with modular structure' : 'Single-file example'}`)
  lines.push('')
  lines.push(`**Source:** [View on GitHub](${example.githubUrl})`)
  lines.push('')

  if (example.subExamples && example.subExamples.length > 0) {
    lines.push('## Supporting Files')
    lines.push('')
    example.subExamples.forEach((subExample) => {
      const details = subExample.description ? ` - ${subExample.description}` : ''
      lines.push(`- [\`${subExample.path}\`](${subExample.githubUrl})${details}`)
    })
    lines.push('')
  }

  const formattedTestStatus = formatTestStatus(example.testStatus)
  if (formattedTestStatus) {
    lines.push('## Test Status')
    lines.push('')
    lines.push(formattedTestStatus)
    lines.push('')

    if (example.testStatus && example.testStatus.status === 'failed') {
      lines.push('### Failing Assertions')
      lines.push('')
      example.testStatus.examples
        .filter(assertion => assertion.status === 'failed')
        .forEach((assertion) => {
          lines.push(`- **${assertion.title}**`)
          if (assertion.failureMessages.length === 0) {
            lines.push('  - (no failure message provided)')
          }
          else {
            assertion.failureMessages.forEach((message) => {
              const formattedMessage = formatFailureMessage(message)
              lines.push(`  - ${formattedMessage}`)
            })
          }
        })
      lines.push('')
    }
  }

  if (example.sourceFiles.length > 0) {
    lines.push('## Files')
    lines.push('')
    example.sourceFiles.forEach((file) => {
      lines.push(`- \`${file}\``)
    })
    lines.push('')
  }

  example.sourceFiles.forEach((relativeFile) => {
    const absolutePath = resolveExamplesFilePath(examplesDir, relativeFile)
    if (!existsSync(absolutePath)) {
      return
    }

    const code = readFileSync(absolutePath, 'utf-8').trimEnd()
    const language = determineCodeFenceLanguage(relativeFile)

    lines.push(`## File: \`${relativeFile}\``)
    lines.push('')
    lines.push(`\`\`\`${language}`)
    lines.push(code)
    lines.push('```')
  })

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  const content = lines.join('\n').replace(/\n{3,}/g, '\n\n')
  return `${content.trimEnd()}\n`
}

function writeExampleDocumentation(example: ExampleInfo, examplesDir: string, outputRoot: string) {
  const exampleDir = join(outputRoot, example.name)
  mkdirSync(exampleDir, { recursive: true })
  const docPath = join(exampleDir, 'index.md')
  const pageContent = generateExamplePage(example, examplesDir)
  writeFileSync(docPath, pageContent)
}

/**
 * Generate the main examples documentation
 */
function generateExamplesDocumentation(examples: ExampleInfo[]): string {
  const header = `# Examples

This directory contains practical examples demonstrating how to use the @relational-fabric/canon package and its configurations.

## Available Examples

`

  const examplesContent = examples
    .map((example) => {
      const docLink = `./${example.name}/`
      let content = `### [${example.name}](${docLink})\n`

      if (example.description) {
        content += `${example.description}\n\n`
      }

      if (example.keyConcepts.length > 0) {
        content += '**Key Concepts:**\n'
        example.keyConcepts.forEach((concept) => {
          content += `- ${concept}\n`
        })
        content += '\n'
      }

      if (example.prerequisites && example.prerequisites.length > 0) {
        content += '**Prerequisites:**\n'
        example.prerequisites.forEach((prereq) => {
          content += `- ${prereq}\n`
        })
        content += '\n'
      }

      content += `**Pattern:** ${example.isDirectory ? 'Multi-file example with modular structure' : 'Single-file example'}\n\n`
      content += `**Source:** [View on GitHub](${example.githubUrl})\n\n`

      const testStatusSummary = formatTestStatusSummary(example.testStatus)
      if (testStatusSummary) {
        content += `${testStatusSummary}\n\n`
        if (example.testStatus && example.testStatus.status === 'failed') {
          content += '**Failing Assertions:**\n'
          example.testStatus.examples
            .filter(assertion => assertion.status === 'failed')
            .forEach((assertion) => {
              content += `- ${assertion.title}\n`
            })
          content += '\n'
        }
      }

      if (example.subExamples && example.subExamples.length > 0) {
        content += '**Supporting Files:**\n'
        example.subExamples.forEach((subExample) => {
          content += `- [\`${subExample.path}\`](${subExample.githubUrl})`
          if (subExample.description) {
            content += ` - ${subExample.description}`
          }
          content += '\n'
        })
        content += '\n'
      }

      return content
    })
    .join('')

  const footer = `## Example Patterns

### Single-File Examples
- **Use case**: Simple, focused examples
- **Pattern**: All code in a single file with narrative flow
- **Structure**: \`01-basic-id-axiom\`
- **Benefits**: Easy to understand, quick to read, perfect for learning one concept

### Folder-Based Examples
- **Use case**: Complex examples with custom axioms or multiple canons
- **Pattern**: Organized into focused files
- **Structure**:
  - \`usage.ts\` - Main entry point with narrative and tests (legacy examples may still use \`index.ts\`)
  - \`axioms/{concept}.ts\` - Custom axiom definitions (type + API)
  - \`canons/{notation}.ts\` - Canon definitions (type + runtime)
  - Supporting files as needed for clarity
- **Benefits**: Clear separation, easy to navigate, demonstrates real-world architecture

### Understanding Axioms vs Canons

**Axioms** define semantic concepts (Id, Email, Currency) and their APIs:
- Each axiom file contains both the type definition AND the API functions (\`emailOf\`, \`currencyOf\`)
- Example: \`axioms/email.ts\` defines EmailAxiom type and exports \`emailOf()\` function

**Canons** aggregate axioms and map them to specific notations:
- REST API canon: maps axioms to \`id\`, \`type\`, \`email\`
- MongoDB canon: maps axioms to \`_id\`, \`_type\`, \`email\`
- JSON-LD canon: maps axioms to \`@id\`, \`@type\`, \`email\`

Canons don't have APIs - they configure how axiom APIs work with different data formats

## Getting Started

Each example includes:
- **Narrative documentation** that teaches concepts through prose
- **Complete code samples** with full TypeScript typing
- **In-source tests** that demonstrate and validate behavior
- **Real-world scenarios** showing practical applications
- **Live source code** linked directly to GitHub

## Prerequisites

Before running these examples, ensure you have:

- Node.js 22.0.0 or higher
- TypeScript 5.0.0 or higher
- ESLint 9.0.0 or higher

## Installation

\`\`\`bash
npm install @relational-fabric/canon
\`\`\`

## Usage

Each example can be run independently. Copy the code samples and adapt them to your specific use case. The examples are designed to work with the TypeScript and ESLint configurations provided by this package.

For more information about the package configurations, see the main [documentation](../README.md).

## Running Examples

You can run examples directly using tsx:

\`\`\`bash
# Run a single-file example
npx tsx examples/01-basic-id-axiom.ts

# Run a folder example
npx tsx examples/02-module-style-canon/usage.ts

# Run multiple examples
npx tsx examples/01-basic-id-axiom.ts && npx tsx examples/02-module-style-canon/usage.ts
\`\`\`

## Testing

Examples use Vitest's in-source testing pattern in their entry points. The examples serve as:
1. **Living documentation** - Narrative code that teaches concepts
2. **Integration tests** - Verify complete workflows work correctly
3. **Regression tests** - Ensure changes don't break functionality

Run the tests with:
\`\`\`bash
npm test
\`\`\`

## Writing New Examples

See [CONTRIBUTING.md](./CONTRIBUTING.md) in the examples directory for guidelines on:
- Structuring examples as narrative documentation
- When to use single-file vs folder-based examples
- Naming conventions for axioms, canons, and supporting files
- Writing tests that teach
`

  return header + examplesContent + footer
}

function replaceDirectory(tempDir: string, targetDir: string) {
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
function main() {
  console.log('🔍 Scanning examples directory...')

  const rootDir = process.cwd()
  const examplesDir = join(rootDir, 'examples')

  if (!existsSync(examplesDir) || !statSync(examplesDir).isDirectory()) {
    console.error('❌ Examples directory not found.')
    process.exitCode = 1
    return
  }

  const files = readdirSync(examplesDir)
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
        const usagePath = join(fullPath, 'usage.ts') // Backwards compatibility
        return existsSync(indexPath) || existsSync(usagePath)
      }

      return false
    })
    .sort()

  console.log(`📁 Found ${files.length} examples`)

  const examples = files.map((file) => {
    console.log(`📄 Processing: ${file}`)
    return processExample(file, file, examplesDir)
  })

  console.log('📝 Generating documentation...')

  const testReportPath = join(rootDir, '.scratch', 'vitest-report.json')
  const tests = existsSync(testReportPath) && statSync(testReportPath).isFile()
    ? loadTestResults(testReportPath)
    : null

  if (!tests) {
    console.warn('⚠️ No Vitest JSON report found. Example status information will be omitted.')
    console.warn('   Run `npm run check:test:json` before generating documentation to include test status.')
  }

  const examplesWithTests = examples.map((example) => {
    if (!tests) {
      return { ...example }
    }
    return augmentExampleWithTestResults(example, tests)
  })

  const documentation = generateExamplesDocumentation(examplesWithTests)
  const outputDir = join(rootDir, 'docs', 'examples')

  const tmpBaseDir = mkdtempSync(join(tmpdir(), 'canon-examples-'))
  const tmpOutputDir = join(tmpBaseDir, 'examples-docs')
  mkdirSync(tmpOutputDir, { recursive: true })

  try {
    writeFileSync(join(tmpOutputDir, 'README.md'), documentation)

    examplesWithTests.forEach((example) => {
      console.log(`🧾 Writing documentation for: ${example.name}`)
      writeExampleDocumentation(example, examplesDir, tmpOutputDir)
    })

    replaceDirectory(tmpOutputDir, outputDir)
  }
  finally {
    if (existsSync(tmpBaseDir)) {
      rmSync(tmpBaseDir, { recursive: true, force: true })
    }
  }

  console.log(`✅ Documentation generated: ${join(outputDir, 'README.md')}`)
  console.log(`📊 Processed ${examples.length} examples`)

  // Print summary
  examples.forEach((example) => {
    const description = example.description || 'No description'
    console.log(`  - ${example.name}: ${description}`)
    if (example.subExamples) {
      example.subExamples.forEach((sub) => {
        console.log(`    └─ ${sub.name}`)
      })
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
