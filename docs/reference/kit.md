# Canon Kit & Third-Party Utilities

The Canon Kit is the curated, opinionated surface exposed from the default `@relational-fabric/canon` entry point. It highlights the third-party tooling we endorse while still allowing transparent access to the underlying libraries.

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

## Kit Configuration Exports

The Kit provides the following configuration helpers for consumers:

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

## Kit Utility Catalog

The Kit provides utility libraries through a dual export strategy, offering both opinionated and transparent access patterns.

### Opinionated Access (Recommended)

```typescript
import { createEslintConfig, defu, parseYaml } from '@relational-fabric/canon'
// Curated Canon Kit selection with our preferred API surface
```

### Transparent Access (Advanced)

```typescript
import antfu from '@relational-fabric/canon/_/antfu'
import { defu } from '@relational-fabric/canon/_/defu'
import * as yaml from '@relational-fabric/canon/_/yaml'
// Direct access to third-party libraries with original API contracts preserved
```

### Available Utilities

**Object Merging:**

- **Opinionated**: `defu` (curated re-export available from the main entry point)
- **Transparent**: `defu` (direct re-export via `_` path)

**ESLint Configuration:**

- **Opinionated**: `createEslintConfig` (wrapper function)
- **Transparent**: `antfu` (direct re-export)

**YAML Processing:**

- **Opinionated**: `parseYaml` (alias for `yaml.parse`)
- **Transparent**: `@relational-fabric/canon/_/yaml` (direct access to all `yaml` exports)

**Version Management**: The package uses both `dependencies` and `optionalDependencies` to ensure consumers get the exact same version used internally, preventing version conflicts and ensuring predictable behavior.

## System Requirements

- **Node.js**: >=22.0.0 (Active LTS)
- **ESLint**: ^9.0.0 (peer dependency)
- **TypeScript**: ^5.0.0 (peer dependency)

## Architecture Decisions

The design and implementation of these configurations is documented in:

- [ADR-001: TypeScript Package Setup](../adrs/0001-typescript-package-setup.md)
- [ADR-002: ESLint Configuration with Antfu](../adrs/0002-eslint-configuration-with-antfu.md)
- [ADR-004: TypeScript Configuration Separation](../adrs/0004-typescript-configuration-separation.md)
- [ADR-005: ESLint Configuration Abstraction](../adrs/0005-eslint-configuration-abstraction.md)
