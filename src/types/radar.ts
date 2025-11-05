/**
 * Technology Radar data structures and types
 */

import { type Expect, invariant } from '../testing.js'

export interface RadarEntry {
  /** The name of the technology or practice */
  name: string
  /** Description of the technology or practice */
  description: string
  /** Whether this is a new entry */
  isNew: boolean
  /** Optional justification for the placement */
  justification?: string
}

export interface Quadrant {
  /** Unique identifier for the quadrant */
  id: string
  /** Display name for the quadrant */
  name: string
  /** Description of what this quadrant represents */
  description: string
}

export interface Ring {
  /** Unique identifier for the ring */
  id: string
  /** Display name for the ring */
  name: string
  /** Description of what this ring represents */
  description: string
  /** Color code for the ring (hex format) */
  color: string
}

export interface RadarMetadata {
  /** Title of the radar */
  title: string
  /** Subtitle of the radar */
  subtitle: string
  /** Version of the radar data */
  version: string
  /** Last updated date */
  lastUpdated: string
  /** Optional description */
  description?: string
}

export interface RadarData {
  /** Metadata about the radar */
  metadata: RadarMetadata
  /** Quadrant definitions */
  quadrants: Quadrant[]
  /** Ring definitions */
  rings: Ring[]
  /** Radar entries organized by quadrant and ring */
  entries: Record<string, Record<string, RadarEntry[]>>
}

export interface RadarConfig {
  /** Configuration for the radar */
  metadata: RadarMetadata
  /** Quadrant configuration */
  quadrants: Quadrant[]
  /** Ring configuration */
  rings: Ring[]
  /** Build configuration */
  buildConfig: {
    csvOutput: string
    yamlInput: string
    includeMetadata: boolean
    sortByRing: boolean
  }
}

export interface CsvRow {
  name: string
  ring: string
  quadrant: string
  isNew: boolean
  description: string
}

export type QuadrantKey =
  | 'tools-libraries'
  | 'techniques-patterns'
  | 'features-capabilities'
  | 'data-structures-formats'
export type RingKey = 'adopt' | 'trial' | 'assess' | 'hold'

// ---------------------------------------------------------------------------
// Compile-time invariants
// ---------------------------------------------------------------------------

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
