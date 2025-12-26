/**
 * Type invariants for Object types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { Pojo, PojoWith } from '../types/index.js'
import { invariant } from '../testing.js'

interface SampleBase extends Pojo {
  name: string
}
type SamplePojo = PojoWith<SampleBase, 'id', string>

invariant<Expect<Pojo, Record<string, unknown>>>()
invariant<Expect<SamplePojo['id'], string>>()
invariant<Expect<SamplePojo['name'], string>>()
