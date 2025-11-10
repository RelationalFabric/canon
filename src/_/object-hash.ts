/// <reference path="../../types/object-hash.d.ts" />

import objectHashRuntime from 'object-hash'

export type {
  ExcludeKeysPredicate,
  Hashable,
  HashAlgorithm,
  HashEncoding,
  ObjectHash,
  ObjectHashFunction,
  Options,
  Replacer,
  StreamOptions,
} from 'object-hash'

const objectHash = objectHashRuntime
const { sha1, keys, writeToStream } = objectHash

export default objectHash
export { keys, sha1, writeToStream }
