/**
 * Technology Radar data structures and types
 */

export interface RadarItem {
  /** The name of the technology or practice */
  name: string
  /** Description of the technology or practice */
  description: string
  /** Which quadrant this item belongs to */
  quadrant: string
  /** Which ring this item belongs to */
  ring: string
  /** Whether this is a new entry */
  isNew: boolean
  /** Optional justification for the placement */
  justification?: string
}

export interface FlatRadarItem {
  /** Single line representation: "name | quadrant | ring | description | isNew | justification" */
  line: string
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
  /** Quadrant names as simple strings */
  quadrants: string[]
  /** Ring names as simple strings */
  rings: string[]
  /** Radar items as a flat array of single-line strings */
  items: string[]
}

export interface RadarConfig {
  /** Configuration for the radar */
  metadata: RadarMetadata
  /** Quadrant names */
  quadrants: string[]
  /** Ring names */
  rings: string[]
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

// Legacy types for backward compatibility during migration
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

export type QuadrantKey = 'tools-libraries' | 'techniques-patterns' | 'features-capabilities' | 'data-structures-formats'
export type RingKey = 'adopt' | 'trial' | 'assess' | 'hold'
