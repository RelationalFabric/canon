# Augmentable Interfaces

This document describes the augmentable interfaces that can be extended by users to add custom functionality to the utility system.

## Default Values

- **Axioms**: Core axioms (Id, Type, Version, Timestamps, References)
- **Canons**: None by default
- **NativeTypes**: None by default

## Available Interfaces

### `Axioms` (Canon)
**Purpose**: Extend the Canon axiom system with custom domain-specific axioms.

**Usage Example**:
```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    MyAxiom: Axiom</* definition */>;
  }
}
```

### `Canons` (Canon)
**Purpose**: Extend the Canon system with custom canon implementations for different data formats.

**Usage Example**:
```typescript
declare module '@relational-fabric/canon' {
  interface Canons {
    MyCanon: Canon</* definition */>;
  }
}
```

### `NativeTypes`
**Purpose**: Define native type mappings for different data sources, mapping source labels to their internal type unions.

**Usage Example**:
```typescript
declare module '@relational-fabric/canon' {
  interface NativeTypes {
    'ES5': Date | RegExp;
    'ES2015': Map<unknown, unknown> | Set<unknown> | WeakMap<object, unknown> | WeakSet<object> | ArrayBuffer | DataView;
    'ES2017': Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
    'ES2020': BigInt64Array | BigUint64Array;
  }
}
```