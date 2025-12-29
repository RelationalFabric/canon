import { createLogger, Oclif } from '@relational-fabric/canon'

const logger = createLogger('canon:cli')

/**
 * Normalize -? to --help for Oclif
 * Oclif handles -h, --help, and 'help' natively via additionalHelpFlags config
 */
function normalizeHelpFlags(argv: readonly string[]): readonly string[] {
  return argv.map(arg => (arg === '-?' ? '--help' : arg))
}

/**
 * Pure CLI entrypoint
 *
 * @param argv - Command line arguments (without executable name)
 * @param _env - Environment variables (currently unused, reserved for future use)
 */
export async function runCli(
  argv: readonly string[],
  _env: Readonly<Record<string, string | undefined>>,
): Promise<void> {
  try {
    // Normalize -? to --help (Oclif handles -h, --help, and 'help' natively)
    const normalizedArgs = normalizeHelpFlags(argv)

    // Oclif.run uses import.meta.url to discover commands via package.json oclif config
    // Convert readonly array to mutable array for Oclif
    await Oclif.run([...normalizedArgs], import.meta.url)
    await Oclif.flush()
  } catch (error) {
    await Oclif.flush()
    if (error instanceof Error)
      logger.error(error.message)
    throw error // Re-throw to let bin handle exit code
  }
}

export default runCli
