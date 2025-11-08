# ADR-008: Dual Export Strategy

- Status: accepted
- Date: 2025-01-26

## Context and Problem Statement

The package needs to provide utility libraries to consumers while maintaining both opinionated and transparent usage patterns. We need to balance convenience (opinionated API) with flexibility (direct access to third-party libraries) while preserving original library contracts and avoiding naming conflicts.

## Decision Drivers

- Need to provide both opinionated and transparent access to utilities
- Requirement to preserve original library API contracts (especially default exports)
- Desire to avoid naming conflicts between different libraries
- Need to separate internal exports from third-party re-exports
- Requirement for clear, discoverable export patterns
- Need to maintain tsconfig and eslint as separate exports

## Considered Options

- Single index file with all exports
- Separate files for each utility library
- Namespace-based organization
- Dual export strategy with opinionated and transparent paths

## Decision Outcome

Chosen option: "Dual export strategy with opinionated and transparent paths", because it provides both convenience and flexibility while preserving library contracts.

### Positive Consequences

- **Clear Separation**: Opinionated vs transparent usage is explicit
- **Preserved Contracts**: Original library APIs remain intact
- **No Naming Conflicts**: Different export paths prevent conflicts
- **Discoverable**: Clear naming convention for different use cases
- **Flexible**: Consumers can choose their preferred approach
- **Maintainable**: Easy to add new utilities without breaking existing patterns

### Negative Consequences

- **More Complex**: Two different import patterns to document
- **Larger API Surface**: More export paths to maintain
- **Learning Curve**: Consumers need to understand the dual approach

## Implementation Details

### Package Structure

```
src/
  kit.ts              # Opinionated catalogue
  _/
    defu.ts          # Direct re-export
    antfu.ts         # Direct re-export
    typescript.ts     # Direct re-export
  types/
    index.ts         # Internal types
```

### Package Exports

```json
{
  "exports": {
    ".": {
      "types": "./src/kit.ts",
      "import": "./src/kit.ts"
    },
    "./_/*": {
      "types": "./src/_/*.ts",
      "import": "./src/_/*.ts"
    },
    "./tsconfig": "./tsconfig.base.json",
    "./eslint": "./eslint.js"
  }
}
```

### Usage Patterns

**Opinionated (kit.ts):**

```typescript
import { createEslintConfig, mergeConfigs } from '@relational-fabric/canon'
```

**Transparent (\_/):**

```typescript
import antfu from '@relational-fabric/canon/_/antfu'
import { defu } from '@relational-fabric/canon/_/defu'
```

## Naming Rationale

- **kit**: Short, clear synonym for "catalogue" without spelling ambiguity
- **\_/**: Non-word path that suggests "breaking the glass" for direct access
- **Excluded**: tsconfig and eslint maintain their own dedicated exports

## Links

- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
