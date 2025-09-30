#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '..');

// Backup file to track renamed files
const backupFile = join(workspaceRoot, '.vitepress-backup.json');

async function restoreReadmeFiles() {
  console.log('🔄 Restoring README.md files from index.md...');
  
  try {
    // Read backup information
    const backupData = await fs.readFile(backupFile, 'utf8');
    const renamedFiles = JSON.parse(backupData);
    
    for (const fileInfo of renamedFiles) {
      const indexPath = join(workspaceRoot, fileInfo.renamed);
      const readmePath = join(workspaceRoot, fileInfo.original);
      
      try {
        // Check if index.md exists
        await fs.access(indexPath);
        
        // Check if README.md already exists and remove it
        try {
          await fs.access(readmePath);
          await fs.unlink(readmePath);
          console.log(`  ✓ Removed existing ${fileInfo.original}`);
        } catch (err) {
          // README.md doesn't exist, which is fine
        }
        
        // Rename index.md back to README.md
        await fs.rename(indexPath, readmePath);
        console.log(`  ✓ Restored ${fileInfo.renamed} → ${fileInfo.original}`);
        
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`  ⚠️  Skipped ${fileInfo.renamed} (file not found)`);
        } else {
          console.error(`  ❌ Error restoring ${fileInfo.renamed}:`, err.message);
        }
      }
    }
    
    // Remove backup file
    try {
      await fs.unlink(backupFile);
      console.log(`  ✓ Cleaned up backup file`);
    } catch (err) {
      // Backup file might not exist, which is fine
    }
    
    console.log('✅ README.md files restored successfully!');
    
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('⚠️  No backup file found - nothing to restore');
    } else {
      console.error('❌ Error restoring README.md files:', err.message);
      throw err;
    }
  }
}

async function main() {
  try {
    await restoreReadmeFiles();
  } catch (error) {
    console.error('❌ Error restoring README.md files:', error.message);
    process.exit(1);
  }
}

main();