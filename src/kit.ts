export type {
  HashAlgorithm as ObjectHashAlgorithm,
  HashEncoding as ObjectHashEncoding,
  Replacer as ObjectHashReplacer,
  ExcludeKeysPredicate as ObjectHashExcludeKeysPredicate,
  Options as ObjectHashOptions,
  StreamOptions as ObjectHashStreamOptions,
  Hashable as ObjectHashInput,
  ObjectHashFunction,
  ObjectHash,
} from './_/object-hash.js'

import ImmutableNamespace from 'immutable'
import * as eslintModule from '../eslint.js'

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

// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export const Immutable = ImmutableNamespace
export { default as objectHash, sha1, keys, writeToStream } from './_/object-hash.js'
export { parse as parseYaml } from 'yaml'

export const createEslintConfig = createEslintConfigExport
