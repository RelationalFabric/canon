# AI Agent Instructions for @relational-fabric/canon

This document provides instructions for AI agents working with the Canon project. It references specific files and summarizes their content rather than repeating information.

## ⚠️ CRITICAL RULE: TypeScript `any` Type is BANNED

**THE SINGLE MOST IMPORTANT RULE:**

❌ **NEVER use the TypeScript `any` type under any circumstances.**

This is an absolute prohibition. The `any` type defeats the entire purpose of TypeScript's type system and is fundamentally incompatible with Canon's type-safe architecture.

**Exceptions (Extremely Rare):**

- Only if there is absolutely NO other way to achieve correct typing
- Must include an ESLint disable comment with detailed justification
- Requires explicit approval in code review

**Better Alternatives:**

- Use `unknown` for truly unknown types (forces type checking)
- Use generic type parameters (`<T>`)
- Use union types or discriminated unions
- Use type guards and type narrowing
- Use `Record<string, unknown>` for object types
- Use conditional types for complex scenarios

**If you find yourself reaching for `any`:**

1. Stop and reconsider the approach
2. Explore type-safe alternatives listed above
3. Ask for clarification if the type requirements are unclear
4. Only proceed with `any` if all other options are exhausted AND document why

This rule is non-negotiable and supersedes all other considerations.

---

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

1. **[Project README](./)** - Project overview, installation, and quick start
2. **[docs/axioms.md](./docs/axioms.md)** - Fundamental building blocks and type system
3. **[docs/canons.md](./docs/canons.md)** - Universal type blueprints and implementation patterns
4. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Conventions, naming patterns, and development workflow

## Core Concepts

### Axioms

Axioms are atomic building blocks that enable lazy typing and adaptability. They define semantic concepts (like ID, type, version) that can be found in different data structures. See [docs/axioms.md](./docs/axioms.md) for the complete type system architecture.

### Canons

Canons are universal type blueprints that implement axioms for specific data formats. Multiple canons can exist simultaneously, each representing different formats, but they all implement the same semantic concepts. See [docs/canons.md](./docs/canons.md) for implementation patterns.

### Core Axioms

The system includes five essential axioms: Id, Type, Version, Timestamps, and References. See [docs/reference/axioms.md](./docs/reference/axioms.md) for detailed specifications.

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

- **❌ NEVER use the TypeScript `any` type** (see Critical Rule above)
- All code must pass `npm run check:all:fix` validation (linting, type checking, and tests)
- Follow the established patterns in [src/](./src/) directory
- Prefer `unknown` over `any` for truly unknown types
- Use type guards and type narrowing for type safety

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
- **[docs/reference/](./docs/reference/)** - API reference and core axiom specifications
- **[docs/adrs/](./docs/adrs/)** - Architecture Decision Records

### Examples & Tests

- **[examples/](./examples/)** - Integration examples showing real-world usage patterns
- **[docs/examples/](./docs/examples/)** - Documentation examples of core axioms in practice
- **[TESTING.md](./TESTING.md)** - Complete testing strategy and guidelines

## Available Scripts

Use these npm scripts for development tasks:

### Development & Quality

- `npm run check:types` - Run TypeScript type checking only
- `npm run check:lint` - Run ESLint checks only
- `npm run check:lint:fix` - Fix ESLint issues automatically
- `npm run check:test` - Run tests only
- `npm run check:radar` - Validate radar configuration
- `npm run check:all` - Run all checks (lint, types, tests)
- `npm run check:all:fix` - Run all checks (lint:fix, types, tests)
- `npm run checks` - Alias for check:all

### Development

- `npm run dev` - Run TypeScript in watch mode

### Testing

- `npm test` - Run all unit tests (npm standard, alias for check:test)
- `npm run check:test` - Run all unit tests (Vitest in-source tests, includes examples)

### Documentation

- `npm run build:docs` - Build documentation for production (with automatic file renaming)
- `npm run build:docs:restore` - Manually restore README.md files from index.md

### ADR Management

- `cd docs/adrs && npx adr new "Title"` - Create a new ADR
- `npm run build:adr` - Build all ADR artifacts (TOC + index)
- `npm run build:adr:toc` - Generate table of contents (in ADR directory)
- `npm run build:adr:index` - Generate ADR index in documentation

