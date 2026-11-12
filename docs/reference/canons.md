# Canons Reference

This document describes the shared canons available in the Canon system.

## Available Canons

### `JsonLdCanon`

**Purpose**: JSON-LD canon implementation for working with JSON-LD formatted data.

**Definition and Export**:

```typescript
// Define well-named interfaces that communicate the JSON-LD structure
interface JsonLdEntity {
  '@id': string
  '@type': string
  '@version'?: string | number
}

interface JsonLdDate {
  '@value': string
  '@type': 'xsd:dateTime' | 'xsd:date' | 'xsd:time'
}

// Define the canon type using the API we created
export type JsonLdCanon = Canon<{
  Id: {
    $basis: JsonLdEntity
    key: '@id'
  }
  Type: {
    $basis: JsonLdEntity
    key: '@type'
  }
  Version: {
    $basis: JsonLdEntity
    key: '@version'
  }
  Timestamps: {
    $basis: TypeGuard<JsonLdDate>
    toCanonical: (value: JsonLdDate) => Date
    fromCanonical: (value: Date) => JsonLdDate
  }
}>

// Export the canon configuration using proper TypeGuard patterns
export default defineCanon<JsonLdCanon>({
  axioms: {
    Id: {
      $basis: (value: unknown): value is JsonLdEntity =>
        isPojo(value) && pojoHas(value, '@id') && typeof value['@id'] === 'string',
      key: '@id',
    },
    Type: {
      $basis: (value: unknown): value is JsonLdEntity =>
        isPojo(value) && pojoHas(value, '@type') && typeof value['@type'] === 'string',
      key: '@type',
    },
    Version: {
      $basis: (value: unknown): value is JsonLdEntity =>
        isPojo(value)
        && pojoHas(value, '@version')
        && (typeof value['@version'] === 'string' || typeof value['@version'] === 'number'),
      key: '@version',
    },
    Timestamps: {
      $basis: <U extends JsonLdDate>(value: U | unknown): value is U =>
        isPojo(value)
        && pojoHas(value, '@value')
        && pojoHas(value, '@type')
        && typeof value['@value'] === 'string'
        && ['xsd:dateTime', 'xsd:date', 'xsd:time'].includes(value['@type']),
      toCanonical: (value: JsonLdDate) => new Date(value['@value']),
      fromCanonical: (value: Date) => ({
        '@value': value.toISOString(),
        '@type': 'xsd:dateTime' as const,
      }),
    },
  },
})
```
