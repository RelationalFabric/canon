# AI Agent Instructions for @relational-fabric/canon

This document provides instructions for AI agents working with the Canon project. It references specific files and summarizes their content rather than repeating information.

## Project Overview

Canon is a modern TypeScript package that provides universal type primitives and axiomatic systems for building robust, data-centric applications. It solves the "empty room problem" by offering consistent design decisions and type blueprints that can be shared across projects.

**Key Features:**
- Universal type primitives from the TypeScript ecosystem
- Canonical type definitions for consistent data models
- Axiomatic system for rich configuration
- Lazy typing with canonical identity preservation
- Support for multiple data formats (JSON-LD, MongoDB, REST APIs)
- **Curated library ecosystem** - Provides a known good set of libraries and modules as a canonical starting point
- **Canonical APIs** - Standardized interfaces for categories of data structures with sensible defaults when choice is available

## Essential Reading Order

Before making any changes, read these documents in order:

1. **[README.md](./README.md)** - Project overview, installation, and quick start
2. **[docs/axioms.md](./docs/axioms.md)** - Fundamental building blocks and type system
3. **[docs/canons.md](./docs/canons.md)** - Universal type blueprints and implementation patterns
4. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Conventions, naming patterns, and development workflow

## Core Concepts

### Axioms
Axioms are atomic building blocks that enable lazy typing and adaptability. They define semantic concepts (like ID, type, version) that can be found in different data structures. See [docs/axioms.md](./docs/axioms.md) for the complete type system architecture.

### Canons
Canons are universal type blueprints that implement axioms for specific data formats. Multiple canons can exist simultaneously, each representing different formats, but they all implement the same semantic concepts. See [docs/canons.md](./docs/canons.md) for implementation patterns.

### Core Axioms
The system includes five essential axioms: Id, Type, Version, Timestamps, and References. See [reference/axioms.md](./reference/axioms.md) for detailed specifications.

### Canonical Data Structures
Canon provides standardized types and APIs for working with data structures, recognizing that in many cases you won't have the opportunity to choose the underlying data structures:
- **Universal type primitives** - Battle-tested types from the TypeScript ecosystem
- **Canonical APIs** - Standardized interfaces for categories of data structures
- **Sensible defaults** - Recommended choices when you do have the opportunity to select data structures
- **Type-safe operations** - Proven patterns for data manipulation and validation
- **Cross-format compatibility** - APIs that work across different data sources and structures

## Development Guidelines

### Naming Conventions
Follow the conventions outlined in [CONTRIBUTING.md](./CONTRIBUTING.md):

- **Axiom Keys**: PascalCase, plural for general concepts (`Timestamps`, `References`), singular for specific concepts (`Id`, `Type`)
- **Function Names**: Use relational `*Of` pattern (`idOf()`, `typeOf()`) not imperative `get*` patterns
- **Type Names**: PascalCase for all type definitions
- **Variables**: camelCase for all variables and parameters
- **Distinguished Keys**: Use `$` prefix only for Canon's internal keys (`$basis`, `$meta`)

### Code Quality Standards
- All code must pass ESLint checks (see [eslint.config.js](./eslint.config.js))
- TypeScript compilation must succeed (see [tsconfig.json](./tsconfig.json))
- Follow the established patterns in [src/](./src/) directory

### Architecture Decisions
Before making significant changes, review the [Architecture Decision Records (ADRs)](./docs/adrs.md). These documents capture important architectural decisions and provide context for current design choices.

## File Structure Reference

### Core Implementation
- **[src/index.ts](./src/index.ts)** - Main package exports
- **[src/types/index.ts](./src/types/index.ts)** - Type definitions (currently empty)

### Configuration Files
- **[package.json](./package.json)** - Package configuration, dependencies, and scripts
- **[tsconfig.json](./tsconfig.json)** - TypeScript configuration extending base config
- **[tsconfig.base.json](./tsconfig.base.json)** - Base TypeScript configuration
- **[eslint.config.js](./eslint.config.js)** - ESLint configuration using the abstracted config
- **[eslint.js](./eslint.js)** - Abstracted ESLint configuration function

### Documentation
- **[docs/](./docs/)** - Core documentation including axioms, canons, and examples
- **[reference/](./reference/)** - API reference and core axiom specifications
- **[docs/adrs/](./docs/adrs/)** - Architecture Decision Records

### Examples
- **[docs/examples/](./docs/examples/)** - Comprehensive examples of core axioms in practice

## Available Scripts

Use these npm scripts for development tasks:

