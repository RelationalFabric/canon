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

### [03-multi-axiom-canon](./03-multi-axiom-canon.ts)
Example: Multi-Axiom Canon with All Core Axioms

**Key Concepts:**
- **Multi-Axiom Canons**: Define canons that implement multiple axioms for comprehensive data modeling
- **Universal Functions**: Use idOf(), typeOf(), versionOf(), timestampsOf(), referencesOf() together
- **Format Conversion**: Timestamps and References automatically convert between different formats
- **Real-World Logic**: Write business logic that works with any entity format
- **Error Handling**: Handle cases where entities don't match expected axioms
- **Type Safety**: All functions maintain full TypeScript type safety
- **Comprehensive Coverage**: Examples should demonstrate all available functionality

**Pattern:** Declarative canon registration

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon.ts)

### [04-format-conversion-examples](./04-format-conversion-examples.ts)
Example: Format Conversion and Cross-Format Compatibility

**Key Concepts:**
- **Multi-Format Support**: Define canons for different data formats (REST, MongoDB, JSON-LD)
- **Universal Functions**: Same business logic works across all formats
- **Automatic Conversion**: Timestamps and references convert between formats automatically
- **Format Conversion**: Convert entities between different data formats
- **Error Handling**: Gracefully handle invalid or incomplete data
- **Real-World Scenarios**: Examples show practical cross-format operations
- **Type Safety**: Maintain full TypeScript type safety across all formats

**Pattern:** Declarative canon registration

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples.ts)

### [05-error-handling-and-edge-cases](./05-error-handling-and-edge-cases.ts)
Example: Error Handling and Edge Cases

**Key Concepts:**
- **Safe Wrappers**: Create safe wrapper functions that return undefined instead of throwing
- **Validation**: Always validate entities before processing
- **Error Handling**: Handle errors gracefully and provide meaningful messages
- **Edge Cases**: Test with null, undefined, wrong types, and missing fields
- **Batch Processing**: Handle multiple entities with proper error isolation
- **Logging**: Log warnings and errors for debugging
- **Graceful Degradation**: Continue processing even when some entities fail

**Pattern:** Declarative canon registration

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases.ts)

### [06-real-world-business-scenarios](./06-real-world-business-scenarios.ts)
Example: Real-World Business Scenarios

**Key Concepts:**
- **Domain Modeling**: Use canons to model business domains with semantic concepts
- **Business Logic**: Write business logic that works with semantic concepts, not field names
- **Cross-Entity Operations**: Process relationships between entities using universal functions
- **Workflow Processing**: Build complex workflows that work across different data formats
- **Error Handling**: Handle business logic errors gracefully
- **Version Control**: Use version axioms for optimistic concurrency control
- **Real-World Value**: Examples show practical business value of the universal type system

**Pattern:** Declarative canon registration

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios.ts)

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
