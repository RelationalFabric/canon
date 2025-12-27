import process from 'node:process'

import { Oclif } from '../kit.js'
import { createLogger } from '../log.js'

const logger = createLogger('canon:cli')

/**
 * Normalize -? to --help for Oclif
 * Oclif handles -h, --help, and 'help' natively via additionalHelpFlags config
 */
function normalizeHelpFlags(argv: string[]): string[] {
  return argv.map(arg => (arg === '-?' ? '--help' : arg))
}

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  try {
    // Normalize -? to --help (Oclif handles -h, --help, and 'help' natively)
    const normalizedArgs = normalizeHelpFlags(argv)
    await Oclif.run(normalizedArgs, import.meta.url)
    await Oclif.flush()
  } catch (error) {
    await Oclif.flush()
    if (error instanceof Error)
      logger.error(error.message)
    process.exitCode = 1
  }
}

export default runCli
