import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { Oclif } from '../../../kit.js'
import { createLogger } from '../../../log.js'

const { command: CanonCommand, flags: CanonFlags } = Oclif
const logger = createLogger('canon:cli:docs:examples')

interface DocsExamplesFlags {
  examplesDir?: string
  outputDir?: string
  testReportPath?: string
}

export default class DocsExamplesCommand extends CanonCommand {
  static summary = 'Generate examples documentation'

  static description = 'Generates tutorial-first narrative documentation from example files using AST parsing, Markdown processing, and test integration.'

  static flags = {
    'examples-dir': CanonFlags.string({
      description: 'Directory containing example files',
      default: 'examples',
    }),
    'output-dir': CanonFlags.string({
      description: 'Output directory for generated documentation',
      default: 'docs/examples',
    }),
    'test-report-path': CanonFlags.string({
      description: 'Path to Vitest JSON report (optional)',
      default: '.scratch/vitest-report.json',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(DocsExamplesCommand)
    const resolvedFlags = flags as DocsExamplesFlags

    const rootDir = process.cwd()
    const examplesDir = join(rootDir, resolvedFlags.examplesDir ?? 'examples')
    const outputDir = join(rootDir, resolvedFlags.outputDir ?? 'docs/examples')
    const testReportPath = resolvedFlags.testReportPath
      ? join(rootDir, resolvedFlags.testReportPath)
      : undefined

    try {
      // Import and run the script logic
      // Path: src/cli/commands/docs/examples.ts → 5 levels up to get to package root
      const currentDir = dirname(fileURLToPath(import.meta.url))
      const packageRoot = dirname(dirname(dirname(dirname(currentDir))))
      const scriptPath = join(packageRoot, 'scripts', 'generate-examples-docs.ts')
      const scriptUrl = pathToFileURL(scriptPath).href
      const { generateExamplesDocs } = await import(scriptUrl)
      await generateExamplesDocs({
        examplesDir,
        outputDir,
        testReportPath,
      })

      this.log('✅ Examples documentation generated successfully')
    } catch (error) {
      logger.error('Error generating examples documentation:', error instanceof Error ? error.message : 'Unknown error')
      this.error('Failed to generate examples documentation', { exit: 1 })
    }
  }
}
