/**
 * AST parser for example documentation
 *
 * Uses TypeScript compiler API to extract metadata, comments, declarations,
 * and test blocks from example source files.
 *
 * INCLUSION RULES:
 * - Block comments `/* ... *\/` → Always included as prose
 * - Code fences `// ``` ... // ``` ` → Included as code
 * - JSDoc-decorated declarations → Included as jsdoc
 * - Tests `if (import.meta.vitest)` → Always included
 * - Include directives `// @include` → Always processed
 * - Header controls `// #+/-/!` → Always processed
 * - Everything else → Stays in source, NOT in docs
 */

import type {
  DocumentMetadata,
  ParsedExample,
  TutorialSection,
} from './types.js'
import { readFileSync } from 'node:fs'
import * as ts from 'typescript'
import {
  parseHeaderControl,
  parseIncludeDirective,
} from './includes.js'

/**
 * Extract document metadata from file-level JSDoc
 */
function extractDocumentMetadata(sourceFile: ts.SourceFile): DocumentMetadata {
  const metadata: DocumentMetadata = {}
  const fullText = sourceFile.getFullText()

  // eslint-disable-next-line regexp/no-unused-capturing-group -- Used for extraction
  const jsdocMatch = /\/\*\*((?:[^*]|\*(?!\/))*)\*\//.exec(fullText)
  if (!jsdocMatch)
    return metadata

  const jsdocText = jsdocMatch[0]

  const titleMatch = /@document\.title\s+(.+)/.exec(jsdocText)
  if (titleMatch?.[1])
    metadata.title = titleMatch[1].trim()

  const descMatch = /@document\.description\s+(.+)/.exec(jsdocText)
  if (descMatch?.[1])
    metadata.description = descMatch[1].trim()

  const keywordsMatch = /@document\.keywords\s+(.+)/.exec(jsdocText)
  if (keywordsMatch?.[1])
    metadata.keywords = keywordsMatch[1].trim()

  const difficultyMatch = /@document\.difficulty\s+(introductory|intermediate|advanced)/.exec(jsdocText)
  if (difficultyMatch?.[1])
    metadata.difficulty = difficultyMatch[1] as 'introductory' | 'intermediate' | 'advanced'

  return metadata
}

/**
 * Extract JSDoc from node
 */
function getJSDocComment(node: ts.Node, sourceFile: ts.SourceFile): string | null {
  const fullText = sourceFile.getFullText()
  const nodePos = node.getFullStart()
  const leadingComments = ts.getLeadingCommentRanges(fullText, nodePos)

  if (!leadingComments || leadingComments.length === 0)
    return null

  const lastComment = leadingComments[leadingComments.length - 1]
  if (lastComment.kind !== ts.SyntaxKind.MultiLineCommentTrivia)
    return null

  const commentText = fullText.slice(lastComment.pos, lastComment.end)
  if (!commentText.startsWith('/**'))
    return null

  return commentText
    .slice(3, -2)
    .split('\n')
    .map(line => line.trim().replace(/^\*\s?/, ''))
    .join('\n')
    .trim()
}

/**
 * Parse JSDoc info
 */
function parseJSDocInfo(jsdocText: string): {
  params: Array<{ name: string, type: string, description: string }>
  returns?: { type: string, description: string }
  description: string
} {
  const lines = jsdocText.split('\n')
  const params: Array<{ name: string, type: string, description: string }> = []
  let returns: { type: string, description: string } | undefined
  const descLines: string[] = []
  let inDescription = true

  for (const line of lines) {
    const paramMatch = /@param\s+(?:\{([^}]+)\}\s+)?(\w+)\s*-?\s*(.*)/.exec(line)
    if (paramMatch) {
      inDescription = false
      params.push({
        name: paramMatch[2],
        type: paramMatch[1] || 'unknown',
        description: paramMatch[3].trim(),
      })
      continue
    }

    const returnsMatch = /@returns?\s+(?:\{([^}]+)\}\s+)?-?\s*(.*)/.exec(line)
    if (returnsMatch) {
      inDescription = false
      returns = {
        type: returnsMatch[1] || 'unknown',
        description: returnsMatch[2].trim(),
      }
      continue
    }

    if (line.trim().startsWith('@')) {
      inDescription = false
      continue
    }

    if (inDescription)
      descLines.push(line)
  }

  return { params, returns, description: descLines.join('\n').trim() }
}

/**
 * Extract test blocks
 */
function extractTestBlocks(node: ts.Node, sourceFile: ts.SourceFile): TutorialSection[] {
  const tests: TutorialSection[] = []

  function findItCalls(n: ts.Node): void {
    if (ts.isCallExpression(n)) {
      const expr = n.expression
      if (ts.isIdentifier(expr) && expr.text === 'it') {
        const args = n.arguments
        if (args.length >= 2) {
          const titleArg = args[0]
          const bodyArg = args[1]

          let title = ''
          if (ts.isStringLiteral(titleArg))
            title = titleArg.text

          let body = ''
          if (ts.isArrowFunction(bodyArg) || ts.isFunctionExpression(bodyArg)) {
            const functionBody = bodyArg.body
            if (ts.isBlock(functionBody))
              body = functionBody.getText(sourceFile).slice(1, -1).trim()
            else
              body = functionBody.getText(sourceFile)
          }

          tests.push({
            type: 'test',
            content: body,
            metadata: { testTitle: title },
          })
        }
      }
    }
    ts.forEachChild(n, findItCalls)
  }

  if (ts.isIfStatement(node) && node.expression.getText(sourceFile).includes('import.meta.vitest'))
    ts.forEachChild(node.thenStatement, findItCalls)

  return tests
}

