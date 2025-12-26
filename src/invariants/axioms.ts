/**
 * Type invariants for Axiom types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { AxiomConfig, EntityReference, KeyNameAxiom, RepresentationAxiom, TypeGuard } from '../types/index.js'
import { invariant } from '../testing.js'

invariant<Expect<KeyNameAxiom['key'], string>>()
invariant<
  Expect<RepresentationAxiom<string, string>['isCanonical'], (value: unknown) => value is string>
>()
invariant<Expect<EntityReference<string>['ref'], string>>()
invariant<Expect<EntityReference<string>['resolved'], boolean>>()
invariant<Expect<AxiomConfig['$basis'], TypeGuard<unknown>>>()
