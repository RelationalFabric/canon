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
  'dateCreated'?: JsonLdDate;
  'references'?: JsonLdReference | JsonLdReference[];
};

type JsonLdReference = {
  '@id': string;
};

type JsonLdDate = {
  '@value': string;
  '@type': 'xsd:dateTime' | 'xsd:date' | 'xsd:time';
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
    $basis: TypeGuard<JsonLdDate>;
    toCanonical: (value: JsonLdDate) => Date;
    fromCanonical: (value: Date) => JsonLdDate;
  };
  References: {
    $basis: TypeGuard<JsonLdReference | JsonLdReference[]>;
    toCanonical: (value: JsonLdReference | JsonLdReference[]) => EntityReference<string, unknown>;
    fromCanonical: (value: EntityReference<string, unknown>) => JsonLdReference | JsonLdReference[];
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
      $basis: <U extends JsonLdDate>(value: U | unknown): value is U => 
        typeof value === 'object' && value !== null && 
        '@value' in value && '@type' in value &&
        typeof (value as any)['@value'] === 'string' &&
        ['xsd:dateTime', 'xsd:date', 'xsd:time'].includes((value as any)['@type']),
      toCanonical: (value: JsonLdDate) => new Date(value['@value']),
      fromCanonical: (value: Date) => ({
        '@value': value.toISOString(),
        '@type': 'xsd:dateTime' as const
      })
    },
    References: {
      $basis: <U extends JsonLdReference | JsonLdReference[]>(value: U | unknown): value is U => 
        (typeof value === 'object' && value !== null && '@id' in value && typeof (value as any)['@id'] === 'string') ||
        (Array.isArray(value) && value.every(item => 
          typeof item === 'object' && item !== null && '@id' in item && typeof item['@id'] === 'string'
        )),
      toCanonical: (value: JsonLdReference | JsonLdReference[]) => {
        if (Array.isArray(value)) {
          return {
            ref: value[0]?.['@id'] || '',
            resolved: false
          };
        }
        return {
          ref: value['@id'],
          resolved: false
        };
      },
      fromCanonical: (value: EntityReference<string, unknown>) => {
        if (Array.isArray(value.ref)) {
          return value.ref.map(ref => ({ '@id': ref }));
        }
        return { '@id': value.ref };
      }
    }
  }
});
```
