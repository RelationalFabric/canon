/**
 * File inclusion system for example documentation
 *
 * Processes // @include directives with header depth controls.
 * Wraps included files with delimiters and labels (not headers).
 */

import type { HeaderControl, HeaderDepthState } from './types.js'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

/**
 * Parse header control marker from comment line
 *
 * Recognizes: // #+, // #-, // #!
 *
 * @param line - Source code line
 * @returns Control type or null if not a control marker
 */
export function parseHeaderControl(line: string): HeaderControl | null {
  const trimmed = line.trim()

  if (trimmed === '// #+')
    return '+'
  if (trimmed === '// #-')
    return '-'
  if (trimmed === '// #!')
    return '!'

  return null
}

/**
 * Apply header control to depth state
 *
 * @param depthState - Current depth state (modified in place)
 * @param control - Control type
 */
export function applyHeaderControl(
  depthState: HeaderDepthState,
  control: HeaderControl,
): void {
  switch (control) {
    case '+':
      depthState.currentLevel = Math.min(6, depthState.currentLevel + 1)
      break
    case '-':
      depthState.currentLevel = Math.max(1, depthState.currentLevel - 1)
      break
    case '!':
      depthState.currentLevel = depthState.documentLevel
      break
  }
}

/**
 * Parse @include directive from comment line
 *
 * Recognizes: // @include <relative-path>
 *
 * @param line - Source code line
 * @returns Relative path to include or null if not an include directive
 */
export function parseIncludeDirective(line: string): string | null {
  const trimmed = line.trim()
  // eslint-disable-next-line regexp/no-super-linear-backtracking -- Simple pattern for @include directive parsing
  const match = /^\/\/\s*@include\s+(.+)$/.exec(trimmed)

  if (!match) {
    return null
  }

  return match[1].trim()
}

/**
 * Resolve include path relative to current file
 *
 * @param currentFilePath - Path to the file containing the @include directive
 * @param includePath - Relative path from the @include directive
 * @returns Absolute path to the included file
 */
export function resolveIncludePath(
  currentFilePath: string,
  includePath: string,
): string {
  const currentDir = dirname(currentFilePath)
  return join(currentDir, includePath)
}

/**
 * Load included file content
 *
 * @param absolutePath - Absolute path to the included file
 * @returns File content or null if file doesn't exist
 */
export function loadIncludedFile(absolutePath: string): string | null {
  if (!existsSync(absolutePath)) {
    console.warn(`⚠️ Included file not found: ${absolutePath}`)
    return null
  }

  try {
    return readFileSync(absolutePath, 'utf-8')
  } catch (error) {
    console.warn(
      `⚠️ Failed to read included file ${absolutePath}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

/**
 * Get file extension for code fence language hint
 *
 * @param filePath - Path to file
 * @returns Language hint (e.g., 'ts', 'js', 'json')
 */
function getLanguageHint(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()

  const langMap: Record<string, string> = {
    ts: 'ts',
    tsx: 'tsx',
    js: 'js',
    jsx: 'jsx',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
  }

  return langMap[ext || ''] || ''
}

/**
 * Get display name for included file
 *
 * @param absolutePath - Absolute path to file
 * @param exampleRoot - Root directory of the example
 * @returns Display name (relative to example root)
 */
export function getIncludeDisplayName(
  absolutePath: string,
  exampleRoot: string,
): string {
  return relative(exampleRoot, absolutePath)
}

/**
 * Render included file content with wrapper
 *
 * Format:
 * --
 * Supporting File (`<display-name>`)
 *
 * ```<lang>
 * <content>
 * ```
 * --
 *
 * @param content - File content
 * @param displayName - Display name for the file
 * @param absolutePath - Absolute path to the file
 * @returns Rendered include block
 */
export function renderInclude(
  content: string,
  displayName: string,
  absolutePath: string,
): string {
  const lang = getLanguageHint(absolutePath)
  const lines: string[] = []

  lines.push('--')
  lines.push(`Supporting File (\`${displayName}\`)`)
  lines.push('')
  lines.push(`\`\`\`${lang}`)
  lines.push(content.trimEnd())
  lines.push('```')
  lines.push('--')

  return lines.join('\n')
}

/**
 * Process include directive and generate include block
 *
 * @param currentFilePath - Path to the file containing the directive
 * @param includePath - Relative path from the directive
 * @param exampleRoot - Root directory of the example
 * @returns Rendered include block or null if file not found
 */
export function processInclude(
  currentFilePath: string,
  includePath: string,
  exampleRoot: string,
): string | null {
  const absolutePath = resolveIncludePath(currentFilePath, includePath)
  const content = loadIncludedFile(absolutePath)

  if (!content) {
    return null
  }

  const displayName = getIncludeDisplayName(absolutePath, exampleRoot)
  return renderInclude(content, displayName, absolutePath)
}

/**
 * Extract all @include directives from source code
 *
 * @param source - Source code content
 * @returns Array of include paths found in source order
 */
export function extractIncludeDirectives(source: string): string[] {
  const includes: string[] = []
  const lines = source.split('\n')

  for (const line of lines) {
    const includePath = parseIncludeDirective(line)
    if (includePath) {
      includes.push(includePath)
    }
  }

  return includes
}
