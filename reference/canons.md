# Canons Reference

This document describes the shared canons available in the Canon system.

## Available Canons

### `JsonLdCanon`
**Purpose**: JSON-LD canon implementation for working with JSON-LD formatted data.

**Definition and Export**:
```typescript
// Define well-named types that communicate the JSON-LD structure
type JsonLdEntity = {
  '@id': string;
  '@type': string;
  '@version'?: string | number;
  'dateCreated'?: string | Date;
  'references'?: string | string[];
};

type JsonLdPerson = JsonLdEntity & {
  '@type': 'Person';
  'name'?: string;
  'email'?: string;
};

type JsonLdOrganization = JsonLdEntity & {
  '@type': 'Organization';
  'name'?: string;
  'url'?: string;
};

// Define the canon type using the API we created
export type JsonLdCanon = Canon<{
  Id: {
    $basis: JsonLdEntity;
    key: '@id';
    $meta: { type: 'uri'; required: 'true' };
  };
  Type: {
    $basis: JsonLdEntity;
    key: '@type';
    $meta: { enum: 'Person,Organization,Event,Place'; discriminator: 'true' };
  };
  Version: {
    $basis: JsonLdEntity;
    key: '@version';
    $meta: { type: 'string|number'; required: 'false' };
  };
  Timestamps: {
    $basis: JsonLdEntity;
    key: 'dateCreated';
    $meta: { format: 'iso8601'; required: 'false' };
  };
  References: {
    $basis: JsonLdEntity;
    key: 'references';
    $meta: { type: 'uri|array'; required: 'false' };
  };
}>;

// Export the canon configuration using proper TypeGuard patterns
export default defineCanon<JsonLdCanon>({
  axioms: {
    Id: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@id' in value && typeof value['@id'] === 'string',
      key: '@id',
      $meta: { type: 'uri', required: 'true' }
    },
    Type: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@type' in value && typeof value['@type'] === 'string',
      key: '@type',
      $meta: { enum: 'Person,Organization,Event,Place', discriminator: 'true' }
    },
    Version: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@version' in value && 
        (typeof value['@version'] === 'string' || typeof value['@version'] === 'number'),
      key: '@version',
      $meta: { type: 'string|number', required: 'false' }
    },
    Timestamps: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && 'dateCreated' in value && 
        (typeof value['dateCreated'] === 'string' || value['dateCreated'] instanceof Date),
      key: 'dateCreated',
      $meta: { format: 'iso8601', required: 'false' }
    },
    References: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && 'references' in value && 
        (typeof value['references'] === 'string' || Array.isArray(value['references'])),
      key: 'references',
      $meta: { type: 'uri|array', required: 'false' }
    }
  }
});
```