/**
 * Parse example source file with explicit inclusion rules
 */
export function parseExampleFile(filePath: string): ParsedExample {
  const source = readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)

  const metadata = extractDocumentMetadata(sourceFile)
  const sections: TutorialSection[] = []
  const referencedFiles: string[] = []
  const lines = source.split('\n')

  // Build sorted list of all source items
  interface SourceItem {
    line: number
    type: 'fence-start' | 'fence-end' | 'block-comment' | 'line-comment' | 'node'
    data: unknown
  }

  const items: SourceItem[] = []

  // Find code fences
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '// ```') {
      items.push({ line: i, type: 'fence-start', data: null })
      // Find matching end
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '// ```') {
          items.push({ line: j, type: 'fence-end', data: { start: i, end: j } })
          i = j
          break
        }
      }
    }
  }

  // Find all comments and nodes
  const fullText = sourceFile.getFullText()

  function collectItems(node: ts.Node): void {
    const fullStart = node.getFullStart()
    const start = node.getStart(sourceFile)

    if (fullStart !== start) {
      const leadingComments = ts.getLeadingCommentRanges(fullText, fullStart) || []
      for (const range of leadingComments) {
        const commentText = fullText.slice(range.pos, range.end)
        const lineStart = sourceFile.getLineAndCharacterOfPosition(range.pos).line

        if (range.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
          if (commentText.startsWith('/*') && !commentText.startsWith('/**'))
            items.push({ line: lineStart, type: 'block-comment', data: { text: commentText, range } })
        }
        else if (range.kind === ts.SyntaxKind.SingleLineCommentTrivia) {
          items.push({ line: lineStart, type: 'line-comment', data: { text: commentText, line: lineStart } })
        }
      }
    }

    // Add node
    const nodeLine = sourceFile.getLineAndCharacterOfPosition(start).line
    items.push({ line: nodeLine, type: 'node', data: node })

    ts.forEachChild(node, collectItems)
  }

  collectItems(sourceFile)

  // Sort by line number
  items.sort((a, b) => a.line - b.line)

  // Process items in source order
  let inFence = false
  const processedLines = new Set<number>()

  for (const item of items) {
    if (item.type === 'fence-start') {
      inFence = true
      processedLines.add(item.line)
    }
    else if (item.type === 'fence-end') {
      const { start, end } = item.data as { start: number, end: number }
      const code = lines.slice(start + 1, end).join('\n').trim()
      if (code) {
        sections.push({ type: 'code', content: code })
        for (let i = start; i <= end; i++)
          processedLines.add(i)
      }
      inFence = false
    }
    else if (!inFence) {
      if (item.type === 'block-comment') {
        const { text, range } = item.data as { text: string, range: ts.CommentRange }
        const lineStart = sourceFile.getLineAndCharacterOfPosition(range.pos).line

        if (processedLines.has(lineStart) || lineStart === 0)
          continue

        const content = text.slice(2, -2).trim()
        if (content)
          sections.push({ type: 'prose', content })

        processedLines.add(lineStart)
      }
      else if (item.type === 'line-comment') {
        const { line: lineNum } = item.data as { text: string, line: number }
        if (processedLines.has(lineNum))
          continue

        const line = lines[lineNum]

        const headerControl = parseHeaderControl(line)
        if (headerControl) {
          sections.push({ type: 'header-control', content: '', metadata: { headerControl } })
          processedLines.add(lineNum)
          continue
        }

        const includePath = parseIncludeDirective(line)
        if (includePath) {
          sections.push({ type: 'include', content: '', metadata: { includePath } })
          referencedFiles.push(includePath)
          processedLines.add(lineNum)
          continue
        }
      }
      else if (item.type === 'node') {
        const node = item.data as ts.Node
        const nodeLine = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line

        if (processedLines.has(nodeLine))
          continue

        // Check for test blocks (always include)
        if (ts.isIfStatement(node) && node.expression.getText(sourceFile).includes('import.meta.vitest')) {
          const testSections = extractTestBlocks(node, sourceFile)
          sections.push(...testSections)
          processedLines.add(nodeLine)
          continue
        }

        // Check if node has JSDoc (means include it)
        if (
          ts.isFunctionDeclaration(node)
          || ts.isClassDeclaration(node)
          || ts.isInterfaceDeclaration(node)
          || ts.isTypeAliasDeclaration(node)
          || ts.isVariableStatement(node)
        ) {
          const jsdocText = getJSDocComment(node, sourceFile)
          if (jsdocText) {
            const info = parseJSDocInfo(jsdocText)
            sections.push({
              type: 'jsdoc',
              content: node.getText(sourceFile),
              metadata: { params: info.params, returns: info.returns },
            })
            processedLines.add(nodeLine)
          }
          // No JSDoc = don't include
        }
      }
    }
  }

  return { metadata, sections, referencedFiles, sourcePath: filePath }
}
