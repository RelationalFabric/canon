/**
 * Object type definitions for Canon
 */

/**
 * Plain old JavaScript object type
 */
export type Pojo = Record<string, unknown>

/**
 * Pojo with a specific property of a given type
 *
 * @template T - The base Pojo type
 * @template K - The key name
 * @template V - The value type
 */
export type PojoWith<T extends Pojo, K extends string, V = unknown> = T & { [P in K]: V }
