/**
 * Morphism type system
 *
 * Morphisms map one Theory onto another. This interface is the
 * augmentation slot for their TypeScript types. Keys are
 * `${Source}/${Target}`.
 */

/**
 * Global registry of morphisms available in Canon
 *
 * This interface is meant to be augmented by morphism implementers.
 *
 * @example
 * ```typescript
 * declare module '@relational-fabric/canon' {
 *   interface Morphisms {
 *   }
 * }
 * ```
 */
export interface Morphisms {}
