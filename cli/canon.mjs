#!/usr/bin/env node

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import 'tsx/esm'

const currentDir = dirname(fileURLToPath(import.meta.url))
const entryPoint = resolve(currentDir, '../src/cli/index.ts')

const module = await import(entryPoint)

if (typeof module.runCli !== 'function') {
  throw new TypeError('Canon CLI entry point did not expose runCli()')
}

await module.runCli(process.argv.slice(2))
