#!/usr/bin/env tsx

import { validateRadarFile } from '../src/radar/validator.js'

async function main() {
  try {
    const result = await validateRadarFile('./planning/radar/data.yaml')

    if (result.isValid) {
      console.log('✅ Radar data is valid')
      if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:')
        result.warnings.forEach(warning => console.log(`  - ${warning}`))
      }
      process.exit(0)
    }
    else {
      console.log('❌ Radar data has errors:')
      result.errors.forEach((error) => {
        console.log(`  - ${error.path ? `${error.path}: ` : ''}${error.message}`)
      })
      if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:')
        result.warnings.forEach(warning => console.log(`  - ${warning}`))
      }
      process.exit(1)
    }
  }
  catch (error) {
    console.error('❌ Error validating radar data:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()
