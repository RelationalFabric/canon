import { createConsola } from 'consola'
import type { ConsolaInstance } from 'consola'

const consolaConfig = {
  level: undefined,
  reporters: undefined,
} satisfies Parameters<typeof createConsola>[0]

const canonLogger = createConsola(consolaConfig).withTag('canon')

export const logger = canonLogger

export function createLogger(tag?: string): ConsolaInstance {
  if (!tag)
    return canonLogger
  return canonLogger.withTag(tag)
}
