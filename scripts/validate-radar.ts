#!/usr/bin/env tsx

import process from 'node:process'
import consola from 'consola'
import { validateRadarFile } from '../src/radar/validator.js'

const logger = consola.withTag('radar')

async function main() {
  try {
    const result = await validateRadarFile('./planning/radar/data.yaml')

    if (result.isValid) {
      logger.success('✅ Radar data is valid')
      if (result.warnings.length > 0) {
        logger.warn('⚠️  Warnings:')
        result.warnings.forEach(warning => logger.warn(`  - ${warning}`))
      }
      process.exit(0)
    } else {
      logger.error('❌ Radar data has errors:')
      result.errors.forEach((error) => {
        logger.error(`  - ${error.path ? `${error.path}: ` : ''}${error.message}`)
      })
      if (result.warnings.length > 0) {
        logger.warn('⚠️  Warnings:')
        result.warnings.forEach(warning => logger.warn(`  - ${warning}`))
      }
      process.exit(1)
    }
  } catch (error) {
    logger.error(
      '❌ Error validating radar data:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    process.exit(1)
  }
}

main()
