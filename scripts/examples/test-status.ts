/**
 * Test status integration for example documentation
 *
 * Loads Vitest JSON report and matches tests by file path + test title.
 * Gracefully omits status when report is missing.
 */

import type { TestStatusMap } from './types.js'
import { existsSync, readFileSync } from 'node:fs'
import { normalize } from 'node:path'
import consola from 'consola'

const logger = consola.withTag('test-status')

/**
 * Vitest JSON report structure
 */
interface VitestTestResult {
  /** Test title */
  title: string
  /** Test status */
  status: 'passed' | 'failed' | 'skipped' | 'pending' | 'todo'
  /** Failure messages */
  failureMessages?: string[]
}

interface VitestFileResult {
  /** File name/path */
  name: string
  /** File-level status */
  status: 'passed' | 'failed'
  /** Test results within file */
  assertionResults: VitestTestResult[]
}

interface VitestReport {
  /** Test results per file */
  testResults: VitestFileResult[]
}

/**
 * Load Vitest JSON report from disk
 *
 * @param reportPath - Path to vitest-report.json
 * @returns Parsed report or null if file doesn't exist or is invalid
 */
export function loadTestReport(reportPath: string): VitestReport | null {
  if (!existsSync(reportPath)) {
    return null
  }

  try {
    const content = readFileSync(reportPath, 'utf-8')
    const report = JSON.parse(content) as unknown

    // Validate report structure
    if (
      !report
      || typeof report !== 'object'
      || !('testResults' in report)
      || !Array.isArray((report as { testResults?: unknown }).testResults)
    ) {
      logger.warn(`⚠️ Invalid Vitest report structure at ${reportPath}`)
      return null
    }

    return report as VitestReport
  } catch (error) {
    logger.warn(
      `⚠️ Failed to load Vitest report at ${reportPath}:`,
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

/**
 * Normalize file path for comparison
 *
 * Removes common prefixes and normalizes separators
 *
 * @param filePath - Path to normalize
 * @param rootDir - Project root directory
 * @returns Normalized path
 */
function normalizeFilePath(filePath: string, rootDir: string): string {
  // Remove cwd prefix if present
  let normalized = filePath.replace(`${rootDir}/`, '')

  // Remove examples/ prefix if present
  if (normalized.startsWith('examples/')) {
    normalized = normalized.slice('examples/'.length)
  }

  // Normalize path separators
  normalized = normalize(normalized)

  return normalized
}

/**
 * Extract test status map for a specific file
 *
 * @param report - Loaded Vitest report
 * @param filePath - Path to the example file (relative to examples/)
 * @param rootDir - Project root directory
 * @returns Map of test title to test status
 */
export function getTestStatusForFile(
  report: VitestReport | null,
  filePath: string,
  rootDir: string,
): TestStatusMap {
  const statusMap: TestStatusMap = {}

  if (!report) {
    return statusMap
  }

  const normalizedTarget = normalizeFilePath(filePath, rootDir)

  // Find matching test results
  const matchingResults = report.testResults.filter((result) => {
    const normalizedResult = normalizeFilePath(result.name, rootDir)
    return normalizedResult === normalizedTarget || normalizedResult.endsWith(normalizedTarget)
  })

  if (matchingResults.length === 0) {
    return statusMap
  }

  // Build status map from all matching results
  for (const result of matchingResults) {
    for (const assertion of result.assertionResults) {
      // Only include passed/failed tests (skip pending, todo, skipped)
      if (assertion.status === 'passed' || assertion.status === 'failed') {
        statusMap[assertion.title] = {
          status: assertion.status,
          failureMessages: assertion.failureMessages || [],
        }
      }
    }
  }

  return statusMap
}

/**
 * Format test status as a Markdown line
 *
 * @param status - Test status ('passed' or 'failed')
 * @param failureMessages - Optional failure messages
 * @returns Formatted status line
 */
export function formatTestStatus(
  status: 'passed' | 'failed',
  failureMessages: string[] = [],
): string {
  if (status === 'passed') {
    return '✅ pass'
  }

  let line = '❌ fail'

  if (failureMessages.length > 0) {
    const messages = failureMessages.map(msg => msg.trim()).join('\n')
    line += `\n\n${messages}`
  }

  return line
}

/**
 * Get summary of test results for an example
 *
 * @param statusMap - Test status map
 * @returns Summary string or null if no tests
 */
export function getTestSummary(statusMap: TestStatusMap): string | null {
  const tests = Object.values(statusMap)

  if (tests.length === 0) {
    return null
  }

  const passed = tests.filter(t => t.status === 'passed').length
  const failed = tests.filter(t => t.status === 'failed').length
  const total = tests.length

  if (failed === 0) {
    return `✅ ${passed}/${total} tests passing`
  }

  return `❌ ${passed}/${total} tests passing (${failed} failing)`
}
