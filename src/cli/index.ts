import process from 'node:process'

import { Oclif } from '../kit.js'
import { createLogger } from '../log.js'

const logger = createLogger('canon:cli')

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  try {
    await Oclif.run(argv, import.meta.url)
    await Oclif.flush()
  } catch (error) {
    await Oclif.flush()
    if (error instanceof Error)
      logger.error(error.message)
    process.exitCode = 1
  }
}

export default runCli
