import { join } from 'node:path'
import process from 'node:process'

import { Oclif } from '../../../kit.js'
import { createLogger } from '../../../log.js'

const { command: CanonCommand, flags: CanonFlags } = Oclif
const logger = createLogger('canon:cli:radar:convert')

interface RadarConvertFlags {
  input?: string
  output?: string
}

export default class RadarConvertCommand extends CanonCommand {
  static summary = 'Convert radar YAML to CSV'

  static description = 'Converts radar planning data from YAML format to CSV for visualization.'

  static flags = {
    input: CanonFlags.string({
      char: 'i',
      description: 'Input YAML file path',
      default: 'planning/radar/data.yaml',
    }),
    output: CanonFlags.string({
      char: 'o',
      description: 'Output CSV file path',
      default: '.vitepress/public/planning/radar/data.csv',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(RadarConvertCommand)
    const resolvedFlags = flags as RadarConvertFlags

    const rootDir = process.cwd()
    const inputPath = join(rootDir, resolvedFlags.input ?? 'planning/radar/data.yaml')
    const outputPath = join(rootDir, resolvedFlags.output ?? '.vitepress/public/planning/radar/data.csv')

    try {
      // Import the converter function directly from the source
      const { convertYamlFileToCsv } = await import('../../../radar/converter.js')
      convertYamlFileToCsv(inputPath, outputPath)

      this.log(`✅ Radar data converted: ${inputPath} → ${outputPath}`)
    } catch (error) {
      logger.error('Error converting radar data:', error instanceof Error ? error.message : 'Unknown error')
      this.error('Failed to convert radar data', { exit: 1 })
    }
  }
}
