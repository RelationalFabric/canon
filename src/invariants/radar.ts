/**
 * Type invariants for Radar types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { Quadrant, QuadrantKey, RadarEntry, Ring, RingKey } from '../types/index.js'
import { invariant } from '../testing.js'

invariant<Expect<RadarEntry['isNew'], boolean>>()
invariant<Expect<Quadrant['id'], string>>()
invariant<Expect<Ring['color'], string>>()
invariant<
  Expect<
    QuadrantKey,
    'tools-libraries' | 'techniques-patterns' | 'features-capabilities' | 'data-structures-formats'
  >
>()
invariant<Expect<RingKey, 'adopt' | 'trial' | 'assess' | 'hold'>>()
