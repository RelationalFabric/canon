# Augmentable Interfaces

This document describes the augmentable interfaces that can be extended by users to add custom functionality to the utility system.

## Available Interfaces

### `Pojo`
**Purpose**: Extend POJO functionality with domain-specific methods and properties.

**Usage Example**:
```typescript
// User-defined domain-specific POJO
interface UserEntity extends Pojo {
  id: string;
  name: string;
  email: string;
  
  // Custom methods
  getDisplayName(): string;
  isActive(): boolean;
  updateLastLogin(): void;
}

// Implementation
class User implements UserEntity {
  [key: ObjectKey]: unknown;
  
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public isActive: boolean = true,
    public lastLogin?: Date
  ) {}
  
  getDisplayName(): string {
    return `${this.name} (${this.email})`;
  }
  
  isActive(): boolean {
    return this.isActive;
  }
  
  updateLastLogin(): void {
    this.lastLogin = new Date();
  }
}
```

### `PojoWith<K>`
**Purpose**: Extend POJO functionality with specific key constraints and custom behavior.

**Usage Example**:
```typescript
// User-defined POJO with specific keys and custom methods
interface ConfigEntity extends PojoWith<'name' | 'value' | 'type'> {
  name: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'object';
  
  // Custom validation
  validate(): boolean;
  getTypedValue(): string | number | boolean | object;
}

// Implementation
class Config implements ConfigEntity {
  [key in 'name' | 'value' | 'type']: unknown;
  
  constructor(
    public name: string,
    public value: unknown,
    public type: 'string' | 'number' | 'boolean' | 'object'
  ) {}
  
  validate(): boolean {
    switch (this.type) {
      case 'string': return typeof this.value === 'string';
      case 'number': return typeof this.value === 'number';
      case 'boolean': return typeof this.value === 'boolean';
      case 'object': return isPojo(this.value);
      default: return false;
    }
  }
  
  getTypedValue(): string | number | boolean | object {
    if (!this.validate()) {
      throw new Error(`Invalid value for type ${this.type}`);
    }
    return this.value as string | number | boolean | object;
  }
}
```

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