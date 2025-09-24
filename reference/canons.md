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
    $basis: string | Date;
    toCanonical: (value: string | Date) => Date;
    fromCanonical: (value: Date) => string | Date;
  } & {
    toCanonical: (value: string | Date) => Date;
    fromCanonical: (value: Date) => string | Date;
  };
  References: {
    $basis: string | string[];
    toCanonical: (value: string | string[]) => string[];
    fromCanonical: (value: string[]) => string | string[];
  } & {
    toCanonical: (value: string | string[]) => string[];
    fromCanonical: (value: string[]) => string | string[];
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
      $basis: (value: unknown): value is string | Date => 
        typeof value === 'string' || value instanceof Date,
      toCanonical: (value: string | Date) => {
        if (value instanceof Date) return value;
        return new Date(value);
      },
      fromCanonical: (value: Date) => value.toISOString()
    },
    References: {
      $basis: (value: unknown): value is string | string[] => 
        typeof value === 'string' || Array.isArray(value),
      toCanonical: (value: string | string[]) => {
        if (Array.isArray(value)) return value;
        return [value];
      },
      fromCanonical: (value: string[]) => value.length === 1 ? value[0] : value
    }
  }
});
```
