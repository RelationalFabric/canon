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

**Test: handles valid entities correctly** ✅

```typescript
const id = safeIdOf(validEntity)
const type = safeTypeOf(validEntity)
const version = safeVersionOf(validEntity)
expect(id).toBe('user-123')
expect(type).toBe('user')
expect(version).toBe(5)
```

**Test: handles missing fields gracefully** ✅

```typescript
const id = safeIdOf(missingFields)
const type = safeTypeOf(missingFields)
const version = safeVersionOf(missingFields)
expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

**Test: handles wrong field types gracefully** ✅

```typescript
const id = safeIdOf(wrongTypes)
const type = safeTypeOf(wrongTypes)
const version = safeVersionOf(wrongTypes)
expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

**Test: handles null and undefined values** ✅

```typescript
const id = safeIdOf(nullValues)
const type = safeTypeOf(nullValues)
const version = safeVersionOf(nullValues)
expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBe(0)
```

**Test: handles empty objects** ✅

```typescript
const id = safeIdOf(emptyObject)
const type = safeTypeOf(emptyObject)
const version = safeVersionOf(emptyObject)
expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

**Test: handles non-object values** ✅

```typescript
const id = safeIdOf(nonObject)
const type = safeTypeOf(nonObject)
const version = safeVersionOf(nonObject)
expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

**Test: validates entities correctly** ✅

```typescript
const validResult = validateEntity(validEntity)
const invalidResult = validateEntity(missingFields)
expect(validResult.isValid).toBe(true)
expect(validResult.errors).toHaveLength(0)
expect(invalidResult.isValid).toBe(false)
expect(invalidResult.errors.length).toBeGreaterThan(0)
```

**Test: processes entities safely** ✅

```typescript
const validResult = processEntitySafely(validEntity)
const invalidResult = processEntitySafely(missingFields)
expect(validResult.success).toBe(true)
expect(validResult.result?.id).toBe('user-123')
expect(invalidResult.success).toBe(false)
expect(invalidResult.errors.length).toBeGreaterThan(0)
```

**Test: processes batch entities correctly** ✅

```typescript
const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])
expect(batchResult.successful).toBe(1)
expect(batchResult.failed).toBe(3)
expect(batchResult.results).toHaveLength(4)
```

**Test: handles timestamp conversion errors** ✅

```typescript
const validTimestamp = safeTimestampConversion('2024-01-15T10:30:00Z')
const invalidTimestamp = safeTimestampConversion('not a date')
expect(validTimestamp).toBeInstanceOf(Date)
expect(invalidTimestamp).toBeUndefined()
```

**Test: handles reference conversion errors** ✅

```typescript
const validReference = safeReferenceConversion('user-123')
const invalidReference = safeReferenceConversion(123)
expect(validReference).toEqual({ ref: 'user-123', resolved: false })
expect(invalidReference).toBeUndefined()
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
