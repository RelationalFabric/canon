# Format Conversion Examples

Converting data between different formats (REST API, MongoDB, JSON-LD) using Canon's universal type system

```ts
const restApiUser = {
id: 'user-123',
type: 'user',
version: 5,
createdAt: new Date('2024-01-15T10:30:00Z'),
updatedAt: new Date('2024-01-20T14:45:00Z'),
profile: { name: 'Alice Johnson', email: 'alice@example.com' },
createdBy: 'admin-456',
}
```

```ts
const mongoDbUser = {
_id: '507f1f77bcf86cd799439011',
_type: 'User',
_version: 6,
created_at: 1705314600000,
updated_at: 1705761900000,
profile: { name: 'Bob Smith', email: 'bob@example.com' },
createdBy: 'admin-789',
}
```

```ts
const jsonLdUser = {
'@id': 'https://api.example.com/users/user-123',
'@type': 'https://schema.org/Person',
'@version': '5-updated',
'created_at': '2024-01-15T10:30:00Z',
'updated_at': '2024-01-20T14:45:00Z',
'profile': { name: 'Carol Davis', email: 'carol@example.com' },
'createdBy': 'admin-123',
}
```

**processes REST API user correctly:**

```ts
const id = idOf(restApiUser)
const type = typeOf(restApiUser)
const version = versionOf(restApiUser)

// Handle timestamps manually since the canon doesn't know about createdAt/updatedAt
const timestamps: Date[] = []
if (typeof restApiUser === 'object' && restApiUser !== null) {
  const obj = restApiUser as Record<string, unknown>
  if (obj.createdAt instanceof Date)
    timestamps.push(obj.createdAt)
  if (obj.updatedAt instanceof Date)
    timestamps.push(obj.updatedAt)
}

expect(id).toBe('user-123')
expect(type).toBe('user')
expect(version).toBe(5)
expect(timestamps).toHaveLength(2)
```

_Status:_ ✅ pass

**processes MongoDB user correctly:**

```ts
const id = idOf(mongoDbUser)
const type = typeOf(mongoDbUser)
const version = versionOf(mongoDbUser)

// Handle timestamps manually since the canon doesn't know about created_at/updated_at
const timestamps: Date[] = []
if (typeof mongoDbUser === 'object' && mongoDbUser !== null) {
  const obj = mongoDbUser as Record<string, unknown>
  if (typeof obj.created_at === 'number')
    timestamps.push(new Date(obj.created_at))
  if (typeof obj.updated_at === 'number')
    timestamps.push(new Date(obj.updated_at))
}

expect(id).toBe('507f1f77bcf86cd799439011')
expect(type).toBe('User')
expect(version).toBe(6)
expect(timestamps).toHaveLength(2)
```

_Status:_ ✅ pass

**processes JSON-LD user correctly:**

```ts
const id = idOf(jsonLdUser)
const type = typeOf(jsonLdUser)
const version = versionOf(jsonLdUser)

// Handle timestamps manually since the canon doesn't know about created_at/updated_at
const timestamps: Date[] = []
if (typeof jsonLdUser === 'object' && jsonLdUser !== null) {
  const obj = jsonLdUser as Record<string, unknown>
  if (typeof obj.created_at === 'string')
    timestamps.push(new Date(obj.created_at))
  if (typeof obj.updated_at === 'string')
    timestamps.push(new Date(obj.updated_at))
}

expect(id).toBe('https://api.example.com/users/user-123')
expect(type).toBe('https://schema.org/Person')
expect(version).toBe('5-updated')
expect(timestamps).toHaveLength(2)
```

_Status:_ ✅ pass

**handles invalid data gracefully:**

```ts
const invalidData = { name: 'Invalid User' }

// @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
expect(() => idOf(invalidData)).toThrow('Expected string ID, got undefined')
// @ts-expect-error - Demonstrating type system correctly rejects invalid data structure
expect(() => typeOf(invalidData)).toThrow('Expected string type, got undefined')
```

_Status:_ ✅ pass

**handles partial data gracefully:**

```ts
const partialData = { id: 'user-123' }

// @ts-expect-error - Demonstrating type system correctly rejects partial data missing required fields
expect(() => typeOf(partialData)).toThrow('Expected string type, got undefined')
```

_Status:_ ✅ pass

**demonstrates format conversion:**

```ts
// This test just ensures the function runs without error
expect(() => demonstrateFormatConversion()).not.toThrow()
```

_Status:_ ✅ pass

**demonstrates error handling:**

```ts
// This test just ensures the function runs without error
expect(() => demonstrateErrorHandling()).not.toThrow()
```

_Status:_ ✅ pass

---

## References

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples/index.ts)

## Metadata

**Keywords:** format-conversion, rest-api, mongodb, json-ld, transformation
**Difficulty:** intermediate
