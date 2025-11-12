import process from 'node:process'

import { oclifFlush, oclifRun } from '../kit.js'

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  try {
    await oclifRun(argv, import.meta.url)
    await oclifFlush()
  } catch (error) {
    await oclifFlush()
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(error.message)
    }
    process.exitCode = 1
  }
}

export default runCli
