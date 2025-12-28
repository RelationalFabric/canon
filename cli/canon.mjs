#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const entryPoint = resolve(currentDir, '../src/cli/index.ts')

// Use tsx to run the TypeScript CLI entry point
const tsxProcess = spawn('npx', ['tsx', entryPoint, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
})

tsxProcess.on('exit', (code) => {
  process.exit(code ?? 1)
})
