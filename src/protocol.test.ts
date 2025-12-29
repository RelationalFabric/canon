import { describe, it, expect, beforeEach } from 'vitest'
import type { Fn } from './types/index.js'
import type { Protocol } from './types/protocols.js'
import {
  defineProtocol,
  extendProtocol,
  getProtocolImplementors,
  Null,
  ObjectFallback,
  satisfiesProtocol,
  Undefined,
} from './protocol.js'

// Define a test protocol interface with index signature for ProtocolInterface compatibility
type TestSeq = Record<string, Fn> & {
  first: (seq: unknown) => unknown
  rest: (seq: unknown) => unknown
  empty: (seq: unknown) => boolean
}

describe('Protocol System', () => {
  let PTestSeq: Protocol<TestSeq>

  beforeEach(() => {
    // Create a fresh protocol for each test
    PTestSeq = defineProtocol<TestSeq>({
      first: 'Returns the first item',
      rest: 'Returns the rest',
      empty: 'Is it empty',
    })
  })

  describe('defineProtocol', () => {
      it('should create a protocol with methods', () => {
        expect(PTestSeq.$name).toMatch(/^Protocol\d+$/)
        expect(typeof PTestSeq.$id).toBe('symbol')
        expect(typeof PTestSeq.first).toBe('function')
        expect(typeof PTestSeq.rest).toBe('function')
        expect(typeof PTestSeq.empty).toBe('function')
      })

    it('should store documentation', () => {
      expect(PTestSeq.$docs.first).toBe('Returns the first item')
      expect(PTestSeq.$docs.rest).toBe('Returns the rest')
      expect(PTestSeq.$docs.empty).toBe('Is it empty')
    })
  })

  describe('extendProtocol', () => {
    it('should extend protocol for Array', () => {
      extendProtocol(PTestSeq, Array, {
        first: (arr: unknown) => (arr as unknown[])[0],
        rest: (arr: unknown) => (arr as unknown[]).slice(1),
        empty: (arr: unknown) => (arr as unknown[]).length === 0,
      })

      expect(PTestSeq.first([1, 2, 3])).toBe(1)
      expect(PTestSeq.rest([1, 2, 3])).toEqual([2, 3])
      expect(PTestSeq.empty([])).toBe(true)
      expect(PTestSeq.empty([1])).toBe(false)
    })

    it('should extend protocol for String', () => {
      extendProtocol(PTestSeq, String, {
        first: (str: unknown) => (str as string)[0],
        rest: (str: unknown) => (str as string).slice(1),
        empty: (str: unknown) => (str as string).length === 0,
      })

      expect(PTestSeq.first('abc')).toBe('a')
      expect(PTestSeq.rest('abc')).toBe('bc')
      expect(PTestSeq.empty('')).toBe(true)
      expect(PTestSeq.empty('a')).toBe(false)
    })

    it('should extend protocol for Null pseudo-constructor', () => {
      extendProtocol(PTestSeq, Null, {
        first: () => undefined,
        rest: () => null,
        empty: () => true,
      })

      expect(PTestSeq.first(null)).toBe(undefined)
      expect(PTestSeq.rest(null)).toBe(null)
      expect(PTestSeq.empty(null)).toBe(true)
    })

    it('should extend protocol for Undefined pseudo-constructor', () => {
      extendProtocol(PTestSeq, Undefined, {
        first: () => undefined,
        rest: () => undefined,
        empty: () => true,
      })

      expect(PTestSeq.first(undefined)).toBe(undefined)
      expect(PTestSeq.rest(undefined)).toBe(undefined)
      expect(PTestSeq.empty(undefined)).toBe(true)
    })

    it('should support ObjectFallback pseudo-constructor', () => {
      extendProtocol(PTestSeq, ObjectFallback, {
        first: (obj: unknown) => Object.values(obj as object)[0],
        rest: (obj: unknown) => {
          const entries = Object.entries(obj as object).slice(1)
          return Object.fromEntries(entries)
        },
        empty: (obj: unknown) => Object.keys(obj as object).length === 0,
      })

      expect(PTestSeq.first({ a: 1, b: 2 })).toBe(1)
      expect(PTestSeq.rest({ a: 1, b: 2 })).toEqual({ b: 2 })
      expect(PTestSeq.empty({})).toBe(true)
    })
  })

  describe('satisfiesProtocol', () => {
    it('should return false for unregistered types', () => {
      expect(satisfiesProtocol([1, 2, 3], PTestSeq)).toBe(false)
    })

    it('should return true for registered types', () => {
      extendProtocol(PTestSeq, Array, {
        first: (arr: unknown) => (arr as unknown[])[0],
      })

      expect(satisfiesProtocol([1, 2, 3], PTestSeq)).toBe(true)
    })

    it('should use ObjectFallback for unregistered objects', () => {
      extendProtocol(PTestSeq, ObjectFallback, {
        first: (obj: unknown) => Object.values(obj as object)[0],
      })

      expect(satisfiesProtocol({ a: 1 }, PTestSeq)).toBe(true)
    })
  })

  describe('getProtocolImplementors', () => {
    it('should return empty array for new protocol', () => {
      expect(getProtocolImplementors(PTestSeq)).toEqual([])
    })

    it('should return registered constructor names', () => {
      extendProtocol(PTestSeq, Array, { first: () => undefined })
      extendProtocol(PTestSeq, String, { first: () => undefined })

      const implementors = getProtocolImplementors(PTestSeq)
      expect(implementors).toContain('Array')
      expect(implementors).toContain('String')
    })
  })

    describe('dispatch errors', () => {
      it('should throw when no implementation exists', () => {
        expect(() => PTestSeq.first([1, 2, 3])).toThrow(
          /No implementation of Protocol\d+\.first found for type Array/,
        )
      })
    })

  describe('constructors', () => {
    it('Null should be a constructor that returns null', () => {
      expect(typeof Null).toBe('function')
      expect(Null()).toBe(null)
      expect(new Null()).toBe(null)
    })

    it('Undefined should be a constructor that returns undefined', () => {
      expect(typeof Undefined).toBe('function')
      expect(Undefined()).toBe(undefined)
      expect(new Undefined()).toBe(undefined)
    })

    it('ObjectFallback should be a constructor that returns empty object', () => {
      expect(typeof ObjectFallback).toBe('function')
      expect(ObjectFallback()).toEqual({})
      expect(new ObjectFallback()).toEqual({})
    })
  })
})
