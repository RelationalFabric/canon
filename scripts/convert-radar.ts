#!/usr/bin/env tsx

import process from 'node:process'
import { convertYamlFileToHtml } from '../src/radar/converter.js'

function main() {
  try {
    convertYamlFileToHtml('./planning/radar/data.yaml', './.vitepress/public/planning/radar/iframe.html')
  }
  catch (error) {
    console.error('❌ Error converting radar data:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()
