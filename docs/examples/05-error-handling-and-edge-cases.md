# Error Handling and Edge Cases Usage Examples

```typescript
import {
  safeIdOf,
  safeReferenceConversion,
  safeTimestampConversion,
  safeTypeOf,
  safeVersionOf,
} from './safe-functions.js'

import {
  findMatchingCanon,
  processBatchSafely,
  processEntitySafely,
  validateEntity,
} from './validation-utilities.js'

import './basic-canon.js'
```

Valid entity with all required fields

```typescript
const validEntity = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  createdBy: 'admin-456',
}
```

Entity with missing required fields

```typescript
const missingFields = {
  name: 'Incomplete User',
  email: 'incomplete@example.com',
}
```

Entity with wrong field types

```typescript
const wrongTypes = {
  id: 123,
  type: true,
  version: 'five',
}
```

Entity with null values

```typescript
const nullValues = {
  id: null,
  version: 0,
}
```

Empty object

```typescript
const emptyObject = {}
```

Non-object value

```typescript
const nonObject = 'not an object'
```

Nested object with valid data in wrong location

```typescript
const nestedObject = {
  user: {
    id: 'user-456',
    type: 'user',
    version: 3,
  },
  metadata: {
    source: 'api',
    timestamp: '2024-01-15T10:30:00Z',
  },
}
```

```typescript
if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('Error Handling and Edge Cases', () => {
    it('handles valid entities correctly', () => {
      const id = safeIdOf(validEntity)
      const type = safeTypeOf(validEntity)
      const version = safeVersionOf(validEntity)

      expect(id).toBe('user-123')
      expect(type).toBe('user')
      expect(version).toBe(5)
    })

    it('handles missing fields gracefully', () => {
      const id = safeIdOf(missingFields)
      const type = safeTypeOf(missingFields)
      const version = safeVersionOf(missingFields)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('handles wrong field types gracefully', () => {
      const id = safeIdOf(wrongTypes)
      const type = safeTypeOf(wrongTypes)
      const version = safeVersionOf(wrongTypes)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      // versionOf returns the actual value when it's not a number, safeVersionOf returns undefined
      expect(version).toBeUndefined()
    })

    it('handles null and undefined values', () => {
      const id = safeIdOf(nullValues)
      const type = safeTypeOf(nullValues)
      const version = safeVersionOf(nullValues)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      // The nullValues object has version: 0, which is a valid number, so safeVersionOf returns 0
      expect(version).toBe(0)
    })

    it('handles empty objects', () => {
      const id = safeIdOf(emptyObject)
      const type = safeTypeOf(emptyObject)
      const version = safeVersionOf(emptyObject)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('handles non-object values', () => {
      const id = safeIdOf(nonObject)
      const type = safeTypeOf(nonObject)
      const version = safeVersionOf(nonObject)

      expect(id).toBeUndefined()
      expect(type).toBeUndefined()
      expect(version).toBeUndefined()
    })

    it('validates entities correctly', () => {
      const validResult = validateEntity(validEntity)
      const invalidResult = validateEntity(missingFields)

      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)
    })

    it('processes entities safely', () => {
      const validResult = processEntitySafely(validEntity)
      const invalidResult = processEntitySafely(missingFields)

      expect(validResult.success).toBe(true)
      expect(validResult.result?.id).toBe('user-123')

      expect(invalidResult.success).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)
    })

    it('processes batch entities correctly', () => {
      const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])

      expect(batchResult.successful).toBe(1)
      expect(batchResult.failed).toBe(3)
      expect(batchResult.results).toHaveLength(4)
    })

    it('handles timestamp conversion errors', () => {
      const validTimestamp = safeTimestampConversion('2024-01-15T10:30:00Z')
      const invalidTimestamp = safeTimestampConversion('not a date')

      expect(validTimestamp).toBeInstanceOf(Date)
      expect(invalidTimestamp).toBeUndefined()
    })

    it('handles reference conversion errors', () => {
      const validReference = safeReferenceConversion('user-123')
      const invalidReference = safeReferenceConversion(123)

      expect(validReference).toEqual({ ref: 'user-123', resolved: false })
      expect(invalidReference).toBeUndefined()
    })
  })
}
```

```typescript
console.log('=== Error Handling and Edge Cases ===')
```

```typescript
const testCases = [
  { name: 'validEntity', data: validEntity },
  { name: 'missingFields', data: missingFields },
  { name: 'wrongTypes', data: wrongTypes },
  { name: 'nullValues', data: nullValues },
  { name: 'emptyObject', data: emptyObject },
  { name: 'nonObject', data: nonObject },
  { name: 'nestedObject', data: nestedObject },
]

console.log('=== Edge Case Examples ===\n')

testCases.forEach(({ name, data }) => {
  console.log(`--- ${name} ---`)
  console.log('Data:', JSON.stringify(data, null, 2))

  const validation = validateEntity(data)
  console.log('Validation:', validation)

  const id = safeIdOf(data)
  const type = safeTypeOf(data)
  const version = safeVersionOf(data)

  console.log('Extracted values:')
  console.log(`  ID: ${id}`)
  console.log(`  Type: ${type}`)
  console.log(`  Version: ${version}`)

  const canon = findMatchingCanon(data)
  console.log(`  Canon match: ${canon ? `Found matching canon` : 'No matching canon'}`)
  console.log()
})
```

```typescript
console.log('=== Batch Processing Example ===')

const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])

console.log('Batch processing results:')

console.log(`  Successful: ${batchResult.successful}`)

console.log(`  Failed: ${batchResult.failed}`)

console.log('  Results:', batchResult.results)

console.log()
```

---

## References

**Source:** `05-error-handling-and-edge-cases/usage.ts`
