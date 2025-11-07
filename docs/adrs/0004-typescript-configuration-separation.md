# ADR-004: TypeScript Configuration Separation

- Status: accepted
- Date: 2025-01-26

## Context and Problem Statement

The TypeScript configuration was initially contained in a single `tsconfig.json` file. To make the package more useful for consumers and allow for better configuration management, we needed to separate the configuration into a base configuration that could be shared and a project-specific configuration.

## Decision Drivers

- Need to provide reusable TypeScript configuration for consumers
- Desire to separate shared configuration from project-specific settings
- Requirement for easy consumption by other packages
- Need to maintain consistency across related projects
- Desire to reduce configuration duplication
- Need for clear separation of concerns

## Considered Options

- Keep single tsconfig.json file
- Create separate base configuration file
- Use multiple configuration files with different purposes
- Create configuration package as separate npm package

## Decision Outcome

Chosen option: "Create separate base configuration file", because it provides a clean separation between shared and project-specific configuration while keeping everything in the same package.

### Positive Consequences

- Consumers can easily extend the base configuration
- Clear separation between shared and project-specific settings
- Base configuration can be exported and reused
- Easier maintenance of configuration
- Follows common patterns in TypeScript packages
- Reduces configuration duplication across projects

### Negative Consequences

- Slightly more complex file structure
- Need to maintain two configuration files
- Consumers need to understand the separation

## Implementation Details

- **Base configuration**: `tsconfig.base.json` with shared settings
- **Project configuration**: `tsconfig.json` extends base and adds project-specific settings
- **Package exports**: `"./tsconfig": "./tsconfig.base.json"`
- **Files included**: `tsconfig.base.json` in package files
- **Base settings**: Modern TypeScript features, Node.js LTS compatibility, declarations, source maps
- **Project settings**: Source directory, output directory, include/exclude patterns

## Usage Examples

**For consumers:**

```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

**For the package:**

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

## Links

- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [@tsconfig/node-lts](https://www.npmjs.com/package/@tsconfig/node-lts)
