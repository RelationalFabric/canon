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