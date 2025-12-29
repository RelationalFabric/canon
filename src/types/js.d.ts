/**
 * Generic function type - represents any callable function
 *
 * This is one of the rare cases where `any` is permitted in TypeScript,
 * as the language requires it for generic function signatures that can
 * accept any number/type of arguments. Function parameters are contravariant,
 * so `(...args: unknown[]) => unknown` is not assignable to specific function
 * types like `(x: number) => number`. Using `any` here mirrors the approach
 * taken with `Constructor<T>`.
 *
 * @see Constructor in constructors.d.ts for similar rationale
 */
export type Fn = (...args: any[]) => any

export interface JsType {
  string: string
  number: number
  boolean: boolean
  object: object
  array: unknown[]
  null: null
  undefined: undefined
  symbol: symbol
  bigint: bigint
  function: Fn
}

export type JsTypeName = keyof JsType
