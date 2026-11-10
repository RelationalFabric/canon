import './theories/identity.js'
import './theories/taxonomy.js'
import './theories/typed-entity.js'

// Axiom and Canon APIs
export * from './axiom.js'
// Specific Axioms
export * from './axioms/id.js'
export * from './axioms/references.js'
export * from './axioms/timestamps.js'
export * from './axioms/type.js'
export * from './axioms/version.js'

export * from './canon.js'

export {
  axiomRefFor,
  canonRefFor,
  DefinitionRegistry,
  definitionUri,
  lexiconTermUri,
  morphismRefFor,
  theoryRefFor,
} from './definitions.js'

// Opinionated kit exports
export * from './kit.js'

// Lazy Module Pattern (ADR-0016)
export * from './lazy-module.js'

// Metadata helpers
export * from './meta.js'

export { composeMorphisms, defineMorphism } from './morphism.js'

// Protocol System (ADR-0015)
export * from './protocol.js'

// Radar
export * from './radar/index.js'

// Registry and Shell
export * from './registry.js'

export * from './shell.js'

// Type testing utilities (compile-time helpers only)
export * from './testing.js'

export { defineTheory } from './theory.js'

// Type system
export type * from './types/index.js'

// Utilities
export * from './utils/guards.js'

export * from './utils/objects.js'
