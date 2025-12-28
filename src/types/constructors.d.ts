/**
 * Constructor type utilities for Canon type system
 */

/**
 * Represents a constructor function (class).
 *
 * This is one of the rare cases where `any` is permitted in TypeScript,
 * as the language requires it for generic constructor signatures that can
 * accept any number/type of arguments. There is no type-safe alternative
 * for representing arbitrary constructor parameter lists.
 *
 * @template T - The instance type that the constructor produces
 *
 * @example
 * ```typescript
 * class User {
 *   constructor(public name: string) {}
 * }
 *
 * const UserConstructor: Constructor<User> = User
 * const instance = new UserConstructor('Alice')
 * ```
 */
export type Constructor<T> = new (...args: any[]) => T

/**
 * Alias for a constructor that produces any type.
 * Use this when you need to reference constructors without caring about
 * their specific instance type.
 *
 * @example
 * ```typescript
 * function isConstructor(value: unknown): value is AnyConstructor {
 *   return typeof value === 'function' && 'prototype' in value
 * }
 * ```
 */
export type AnyConstructor = Constructor<unknown>
