#!/usr/bin/env tsx

import { convertYamlFileToCsv } from '../src/radar/converter.js'

function main() {
  try {
    convertYamlFileToCsv('./docs/planning/radar/data.yaml', './docs/public/radar/data.csv')
  } catch (error) {
    console.error('❌ Error converting radar data:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()