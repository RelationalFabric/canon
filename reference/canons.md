# Canons Reference

This document describes the shared canons available in the Canon system.

## Available Canons

### `JsonLdCanon`
**Purpose**: JSON-LD canon implementation for working with JSON-LD formatted data.

**Definition and Export**:
```typescript
// Define the canon type
export type JsonLdCanon = Canon<{
  Id: {
    $basis: { '@id': string };
    key: '@id';
    $meta: { type: 'uri'; required: 'true' };
  };
  Type: {
    $basis: { '@type': string };
    key: '@type';
    $meta: { enum: 'string'; discriminator: 'true' };
  };
  Version: {
    $basis: { '@version': string | number };
    key: '@version';
    $meta: { type: 'string|number'; required: 'false' };
  };
  Timestamps: {
    $basis: { 'dateCreated': string | Date };
    key: 'dateCreated';
    $meta: { format: 'iso8601'; required: 'false' };
  };
  References: {
    $basis: { 'references': string | string[] };
    key: 'references';
    $meta: { type: 'uri|array'; required: 'false' };
  };
}>;

// Export the canon configuration
export default defineCanon<JsonLdCanon>({
  axioms: {
    Id: {
      $basis: (value: unknown): value is { '@id': string } => 
        typeof value === 'object' && value !== null && '@id' in value && typeof (value as any)['@id'] === 'string',
      key: '@id',
      $meta: { type: 'uri', required: 'true' }
    },
    Type: {
      $basis: (value: unknown): value is { '@type': string } => 
        typeof value === 'object' && value !== null && '@type' in value && typeof (value as any)['@type'] === 'string',
      key: '@type',
      $meta: { enum: 'Person,Organization,Event,Place', discriminator: 'true' }
    },
    Version: {
      $basis: (value: unknown): value is { '@version': string | number } => 
        typeof value === 'object' && value !== null && '@version' in value && 
        (typeof (value as any)['@version'] === 'string' || typeof (value as any)['@version'] === 'number'),
      key: '@version',
      $meta: { type: 'string|number', required: 'false' }
    },
    Timestamps: {
      $basis: (value: unknown): value is { 'dateCreated': string | Date } => 
        typeof value === 'object' && value !== null && 'dateCreated' in value && 
        (typeof (value as any).dateCreated === 'string' || (value as any).dateCreated instanceof Date),
      key: 'dateCreated',
      $meta: { format: 'iso8601', required: 'false' }
    },
    References: {
      $basis: (value: unknown): value is { 'references': string | string[] } => 
        typeof value === 'object' && value !== null && 'references' in value && 
        (typeof (value as any).references === 'string' || Array.isArray((value as any).references)),
      key: 'references',
      $meta: { type: 'uri|array', required: 'false' }
    }
  }
});
```

**Usage**:
```typescript
import jsonLdCanon, { type JsonLdCanon } from '@relational-fabric/canon/jsonld';
import { registerCanons } from '@relational-fabric/canon';

// Register the canon
registerCanons({ JsonLd: jsonLdCanon });

// Use with JSON-LD data
const jsonLdData = {
  '@id': 'https://example.com/person/123',
  '@type': 'Person',
  '@version': 1,
  'dateCreated': '2022-01-01T00:00:00Z',
  'references': ['https://example.com/org/456']
};

// Works with universal functions
const id = idOf(jsonLdData); // 'https://example.com/person/123'
const type = typeOf(jsonLdData); // 'Person'
const version = versionOf(jsonLdData); // 1
const timestamp = timestampsOf(jsonLdData); // Converted to canonical format
const references = referencesOf(jsonLdData); // Converted to canonical format
```