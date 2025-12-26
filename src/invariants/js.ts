/**
 * Type invariants for JsType
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { JsType, JsTypeName } from '../types/index.js'
import { invariant } from '../testing.js'

void invariant<Expect<JsType['string'], string>>()
void invariant<Expect<JsType['array'], unknown[]>>()
void invariant<Expect<JsTypeName, keyof JsType>>()
