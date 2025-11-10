import ImmutableNamespace from 'immutable'
import * as eslintModule from '../eslint.js'

export type {
  ObjectHash,
  HashAlgorithm as ObjectHashAlgorithm,
  HashEncoding as ObjectHashEncoding,
  ExcludeKeysPredicate as ObjectHashExcludeKeysPredicate,
  ObjectHashFunction,
  Hashable as ObjectHashInput,
  Options as ObjectHashOptions,
  Replacer as ObjectHashReplacer,
  StreamOptions as ObjectHashStreamOptions,
} from './_/object-hash.js'

type EslintConfigInput = Record<string, unknown>
type FlatEslintConfig = Record<string, unknown>
type CreateEslintConfig = (
  options?: EslintConfigInput,
  ...configs: FlatEslintConfig[]
) => Promise<readonly FlatEslintConfig[]>

export type CanonEslintFlatConfig = FlatEslintConfig

const moduleDefault = (eslintModule as { default?: CreateEslintConfig }).default
const createEslintConfigExport = (
  moduleDefault ?? (eslintModule as unknown as CreateEslintConfig)
) as CreateEslintConfig

export { keys, default as objectHash, sha1, writeToStream } from './_/object-hash.js'
export const Immutable = ImmutableNamespace
// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export { parse as parseYaml } from 'yaml'

export const createEslintConfig = createEslintConfigExport
