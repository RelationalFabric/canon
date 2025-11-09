# Third-Party Libraries and Dependencies

This document catalogs the third-party libraries that consumers can leverage when using the `@relational-fabric/canon` package configurations.

## Required Peer Dependencies

When using `@relational-fabric/canon`, consumers must install these peer dependencies:

### TypeScript

- **typescript** (`^5.0.0`) - TypeScript compiler
  - Required for TypeScript configuration support
  - Provides type checking and compilation capabilities
  - Must be installed as a peer dependency

### ESLint

- **eslint** (`^9.0.0`) - JavaScript/TypeScript linter
  - Required for ESLint configuration support
  - Used for code quality and consistency enforcement
  - Must be installed as a peer dependency

## Available Configurations

The package provides the following configurations for consumers:

### TypeScript Configuration

```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

- Extends `@tsconfig/node-lts` with additional modern TypeScript settings
- Includes strict mode and modern TypeScript features
- Optimized for Node.js LTS environments

### ESLint Configuration

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'
export default createEslintConfig()
```

- Based on `@antfu/eslint-config` with TypeScript and Node.js support
- Supports custom configuration merging
- Includes automatic fixing capabilities

### Custom ESLint Configuration

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'
export default createEslintConfig({
  ignores: ['custom-ignore'],
  rules: {
    'no-console': 'warn',
  },
})
```

## Available Utilities

The package provides utility libraries through a dual export strategy, offering both opinionated and transparent access patterns.

### Opinionated Access (Recommended)

```typescript
import { createEslintConfig, mergeConfigs } from '@relational-fabric/canon'
// Curated, opinionated selection with our preferred naming and API shape
```

### Transparent Access (Advanced)

```typescript
import antfu from '@relational-fabric/canon/_/antfu'
import { defu } from '@relational-fabric/canon/_/defu'
// Direct access to third-party libraries with original API contracts preserved
```

### Available Utilities

**Object Merging:**

- **Opinionated**: `mergeConfigs` (wrapper function)
- **Transparent**: `defu` (direct re-export)

**ESLint Configuration:**

- **Opinionated**: `createEslintConfig` (wrapper function)
- **Transparent**: `antfu` (direct re-export)

**Version Management**: The package uses both `dependencies` and `optionalDependencies` to ensure consumers get the exact same version used internally, preventing version conflicts and ensuring predictable behavior.

## System Requirements

- **Node.js**: >=22.0.0 (Active LTS)
- **ESLint**: ^9.0.0 (peer dependency)
- **TypeScript**: ^5.0.0 (peer dependency)

## Architecture Decisions

The design and implementation of these configurations is documented in:

- [ADR-001: TypeScript Package Setup](../docs/adrs/0001-typescript-package-setup.md)
- [ADR-002: ESLint Configuration with Antfu](../docs/adrs/0002-eslint-configuration-with-antfu.md)
- [ADR-004: TypeScript Configuration Separation](../docs/adrs/0004-typescript-configuration-separation.md)
- [ADR-005: ESLint Configuration Abstraction](../docs/adrs/0005-eslint-configuration-abstraction.md)
