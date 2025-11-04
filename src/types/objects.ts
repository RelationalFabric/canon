/**
 * Object type definitions for Canon
 */

import { type Expect, invariant } from '../testing.js'

/**
 * Plain old JavaScript object type
 */
export type Pojo = Record<string, unknown>

/**
 * Pojo with a specific property of a given type
 *
 * @template T - The base Pojo type
 * @template K - The key name
 * @template V - The value type
 */
export type PojoWith<T extends Pojo, K extends string, V = unknown> = T & { [P in K]: V }

// ---------------------------------------------------------------------------
// Compile-time invariants
// ---------------------------------------------------------------------------

interface SampleBase extends Pojo { name: string }
type SamplePojo = PojoWith<SampleBase, 'id', string>

void invariant<Expect<Pojo, Record<string, unknown>>>()
void invariant<Expect<SamplePojo['id'], string>>()
void invariant<Expect<SamplePojo['name'], string>>()
