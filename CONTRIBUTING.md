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

## Development Workflow

<!-- TODO: Add development workflow information -->

## Testing

<!-- TODO: Add testing guidelines -->

## Code Review

<!-- TODO: Add code review guidelines -->

## Release Process

<!-- TODO: Add release process information -->

## Community Guidelines

<!-- TODO: Add community guidelines -->

## Questions?

If you have questions about these conventions or need clarification, please open an issue or start a discussion in the project repository.
