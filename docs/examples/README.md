# Examples

This directory contains practical examples demonstrating how to use the @relational-fabric/canon package and its configurations.

## Available Examples

### [01-basic-id-axiom](./01-basic-id-axiom.ts)
Example: Basic Id Axiom Usage

**Key Concepts:**
- Define canons for each data format you work with (internal, JSON-LD, etc.)
- Use universal functions like idOf() that work across all formats
- Write your business logic once - it works with any registered canon
- Add new formats anytime without changing existing code
- Use Canon's utility functions (pojoHasString, isPojo) for clean type guards

**Pattern:** Declarative canon registration

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/01-basic-id-axiom.ts)

### [02-module-style-canon](./02-module-style-canon)
Module-Style Canon Example

**Pattern:** Module-style canon definition

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon)

**Files:**
- [mongodb-canon](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon/mongodb-canon.ts) - MongoDB Canon Module
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon/usage.ts) - Using the MongoDB Canon Module

## Example Patterns

The examples demonstrate two main patterns for working with Canon:

### Declarative Style (01-basic-id-axiom)
- **Use case**: Internal, app-specific canons
- **Pattern**: Define and register canons directly in your application
- **Benefits**: Simple, direct, perfect for internal use
- **Example**: `declareCanon('Internal', { ... })`

### Module Style (02-module-style-canon)
- **Use case**: Shared, reusable canons
- **Pattern**: Define canons in separate modules, register when needed
- **Benefits**: Reusable, testable, composable, versionable
- **Example**: `defineCanon({ ... })` + `registerCanons({ ... })`

## Getting Started

Each example includes:
- **Complete code samples** with full TypeScript typing
- **Step-by-step explanations** of the implementation
- **Best practices** and common pitfalls to avoid
- **Integration examples** showing how to use with the canon configurations
- **Live source code** linked directly to GitHub

## Prerequisites

Before running these examples, ensure you have:

- Node.js 22.0.0 or higher
- TypeScript 5.0.0 or higher
- ESLint 9.0.0 or higher

## Installation

```bash
npm install @relational-fabric/canon
```

## Usage

Each example can be run independently. Copy the code samples and adapt them to your specific use case. The examples are designed to work with the TypeScript and ESLint configurations provided by this package.

For more information about the package configurations, see the main [documentation](../README.md).

## Running Examples

You can run examples directly using tsx:

```bash
# Run a specific example
npx tsx examples/01-basic-id-axiom.ts

# Run all examples
npx tsx examples/01-basic-id-axiom.ts && npx tsx examples/02-module-style-canon/usage.ts
```

## Testing

All examples include built-in tests using Vitest's in-source testing pattern. The examples serve as:
1. **Documentation** - Show how to use the framework
2. **Integration tests** - Verify the complete workflow works
3. **Regression tests** - Ensure changes don't break functionality

Run the tests with:
```bash
npm test
```
