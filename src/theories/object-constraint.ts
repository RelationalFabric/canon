/**
 * A canon key models Identity through ObjectConstraintAxiom.
 */

import type { ObjectConstraintAxiom, Theories } from '../types/index.js'

// @ts-expect-error ObjectConstraintAxiom takes Theories only
type NotATheoryConstraint = ObjectConstraintAxiom<[{ NotATheory: string }]>

void 0 as unknown as NotATheoryConstraint

interface ConstrainedCanon {
  Owner: ObjectConstraintAxiom<[Theories['Identity']]>
}

const ownerWithId: ConstrainedCanon = {
  Owner: {
    $basis: (value: unknown): value is { id: string } =>
      typeof value === 'object' && value !== null && 'id' in value,
    models: ['Identity'],
    $meta: {
      Id: {
        $basis: {},
        key: 'id',
        $meta: {},
      },
    },
  },
}

const ownerWithoutId: ConstrainedCanon = {
  Owner: {
    $basis: (value: unknown): value is { id: string } =>
      typeof value === 'object' && value !== null && 'id' in value,
    models: ['Identity'],
    // @ts-expect-error Owner must model Identity, which has Id
    $meta: {},
  },
}

void ownerWithId
void ownerWithoutId
