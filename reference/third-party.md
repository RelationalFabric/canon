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
- Includes strict mode, declaration generation, and source maps
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
    'no-console': 'warn'
  }
})
```

## System Requirements

- **Node.js**: >=18.0.0 (LTS)
- **ESLint**: ^9.0.0 (peer dependency)
- **TypeScript**: ^5.0.0 (peer dependency)

## Architecture Decisions

The design and implementation of these configurations is documented in:

- [ADR-001: TypeScript Package Setup](../docs/adrs/0001-typescript-package-setup.md)
- [ADR-002: ESLint Configuration with Antfu](../docs/adrs/0002-eslint-configuration-with-antfu.md)
- [ADR-004: TypeScript Configuration Separation](../docs/adrs/0004-typescript-configuration-separation.md)
- [ADR-005: ESLint Configuration Abstraction](../docs/adrs/0005-eslint-configuration-abstraction.md)