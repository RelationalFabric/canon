/**
 * Tests for object utilities
 */

import { describe, expect, it } from 'vitest'
import { isPojo, objectEntries, objectKeys, objectValues, pojoHas, pojoHasString } from './objects.js'

describe('isPojo', () => {
  it('should return true for plain objects', () => {
    expect(isPojo({})).toBe(true)
    expect(isPojo({ id: '123' })).toBe(true)
    expect(isPojo({ nested: { value: 1 } })).toBe(true)
  })

  it('should return false for arrays', () => {
    expect(isPojo([])).toBe(false)
    expect(isPojo([1, 2, 3])).toBe(false)
  })

  it('should return false for null', () => {
    expect(isPojo(null)).toBe(false)
  })

  it('should return false for primitives', () => {
    expect(isPojo('string')).toBe(false)
    expect(isPojo(123)).toBe(false)
    expect(isPojo(true)).toBe(false)
    expect(isPojo(undefined)).toBe(false)
  })

  it('should return false for class instances', () => {
    class MyClass {}
    expect(isPojo(new MyClass())).toBe(false)
    expect(isPojo(new Date())).toBe(false)
    expect(isPojo(new Map())).toBe(false)
  })

  it('should return false for objects with custom prototypes', () => {
    const customProto = Object.create({ custom: true })
    expect(isPojo(customProto)).toBe(false)
  })
})

describe('pojoHas', () => {
  it('should return true when property exists', () => {
    const obj = { id: '123', name: 'Test' }
    expect(pojoHas(obj, 'id')).toBe(true)
    expect(pojoHas(obj, 'name')).toBe(true)
  })

  it('should return false when property does not exist', () => {
    const obj = { id: '123' }
    expect(pojoHas(obj, 'missing')).toBe(false)
  })
})

describe('pojoHasString', () => {
  it('should return true for object with string field', () => {
    expect(pojoHasString({ id: '123' }, 'id')).toBe(true)
    expect(pojoHasString({ '@id': 'uri' }, '@id')).toBe(true)
  })

  it('should return false for non-string field', () => {
    expect(pojoHasString({ id: 123 }, 'id')).toBe(false)
    expect(pojoHasString({ id: null }, 'id')).toBe(false)
  })

  it('should return false for missing field', () => {
    expect(pojoHasString({ name: 'test' }, 'id')).toBe(false)
  })

  it('should return false for non-objects', () => {
    expect(pojoHasString('string', 'id')).toBe(false)
    expect(pojoHasString(null, 'id')).toBe(false)
  })
})

describe('objectKeys', () => {
  it('should return typed keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const keys = objectKeys(obj)
    expect(keys).toEqual(['a', 'b', 'c'])
  })
})

describe('objectValues', () => {
  it('should return values', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const values = objectValues(obj)
    expect(values).toEqual([1, 2, 3])
  })
})

describe('objectEntries', () => {
  it('should return entries', () => {
    const obj = { a: 1, b: 2 }
    const entries = objectEntries(obj)
    expect(entries).toEqual([['a', 1], ['b', 2]])
  })
})
