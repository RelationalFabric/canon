import { type Expect, invariant } from '../testing.js'

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
  // @eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (...args: any[]) => any // This is the only time we're allowing any
}

export type JsTypeName = keyof JsType

// ---------------------------------------------------------------------------
// Compile-time invariants
// ---------------------------------------------------------------------------

void invariant<Expect<JsType['string'], string>>()
void invariant<Expect<JsType['array'], unknown[]>>()
void invariant<Expect<JsTypeName, keyof JsType>>()
