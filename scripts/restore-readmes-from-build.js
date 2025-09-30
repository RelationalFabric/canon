#!/usr/bin/env node

/**
 * Script to restore index.md files back to README.md after VitePress build
 * This script reverts the build-time renaming to maintain GitHub-first approach
 */

import { readdir, stat, rename } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const docsDir = join(__dirname, '..', 'docs')

/**
 * Recursively find and rename index.md files back to README.md
 * @param {string} dir - Directory to process
 * @returns {Promise<string[]>} Array of restored files
 */
async function restoreReadmeFiles(dir) {
  const restoredFiles = []
  
  try {
    const entries = await readdir(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stats = await stat(fullPath)
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        const subRestored = await restoreReadmeFiles(fullPath)
        restoredFiles.push(...subRestored)
      } else if (entry === 'index.md' && dir !== docsDir && !dir.includes('.vitepress')) {
        // Rename index.md back to README.md (but not the main docs/index.md)
        const readmePath = join(dir, 'README.md')
        await rename(fullPath, readmePath)
        restoredFiles.push(fullPath)
        console.log(`Restored: ${fullPath} → ${readmePath}`)
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message)
  }
  
  return restoredFiles
}

/**
 * Main function
 */
async function main() {
  console.log('Starting index.md → README.md restore after VitePress build...')
  console.log(`Processing directory: ${docsDir}`)
  
  try {
    const restoredFiles = await restoreReadmeFiles(docsDir)
    
    if (restoredFiles.length > 0) {
      console.log(`\nSuccessfully restored ${restoredFiles.length} files:`)
      restoredFiles.forEach(file => console.log(`  - ${file}`))
      console.log('\nRepository is now ready for GitHub editing.')
    } else {
      console.log('No index.md files found to restore.')
    }
  } catch (error) {
    console.error('Error during restore process:', error.message)
    process.exit(1)
  }
}

// Run the script
main()