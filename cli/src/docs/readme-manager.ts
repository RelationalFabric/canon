import { readdirSync, renameSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { createLogger } from '@relational-fabric/canon'

const logger = createLogger('canon:docs:readme-manager')

interface RenameReadmesOptions {
  rootDir: string
  docsDir: string
  excludeDirs?: string[]
}

interface RestoreReadmesOptions {
  rootDir: string
  docsDir: string
  excludeDirs?: string[]
  keepMainIndex?: boolean
}

/**
 * Recursively find all README.md files in a directory
 */
function findReadmeFiles(dir: string, excludeDirs: string[] = []): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    // Skip excluded directories
    if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
      continue
    }

    if (entry.isFile() && entry.name === 'README.md') {
      files.push(fullPath)
    } else if (entry.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findReadmeFiles(fullPath, excludeDirs))
    }
  }

  return files
}

/**
 * Recursively find all index.md files in a directory
 */
function findIndexFiles(dir: string, excludeDirs: string[] = [], keepMainIndex: boolean = true): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    // Skip excluded directories
    if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
      continue
    }

    if (entry.isFile() && entry.name === 'index.md') {
      // Skip the main docs/index.md if keepMainIndex is true
      if (keepMainIndex && fullPath === join(dir, 'index.md')) {
        continue
      }
      files.push(fullPath)
    } else if (entry.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findIndexFiles(fullPath, excludeDirs, false))
    }
  }

  return files
}

/**
 * Rename README.md files to index.md for VitePress build
 */
export function renameReadmesToIndex(options: RenameReadmesOptions): void {
  const { docsDir, excludeDirs = [] } = options
  const readmeFiles = findReadmeFiles(docsDir, excludeDirs)

  if (readmeFiles.length === 0) {
    logger.info('No README.md files found to rename')
    return
  }

  logger.info(`Found ${readmeFiles.length} README.md file(s) to rename`)

  for (const readmePath of readmeFiles) {
    const dir = join(readmePath, '..')
    const indexPath = join(dir, 'index.md')

    // Check if index.md already exists (shouldn't happen, but be safe)
    try {
      const stat = statSync(indexPath)
      if (stat.isFile()) {
        logger.warn(`Skipping ${readmePath}: index.md already exists`)
        continue
      }
    } catch {
      // index.md doesn't exist, which is expected
    }

    renameSync(readmePath, indexPath)
    logger.info(`Renamed: ${readmePath} → ${indexPath}`)
  }

  logger.success(`✅ Renamed ${readmeFiles.length} README.md file(s) to index.md`)
}

/**
 * Restore index.md files back to README.md after VitePress build
 */
export function restoreIndexToReadmes(options: RestoreReadmesOptions): void {
  const { docsDir, excludeDirs = [], keepMainIndex = true } = options
  const indexFiles = findIndexFiles(docsDir, excludeDirs, keepMainIndex)

  if (indexFiles.length === 0) {
    logger.info('No index.md files found to restore')
    return
  }

  logger.info(`Found ${indexFiles.length} index.md file(s) to restore`)

  for (const indexPath of indexFiles) {
    const dir = join(indexPath, '..')
    const readmePath = join(dir, 'README.md')

    // Check if README.md already exists
    try {
      const stat = statSync(readmePath)
      if (stat.isFile()) {
        logger.warn(`Skipping ${indexPath}: README.md already exists`)
        continue
      }
    } catch {
      // README.md doesn't exist, which is expected
    }

    renameSync(indexPath, readmePath)
    logger.info(`Restored: ${indexPath} → ${readmePath}`)
  }

  logger.success(`✅ Restored ${indexFiles.length} index.md file(s) to README.md`)
}
