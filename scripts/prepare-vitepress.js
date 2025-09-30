#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '..');

// List of README.md files to rename to index.md
const readmeFiles = [
  'docs/README.md',
  'docs/adrs/README.md', 
  'docs/planning/README.md',
  'docs/planning/radar/README.md'
];

// Backup file to track renamed files
const backupFile = join(workspaceRoot, '.vitepress-backup.json');

async function renameReadmeFiles() {
  console.log('🔄 Preparing VitePress: Renaming README.md files to index.md...');
  
  const renamedFiles = [];
  
  for (const readmePath of readmeFiles) {
    const fullReadmePath = join(workspaceRoot, readmePath);
    const indexPath = fullReadmePath.replace('README.md', 'index.md');
    
    try {
      // Check if README.md exists
      await fs.access(fullReadmePath);
      
      // Check if index.md already exists and remove it
      try {
        await fs.access(indexPath);
        await fs.unlink(indexPath);
        console.log(`  ✓ Removed existing ${readmePath.replace('README.md', 'index.md')}`);
      } catch (err) {
        // index.md doesn't exist, which is fine
      }
      
      // Rename README.md to index.md
      await fs.rename(fullReadmePath, indexPath);
      renamedFiles.push({
        original: readmePath,
        renamed: readmePath.replace('README.md', 'index.md')
      });
      console.log(`  ✓ Renamed ${readmePath} → ${readmePath.replace('README.md', 'index.md')}`);
      
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`  ⚠️  Skipped ${readmePath} (file not found)`);
      } else {
        console.error(`  ❌ Error renaming ${readmePath}:`, err.message);
        throw err;
      }
    }
  }
  
  // Save backup information
  await fs.writeFile(backupFile, JSON.stringify(renamedFiles, null, 2));
  console.log(`  ✓ Backup information saved to ${backupFile}`);
  
  console.log('✅ VitePress preparation complete!');
}

async function main() {
  try {
    await renameReadmeFiles();
  } catch (error) {
    console.error('❌ Error preparing VitePress:', error.message);
    process.exit(1);
  }
}

main();