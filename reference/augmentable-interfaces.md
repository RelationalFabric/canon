# Augmentable Interfaces

This document describes the augmentable interfaces that can be extended by users to add custom functionality to the utility system.

## Overview

Augmentable interfaces allow users to extend the core utility types with domain-specific functionality while maintaining type safety and interoperability.

## Available Interfaces

### `TypeGuard<T>`
**Purpose**: Extend type guard functionality with custom validation logic.

**Usage Example**:
```typescript
// User-defined custom type guard
interface CustomUserGuard extends TypeGuard<{ id: string; role: string }> {
  validateRole(role: string): boolean;
}

// Implementation with custom validation
const userGuard: CustomUserGuard = {
  <U extends { id: string; role: string }>(obj: U | unknown): obj is U {
    return isPojo(obj) && 
           typeof obj.id === 'string' && 
           typeof obj.role === 'string' &&
           this.validateRole(obj.role);
  },
  validateRole(role: string): boolean {
    return ['admin', 'user', 'guest'].includes(role);
  }
};

// Usage
if (userGuard(data)) {
  // data is typed as { id: string; role: string }
  console.log(data.id, data.role);
}
```

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

### `ObjectKey`
**Purpose**: Extend key type functionality with custom key validation and processing.

**Usage Example**:
```typescript
// User-defined key type with custom validation
type ValidatedKey = ObjectKey & {
  validate(key: string | number | symbol): boolean;
  normalize(key: string | number | symbol): string;
};

// Implementation
const keyValidator: ValidatedKey = {
  validate(key: string | number | symbol): boolean {
    if (typeof key === 'string') {
      return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
    }
    if (typeof key === 'number') {
      return Number.isInteger(key) && key >= 0;
    }
    if (typeof key === 'symbol') {
      return key.description !== undefined;
    }
    return false;
  },
  
  normalize(key: string | number | symbol): string {
    if (typeof key === 'string') return key;
    if (typeof key === 'number') return key.toString();
    if (typeof key === 'symbol') return key.description || 'symbol';
    return 'unknown';
  }
} as ValidatedKey;

// Usage
function processKey(key: ObjectKey): string {
  if (keyValidator.validate(key)) {
    return keyValidator.normalize(key);
  }
  throw new Error('Invalid key format');
}
```

## Extension Guidelines

1. **Maintain Compatibility**: Ensure extensions don't break existing functionality
2. **Preserve Type Safety**: Use proper TypeScript constraints and generics
3. **Document Custom Behavior**: Clearly document any custom methods or properties
4. **Test Thoroughly**: Validate extensions work with the core utility functions
5. **Follow Naming Conventions**: Use consistent naming patterns for custom methods

## Best Practices

- **Minimal Extensions**: Only add functionality that's truly needed
- **Composition Over Inheritance**: Prefer composition when possible
- **Type Guards**: Use type guards for runtime validation
- **Error Handling**: Implement proper error handling for custom methods
- **Performance**: Consider performance implications of custom extensions