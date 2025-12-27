import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { Oclif } from '../../../kit.js'
import { createLogger } from '../../../log.js'

const { command: CanonCommand, flags: CanonFlags } = Oclif
const logger = createLogger('canon:cli:adr:index')

interface AdrIndexFlags {
  adrsDir?: string
  readmePath?: string
}

export default class AdrIndexCommand extends CanonCommand {
  static summary = 'Generate ADR index table'

  static description = 'Scans ADR files and generates/updates the index table in the ADR README.'

  static flags = {
    'adrs-dir': CanonFlags.string({
      description: 'Directory containing ADR files',
      default: 'docs/adrs',
    }),
    'readme-path': CanonFlags.string({
      description: 'Path to ADR README file (relative to adrs-dir)',
      default: 'README.md',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(AdrIndexCommand)
    const resolvedFlags = flags as AdrIndexFlags

    const rootDir = process.cwd()
    const adrsDir = join(rootDir, resolvedFlags.adrsDir ?? 'docs/adrs')
    const readmePath = join(adrsDir, resolvedFlags.readmePath ?? 'README.md')

    try {
      // Import and run the script logic
      const packageRoot = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
      const scriptPath = join(packageRoot, 'scripts', 'generate-adr-index.js')
      const scriptUrl = pathToFileURL(scriptPath).href
      const { generateAdrIndex } = await import(scriptUrl)
      await generateAdrIndex({
        adrsDir,
        readmePath,
      })

      this.log('✅ ADR index generated successfully')
    } catch (error) {
      logger.error('Error generating ADR index:', error instanceof Error ? error.message : 'Unknown error')
      this.error('Failed to generate ADR index', { exit: 1 })
    }
  }
}
