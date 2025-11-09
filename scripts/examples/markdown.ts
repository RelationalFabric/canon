/**
 * Markdown processor for example documentation
 *
 * Uses remark to parse Markdown from block comments and detect explicit headings.
 * Never synthesizes headers - all structure comes from author-written Markdown.
 */

import type { Content, Heading, Root } from 'mdast'
import type { HeaderDepthState } from './types.js'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

/**
 * Parse Markdown content from a block comment
 *
 * @param content - Raw Markdown content
 * @returns Parsed Markdown AST
 */
export async function parseMarkdown(content: string): Promise<Root> {
  const processor = unified().use(remarkParse)
  const ast = processor.parse(content)
  return ast as Root
}

/**
 * Render Markdown AST back to string
 *
 * @param ast - Markdown AST
 * @returns Rendered Markdown string
 */
export async function renderMarkdown(ast: Root): Promise<string> {
  const processor = unified().use(remarkStringify, {
    bullet: '-',
    emphasis: '_',
    fences: true,
    listItemIndent: 'one',
  })
  const result = await processor.stringify(ast)
  return result
}

/**
 * Extract explicit headings from Markdown AST
 *
 * @param ast - Markdown AST
 * @returns Array of heading nodes with their text content
 */
export function extractHeadings(ast: Root): Array<{ level: number, text: string }> {
  const headings: Array<{ level: number, text: string }> = []

  function visit(node: Content): void {
    if (node.type === 'heading') {
      const heading = node as Heading
      const text = heading.children
        .map((child) => {
          if (child.type === 'text') {
            return child.value
          }
          if (child.type === 'inlineCode') {
            return `\`${child.value}\``
          }
          return ''
        })
        .join('')
      headings.push({ level: heading.depth, text })
    }

    // Recursively visit child nodes
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child as Content)
      }
    }
  }

  for (const node of ast.children) {
    visit(node as Content)
  }

  return headings
}

/**
 * Validate heading structure
 *
 * Headers in source must:
 * 1. Start at level 1
 * 2. Increment/decrement by at most 1 level
 *
 * @param headings - Array of headings
 * @param sourcePath - Path to source file (for error messages)
 * @throws Error if heading structure is invalid
 */
export function validateHeadingStructure(
  headings: Array<{ level: number, text: string }>,
  sourcePath?: string,
): void {
  if (headings.length === 0) {
    return
  }

  const location = sourcePath ? ` in ${sourcePath}` : ''

  // First heading must be level 1
  if (headings[0].level !== 1) {
    throw new Error(
      `Invalid heading structure${location}: First heading must be level 1 (# not ${'#'.repeat(headings[0].level)}). Found: "${'#'.repeat(headings[0].level)} ${headings[0].text}"`,
    )
  }

  // Check for level jumps
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1]
    const curr = headings[i]
    const levelDiff = curr.level - prev.level

    // Level can increase by at most 1
    if (levelDiff > 1) {
      throw new Error(
        `Invalid heading structure${location}: Heading levels cannot skip (found level ${curr.level} after level ${prev.level}).\n`
        + `  Previous: "${'#'.repeat(prev.level)} ${prev.text}"\n`
        + `  Current:  "${'#'.repeat(curr.level)} ${curr.text}"\n`
        + `Headers must increment by at most 1 level.`,
      )
    }
  }
}

/**
 * Adjust heading levels in Markdown AST based on depth state
 *
 * Headers in prose are relative to currentLevel:
 * - # → currentLevel
 * - ## → currentLevel + 1
 * - ### → currentLevel + 2
 *
 * @param ast - Markdown AST
 * @param depthState - Current header depth state
 * @returns Modified AST with adjusted heading levels
 */
export function adjustHeadingLevels(ast: Root, depthState: HeaderDepthState): Root {
  // Headers in source are relative (# is 1, ## is 2, etc.)
  // We need to map them to absolute levels based on currentLevel
  const baseAdjustment = depthState.currentLevel - 1

  function visit(node: Content): void {
    if (node.type === 'heading') {
      const heading = node as Heading
      // Relative heading in source (1, 2, 3...) + adjustment = absolute level
      const absoluteLevel = heading.depth + baseAdjustment
      heading.depth = Math.max(1, Math.min(6, absoluteLevel)) as 1 | 2 | 3 | 4 | 5 | 6
    }

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child as Content)
      }
    }
  }

  for (const node of ast.children) {
    visit(node as Content)
  }

  return ast
}

/**
 * Clean Markdown content by trimming and normalizing whitespace
 *
 * @param content - Raw Markdown content
 * @returns Cleaned Markdown content
 */
export function cleanMarkdown(content: string): string {
  return content
    .trim()
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines
}

/**
 * Check if content contains any Markdown headings
 *
 * @param content - Markdown content to check
 * @returns True if content contains headings
 */
export async function hasHeadings(content: string): Promise<boolean> {
  const ast = await parseMarkdown(content)
  const headings = extractHeadings(ast)
  return headings.length > 0
}

/**
 * Process block comment content as Markdown
 *
 * Parses the content, validates heading structure, and returns the
 * processed Markdown with adjusted heading levels if needed.
 *
 * @param content - Block comment content (without comment delimiters)
 * @param depthState - Current header depth state
 * @param sourcePath - Path to source file (for error messages)
 * @returns Processed Markdown string
 * @throws Error if heading structure is invalid
 */
export async function processBlockComment(
  content: string,
  depthState: HeaderDepthState,
  sourcePath?: string,
): Promise<string> {
  const cleaned = cleanMarkdown(content)

  if (cleaned.length === 0) {
    return ''
  }

  const ast = await parseMarkdown(cleaned)

  // Validate heading structure before adjusting
  const headings = extractHeadings(ast)
  validateHeadingStructure(headings, sourcePath)

  const adjusted = adjustHeadingLevels(ast, depthState)
  const rendered = await renderMarkdown(adjusted)

  return rendered.trim()
}
