# Augmentable Interfaces

This document describes the augmentable interfaces that can be extended by users to add custom functionality to the utility system.

## Available Interfaces

### `Axioms` (Canon)
**Purpose**: Extend the Canon axiom system with custom domain-specific axioms.

**Usage Example**:
```typescript
// User-defined custom axiom
type CustomAxiom = Axiom<{
  $basis: Record<string, unknown>;
  key: string;
}, {
  key: string;
}>;

// Registration
declare module '@relational-fabric/canon' {
  interface Axioms {
    Custom: CustomAxiom;
  }
}

// Usage with custom axiom
function customOf<T extends Satisfies<'Custom'>>(x: T): AxiomValue<'Custom'> {
  const config = inferAxiom('Custom', x);
  return x[config.key] as AxiomValue<'Custom'>;
}
```

### `Canons` (Canon)
**Purpose**: Extend the Canon system with custom canon implementations for different data formats.

**Usage Example**:
```typescript
// User-defined custom canon
type MyCustomCanon = Canon<{
  Id: {
    $basis: { id: string };
    key: 'id';
    $meta: { type: string; required: string };
  };
  Type: {
    $basis: { type: string };
    key: 'type';
    $meta: { enum: string; discriminator: string };
  };
}>;

// Registration
declare module '@relational-fabric/canon' {
  interface Canons {
    MyCustom: MyCustomCanon;
  }
}

// Runtime registration
registerCanons({ MyCustom: myCustomCanonConfig });
```