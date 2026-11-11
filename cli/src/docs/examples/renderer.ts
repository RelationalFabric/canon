/**
 * Tutorial body renderer for example documentation
 *
 * Orchestrates parsing, Markdown processing, test integration, and file inclusion
 * to generate tutorial-first documentation from example source files.
 */

import type {
  HeaderDepthState,
  ParsedExample,
  TestStatusMap,
} from './types.js'
import { dirname } from 'node:path'
import {
  applyHeaderControl,
  getIncludeDisplayName,
  processInclude,
  resolveIncludePath,
} from './includes.js'
import {
  processBlockComment,
} from './markdown.js'
import { parseExampleFile } from './parser.js'
import { formatTestStatus, getTestStatusForFile } from './test-status.js'

type TestReport = Parameters<typeof getTestStatusForFile>[0]

const GITHUB_BASE_URL = 'https://github.com/RelationalFabric/canon/tree/main/examples'

/**
 * Convert absolute source path to GitHub URL
 *
 * @param sourcePath - Absolute path to source file
 * @returns GitHub URL for the source file
 */
function sourcePathToGitHubUrl(sourcePath: string): string {
  // Extract the relative path after 'examples/'
  const match = /examples\/(.+)$/.exec(sourcePath)
  if (match?.[1]) {
    return `${GITHUB_BASE_URL}/${match[1]}`
  }
  // Fallback: return the original path if pattern doesn't match
  return sourcePath
}

/**
 * Render tutorial body from parsed example
 *
 * Processes sections in source order:
 * 1. Prose (block comments) → Markdown
 * 2. Code → Fenced code block
 * 3. JSDoc → Description + params/returns + code
 * 4. Tests → Bold title + code block + status
 * 5. Includes → Wrapped file content
 * 6. Header controls → Adjust depth state
 *
 * @param parsed - Parsed example
 * @param testStatusMap - Test status from Vitest report
 * @param exampleRoot - Root directory of the example
 * @returns Rendered tutorial body
 */
export async function renderTutorialBody(
  parsed: ParsedExample,
  testStatusMap: TestStatusMap,
  exampleRoot: string,
  parentDepthState?: HeaderDepthState,
  testReport: TestReport = null,
  rootDir = '',
): Promise<string> {
  const lines: string[] = []

  // Initialize depth state
  // If document has a title, document level becomes 2 (since H1 is used for title)
  const documentLevel = parentDepthState?.documentLevel ?? (parsed.metadata.title ? 2 : 1)
  const depthState: HeaderDepthState = parentDepthState
    ? {
        documentLevel: parentDepthState.documentLevel,
        currentLevel: parentDepthState.currentLevel,
      }
    : {
        documentLevel,
        currentLevel: documentLevel,
      }

  for (const section of parsed.sections) {
    switch (section.type) {
      case 'prose': {
        // Process block comment as Markdown
        const markdown = await processBlockComment(section.content, depthState, parsed.sourcePath)
        if (markdown) {
          lines.push(markdown)
          lines.push('')
        }
        break
      }

      case 'code': {
        // Render code as fenced block
        lines.push('```ts')
        lines.push(section.content)
        lines.push('```')
        lines.push('')
        break
      }

      case 'jsdoc': {
        // Render JSDoc declaration
        const { description, params, returns } = section.metadata || {}

        if (description) {
          lines.push(description)
          lines.push('')
        }

        // Render parameter table if there are params
        if (params && params.length > 0) {
          lines.push('| Param | Type | Description |')
          lines.push('|-------|------|-------------|')
          for (const param of params) {
            lines.push(`| \`${param.name}\` | ${param.type} | ${param.description} |`)
          }
          lines.push('')
        }

        // Render return information
        if (returns) {
          lines.push(`**Returns:** \`${returns.type}\` — ${returns.description}`)
          lines.push('')
        }

        // Render code
        lines.push('```ts')
        lines.push(section.content)
        lines.push('```')
        lines.push('')
        break
      }

      case 'test': {
        // Render test with title and status
        const { testTitle } = section.metadata || {}

        if (testTitle) {
          // Bold title line
          lines.push(`**${testTitle}:**`)
          lines.push('')
        }

        // Test body code
        lines.push('```ts')
        lines.push(section.content)
        lines.push('```')
        lines.push('')

        // Status line if available
        if (testTitle && testStatusMap[testTitle]) {
          const status = testStatusMap[testTitle]
          const statusLine = formatTestStatus(status.status, status.failureMessages)
          lines.push(`_Status:_ ${statusLine}`)
          lines.push('')
        }
        break
      }

      case 'include': {
        // Process include directive
        // Included file's document level = current level of includer
        const { includePath } = section.metadata || {}

        if (includePath) {
          const absolutePath = resolveIncludePath(parsed.sourcePath, includePath)
          const displayName = getIncludeDisplayName(absolutePath, exampleRoot)

          if (includePath.endsWith('.ts')) {
            const includedParsed = parseExampleFile(absolutePath)
            const includedRoot = dirname(absolutePath)
            const includedStatus = getTestStatusForFile(testReport, absolutePath, rootDir)
            const includedBody = await renderTutorialBody(
              includedParsed,
              includedStatus,
              includedRoot,
              depthState,
              testReport,
              rootDir,
            )

            lines.push('--')
            lines.push(`Supporting File (\`${displayName}\`)`)
            lines.push('')
            lines.push(includedBody)
            lines.push('--')
            lines.push('')
          } else {
            const includeContent = processInclude(
              parsed.sourcePath,
              includePath,
              exampleRoot,
            )

            if (includeContent) {
              lines.push(includeContent)
              lines.push('')
            }
          }
        }
        break
      }

      case 'header-control': {
        // Apply header depth control
        const { headerControl } = section.metadata || {}

        if (headerControl) {
          applyHeaderControl(depthState, headerControl)
        }
        break
      }
    }
  }

  // Clean up trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.join('\n')
}

