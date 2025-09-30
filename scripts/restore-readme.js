#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '..');

async function restoreReadmeFiles() {
  console.log('🔄 Restoring README.md files from index.md...');
  
  try {
    const docsDir = join(workspaceRoot, 'docs');
    const entries = await fs.readdir(docsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await restoreInDirectory(join(docsDir, entry.name));
      }
    }
    
    // Also check the root docs directory
    const docsIndexPath = join(docsDir, 'index.md');
    const docsReadmePath = join(docsDir, 'README.md');
    await renameIfExists(docsIndexPath, docsReadmePath);
    
    console.log('✅ README.md files restored successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring README.md files:', error.message);
    process.exit(1);
  }
}

async function restoreInDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await restoreInDirectory(join(dirPath, entry.name));
      } else if (entry.name === 'index.md') {
        const indexPath = join(dirPath, 'index.md');
        const readmePath = join(dirPath, 'README.md');
        await renameIfExists(indexPath, readmePath);
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible, continue
  }
}

async function renameIfExists(sourcePath, targetPath) {
  try {
    await fs.access(sourcePath);
    await fs.rename(sourcePath, targetPath);
    console.log(`  ✓ Restored ${sourcePath.replace(workspaceRoot, '')} → ${targetPath.replace(workspaceRoot, '')}`);
  } catch (error) {
    // File doesn't exist, which is fine
  }
}

restoreReadmeFiles();