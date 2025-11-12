import type { FormattingOptions as JsonFormattingOptions, ParseError as JsonParseError } from 'jsonc-parser'
import type { ObjectHash } from 'object-hash'
import type { SourceFile as TsMorphSourceFile } from 'ts-morph'
import { Command as OclifCommand, Flags as OclifFlags, flush as oclifFlush, run as oclifRun } from '@oclif/core'
import fsExtra from 'fs-extra'
import { runner as hygenRunner } from 'hygen'
import HygenLoggerModule from 'hygen/dist/logger'
import ImmutableNamespace from 'immutable'
import {
  applyEdits as jsoncApplyEdits,
  modify as jsoncModify,
  parse as jsoncParse,
  printParseErrorCode as jsoncPrintError,
} from 'jsonc-parser'
import objectHashDefault from 'object-hash'
import {
  Project as TsMorphProjectClass,
  QuoteKind as TsMorphQuoteKindEnum,
  StructureKind as TsMorphStructureKindEnum,
} from 'ts-morph'
import { parse as yamlParse } from 'yaml'
import type { ConsolaInstance } from 'consola'
import { createLogger as createCanonLogger } from './log.js'

// Third-party dependencies blessed for consumer use
export { defu } from 'defu'
export const Immutable = ImmutableNamespace

export const objectHash: ObjectHash = objectHashDefault

const parseYamlFn = yamlParse
const HygenLoggerResolved: typeof HygenLoggerModule
  = typeof HygenLoggerModule === 'function'
    ? HygenLoggerModule
    : (HygenLoggerModule as { default: typeof HygenLoggerModule }).default

const { ensureDir, pathExists, readFile, writeFile } = fsExtra

export const Files = {
  ensureDir,
  pathExists,
  readFile,
  writeFile,
} as const

export const Oclif = {
  command: OclifCommand,
  flags: OclifFlags,
  flush: oclifFlush,
  run: oclifRun,
} as const

export const Hygen = {
  run: hygenRunner,
  createLogger(log: (message: string) => void): InstanceType<typeof HygenLoggerResolved> {
    return new HygenLoggerResolved(log)
  },
} as const

export const Jsonc = {
  applyEdits: jsoncApplyEdits,
  modify: jsoncModify,
  parse: jsoncParse,
  printError: jsoncPrintError,
} as const

export const Parse = {
  yaml: parseYamlFn,
  jsonWithComments: jsoncParse,
} as const

export const TsMorph = {
  Project: TsMorphProjectClass,
  QuoteKind: TsMorphQuoteKindEnum,
  StructureKind: TsMorphStructureKindEnum,
} as const

export function createLogger(tag?: string): ConsolaInstance {
  return createCanonLogger(tag)
}

export type { JsonFormattingOptions, JsonParseError, TsMorphSourceFile }

export const parseYaml = Parse.yaml
export const parseJsonWithComments = Jsonc.parse
export const applyJsonEdits = Jsonc.applyEdits
export const modifyJsonContent = Jsonc.modify
export const printParseErrorCode = Jsonc.printError
