# Format Conversion Usage Examples

```typescript
import { idOf, typeOf, versionOf } from '@relational-fabric/canon'

import {
  demonstrateErrorHandling,
  demonstrateFormatConversion,
  processUsersFromDifferentSources,
} from './conversion-utilities.js'

import './canons.js'
```

REST API user entity

```typescript
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

MongoDB user entity

```typescript
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

JSON-LD user entity

```typescript
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

**Test: processes REST API user correctly** ✅

```typescript
const id = idOf(restApiUser)
const type = typeOf(restApiUser)
const version = versionOf(restApiUser)
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

**Test: processes MongoDB user correctly** ✅

```typescript
const id = idOf(mongoDbUser)
const type = typeOf(mongoDbUser)
const version = versionOf(mongoDbUser)
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

**Test: processes JSON-LD user correctly** ✅

```typescript
const id = idOf(jsonLdUser)
const type = typeOf(jsonLdUser)
const version = versionOf(jsonLdUser)
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

**Test: handles invalid data gracefully** ✅

```typescript
const invalidData = { name: 'Invalid User' }
expect(() => idOf(invalidData)).toThrow('Expected string ID, got undefined')
expect(() => typeOf(invalidData)).toThrow('Expected string type, got undefined')
```

**Test: handles partial data gracefully** ✅

```typescript
const partialData = { id: 'user-123' }
expect(() => typeOf(partialData)).toThrow('Expected string type, got undefined')
```

**Test: demonstrates format conversion** ✅

```typescript
expect(() => demonstrateFormatConversion()).not.toThrow()
```

**Test: demonstrates error handling** ✅

```typescript
expect(() => demonstrateErrorHandling()).not.toThrow()
```

```typescript
console.log('=== Format Conversion Examples ===')

processUsersFromDifferentSources()

demonstrateFormatConversion()

demonstrateErrorHandling()
```

---

## References

**Source:** `04-format-conversion-examples/usage.ts`
