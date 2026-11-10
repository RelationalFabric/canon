/**
 * Theory type system
 *
 * Theories are named bundles of axiom requirements. This interface is the
 * augmentation slot for their TypeScript types.
 */

/**
 * Global registry of theories available in Canon
 *
 * This interface is meant to be augmented by theory implementers.
 *
 * @example
 * ```typescript
 * declare module '@relational-fabric/canon' {
 *   interface Theories {
 *   }
 * }
 * ```
 */
export interface Theories {}
