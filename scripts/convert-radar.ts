#!/usr/bin/env tsx

import { convertYamlFileToCsv } from '../src/radar/converter.js'

function main() {
  try {
    convertYamlFileToCsv('./docs/radar/data.yaml', './docs/radar/data.csv')
  } catch (error) {
    console.error('❌ Error converting radar data:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()