- `npm run check` - Type check and lint the package
- `npm run dev` - Run TypeScript in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run adr:new "Title"` - Create a new ADR
- `npm run adr:list` - List all ADRs
- `npm run adr:index` - Generate ADR table of contents (in ADR directory)

## Build Process and File Naming

### CRITICAL: Documentation Build Process

**The documentation build process uses a GitHub-first approach with build-time file renaming.**

The documentation system follows a specific process to maintain GitHub compatibility while enabling VitePress routing:

1. **Source Repository**: All documentation files use `README.md` naming for GitHub compatibility
2. **Build Process**: During build, `README.md` files are temporarily renamed to `index.md` for VitePress routing
3. **Post-Build**: Files are automatically restored to `README.md` naming for GitHub editing

### File Naming Rules for Documentation

- ✅ **Always edit**: `README.md` files in the repository (GitHub-first approach)
- ✅ **Build process**: Automatically renames `README.md` → `index.md` during VitePress build
- ✅ **Post-build**: Automatically renames `index.md` → `README.md` after build completes
- ❌ **Never manually rename**: Let the build scripts handle file renaming
- ❌ **Never commit**: `index.md` files (except `docs/index.md` which is the main entry point)

### Documentation Build Scripts

- `npm run docs:build` - Complete build process with automatic file renaming
- `npm run docs:restore` - Manually restore files if needed after build
- `npm run docs:dev` - Development server (no file renaming needed)

### ADR Documentation Process

**The ADR README update is independent of the main documentation build process.**

1. **Repository contains**: `docs/adrs/README.md` - This is the source file that should be committed
2. **Script updates**: The `scripts/generate-adr-index.js` script updates the ADR table in `README.md`
3. **No index.md files**: There are no `index.md` files created or needed for ADRs

### Important Notes for AI Agents

- **Always work with README.md files** in the source repository
- **Never manually rename files** - the build process handles this automatically
- **The repository structure must remain GitHub-compatible** at all times
- **VitePress routing is handled at build time only**
- **If you see index.md files, run `npm run docs:restore` before editing**

## Key Patterns to Follow

### Module Augmentation
Always use the `declare module '@relational-fabric/canon'` pattern for registering axioms and canons:

```typescript
declare module '@relational-fabric/canon' {
  interface Axioms {
    MyAxiom: MyAxiomType
  }
  interface Canons {
    MyCanon: MyCanonType
  }
}
```

### Type Safety
- Always use `Satisfies<T>` constraint for axiom functions
- Use proper TypeScript types in `$basis` fields
- Provide complete function signatures with return types

### Error Handling
- Provide clear error messages for invalid configurations
- Use TypeScript's type system to catch errors at compile time
- Document expected behavior and error conditions

## Common Tasks

### Adding a New Axiom
1. Define the axiom type following patterns in [reference/axioms.md](./reference/axioms.md)
2. Register it in the `Axioms` interface using module augmentation
3. Provide API functions following the `*Of` naming pattern
4. Update documentation with examples

### Adding a New Canon
1. Choose between Declarative Style (local) or Module Style (shareable) as described in [docs/canons.md](./docs/canons.md)
2. Define both type-level and runtime configurations
3. Register the canon following established patterns
4. Test with multiple data formats

### Creating Documentation
1. Start with Prerequisites section directing readers to foundational documents
2. Use clear examples showing complete, working code
3. Avoid redundant explanations - reference previous code blocks
4. Link to foundational documents (axioms before canons)

## Dependencies and Requirements

### Peer Dependencies
- Node.js: 22.0.0 or higher
- TypeScript: 5.0.0 or higher
- ESLint: 9.0.0 or higher

### Key Dependencies
- `@antfu/eslint-config` - ESLint configuration
- `@tsconfig/node-lts` - TypeScript base configuration
- `defu` - Configuration merging utility
- `adr-tools` - Architecture Decision Record management

## Integration Points

Canon is designed to compose with existing TypeScript libraries and provides a curated ecosystem of known good libraries:

### Core Library Ecosystem
- **type-fest** & **ts-essentials** - For utility types
- **uuid** & **nanoid** - For identity generation
- **object-hash** - For content-based hashing
- **immutable.js** - For immutable data structures

### Canonical Starting Point
Canon serves as a **canonical starting point** by providing:
- **Pre-configured TypeScript setup** - Base configurations that work out of the box
- **Curated dependency set** - Known good versions of essential libraries
- **Standardized patterns** - Consistent approaches to common problems
- **Best practice implementations** - Proven solutions for type safety and data handling
- **Canonical APIs** - Standardized interfaces that work across different data structures
- **Sensible defaults** - Recommended choices when you have the opportunity to select data structures

This curated approach ensures that developers have a solid foundation to build upon, reducing decision fatigue and providing confidence in the chosen technology stack, while recognizing that in many real-world scenarios you must work with existing data structures rather than choosing new ones.

## Testing and Quality Assurance

- All code must pass ESLint checks
- TypeScript compilation must succeed
- Documentation code examples must be properly formatted
- Test across different data formats to ensure compatibility

## Getting Help

- Review existing [examples](./docs/examples/) for implementation patterns
- Check ADR directory for architectural context
- Follow the established conventions in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Use the provided npm scripts for development tasks

## Important Notes

- **Never use `$` prefix for user-defined keys** - this is reserved for Canon's internal use
- **Always provide both type-level and runtime configurations** for canons
- **Use the `Satisfies` constraint** to ensure compile-time type checking
- **Register axioms and canons early** in the application lifecycle
- **Follow the established naming conventions** for consistency

This project emphasizes type safety, consistency, and universal compatibility across different data formats. When in doubt, refer to the existing patterns and documentation rather than creating new approaches.
