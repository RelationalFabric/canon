/// <reference path="../../types/object-hash.d.ts" />

import objectHashRuntime from 'object-hash'

export type {
  HashAlgorithm,
  HashEncoding,
  Replacer,
  ExcludeKeysPredicate,
  Options,
  StreamOptions,
  Hashable,
  ObjectHashFunction,
  ObjectHash,
} from 'object-hash'

const objectHash = objectHashRuntime
const { sha1, keys, writeToStream } = objectHash

export default objectHash
export { sha1, keys, writeToStream }
