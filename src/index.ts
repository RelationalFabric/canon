// Axiom and Canon APIs
export * from './axiom.js'
// Specific Axioms
export * from './axioms/id.js'

export * from './canon.js'

// Radar
export * from './radar/index.js'

// Registry and Shell
export * from './registry.js'
export * from './shell.js'

// Type system (includes defineAxiom, defineCanon)
export * from './types/index.js'

// Utilities
export * from './utils/guards.js'
export * from './utils/objects.js'

// Re-export utility libraries used internally
export { defu } from 'defu'