### Radar Management

- `npm run build:radar` - Convert YAML radar data to CSV

### Examples

- `npm run build:docs:examples` - Generate documentation from examples

## Build Process and File Naming

### CRITICAL: Documentation Build Process

**The documentation build process uses a GitHub-first approach with build-time file renaming.**

The documentation system follows a specific process to maintain GitHub compatibility while enabling VitePress routing:

1. **Source Repository**: All documentation files use `README.md` naming for GitHub compatibility
2. **Build Process**: During build, `README.md` files are temporarily renamed to `index.md` for VitePress routing
3. **Post-Build**: Files are automatically restored to `README.md` naming for GitHub editing

### File Naming Rules for Documentation

**Repository State (GitHub-Compatible):**

- ✅ **Always edit**: `README.md` files in the repository (GitHub-first approach)
- ✅ **Main entry**: `docs/index.md` - VitePress entry point (never renamed)
- ✅ **Subdirectories**: Use `README.md` for all subdirectory documentation

**Build State (VitePress-Compatible):**

- ✅ **During build**: `README.md` → `index.md` in subdirectories only
- ✅ **VitePress routing**: `/adrs/` maps to `docs/adrs/index.md` (after rename)
- ✅ **Main entry**: `docs/index.md` remains unchanged

**Post-Build State (GitHub-Compatible):**

- ✅ **After build**: `index.md` → `README.md` in subdirectories (restored)
- ❌ **Never manually rename**: Let the build scripts handle file renaming
- ❌ **Never commit**: `index.md` files in subdirectories (except `docs/index.md`)

### Documentation Build Scripts

- `npm run build:docs` - Complete build process with automatic file renaming
- `npm run build:docs:restore` - Manually restore files if needed after build

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
- **If you see index.md files, run `npm run build:docs:restore` before editing**

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

- **❌ NEVER use `any`** - This is the cardinal sin of TypeScript (see Critical Rule above)
- Always use `Satisfies<T>` constraint for axiom functions
- Use proper TypeScript types in `$basis` fields
- Provide complete function signatures with return types
- Prefer `unknown` and type guards over `any`
- Use generic type parameters for flexible, type-safe code

### Error Handling

- Provide clear error messages for invalid configurations
- Use TypeScript's type system to catch errors at compile time
- Document expected behavior and error conditions

## Common Tasks

### Adding a New Axiom

1. Define the axiom type following patterns in [docs/reference/axioms.md](./docs/reference/axioms.md)
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

### Testing Strategy

Canon uses [Vitest's in-source testing](https://vitest.dev/guide/in-source) pattern:

**Critical Testing Rules:**

- ❌ **Do NOT create separate `.test.ts` files** - Use in-source tests with `if (import.meta.vitest)`
- ❌ **Do NOT use relative imports in examples** - Always use `@relational-fabric/canon`
- ✅ **DO colocate tests** with source files using in-source pattern
- ✅ **DO use package imports** in all example files to show real-world usage

See [TESTING.md](./TESTING.md) for complete testing documentation.

### Quality Standards

- All code must pass `npm run check:all` before merging PRs (validates linting, type checking, and tests)
- Examples must use package imports, not relative paths
- Test across different data formats to ensure compatibility

## Getting Help

- Review existing [examples](./docs/examples/) for implementation patterns
- Check ADR directory for architectural context
- Follow the established conventions in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Use the provided npm scripts for development tasks

## Important Notes

- **❌ NEVER use the TypeScript `any` type** - This is the #1 most important rule (see Critical Rule section)
- **Never use `$` prefix for user-defined keys** - this is reserved for Canon's internal use
- **Always provide both type-level and runtime configurations** for canons
- **Use the `Satisfies` constraint** to ensure compile-time type checking
- **Register axioms and canons early** in the application lifecycle
- **Follow the established naming conventions** for consistency
- **❌ Do NOT create summary files** (e.g., IMPLEMENTATION_SUMMARY.md, WORKFLOW_SUMMARY.md) - use the chat for feedback instead
- **❌ Do NOT write extraneuos documentation files** unless explicitly requested by the user

This project emphasizes type safety, consistency, and universal compatibility across different data formats. When in doubt, refer to the existing patterns and documentation rather than creating new approaches.
