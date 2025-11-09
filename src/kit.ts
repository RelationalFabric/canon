import ImmutableNamespace from 'immutable'
import * as eslintModule from '../eslint.js'

type CreateEslintConfig = (
  options?: Record<string, unknown>,
  ...configs: Record<string, unknown>[]
) => Record<string, unknown>

const moduleDefault = (eslintModule as { default?: CreateEslintConfig }).default
const createEslintConfigExport = (
  moduleDefault ?? (eslintModule as unknown as CreateEslintConfig)
) as CreateEslintConfig

// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export const Immutable = ImmutableNamespace
export { default as objectHash } from 'object-hash'
export * from 'object-hash'
export { parse as parseYaml } from 'yaml'

export const createEslintConfig = createEslintConfigExport
