import { join } from 'node:path'
import process from 'node:process'

import { createLogger, Oclif } from '@relational-fabric/canon'
import { renameReadmesToIndex, restoreIndexToReadmes } from '../../docs/readme-manager.js'

const { command: CanonCommand, flags: CanonFlags } = Oclif
const logger = createLogger('canon:cli:docs:rename-readmes')

interface RenameReadmesFlags {
  docsDir?: string
  exclude?: string
  restore?: boolean
  keepMainIndex?: boolean
}

export default class DocsRenameReadmesCommand extends CanonCommand {
  static summary = 'Rename README.md files to/from index.md for VitePress build'

  static description = 'Renames README.md files to index.md for VitePress routing (default), or restores index.md files back to README.md when --restore is used. This is typically used as part of the documentation build process.'

  static flags = {
    'docs-dir': CanonFlags.string({
      description: 'Directory containing documentation files',
      default: 'docs',
    }),
    'exclude': CanonFlags.string({
      description: 'Comma-separated list of directory names to exclude from renaming',
      default: '.vitepress',
    }),
    'restore': CanonFlags.boolean({
      description: 'Restore index.md files back to README.md (reverse operation)',
      default: false,
    }),
    'keep-main-index': CanonFlags.boolean({
      description: 'Keep docs/index.md as index.md when restoring (only applies with --restore)',
      default: true,
      allowNo: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(DocsRenameReadmesCommand)
    const resolvedFlags = flags as RenameReadmesFlags

    // Commands are the boundary - can read process state here
    const rootDir = process.cwd()
    const docsDir = join(rootDir, resolvedFlags.docsDir ?? 'docs')
    const excludeDirs = resolvedFlags.exclude
      ? resolvedFlags.exclude.split(',').map(d => d.trim())
      : ['.vitepress']
    const restore = resolvedFlags.restore ?? false
    const keepMainIndex = resolvedFlags.keepMainIndex !== false

    try {
      if (restore) {
        restoreIndexToReadmes({
          rootDir,
          docsDir,
          excludeDirs,
          keepMainIndex,
        })
        this.log('✅ index.md files restored successfully')
      } else {
        renameReadmesToIndex({
          rootDir,
          docsDir,
          excludeDirs,
        })
        this.log('✅ README.md files renamed successfully')
      }
    } catch (error) {
      logger.error('Error renaming README files:', error instanceof Error ? error.message : 'Unknown error')
      this.error('Failed to rename README files', { exit: 1 })
    }
  }
}
