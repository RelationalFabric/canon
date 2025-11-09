# ADR-006: Unbuilt TypeScript Library

- Status: accepted
- Date: 2025-01-26

## Context and Problem Statement

The package currently includes a build process that compiles TypeScript to JavaScript and generates declaration files. However, given the package's role as a meta-package providing configurations and utilities, and the need to maintain data structure consistency between the package and consumers, we need to evaluate whether a build process is necessary or beneficial.

## Decision Drivers

- Need to maintain data structure consistency between package and consumers
- Requirement for type safety and compile-time validation
- Desire to avoid serialization/deserialization issues with complex data structures
- Need to provide consumers with exact types and interfaces
- Requirement for transparent dependency management
- Need to avoid build process complexity and maintenance overhead
- Desire to provide better IDE support and debugging experience

## Considered Options

- Keep current build process (TypeScript → JavaScript + declarations)
- Remove build process and distribute TypeScript source directly
- Hybrid approach with both built and unbuilt options
- Use different build tools or configurations

## Decision Outcome

Chosen option: "Remove build process and distribute TypeScript source directly", because it provides better data structure consistency, type safety, and developer experience for a meta-package.

### Positive Consequences

- **Data Structure Consistency**: Consumers get direct access to the same objects and types used internally
- **Type Safety**: TypeScript compiler ensures compatibility at compile time, preventing runtime errors
- **No Serialization Issues**: Direct object references eliminate JSON serialization/deserialization problems
- **Transparent Dependencies**: Consumers see exactly what libraries and versions are being used
- **Better IDE Support**: Full IntelliSense, go-to-definition, and refactoring support
- **Easier Debugging**: Source code is directly accessible, no minified/obfuscated code
- **Simplified Maintenance**: No build artifacts to maintain or version
- **Version Consistency**: TypeScript ensures consumers use the exact same library versions

### Negative Consequences

- **Consumer Requirements**: Consumers must have TypeScript in their build process
- **Node.js Requirement**: Consumers need Node.js build environment
- **Slightly More Complex Setup**: Consumers need to handle TypeScript compilation
- **Source Code Exposure**: Package source code is directly accessible (though this may be a feature)

## Implementation Details

- **Remove Build Process**: Eliminate `tsc` compilation and related scripts
- **Update Package Exports**: Change exports to point to TypeScript source files
- **Update Package Files**: Include TypeScript source files instead of compiled JavaScript
- **Update Documentation**: Reflect the unbuilt approach in documentation
- **Maintain TypeScript Configuration**: Keep `tsconfig.base.json` for consumers to extend

## Package Structure Changes

**Before:**

```
dist/
  index.js
  index.d.ts
  types/
    index.js
    index.d.ts
```

**After:**

```
src/
  index.ts
  types/
    index.ts
tsconfig.base.json
```

## Dependency Management

The package uses both `dependencies` and `optionalDependencies` for utility libraries to ensure version consistency:

```json
{
  "dependencies": {
    "defu": "^6.1.4"
  },
  "optionalDependencies": {
    "defu": "^6.1.4"
  }
}
```

This modern approach ensures consumers get the exact same version used internally, preventing version conflicts and ensuring predictable behavior.

## Package.json Changes

**Exports:**

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./tsconfig": "./tsconfig.base.json",
    "./eslint": "./eslint.js"
  }
}
```

**Files:**

```json
{
  "files": ["src", "eslint.js", "tsconfig.base.json"]
}
```

## Consumer Usage

**TypeScript Configuration:**

```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

**ESLint Configuration:**

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig()
```

**Utility Libraries:**

```typescript
import { defu } from '@relational-fabric/canon'
// Direct access to the same utility used internally
```

## Links

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
