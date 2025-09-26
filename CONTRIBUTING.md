# Contributing to Canon

Thank you for your interest in contributing to Canon! This document outlines the conventions and guidelines for contributing to the project.

## Conventions

### Naming Conventions

#### Axiom Keys
- Use **PascalCase** for axiom keys: `Id`, `Type`, `Version`, `Timestamps`, `References`
- Use **plural form** for general concepts that can contain multiple values: `Timestamps` (not `Timestamp`), `References` (not `Reference`)
- Use **singular form** for specific concepts that represent a single value: `Id`, `Type`, `Version`

#### Function Names
- Use **relational `*Of` pattern** for axiom functions: `idOf()`, `typeOf()`, `timestampsOf()`, `referencesOf()`
- Avoid imperative `get*` patterns: use `idOf()` not `getId()`
- Use **camelCase** for utility functions: `inferAxiom()`, `declareCanon()`

#### Type Names
- Use **PascalCase** for type definitions: `KeyNameAxiom`, `RepresentationAxiom`
- Use **PascalCase** for canon types: `InternalCanon`, `JsonLdCanon`, `MongoCanon`
- Use **PascalCase** for utility types: `Satisfies`, `AxiomValue`, `CanonDefinition`

#### Variable Names
- Use **camelCase** for variables: `internalData`, `jsonLdData`, `mongoData`
- Use **camelCase** for function parameters: `entity`, `value`, `config`
- Use **camelCase** for local variables: `currentVersion`, `latestEntity`

### Distinguished Keys Convention

- Use `$` prefix for keys that Canon understands and has specific behaviors for
- These are **distinguished keys** that have special meaning to the Canon system
- Examples: `$basis`, `$meta` - these are reserved and have defined behaviors
- **Never use `$` prefix for user-defined keys** - this is reserved for Canon's internal use

### Documentation Conventions

#### Document Structure
- Start with **Prerequisites** section directing readers to foundational documents
- Use **clear examples** that show complete, working code
- Avoid **redundant explanations** of the same concepts
- Reference **previous code blocks** instead of repeating them

#### Code Examples
- Show **complete examples** with both type-level and runtime definitions
- Use **realistic scenarios** (internal vs external data formats)
- Avoid **domain-specific examples** (use format-specific examples instead)
- Include **usage examples** that demonstrate the value proposition

#### Cross-References
- Link to **foundational documents** (axioms before canons)
- Use **descriptive link text** that explains what readers will learn
- Avoid **circular references** between documents

### TypeScript Conventions

#### Type Safety
- Always use `Satisfies<T>` constraint for axiom functions
- Use proper TypeScript types in `$basis` fields
- Provide complete function signatures with return types
- Use generic constraints appropriately

#### Module Augmentation
- Always use `declare module '@relational-fabric/canon'` pattern
- Register axioms in the `Axioms` interface
- Register canons in the `Canons` interface
- Use consistent module augmentation patterns

#### Error Handling
- Provide clear error messages for invalid configurations
- Use TypeScript's type system to catch errors at compile time
- Document expected behavior and error conditions

## Architecture Decision Records (ADRs)

Before making significant changes to the project architecture, please read the existing [Architecture Decision Records (ADRs)](./docs/adrs/README.md). ADRs document important architectural decisions and provide context for why certain choices were made.

### Creating New ADRs

When making architectural decisions that affect the project structure, configuration, or major features:

1. **Read existing ADRs** to understand current decisions and context
2. **Create a new ADR** using the template in `docs/adrs/template.md`
3. **Follow the ADR format** with clear context, decision drivers, and consequences
4. **Update the ADR index** in `docs/adrs/README.md`
5. **Reference related ADRs** when applicable

### ADR Lifecycle

- **Proposed** - Decision is under consideration
- **Accepted** - Decision has been made and implemented
- **Deprecated** - Decision is no longer recommended
- **Superseded** - Decision has been replaced by a newer ADR

## Development Workflow

### Prerequisites

- Node.js 18+ (see [ADR-001](./docs/adrs/0001-typescript-package-setup.md))
- TypeScript 5.4+
- ESLint 9+ (see [ADR-002](./docs/adrs/0002-eslint-configuration-with-antfu.md))

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run checks: `npm run check`
4. Build the package: `npm run build`

### Code Quality

- All code must pass ESLint checks: `npm run lint`
- TypeScript compilation must succeed: `npm run check`
- Documentation code examples must be properly formatted (see [ADR-003](./docs/adrs/0003-documentation-linting-inclusion.md))

## Testing

<!-- TODO: Add testing guidelines -->

## Code Review

### Review Checklist

- [ ] Code follows established conventions
- [ ] TypeScript types are properly defined
- [ ] ESLint passes without errors
- [ ] Documentation is updated if needed
- [ ] ADRs are created for architectural changes
- [ ] Code examples in documentation are valid and formatted

## Release Process

<!-- TODO: Add release process information -->

## Community Guidelines

<!-- TODO: Add community guidelines -->

## Questions?

If you have questions about these conventions or need clarification, please open an issue or start a discussion in the project repository.
