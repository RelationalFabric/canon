#!/usr/bin/env tsx

/**
 * Generate Examples Documentation (Tutorial-First, Single Doc per Example)
 *
 * This script implements a tutorial-first documentation generator that:
 * - Parses TypeScript examples using AST analysis
 * - Extracts narrative prose from comments with Markdown support
 * - Renders code in source order with tests integrated as narrative
 * - Supports @include directives and header depth controls
 * - Maps test results from Vitest JSON reports
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
import { basename, dirname, extname, join, resolve } from 'node:path'
import ts from 'typescript'

// =============================================================================
// Type Definitions
// =============================================================================

interface DocumentMetadata {
  title?: string
  description?: string
  keywords?: string[]
  difficulty?: string
}

interface ExampleInfo {
  name: string
  path: string
  entryFile: string
  referencedFiles: string[]
  isDirectory: boolean
}

interface TutorialSection {
  type: 'prose' | 'code' | 'test' | 'jsdoc' | 'include'
  content: string
  heading?: string
  headingLevel?: number
  language?: string
  testTitle?: string
  testStatus?: TestStatus
  filePath?: string
  jsDocInfo?: JSDocInfo
}

interface JSDocInfo {
  description: string
  params?: Array<{ name: string, type?: string, description: string }>
  returns?: { type?: string, description: string }
  throws?: string[]
}

interface TestStatus {
  status: 'passed' | 'failed' | 'unknown'
  message?: string
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

interface HeaderDepthState {
  currentDepth: number
}

// =============================================================================
// Utilities
// =============================================================================

function normalizeRelativePath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/')
}

function loadTestResults(reportPath: string): VitestJsonReport | null {
  try {
    if (!existsSync(reportPath)) {
      return null
    }
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

function findTestStatus(
  report: VitestJsonReport | null,
  filePath: string,
  testTitle: string,
): TestStatus {
  if (!report) {
    return { status: 'unknown' }
  }

  const normalizedPath = normalizeRelativePath(filePath)

  // Find matching file in test results
  const fileResult = report.testResults.find((result) => {
    const resultPath = normalizeRelativePath(result.name)
    return resultPath.includes(normalizedPath) || normalizedPath.includes(resultPath)
  })

  if (!fileResult) {
    return { status: 'unknown' }
  }

  // Find matching test by title
  const assertion = fileResult.assertionResults.find(
    a => a.title === testTitle || a.title.includes(testTitle),
  )

  if (!assertion) {
    return { status: 'unknown' }
  }

  if (assertion.status === 'failed') {
    return {
      status: 'failed',
      message: assertion.failureMessages.join('\n'),
    }
  }

  return { status: assertion.status === 'passed' ? 'passed' : 'unknown' }
}

// =============================================================================
// Example Discovery
// =============================================================================

function discoverExamples(examplesDir: string): ExampleInfo[] {
  const entries = readdirSync(examplesDir)
    .filter((entry) => {
      const fullPath = join(examplesDir, entry)
      const stat = statSync(fullPath)

      // Single-file .ts examples
      if (stat.isFile() && entry.endsWith('.ts') && !entry.includes('README') && !entry.includes('CONTRIBUTING')) {
        return true
      }

      // Folder examples with index.ts or usage.ts
      if (stat.isDirectory()) {
        const indexPath = join(fullPath, 'index.ts')
        const usagePath = join(fullPath, 'usage.ts')
        return existsSync(indexPath) || existsSync(usagePath)
      }

      return false
    })
    .sort()

  return entries.map((entry) => {
    const fullPath = join(examplesDir, entry)
    const stat = statSync(fullPath)
    const name = basename(entry, extname(entry))

    if (stat.isFile()) {
      // Single-file example
      return {
        name,
        path: normalizeRelativePath(entry),
        entryFile: normalizeRelativePath(entry),
        referencedFiles: [],
        isDirectory: false,
      }
    }
    else {
      // Folder example
      const indexPath = join(fullPath, 'index.ts')
      const entryFileName = existsSync(indexPath) ? 'index.ts' : 'usage.ts'
      const entryFile = normalizeRelativePath(join(entry, entryFileName))

      return {
        name,
        path: normalizeRelativePath(entry),
        entryFile,
        referencedFiles: [],
        isDirectory: true,
      }
    }
  })
}

// =============================================================================
// AST Parser
// =============================================================================

interface ParsedElement {
  type: 'comment' | 'code'
  content: string
  start: number
  end: number
  isBlockComment?: boolean
  isJSDoc?: boolean
  node?: ts.Node
}

class ExampleParser {
  private sourceFile: ts.SourceFile
  private sourceText: string
  private exampleRoot: string
  private depthState: HeaderDepthState
  private referencedFiles: Set<string>

  constructor(
    filePath: string,
    exampleRoot: string,
  ) {
    this.sourceText = readFileSync(filePath, 'utf-8')
    this.sourceFile = ts.createSourceFile(
      filePath,
      this.sourceText,
      ts.ScriptTarget.Latest,
      true,
    )
    this.exampleRoot = exampleRoot
    this.depthState = { currentDepth: 1 }
    this.referencedFiles = new Set()
  }

  /**
   * Extract document metadata from the file-level JSDoc comment
   */
  extractMetadata(): DocumentMetadata {
    const metadata: DocumentMetadata = {}

    const fullText = this.sourceFile.getFullText()
    const commentRanges = ts.getLeadingCommentRanges(fullText, 0)

    if (!commentRanges || commentRanges.length === 0) {
      return metadata
    }

    const firstComment = commentRanges[0]
    const commentText = fullText.substring(firstComment.pos, firstComment.end)

    // Parse @document.* tags
    const titleMatch = commentText.match(/@document\.title\s+(.+)/i)
    const descMatch = commentText.match(/@document\.description\s+(.+)/i)
    const keywordsMatch = commentText.match(/@document\.keywords\s+(.+)/i)
    const difficultyMatch = commentText.match(/@document\.difficulty\s+(.+)/i)

    if (titleMatch) {
      metadata.title = titleMatch[1].trim()
    }
    if (descMatch) {
      metadata.description = descMatch[1].trim()
    }
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim())
    }
    if (difficultyMatch) {
      metadata.difficulty = difficultyMatch[1].trim()
    }

    // Fallback: extract title from first JSDoc line
    if (!metadata.title) {
      const lines = commentText.split('\n')
      if (lines.length > 1) {
        const firstLine = lines[1].replace(/^\s*\*\s?/, '').trim()
        if (firstLine) {
          metadata.title = firstLine
        }
      }
    }

    // Fallback: use second line as description if no @document.description
    if (!metadata.description) {
      const lines = commentText.split('\n').map(l => l.replace(/^\s*\*\s?/, '').trim()).filter(Boolean)
      if (lines.length > 1) {
        metadata.description = lines[1]
      }
    }

    return metadata
  }

  /**
   * Parse the entire file and extract tutorial sections in source order
   */
  parse(): TutorialSection[] {
    const elements = this.extractElements()
    return this.buildSections(elements)
  }

  getReferencedFiles(): string[] {
    return Array.from(this.referencedFiles)
  }

  /**
   * Extract all elements (comments, code) in source order
   */
  private extractElements(): ParsedElement[] {
    const elements: ParsedElement[] = []
    const fullText = this.sourceFile.getFullText()
    let lastPos = 0
    let isFirstStatement = true

    // Walk through all statements in source order
    const statements = this.sourceFile.statements
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Tests are just code - don't extract them separately
      // They stay inline as part of the narrative flow

      // Get leading comments
      const commentRanges = ts.getLeadingCommentRanges(fullText, statement.getFullStart())
      if (commentRanges) {
        for (const range of commentRanges) {
          if (range.pos >= lastPos) {
            const text = fullText.substring(range.pos, range.end)
            const isBlockComment = text.startsWith('/*')
            const isJSDoc = text.startsWith('/**')

            // Skip the first file-level JSDoc comment (it's for metadata)
            if (isFirstStatement && isJSDoc) {
              isFirstStatement = false
              lastPos = range.end
              continue
            }

            elements.push({
              type: 'comment',
              content: text,
              start: range.pos,
              end: range.end,
              isBlockComment,
              isJSDoc,
            })
            lastPos = range.end
          }
        }
      }

      isFirstStatement = false

      // Add the statement itself as code
      const codeElement: ParsedElement = {
        type: 'code',
        content: statement.getText(this.sourceFile),
        start: statement.getStart(this.sourceFile),
        end: statement.getEnd(),
        node: statement,
      }
      elements.push(codeElement)
      lastPos = statement.getEnd()
    }

    return elements
  }

  /**
   * Build tutorial sections from parsed elements
   */
  private buildSections(elements: ParsedElement[]): TutorialSection[] {
    const sections: TutorialSection[] = []
    let i = 0

    while (i < elements.length) {
      const element = elements[i]

      if (element.type === 'comment') {
        // Check for @include directive
        if (element.content.includes('@include')) {
          this.processIncludeDirective(element.content, sections)
          i++
          continue
        }

        // Check for header control directives
        if (element.content.includes('// #+') || element.content.includes('// #-') || element.content.includes('// #!')) {
          this.processHeaderControl(element.content)
          i++
          continue
        }

        // Skip section divider comments (lines of =, -, etc.)
        if (/^\/\/\s*[=\-]{5,}/.test(element.content)) {
          i++
          continue
        }

        // Skip single-line comments entirely (they stay with code)
        if (element.content.startsWith('//')) {
          i++
          continue
        }

        // Check if this is JSDoc for a declaration (next element is code)
        const nextElement = elements[i + 1]
        if (element.isJSDoc && nextElement && nextElement.type === 'code') {
          const jsDocInfo = this.parseJSDoc(element.content)
          if (jsDocInfo) {
            // Add JSDoc section
            sections.push({
              type: 'jsdoc',
              content: jsDocInfo.description,
              jsDocInfo,
            })
            i++
            continue
          }
        }

        // Process block comments as prose
        if (element.isBlockComment) {
          const prose = this.extractProseFromBlockComment(element.content)
          if (prose.trim().length > 0) {
            sections.push({
              type: 'prose',
              content: prose,
            })
          }
        }

        i++
      }
      else if (element.type === 'code') {
        // Group consecutive code statements together (including tests)
        const codeStatements: string[] = [element.content]
        let j = i + 1
        
        while (j < elements.length && elements[j].type === 'code') {
          codeStatements.push(elements[j].content)
          j++
        }

        // Add grouped code block
        sections.push({
          type: 'code',
          content: codeStatements.join('\n\n'),
          language: 'typescript',
        })
        
        i = j
      }
      else {
        i++
      }
    }

    return sections
  }

  private extractProseFromBlockComment(commentText: string): string {
    // Remove comment markers
    const content = commentText
      .replace(/^\/\*\*?/, '') // Remove opening
      .replace(/\*\/$/, '') // Remove closing
      .split('\n')
      .map((line) => {
        // Remove leading asterisks and whitespace
        return line.replace(/^\s*\*\s?/, '')
      })
      .join('\n')
      .trim()

    return content
  }

  /**
   * Parse JSDoc comment into structured information
   */
  private parseJSDoc(commentText: string): JSDocInfo | null {
    const prose = this.extractProseFromBlockComment(commentText)

    // Check if this has JSDoc tags
    if (!prose.includes('@param') && !prose.includes('@returns') && !prose.includes('@throws')) {
      return null
    }

    const lines = prose.split('\n')
    let description = ''
    const params: Array<{ name: string, type?: string, description: string }> = []
    let returns: { type?: string, description: string } | undefined
    const throws: string[] = []

    let currentSection = 'description'
    let currentParam: { name: string, type?: string, description: string } | null = null

    for (const line of lines) {
      const trimmed = line.trim()

      // @param tag
      const paramMatch = trimmed.match(/^@param\s+(?:\{([^}]+)\}\s+)?(\w+)\s+(.+)/)
      if (paramMatch) {
        if (currentParam) {
          params.push(currentParam)
        }
        currentParam = {
          name: paramMatch[2],
          type: paramMatch[1],
          description: paramMatch[3],
        }
        currentSection = 'param'
        continue
      }

      // @returns tag
      const returnsMatch = trimmed.match(/^@returns?\s+(?:\{([^}]+)\}\s+)?(.+)/)
      if (returnsMatch) {
        if (currentParam) {
          params.push(currentParam)
          currentParam = null
        }
        returns = {
          type: returnsMatch[1],
          description: returnsMatch[2],
        }
        currentSection = 'returns'
        continue
      }

      // @throws tag
      const throwsMatch = trimmed.match(/^@throws\s+(.+)/)
      if (throwsMatch) {
        if (currentParam) {
          params.push(currentParam)
          currentParam = null
        }
        throws.push(throwsMatch[1])
        currentSection = 'throws'
        continue
      }

      // Continuation of current section
      if (currentSection === 'description' && trimmed.length > 0) {
        description += (description ? '\n' : '') + trimmed
      }
      else if (currentSection === 'param' && currentParam && trimmed.length > 0 && !trimmed.startsWith('@')) {
        currentParam.description += ` ${trimmed}`
      }
      else if (currentSection === 'returns' && returns && trimmed.length > 0 && !trimmed.startsWith('@')) {
        returns.description += ` ${trimmed}`
      }
    }

    if (currentParam) {
      params.push(currentParam)
    }

    return {
      description,
      params: params.length > 0 ? params : undefined,
      returns,
      throws: throws.length > 0 ? throws : undefined,
    }
  }

  private processIncludeDirective(commentText: string, sections: TutorialSection[]): void {
    const match = commentText.match(/@include\s+(.+)/)
    if (!match) {
      return
    }

    const includePath = match[1].trim()
    const resolvedPath = resolve(this.exampleRoot, includePath)

    if (!existsSync(resolvedPath)) {
      console.warn(`⚠️ Include file not found: ${includePath}`)
      return
    }

    this.referencedFiles.add(includePath)

    const content = readFileSync(resolvedPath, 'utf-8')
    const language = this.getLanguageFromPath(includePath)

    sections.push({
      type: 'include',
      content,
      language,
      filePath: includePath,
    })
  }

  private processHeaderControl(commentText: string): void {
    if (commentText.includes('// #+')) {
      this.depthState.currentDepth++
    }
    else if (commentText.includes('// #-')) {
      this.depthState.currentDepth = Math.max(1, this.depthState.currentDepth - 1)
    }
    else if (commentText.includes('// #!')) {
      this.depthState.currentDepth = 1
    }
  }

  private isVitestTestBlock(statement: ts.Statement): boolean {
    if (!ts.isIfStatement(statement)) {
      return false
    }

    const condition = statement.expression

    // Check if condition is: import.meta.vitest
    // Structure: PropertyAccessExpression { name: "vitest", expression: MetaProperty }
    if (ts.isPropertyAccessExpression(condition) && condition.name.text === 'vitest') {
      const expr = condition.expression
      if (ts.isMetaProperty(expr) && expr.keywordToken === ts.SyntaxKind.ImportKeyword) {
        return true
      }
    }
    return false
  }

  private extractTestsFromBlock(node: ts.IfStatement, sections: TutorialSection[]): void {
    const thenBlock = node.thenStatement

    if (!ts.isBlock(thenBlock)) {
      return
    }

    // Look for it() and describe() calls
    for (const statement of thenBlock.statements) {
      this.extractTestCases(statement, sections)
    }
  }

  private extractTestCases(node: ts.Node, sections: TutorialSection[]): void {
    if (ts.isExpressionStatement(node)) {
      const expr = node.expression

      if (ts.isCallExpression(expr)) {
        const callee = expr.expression

        if (ts.isIdentifier(callee) && callee.text === 'it') {
          // Extract test title and body
          const args = expr.arguments
          if (args.length >= 2) {
            const titleArg = args[0]
            const bodyArg = args[1]

            if (ts.isStringLiteral(titleArg)) {
              const title = titleArg.text

              // Extract body content (handle arrow functions and regular functions)
              let body = ''
              if (ts.isArrowFunction(bodyArg) || ts.isFunctionExpression(bodyArg)) {
                const fnBody = bodyArg.body
                if (ts.isBlock(fnBody)) {
                  // Get statements inside function body
                  body = fnBody.statements.map(s => s.getText(this.sourceFile)).join('\n')
                }
                else {
                  // Arrow function with expression body
                  body = fnBody.getText(this.sourceFile)
                }
              }

              sections.push({
                type: 'test',
                testTitle: title,
                content: body,
                language: 'typescript',
                testStatus: { status: 'unknown' },
              })
            }
          }
        }
        else if (ts.isIdentifier(callee) && callee.text === 'describe') {
          // Recurse into describe block
          const args = expr.arguments
          if (args.length >= 2) {
            const bodyArg = args[1]
            if (ts.isArrowFunction(bodyArg) || ts.isFunctionExpression(bodyArg)) {
              const body = bodyArg.body
              if (ts.isBlock(body)) {
                for (const statement of body.statements) {
                  this.extractTestCases(statement, sections)
                }
              }
            }
          }
        }
      }
    }
  }

  private getLanguageFromPath(path: string): string {
    const ext = extname(path).toLowerCase()
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.js': 'javascript',
      '.json': 'json',
      '.md': 'markdown',
      '.yaml': 'yaml',
      '.yml': 'yaml',
    }
    return languageMap[ext] || ''
  }
}

