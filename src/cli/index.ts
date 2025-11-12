import process from 'node:process'

import { Oclif } from '../kit.js'

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  try {
    await Oclif.run(argv, import.meta.url)
    await Oclif.flush()
  } catch (error) {
    await Oclif.flush()
    if (error instanceof Error) {
      console.error(error.message)
    }
    process.exitCode = 1
  }
}

export default runCli
