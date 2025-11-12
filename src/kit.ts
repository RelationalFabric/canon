import ImmutableNamespace from 'immutable'
import objectHashDefault from 'object-hash'
import type { ObjectHash } from 'object-hash'

// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export const Immutable = ImmutableNamespace
export const objectHash: ObjectHash = objectHashDefault
export * from 'object-hash'
export { parse as parseYaml } from 'yaml'
