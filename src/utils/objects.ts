/**
 * Object utilities for Canon
 *
 * Helpers for working with plain JavaScript objects.
 */

import type { JsType, JsTypeName, Pojo, PojoWith, TypeGuard } from '../types/index.js'
import { typeGuard } from './guards.js'

/**
 * Re-export types for convenience
 */
export type { Pojo, PojoWith }

/**
 * Type guard to check if a value is a plain JavaScript object
 *
 * @example
 * ```typescript
 * isPojo({ id: '123' }) // true
 * isPojo([1, 2, 3]) // false
 * isPojo(null) // false
 * isPojo('string') // false
 * ```
 */
export const isPojo = typeGuard<Pojo>((value: unknown) =>
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype,
)

/**
 * Create a type guard for Pojo with a specific property
 *
 * Higher-order function that returns a reusable TypeGuard.
 *
 * @param key - The property name to check for
 * @returns TypeGuard that checks if value is a Pojo with that property
 *
 * @example
 * ```typescript
 * const hasId = pojoWith('id')
 * hasId({ id: '123' }) // true
 * hasId({ name: 'test' }) // false
 * ```
 */
export function pojoWith<K extends string>(key: K): TypeGuard<PojoWith<Pojo, K, unknown>> {
  return typeGuard((value: unknown) => isPojo(value) && key in value)
}

/**
 * Convenience function to check if a Pojo has a specific property
 *
 * Uses pojoWith() internally.
 *
 * @param obj - The object to check
 * @param key - The property name to look for
 * @returns True if the object has the property
 *
 * @example
 * ```typescript
 * const data = { id: '123', name: 'Test' }
 * pojoHas(data, 'id') // true
 * pojoHas(data, 'missing') // false
 * ```
 */
export function pojoHas<T extends Pojo, K extends string>(
  obj: T | unknown,
  key: K,
): obj is PojoWith<T, K, unknown> {
  return pojoWith(key)(obj)
}

export function pojoWithOfType<K extends string, V extends JsTypeName>(
  key: K,
  type: V,
): TypeGuard<PojoWith<Pojo, K, JsType[V]>> {
  return typeGuard((value: unknown) => {
    if (!pojoHas(value, key)) {
      return false
    }
    const valueType: JsTypeName = typeof value[key] // Needs to be seperate because we're not using a string literal
    return valueType === type
  })
}

/**
 * Convenience function to check if a value has a specific string field
 *
 * @param value - The value to check
 * @param key - The field name that should contain a string
 * @returns True if value is a Pojo with the specified string field
 *
 * @example
 * ```typescript
 * pojoHasString({ id: '123' }, 'id') // true
 * pojoHasString({ id: 123 }, 'id') // false
 * pojoHasString('not object', 'id') // false
 * ```
 */
export function pojoHasOfType<T extends Pojo, K extends string, V extends JsTypeName>(
  value: T | unknown,
  key: K,
  type: V,
): value is PojoWith<T, K, JsType[V]> {
  return pojoWithOfType(key, type)(value)
}

/**
 * Type-safe Object.keys that handles both objects and arrays correctly
 *
 * For arrays, returns numeric indices. For objects, returns property keys.
 *
 * @param obj - The object to get keys from
 * @returns Array of object keys
 *
 * @example
 * ```typescript
 * objectKeys({ a: 1, b: 2 }) // ['a', 'b']
 * objectKeys([1, 2, 3]) // [0, 1, 2]
 * ```
 */
export function objectKeys<T extends object>(obj: T): Array<keyof T> {
  if (Array.isArray(obj)) {
    return Array.from(obj.keys()) as Array<keyof T>
  }
  return Object.keys(obj) as Array<keyof T>
}

/**
 * Type-safe Object.values that handles both objects and arrays correctly
 *
 * For arrays, returns array values. For objects, returns property values.
 *
 * @param obj - The object to get values from
 * @returns Array of object values
 *
 * @example
 * ```typescript
 * objectValues({ a: 1, b: 2 }) // [1, 2]
 * objectValues([1, 2, 3]) // [1, 2, 3]
 * ```
 */
export function objectValues<T extends object>(obj: T): unknown[] {
  if (Array.isArray(obj)) {
    return Array.from(obj)
  }
  return Object.values(obj)
}

/**
 * Type-safe Object.entries that handles both objects and arrays correctly
 *
 * For arrays, returns [index, value] pairs. For objects, returns [key, value] pairs.
 *
 * @param obj - The object to get entries from
 * @returns Array of [key, value] tuples
 *
 * @example
 * ```typescript
 * objectEntries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 * objectEntries([1, 2, 3]) // [[0, 1], [1, 2], [2, 3]]
 * ```
 */
export function objectEntries<T extends object>(
  obj: T,
): Array<[keyof T, T[keyof T]]> {
  if (Array.isArray(obj)) {
    return Array.from(obj.entries()) as Array<[keyof T, T[keyof T]]>
  }
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}