/**
 * Render document footer
 *
 * Includes:
 * - References (source + included files)
 * - Metadata (keywords, difficulty)
 *
 * @param parsed - Parsed example
 * @returns Rendered footer
 */
export function renderFooter(parsed: ParsedExample): string {
  const lines: string[] = []
  const { metadata, referencedFiles, sourcePath } = parsed

  // References section
  lines.push('## References')
  lines.push('')
  lines.push(`**Source:** [View on GitHub](${sourcePathToGitHubUrl(sourcePath)})`)

  if (referencedFiles.length > 0) {
    lines.push('')
    lines.push('**Referenced files:**')
    for (const file of referencedFiles) {
      lines.push(`- \`${file}\``)
    }
  }

  lines.push('')

  // Metadata section
  if (metadata.keywords || metadata.difficulty) {
    lines.push('## Metadata')
    lines.push('')

    if (metadata.keywords) {
      lines.push(`**Keywords:** ${metadata.keywords}`)
    }

    if (metadata.difficulty) {
      lines.push(`**Difficulty:** ${metadata.difficulty}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Render complete example document
 *
 * @param parsed - Parsed example
 * @param testStatusMap - Test status map
 * @param exampleRoot - Root directory of the example
 * @returns Complete rendered Markdown document
 */
export async function renderExample(
  parsed: ParsedExample,
  testStatusMap: TestStatusMap,
  exampleRoot: string,
  testReport: TestReport = null,
  rootDir = '',
): Promise<string> {
  const lines: string[] = []

  // Title (H1) from metadata
  if (parsed.metadata.title) {
    lines.push(`# ${parsed.metadata.title}`)
    lines.push('')
  }

  // Description
  if (parsed.metadata.description) {
    lines.push(parsed.metadata.description)
    lines.push('')
  }

  // Tutorial body
  const body = await renderTutorialBody(parsed, testStatusMap, exampleRoot, undefined, testReport, rootDir)
  lines.push(body)

  // Footer
  lines.push('')
  lines.push('---')
  lines.push('')
  const footer = renderFooter(parsed)
  lines.push(footer)

  return `${lines.join('\n').trimEnd()}\n`
}

/**
 * Generate example documentation from source file
 *
 * Complete pipeline:
 * 1. Parse source file
 * 2. Get test status
 * 3. Render document
 *
 * @param filePath - Path to example source file
 * @param testStatusMap - Test status map
 * @param exampleRoot - Root directory of the example
 * @returns Rendered Markdown document
 */
export async function generateExampleDoc(
  filePath: string,
  testStatusMap: TestStatusMap,
  exampleRoot: string,
  testReport: TestReport = null,
  rootDir = '',
): Promise<string> {
  const parsed = parseExampleFile(filePath)
  return renderExample(parsed, testStatusMap, exampleRoot, testReport, rootDir)
}
