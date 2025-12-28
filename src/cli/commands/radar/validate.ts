import { join } from 'node:path'
import process from 'node:process'

import { Oclif } from '../../../kit.js'
import { createLogger } from '../../../log.js'

const { command: CanonCommand, flags: CanonFlags } = Oclif
const logger = createLogger('canon:cli:radar:validate')

interface RadarValidateFlags {
  file?: string
}

export default class RadarValidateCommand extends CanonCommand {
  static summary = 'Validate radar YAML file'

  static description = 'Validates the structure and content of a radar planning YAML file.'

  static flags = {
    file: CanonFlags.string({
      char: 'f',
      description: 'Path to radar YAML file',
      default: 'planning/radar/data.yaml',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(RadarValidateCommand)
    const resolvedFlags = flags as RadarValidateFlags

    const rootDir = process.cwd()
    const filePath = join(rootDir, resolvedFlags.file ?? 'planning/radar/data.yaml')

    try {
      // Import the validator function directly from the source
      const { validateRadarFile } = await import('../../../radar/validator.js')
      const result = await validateRadarFile(filePath)

      if (result.isValid) {
        this.log('✅ Radar data is valid')
        if (result.warnings.length > 0) {
          this.log('⚠️  Warnings:')
          result.warnings.forEach(warning => this.log(`  - ${warning}`))
        }
      } else {
        this.log('❌ Radar data has errors:')
        result.errors.forEach((error) => {
          this.log(`  - ${error.path ? `${error.path}: ` : ''}${error.message}`)
        })
        if (result.warnings.length > 0) {
          this.log('⚠️  Warnings:')
          result.warnings.forEach(warning => this.log(`  - ${warning}`))
        }
        this.error('Radar validation failed', { exit: 1 })
      }
    } catch (error) {
      logger.error('Error validating radar data:', error instanceof Error ? error.message : 'Unknown error')
      this.error('Failed to validate radar data', { exit: 1 })
    }
  }
}
