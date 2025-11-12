import { createConsola } from 'consola'
import type { ConsolaInstance } from 'consola'

const canonLogger = createConsola().withTag('canon')

export const logger = canonLogger

export function createLogger(tag?: string): ConsolaInstance {
  if (!tag)
    return canonLogger
  return canonLogger.withTag(tag)
}