// =============================================================================
// Markdown Rendering
// =============================================================================

function renderTutorialSections(
  sections: TutorialSection[],
  metadata: DocumentMetadata,
  report: VitestJsonReport | null,
  examplePath: string,
): string {
  const lines: string[] = []

  // Title (H1) - only inferred header
  const title = metadata.title || formatTitle(basename(examplePath))
  lines.push(`# ${title}`)
  lines.push('')

  // Description (only if it's different from title)
  if (metadata.description && metadata.description !== title) {
    lines.push(metadata.description)
    lines.push('')
  }

  // Render sections in order
  for (const section of sections) {
    switch (section.type) {
      case 'prose':
        // Prose with potential explicit Markdown headings
        if (section.content.trim().length > 0) {
          lines.push(section.content)
          lines.push('')
        }
        break

      case 'code':
        // Code block
        lines.push(`\`\`\`${section.language || 'typescript'}`)
        lines.push(section.content)
        lines.push('```')
        lines.push('')
        break

      case 'jsdoc':
        // JSDoc with description and optional tables
        if (section.jsDocInfo) {
          const info = section.jsDocInfo

          // Description
          if (info.description.trim().length > 0) {
            lines.push(info.description)
            lines.push('')
          }

          // Parameters table
          if (info.params && info.params.length > 0) {
            lines.push('**Parameters:**')
            lines.push('')
            lines.push('| Parameter | Type | Description |')
            lines.push('|-----------|------|-------------|')
            for (const param of info.params) {
              const type = param.type ? `\`${param.type}\`` : '-'
              lines.push(`| \`${param.name}\` | ${type} | ${param.description} |`)
            }
            lines.push('')
          }

          // Returns
          if (info.returns) {
            const type = info.returns.type ? ` \`${info.returns.type}\`` : ''
            lines.push(`**Returns:**${type}`)
            lines.push('')
            lines.push(info.returns.description)
            lines.push('')
          }

          // Throws
          if (info.throws && info.throws.length > 0) {
            lines.push('**Throws:**')
            lines.push('')
            for (const throwInfo of info.throws) {
              lines.push(`- ${throwInfo}`)
            }
            lines.push('')
          }
        }
        else if (section.content.trim().length > 0) {
          // Fallback for non-structured JSDoc
          lines.push(section.content)
          lines.push('')
        }
        break

      case 'test':
        // Tests should not be rendered separately - they're part of code flow
        // This case should never be reached with the updated parser
        break

      case 'include':
        // Include as wrapped section
        lines.push('---')
        lines.push('')
        lines.push(`Supporting File (\`${section.filePath}\`)`)
        lines.push('')
        lines.push(`\`\`\`${section.language || ''}`)
        lines.push(section.content)
        lines.push('```')
        lines.push('')
        lines.push('---')
        lines.push('')
        break
    }
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

function renderFooter(
  metadata: DocumentMetadata,
  entryFile: string,
  referencedFiles: string[],
): string {
  const lines: string[] = []

  lines.push('---')
  lines.push('')
  lines.push('## References')
  lines.push('')
  lines.push(`**Source:** \`${entryFile}\``)

  if (referencedFiles.length > 0) {
    lines.push('')
    lines.push('**Referenced files:**')
    referencedFiles.forEach((file) => {
      lines.push(`- \`${file}\``)
    })
  }

  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push('')
    lines.push(`**Keywords:** ${metadata.keywords.join(', ')}`)
  }

  if (metadata.difficulty) {
    lines.push('')
    lines.push(`**Difficulty:** ${metadata.difficulty}`)
  }

  lines.push('')

  return lines.join('\n')
}

// =============================================================================
// Document Generation
// =============================================================================

function generateExampleDocument(
  example: ExampleInfo,
  examplesDir: string,
  report: VitestJsonReport | null,
): string {
  const entryFilePath = join(examplesDir, example.entryFile)
  const exampleRoot = example.isDirectory ? join(examplesDir, example.path) : examplesDir

  const parser = new ExampleParser(entryFilePath, exampleRoot)

  const metadata = parser.extractMetadata()
  const sections = parser.parse()
  const referencedFiles = parser.getReferencedFiles()

  // Update referenced files in example info
  example.referencedFiles = referencedFiles

  // Fill in test statuses from report
  for (const section of sections) {
    if (section.type === 'test' && section.testTitle) {
      section.testStatus = findTestStatus(report, example.entryFile, section.testTitle)
    }
  }

  const body = renderTutorialSections(sections, metadata, report, example.path)
  const footer = renderFooter(metadata, example.entryFile, referencedFiles)

  return `${body}\n${footer}`
}

function generateIndexPage(examples: ExampleInfo[], examplesWithMeta: Array<{ example: ExampleInfo, metadata: DocumentMetadata, testsPassed: number, testsTotal: number }>): string {
  const lines: string[] = []

  lines.push('# Examples')
  lines.push('')
  lines.push('This directory contains practical examples demonstrating how to use the @relational-fabric/canon package.')
  lines.push('')
  lines.push('## Available Examples')
  lines.push('')

  for (const item of examplesWithMeta) {
    const { example, metadata, testsPassed, testsTotal } = item
    const docLink = `./${example.name}.md`
    const title = metadata.title || formatTitle(example.name)

    lines.push(`### [${title}](${docLink})`)
    lines.push('')

    if (metadata.description) {
      lines.push(metadata.description)
      lines.push('')
    }

    lines.push(`**Pattern:** ${example.isDirectory ? 'Multi-file example' : 'Single-file example'}`)
    lines.push('')

    if (testsTotal > 0) {
      const statusIcon = testsPassed === testsTotal ? '✅' : testsPassed > 0 ? '⚠️' : '❌'
      lines.push(`**Tests:** ${testsPassed}/${testsTotal} passed ${statusIcon}`)
      lines.push('')
    }

    if (metadata.keywords && metadata.keywords.length > 0) {
      lines.push(`**Keywords:** ${metadata.keywords.join(', ')}`)
      lines.push('')
    }

    if (metadata.difficulty) {
      lines.push(`**Difficulty:** ${metadata.difficulty}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// =============================================================================
// Utilities
// =============================================================================

function formatTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\.ts$/u, '')
    .replace(/\b\w/gu, match => match.toUpperCase())
}

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

// =============================================================================
// Main
// =============================================================================

function main(): void {
  console.log('🔍 Scanning examples directory...')

  const rootDir = process.cwd()
  const examplesDir = join(rootDir, 'examples')

  if (!existsSync(examplesDir) || !statSync(examplesDir).isDirectory()) {
    console.error('❌ Examples directory not found.')
    process.exitCode = 1
    return
  }

  const examples = discoverExamples(examplesDir)
  console.log(`📁 Found ${examples.length} examples`)

  // Load test report
  const testReportPath = join(rootDir, '.scratch', 'vitest-report.json')
  const report = loadTestResults(testReportPath)

  if (!report) {
    console.warn('⚠️ No Vitest JSON report found. Test status will be marked as unknown.')
    console.warn('   Run `npm run check:test:json` before generating documentation to include test status.')
  }

  // Create staging directory
  const tmpBaseDir = mkdtempSync(join(tmpdir(), 'canon-examples-'))
  const tmpOutputDir = join(tmpBaseDir, 'examples-docs')
  mkdirSync(tmpOutputDir, { recursive: true })

  try {
    // Generate individual example pages and collect metadata
    const examplesWithMeta: Array<{ example: ExampleInfo, metadata: DocumentMetadata, testsPassed: number, testsTotal: number }> = []

    for (const example of examples) {
      console.log(`📄 Generating documentation for: ${example.name}`)

      // Parse to get metadata and test counts
      const entryFilePath = join(examplesDir, example.entryFile)
      const exampleRoot = example.isDirectory ? join(examplesDir, example.path) : examplesDir
      const parser = new ExampleParser(entryFilePath, exampleRoot)
      const metadata = parser.extractMetadata()
      const sections = parser.parse()

      // Count tests and passed tests
      let testsTotal = 0
      let testsPassed = 0
      for (const section of sections) {
        if (section.type === 'test' && section.testTitle) {
          testsTotal++
          section.testStatus = findTestStatus(report, example.entryFile, section.testTitle)
          if (section.testStatus.status === 'passed') {
            testsPassed++
          }
        }
      }

      examplesWithMeta.push({ example, metadata, testsPassed, testsTotal })

      // Generate document
      const docContent = generateExampleDocument(example, examplesDir, report)
      const docPath = join(tmpOutputDir, `${example.name}.md`)
      writeFileSync(docPath, docContent)
    }

    // Generate index page
    const indexContent = generateIndexPage(examples, examplesWithMeta)
    writeFileSync(join(tmpOutputDir, 'README.md'), indexContent)

    // Atomically replace docs/examples/
    const outputDir = join(rootDir, 'docs', 'examples')
    replaceDirectory(tmpOutputDir, outputDir)

    console.log(`✅ Documentation generated: ${outputDir}`)
    console.log(`📊 Processed ${examples.length} examples`)
  }
  finally {
    if (existsSync(tmpBaseDir)) {
      rmSync(tmpBaseDir, { recursive: true, force: true })
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
