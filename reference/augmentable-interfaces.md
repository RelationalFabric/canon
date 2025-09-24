# Augmentable Interfaces

This document describes the augmentable interfaces that can be extended by users to add custom functionality to the utility system.

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
    'Date': Date;
    'RegExp': RegExp;
    'Map': Map<unknown, unknown>;
    'Set': Set<unknown>;
    'WeakMap': WeakMap<object, unknown>;
    'WeakSet': WeakSet<object>;
    'ArrayBuffer': ArrayBuffer;
    'DataView': DataView;
    'Int8Array': Int8Array;
    'Uint8Array': Uint8Array;
    'Uint8ClampedArray': Uint8ClampedArray;
    'Int16Array': Int16Array;
    'Uint16Array': Uint16Array;
    'Int32Array': Int32Array;
    'Uint32Array': Uint32Array;
    'Float32Array': Float32Array;
    'Float64Array': Float64Array;
    'BigInt64Array': BigInt64Array;
    'BigUint64Array': BigUint64Array;
  }
}
```