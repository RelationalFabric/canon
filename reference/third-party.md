# Third-Party Libraries and Dependencies

This document catalogs the third-party libraries and dependencies used in the `@relational-fabric/canon` package, organized by category and purpose.

## Core Dependencies

### TypeScript Configuration
- **@tsconfig/node-lts** (`^20.0.0`) - Base TypeScript configuration for Node.js LTS
  - Provides modern TypeScript settings optimized for Node.js LTS
  - Used as foundation for `tsconfig.base.json`
  - Ensures compatibility with current Node.js LTS features

### ESLint Configuration
- **@antfu/eslint-config** (`^3.0.0`) - Opinionated ESLint configuration
  - Modern, comprehensive ESLint setup with TypeScript support
  - Includes automatic fixing capabilities
  - Provides consistent code style and quality rules
  - Used as base for the abstracted ESLint configuration

### Utility Libraries
- **defu** (`^6.1.4`) - Object merging utility
  - Enables deep merging of configuration objects
  - Used in ESLint configuration abstraction for custom option merging
  - Provides type-safe object merging capabilities

## Development Dependencies

### Documentation Tools
- **adr-tools** (`^2.0.4`) - Architecture Decision Record management
  - Command-line tool for creating and managing ADRs
  - Provides `adr:new`, `adr:list`, and `adr:index` scripts
  - Enables structured decision documentation

### Core Development Tools
- **eslint** (`^9.10.0`) - JavaScript/TypeScript linter
  - Required peer dependency for ESLint configuration
  - Used for code quality and consistency enforcement
  - Supports modern ESLint flat config format

- **typescript** (`^5.4.0`) - TypeScript compiler
  - Required peer dependency for TypeScript support
  - Used for type checking and compilation
  - Provides modern TypeScript features and Node.js LTS compatibility

## Package Exports

The package provides the following exports for consumers:

### TypeScript Configuration
```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

### ESLint Configuration
```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'
export default createEslintConfig()
```

## Architecture Decisions

The selection and integration of these libraries is documented in the following ADRs:

- [ADR-001: TypeScript Package Setup](../docs/adrs/0001-typescript-package-setup.md)
- [ADR-002: ESLint Configuration with Antfu](../docs/adrs/0002-eslint-configuration-with-antfu.md)
- [ADR-003: Documentation Linting Inclusion](../docs/adrs/0003-documentation-linting-inclusion.md)
- [ADR-004: TypeScript Configuration Separation](../docs/adrs/0004-typescript-configuration-separation.md)
- [ADR-005: ESLint Configuration Abstraction](../docs/adrs/0005-eslint-configuration-abstraction.md)

## Version Requirements

- **Node.js**: >=18.0.0 (LTS)
- **ESLint**: ^9.0.0
- **TypeScript**: ^5.0.0

## Maintenance Notes

- All dependencies are actively maintained and regularly updated
- Peer dependencies ensure compatibility with consumer projects
- Configuration abstractions allow for easy customization while maintaining consistency
- Documentation tools are integrated into the development workflow