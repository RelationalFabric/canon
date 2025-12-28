#!/usr/bin/env -S npx tsx
/**
 * Canon CLI Entry Point
 *
 * This is the main entry point for the canon command-line interface.
 * The shebang uses `npx tsx` to execute TypeScript directly without
 * requiring a build step.
 *
 * Note: The `-S` flag in the shebang allows multiple arguments and is
 * supported on Linux (coreutils 8.30+) and macOS (High Sierra+), which
 * aligns with the Node.js 22+ requirement of this package.
 */
import { runCli } from '../src/cli/index.js'

await runCli()
