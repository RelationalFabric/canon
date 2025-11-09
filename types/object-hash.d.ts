declare module 'object-hash' {
  export type HashAlgorithm = 'sha1' | 'md5' | 'sha256'
  export type HashEncoding = 'hex' | 'binary' | 'base64'

  export type Replacer = (this: unknown, value: unknown) => unknown
  export type ExcludeKeysPredicate = (key: string) => boolean

  export interface Options {
    algorithm?: HashAlgorithm
    encoding?: HashEncoding
    excludeValues?: boolean
    ignoreUnknown?: boolean
    replacer?: Replacer | undefined
    respectType?: boolean
    respectFunctionNames?: boolean
    respectFunctionProperties?: boolean
    unorderedArrays?: boolean
    unorderedObjects?: boolean
    unorderedSets?: boolean
    unorderedMaps?: boolean
    excludeKeys?: ExcludeKeysPredicate | undefined
  }

  export interface StreamOptions extends Options {
    stream: true
  }

  export type Hashable = unknown

  export type ObjectHashFunction = (value: Hashable, options?: Options) => string

  export interface ObjectHash extends ObjectHashFunction {
    sha1: (value: Hashable) => string
    keys: (value: Hashable) => string[]
    writeToStream: (value: Hashable, options: StreamOptions) => NodeJS.ReadWriteStream
    readonly VERSION: string
  }

  const objectHash: ObjectHash
  export default objectHash

  export const sha1: (value: Hashable) => string
  export const keys: (value: Hashable) => string[]
  export const writeToStream: (value: Hashable, options: StreamOptions) => NodeJS.ReadWriteStream
}
