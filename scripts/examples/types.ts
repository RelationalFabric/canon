/**
 * Type definitions for example documentation generation
 *
 * These types support the tutorial-first documentation system that parses
 * TypeScript examples into narrative Markdown documentation.
 */

import type * as ts from 'typescript'

/**
 * Document-level metadata extracted from @document.* JSDoc tags
 */
export interface DocumentMetadata {
  /** Document title (from @document.title) - becomes H1 */
  title?: string
  /** Document description (from @document.description) */
  description?: string
  /** Keywords (from @document.keywords) - comma-separated */
  keywords?: string
  /** Difficulty level (from @document.difficulty) */
  difficulty?: 'introductory' | 'intermediate' | 'advanced'
}

/**
 * Test status from Vitest JSON report
 */
export interface TestStatus {
  /** Pass or fail */
  status: 'passed' | 'failed'
  /** Failure messages if any */
  failureMessages: string[]
}

/**
 * Map of test titles to their status
 */
export interface TestStatusMap {
  [testTitle: string]: TestStatus
}

/**
 * Header depth control markers in source code
 */
export type HeaderControl = '+' | '-' | '!'

/**
 * Header depth state during document generation
 */
export interface HeaderDepthState {
  /** Document header level - base level for this document */
  documentLevel: number
  /** Current header level - active level for interpreting # in prose */
  currentLevel: number
}

/**
 * A section of tutorial content
 */
export interface TutorialSection {
  /** Type of section */
  type: 'prose' | 'code' | 'jsdoc' | 'test' | 'include' | 'header-control'
  /** Content of the section */
  content: string
  /** Optional metadata specific to section type */
  metadata?: {
    /** For JSDoc sections: parameter and return info */
    params?: Array<{ name: string, type: string, description: string }>
    returns?: { type: string, description: string }
    /** For test sections: test title and status */
    testTitle?: string
    testStatus?: TestStatus
    /** For include sections: path to included file */
    includePath?: string
    /** For header-control sections: control type */
    headerControl?: HeaderControl
  }
}

/**
 * Parsed example document
 */
export interface ParsedExample {
  /** Document metadata */
  metadata: DocumentMetadata
  /** Tutorial sections in source order */
  sections: TutorialSection[]
  /** Referenced files (from @include directives) */
  referencedFiles: string[]
  /** Source file path */
  sourcePath: string
}

/**
 * Example information for index generation
 */
export interface ExampleInfo {
  /** Example name (derived from filename/directory) */
  name: string
  /** Relative path from examples/ directory */
  path: string
  /** Description from metadata */
  description: string
  /** Keywords from metadata */
  keywords: string[]
  /** Difficulty level */
  difficulty?: string
  /** Referenced files */
  referencedFiles: string[]
  /** Is this a directory-based example? */
  isDirectory: boolean
  /** Generated doc filename */
  docFile: string
}

/**
 * Type guard to check if a node is a specific TypeScript syntax kind
 */
export function isNodeOfKind<T extends ts.Node>(
  node: ts.Node,
  kind: ts.SyntaxKind,
): node is T {
  return node.kind === kind
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * Type guard to check if a value is an object (but not null or array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
