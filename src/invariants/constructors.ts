/**
 * Type invariants for Constructor types
 *
 * These compile-time assertions verify type relationships and guard against regressions.
 */

import type { Expect } from '../testing.js'
import type { AnyConstructor, Constructor } from '../types/index.js'
import { invariant } from '../testing.js'

class ExampleClass {
  constructor(public value: string) {}
}

type ExampleConstructor = Constructor<ExampleClass>
type ExtractedType<T> = T extends Constructor<infer U> ? U : never

invariant<Expect<ExtractedType<ExampleConstructor>, ExampleClass>>()
invariant<Expect<AnyConstructor, Constructor<unknown>>>()

// Verify that AnyConstructor is assignable to specific constructors
const _test1: ExampleConstructor = null as unknown as AnyConstructor as ExampleConstructor
void _test1

// Verify that specific constructors are assignable to AnyConstructor
const _test2: AnyConstructor = null as unknown as ExampleConstructor
void _test2
