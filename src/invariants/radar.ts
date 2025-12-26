/**
 * Type invariants for Radar types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { Quadrant, QuadrantKey, RadarEntry, Ring, RingKey } from '../types/index.js'
import { invariant } from '../testing.js'

void invariant<Expect<RadarEntry['isNew'], boolean>>()
void invariant<Expect<Quadrant['id'], string>>()
void invariant<Expect<Ring['color'], string>>()
void invariant<
  Expect<
    QuadrantKey,
    'tools-libraries' | 'techniques-patterns' | 'features-capabilities' | 'data-structures-formats'
  >
>()
void invariant<Expect<RingKey, 'adopt' | 'trial' | 'assess' | 'hold'>>()
