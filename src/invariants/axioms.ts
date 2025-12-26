/**
 * Type invariants for Axiom types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { AxiomConfig, EntityReference, KeyNameAxiom, RepresentationAxiom, TypeGuard } from '../types/index.js'
import { invariant } from '../testing.js'

void invariant<Expect<KeyNameAxiom['key'], string>>()
void invariant<
  Expect<RepresentationAxiom<string, string>['isCanonical'], (value: unknown) => value is string>
>()
void invariant<Expect<EntityReference<string>['ref'], string>>()
void invariant<Expect<EntityReference<string>['resolved'], boolean>>()
void invariant<Expect<AxiomConfig['$basis'], TypeGuard<unknown>>>()
