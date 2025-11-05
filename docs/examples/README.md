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

**Pattern:** Single-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/01-basic-id-axiom.ts)

### [02-module-style-canon](./02-module-style-canon)

Using the MongoDB Canon Module

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon)

**Files:**

- [mongodb-canon](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon/mongodb-canon.ts) - MongoDB Canon Module
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon/usage.ts) - Using the MongoDB Canon Module

### [03-multi-axiom-canon](./03-multi-axiom-canon)

Multi-Axiom Canon Usage Examples

**Key Concepts:**

- **Comprehensive Canon**: A single canon can implement all five core axioms
- **Universal Functions**: The same functions work across all axiom types
- **Type Safety**: Full TypeScript type safety with multiple axioms
- **Format Conversion**: Automatic conversion between different data formats
- **Real-World Usage**: Practical examples with user and product entities
- **Version Control**: Built-in optimistic concurrency control
- **Timestamp Handling**: Flexible timestamp conversion and validation
- **Reference Management**: Structured reference handling with resolution tracking
- **Entity Analysis**: Comprehensive entity analysis across all axioms
- **Business Logic**: Real-world business scenarios with multiple axioms

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon)

**Files:**

- [comprehensive-canon](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon/comprehensive-canon.ts) - Comprehensive Canon Definition
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon/usage.ts) - Multi-Axiom Canon Usage Examples
- [utility-functions](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon/utility-functions.ts) - Utility Functions for Multi-Axiom Canon

### [04-format-conversion-examples](./04-format-conversion-examples)

Format Conversion Usage Examples

**Key Concepts:**

- **Cross-Format Compatibility**: Same business logic works across different data formats
- **Automatic Conversion**: Canon automatically converts between formats
- **Type Safety**: Full TypeScript type safety across all formats
- **Real-World Usage**: Practical examples with REST APIs, MongoDB, and JSON-LD
- **Error Handling**: Graceful error handling for invalid or partial data
- **Format Conversion**: Built-in utilities for converting between formats
- **Universal Functions**: Same functions work regardless of data format
- **Metadata Preservation**: Format-specific metadata is preserved and accessible
- **Business Logic**: Complex business logic works seamlessly across formats
- **Integration**: Easy integration with existing systems and data sources

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples)

**Files:**

- [canons](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples/canons.ts) - Format-Specific Canon Definitions
- [conversion-utilities](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples/conversion-utilities.ts) - Format Conversion Utilities
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples/usage.ts) - Format Conversion Usage Examples

### [05-error-handling-and-edge-cases](./05-error-handling-and-edge-cases)

Error Handling and Edge Cases Usage Examples

**Key Concepts:**

- **Safe Wrapper Functions**: Use safe functions that return undefined instead of throwing
- **Comprehensive Validation**: Validate entities before processing
- **Graceful Error Handling**: Handle errors gracefully with fallback values
- **Batch Processing**: Process multiple entities with individual error handling
- **Edge Case Coverage**: Handle null, undefined, wrong types, and missing fields
- **Type Safety**: Maintain type safety even with error handling
- **Logging**: Log errors for debugging while continuing execution
- **Fallback Values**: Provide sensible defaults for missing data
- **Validation Results**: Return detailed validation results with errors and warnings
- **Robust Processing**: Build robust systems that handle real-world data variations

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases)

**Files:**

- [basic-canon](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases/basic-canon.ts) - Basic Canon for Error Handling Examples
- [safe-functions](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases/safe-functions.ts) - Safe Wrapper Functions
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases/usage.ts) - Error Handling and Edge Cases Usage Examples
- [validation-utilities](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases/validation-utilities.ts) - Validation Utilities

### [06-real-world-business-scenarios](./06-real-world-business-scenarios)

Real-World Business Scenarios Usage Examples

**Key Concepts:**

- **Real-World Applications**: Canon enables complex business logic with type safety
- **Domain Modeling**: Rich domain models with proper entity relationships
- **Business Rules**: Encode business rules directly into the type system
- **Workflow Management**: Complete business workflows with error handling
- **Version Control**: Optimistic concurrency control for data consistency
- **Validation**: Comprehensive validation with detailed error reporting
- **Type Safety**: Full TypeScript type safety across complex business operations
- **Error Handling**: Graceful error handling with detailed error messages
- **Modularity**: Clean separation of concerns with focused modules
- **Maintainability**: Easy to maintain and extend business logic

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios)

**Files:**

- [business-logic](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios/business-logic.ts) - Business Logic Functions
- [domain-models](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios/domain-models.ts) - Domain Models for Business Scenarios
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios/usage.ts) - Real-World Business Scenarios Usage Examples

### [07-custom-axioms-example](./07-custom-axioms-example)

Custom Axioms Usage Examples

**Key Concepts:**

- **Custom Axiom Types**: Define your own axiom types using KeyNameAxiom, RepresentationAxiom, or custom Axiom types
- **Axiom Registration**: Register custom axioms in the global Axioms interface
- **Custom Functions**: Implement your own universal functions (emailOf, currencyOf, etc.)
- **Domain-Specific Logic**: Add validation, conversion, and business logic specific to your domain
- **Type Safety**: Maintain full TypeScript type safety with custom axioms
- **Canon Integration**: Use custom axioms in your canon definitions
- **Real-World Applications**: Custom axioms enable domain-specific semantic concepts
- **Validation**: Add custom validation logic for your specific use cases
- **Conversion**: Implement format conversion for your custom data types
- **Business Rules**: Encode business rules directly into your axiom implementations

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example)

**Files:**

- [business-scenarios](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example/business-scenarios.ts) - Business Scenarios with Custom Axioms
- [custom-axioms](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example/custom-axioms.ts) - Custom Axiom Definitions
- [custom-functions](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example/custom-functions.ts) - Custom Axiom Functions
- [usage](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example/usage.ts) - Custom Axioms Usage Examples

## Example Patterns

The examples demonstrate different patterns for working with Canon:

### Single-File Examples (01-basic-id-axiom)

- **Use case**: Simple, self-contained examples
- **Pattern**: All code in a single file with clear sections
- **Benefits**: Easy to understand, quick to run, perfect for learning
- **Example**: `01-basic-id-axiom.ts`

### Multi-File Examples (02-module-style-canon, 03-multi-axiom-canon, etc.)

- **Use case**: Complex examples with multiple concerns
- **Pattern**: Organized into multiple files with clear separation of concerns
- **Benefits**: Modular, maintainable, demonstrates real-world architecture
- **Structure**:
  - `usage.ts` - Main entry point and examples
  - `canons.ts` - Canon definitions
  - `utility-functions.ts` - Helper functions
  - `domain-models.ts` - Type definitions
  - `business-logic.ts` - Business logic

### Canon Definition Patterns

#### Declarative Style

- **Use case**: Internal, app-specific canons
- **Pattern**: Define and register canons directly in your application
- **Benefits**: Simple, direct, perfect for internal use
- **Example**: `declareCanon('Internal', { ... })`

#### Module Style

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
