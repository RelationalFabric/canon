// Opinionated wrappers for curated utilities
export { default as createEslintConfig } from '../eslint.js'

// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export { parse as parseYaml } from 'yaml'
export { default as createHash, createHash as objectHash, default as objectHashDefault } from 'object-hash'
