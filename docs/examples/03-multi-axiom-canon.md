# Multi-Axiom Canon Usage Examples

```typescript
import {
  analyzeEntity,
  demonstrateReferenceConversion,
  demonstrateTimestampConversion,
  processEntityUpdate,
} from './utility-functions.js'

import './comprehensive-canon.js'
```

User entity with all five axioms

```typescript
const userEntity = {
  id: 'user-123',
  type: 'user',
  version: 5,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
  },
  createdBy: 'admin-456',
}
```

Product entity with all five axioms

```typescript
const productEntity = {
  id: 'product-456',
  type: 'product',
  version: 12,
  createdAt: new Date('2024-01-10T09:00:00Z'),
  updatedAt: new Date('2024-01-25T16:20:00Z'),
  name: 'Canon Framework License',
  price: 99.99,
  category: 'software',
  createdBy: 'user-123',
}
```

**Test: analyzes user entity correctly** ✅

```typescript
const analysis = analyzeEntity(userEntity)
expect(analysis.id).toBe('user-123')
expect(analysis.type).toBe('user')
expect(analysis.version).toBe(5)
expect(analysis.timestamps).toHaveLength(2)
expect(analysis.references).toHaveLength(1)
```

**Test: analyzes product entity correctly** ✅

```typescript
const analysis = analyzeEntity(productEntity)
expect(analysis.id).toBe('product-456')
expect(analysis.type).toBe('product')
expect(analysis.version).toBe(12)
expect(analysis.timestamps).toHaveLength(2)
expect(analysis.references).toHaveLength(1)
```

**Test: processes entity updates with version increment** ✅

```typescript
const update = processEntityUpdate(productEntity)
expect(update.id).toBe('product-456')
expect(update.oldVersion).toBe(12)
expect(update.newVersion).toBe(13)
expect(update.updatedAt).toBeInstanceOf(Date)
```

**Test: demonstrates timestamp conversion** ✅

```typescript
expect(() => demonstrateTimestampConversion()).not.toThrow()
```

**Test: demonstrates reference conversion** ✅

```typescript
expect(() => demonstrateReferenceConversion()).not.toThrow()
```

```typescript
console.log('=== Multi-Axiom Canon Examples ===')

console.log('\n1. Analyzing user entity:')

const userAnalysis = analyzeEntity(userEntity)

console.log(userAnalysis)

console.log('\n2. Analyzing product entity:')

const productAnalysis = analyzeEntity(productEntity)

console.log(productAnalysis)

demonstrateTimestampConversion()

demonstrateReferenceConversion()

console.log('\n3. Processing entity update:')

processEntityUpdate(productEntity)
```

---

## References

**Source:** `03-multi-axiom-canon/usage.ts`
