/**
 * Type invariants for JsType
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { JsType, JsTypeName } from '../types/index.js'
import { invariant } from '../testing.js'

invariant<Expect<JsType['string'], string>>()
invariant<Expect<JsType['array'], unknown[]>>()
invariant<Expect<JsTypeName, keyof JsType>>()
