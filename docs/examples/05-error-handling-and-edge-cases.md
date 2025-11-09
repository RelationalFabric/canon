# Error Handling and Edge Cases

Gracefully handling errors, edge cases, and validation in Canon applications

```ts
const validEntity = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  createdBy: 'admin-456',
}
```

```ts
const missingFields = {
  name: 'Incomplete User',
  email: 'incomplete@example.com',
}
```

```ts
const wrongTypes = {
  id: 123,
  type: true,
  version: 'five',
}
```

```ts
const nullValues = {
  id: null,
  version: 0,
}
```

```ts
const emptyObject = {}
```

```ts
const nonObject = 'not an object'
```

```ts
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

**handles valid entities correctly:**

```ts
const id = safeIdOf(validEntity)
const type = safeTypeOf(validEntity)
const version = safeVersionOf(validEntity)

expect(id).toBe('user-123')
expect(type).toBe('user')
expect(version).toBe(5)
```

_Status:_ ✅ pass

**handles missing fields gracefully:**

```ts
const id = safeIdOf(missingFields)
const type = safeTypeOf(missingFields)
const version = safeVersionOf(missingFields)

expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

_Status:_ ✅ pass

**handles wrong field types gracefully:**

```ts
const id = safeIdOf(wrongTypes)
const type = safeTypeOf(wrongTypes)
const version = safeVersionOf(wrongTypes)

expect(id).toBeUndefined()
expect(type).toBeUndefined()
// versionOf returns the actual value when it's not a number, safeVersionOf returns undefined
expect(version).toBeUndefined()
```

_Status:_ ✅ pass

**handles null and undefined values:**

```ts
const id = safeIdOf(nullValues)
const type = safeTypeOf(nullValues)
const version = safeVersionOf(nullValues)

expect(id).toBeUndefined()
expect(type).toBeUndefined()
// The nullValues object has version: 0, which is a valid number, so safeVersionOf returns 0
expect(version).toBe(0)
```

_Status:_ ✅ pass

**handles empty objects:**

```ts
const id = safeIdOf(emptyObject)
const type = safeTypeOf(emptyObject)
const version = safeVersionOf(emptyObject)

expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

_Status:_ ✅ pass

**handles non-object values:**

```ts
const id = safeIdOf(nonObject)
const type = safeTypeOf(nonObject)
const version = safeVersionOf(nonObject)

expect(id).toBeUndefined()
expect(type).toBeUndefined()
expect(version).toBeUndefined()
```

_Status:_ ✅ pass

**validates entities correctly:**

```ts
const validResult = validateEntity(validEntity)
const invalidResult = validateEntity(missingFields)

expect(validResult.isValid).toBe(true)
expect(validResult.errors).toHaveLength(0)

expect(invalidResult.isValid).toBe(false)
expect(invalidResult.errors.length).toBeGreaterThan(0)
```

_Status:_ ✅ pass

**processes entities safely:**

```ts
const validResult = processEntitySafely(validEntity)
const invalidResult = processEntitySafely(missingFields)

expect(validResult.success).toBe(true)
expect(validResult.result?.id).toBe('user-123')

expect(invalidResult.success).toBe(false)
expect(invalidResult.errors.length).toBeGreaterThan(0)
```

_Status:_ ✅ pass

**processes batch entities correctly:**

```ts
const batchResult = processBatchSafely([validEntity, missingFields, wrongTypes, nullValues])

expect(batchResult.successful).toBe(1)
expect(batchResult.failed).toBe(3)
expect(batchResult.results).toHaveLength(4)
```

_Status:_ ✅ pass

**handles timestamp conversion errors:**

```ts
const validTimestamp = safeTimestampConversion('2024-01-15T10:30:00Z')
const invalidTimestamp = safeTimestampConversion('not a date')

expect(validTimestamp).toBeInstanceOf(Date)
expect(invalidTimestamp).toBeUndefined()
```

_Status:_ ✅ pass

**handles reference conversion errors:**

```ts
const validReference = safeReferenceConversion('user-123')
const invalidReference = safeReferenceConversion(123)

expect(validReference).toEqual({ ref: 'user-123', resolved: false })
expect(invalidReference).toBeUndefined()
```

_Status:_ ✅ pass

---

## References

**Source:** `/home/runner/work/canon/canon/examples/05-error-handling-and-edge-cases/index.ts`

## Metadata

**Keywords:** error-handling, validation, edge-cases, safe-functions, robustness
**Difficulty:** intermediate
