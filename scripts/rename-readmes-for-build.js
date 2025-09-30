#!/usr/bin/env node

/**
 * Script to rename README.md files to index.md for VitePress build
 * This script preserves the GitHub-first approach by only renaming files
 * during the build process, not in the source repository.
 */

import { readdir, stat, rename } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const docsDir = join(__dirname, '..', 'docs')

/**
 * Recursively find and rename README.md files to index.md
 * @param {string} dir - Directory to process
 * @returns {Promise<string[]>} Array of renamed files
 */
async function renameReadmeFiles(dir) {
  const renamedFiles = []
  
  try {
    const entries = await readdir(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stats = await stat(fullPath)
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        const subRenamed = await renameReadmeFiles(fullPath)
        renamedFiles.push(...subRenamed)
      } else if (entry === 'README.md') {
        // Rename README.md to index.md (but skip if index.md already exists in this directory)
        const indexPath = join(dir, 'index.md')
        try {
          await stat(indexPath)
          console.log(`Skipped: ${fullPath} (index.md already exists in ${dir})`)
        } catch {
          // index.md doesn't exist, safe to rename
          await rename(fullPath, indexPath)
          renamedFiles.push(fullPath)
          console.log(`Renamed: ${fullPath} → ${indexPath}`)
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message)
  }
  
  return renamedFiles
}

/**
 * Main function
 */
async function main() {
  console.log('Starting README.md → index.md rename for VitePress build...')
  console.log(`Processing directory: ${docsDir}`)
  
  try {
    const renamedFiles = await renameReadmeFiles(docsDir)
    
    if (renamedFiles.length > 0) {
      console.log(`\nSuccessfully renamed ${renamedFiles.length} files:`)
      renamedFiles.forEach(file => console.log(`  - ${file}`))
      console.log('\nBuild process can now proceed with VitePress.')
    } else {
      console.log('No README.md files found to rename.')
    }
  } catch (error) {
    console.error('Error during rename process:', error.message)
    process.exit(1)
  }
}

// Run the script
main()