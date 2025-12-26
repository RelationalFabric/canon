/**
 * Type invariants for Canon types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { AxiomConfig, CanonConfig } from '../types/index.js'
import { invariant } from '../testing.js'

void invariant<Expect<CanonConfig['axioms'], Record<string, AxiomConfig>>>()
