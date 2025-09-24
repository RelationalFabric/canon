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
  name?: string;
  email?: string;
};

type JsonLdOrganization = JsonLdEntity & {
  '@type': 'Organization';
  name?: string;
  url?: string;
};

// Define the canon type using the API we created
export type JsonLdCanon = Canon<{
  Id: {
    $basis: JsonLdEntity;
    key: '@id';
  };
  Type: {
    $basis: JsonLdEntity;
    key: '@type';
  };
  Version: {
    $basis: JsonLdEntity;
    key: '@version';
  };
  Timestamps: {
    $basis: JsonLdEntity;
    toCanonical: (value: JsonLdEntity) => Date;
    fromCanonical: (value: Date) => JsonLdEntity;
  } & {
    toCanonical: (value: JsonLdEntity) => Date;
    fromCanonical: (value: Date) => JsonLdEntity;
  };
  References: {
    $basis: JsonLdEntity;
    toCanonical: (value: JsonLdEntity) => string[];
    fromCanonical: (value: string[]) => JsonLdEntity;
  } & {
    toCanonical: (value: JsonLdEntity) => string[];
    fromCanonical: (value: string[]) => JsonLdEntity;
  };
}>;

// Export the canon configuration using proper TypeGuard patterns
export default defineCanon<JsonLdCanon>({
  axioms: {
    Id: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@id' in value && typeof value['@id'] === 'string',
      key: '@id'
    },
    Type: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@type' in value && typeof value['@type'] === 'string',
      key: '@type'
    },
    Version: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && '@version' in value && 
        (typeof value['@version'] === 'string' || typeof value['@version'] === 'number'),
      key: '@version'
    },
    Timestamps: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && 'dateCreated' in value && 
        (typeof value['dateCreated'] === 'string' || value['dateCreated'] instanceof Date),
      toCanonical: (value: JsonLdEntity) => {
        const timestamp = value['dateCreated'];
        if (timestamp instanceof Date) return timestamp;
        if (typeof timestamp === 'string') return new Date(timestamp);
        return new Date();
      },
      fromCanonical: (value: Date) => ({ 'dateCreated': value } as JsonLdEntity)
    },
    References: {
      $basis: (value: unknown): value is JsonLdEntity => 
        isPojo(value) && 'references' in value && 
        (typeof value['references'] === 'string' || Array.isArray(value['references'])),
      toCanonical: (value: JsonLdEntity) => {
        const refs = value['references'];
        if (Array.isArray(refs)) return refs;
        if (typeof refs === 'string') return [refs];
        return [];
      },
      fromCanonical: (value: string[]) => ({ 'references': value } as JsonLdEntity)
    }
  }
});
```
