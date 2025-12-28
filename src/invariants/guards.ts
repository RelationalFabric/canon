/**
 * Type invariants for TypeGuard and Predicate types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { Predicate, TypeGuard } from '../types/index.js'
import { invariant } from '../testing.js'

type ExampleGuard = TypeGuard<{ id: string }>
type ExamplePredicate = Predicate<{ id: string }>

type GuardTarget<T> = T extends TypeGuard<infer Target> ? Target : never
type PredicateTarget<T> = T extends Predicate<infer Target> ? Target : never
type GuardReturn<T> = T extends (value: unknown) => value is infer R ? R : never
type PredicateReturn<T> = T extends (value: unknown) => infer R ? R : never

invariant<Expect<GuardTarget<ExampleGuard>, { id: string }>>()
invariant<Expect<PredicateTarget<ExamplePredicate>, { id: string }>>()
invariant<Expect<GuardReturn<ExampleGuard>, { id: string }>>()
invariant<Expect<PredicateReturn<ExamplePredicate>, boolean>>()
