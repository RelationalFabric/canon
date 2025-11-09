# Examples

This directory contains practical examples demonstrating how to use the @relational-fabric/canon package and its configurations.

## Available Examples

### [01-basic-id-axiom](./01-basic-id-axiom.md)
Example: Basic Id Axiom Usage

**Key Concepts:**
- Define canons for each data format you work with (internal, JSON-LD, etc.)
- Use universal functions like idOf() that work across all formats
- Write your business logic once - it works with any registered canon
- Add new formats anytime without changing existing code
- Use Canon's utility functions (pojoHasString, isPojo) for clean type guards

**Pattern:** Single-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/01-basic-id-axiom.ts)

### [02-module-style-canon](./02-module-style-canon.md)
Using the MongoDB Canon Module

**Pattern:** Multi-file example with modular structure

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon)

### [03-multi-axiom-canon](./03-multi-axiom-canon.md)
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

### [04-format-conversion-examples](./04-format-conversion-examples.md)
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

### [05-error-handling-and-edge-cases](./05-error-handling-and-edge-cases.md)
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

### [06-real-world-business-scenarios](./06-real-world-business-scenarios.md)
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

### [07-custom-axioms-example](./07-custom-axioms-example.md)
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

## Example Patterns

### Single-File Examples
- **Use case**: Simple, focused examples
- **Pattern**: All code in a single file with narrative flow
- **Structure**: `01-basic-id-axiom`
- **Benefits**: Easy to understand, quick to read, perfect for learning one concept

### Folder-Based Examples
- **Use case**: Complex examples with custom axioms or multiple canons
- **Pattern**: Organized into focused files
- **Structure**:
  - `usage.ts` - Main entry point with narrative and tests (legacy examples may still use `index.ts`)
  - `axioms/{concept}.ts` - Custom axiom definitions (type + API)
  - `canons/{notation}.ts` - Canon definitions (type + runtime)
  - Supporting files as needed for clarity
- **Benefits**: Clear separation, easy to navigate, demonstrates real-world architecture

### Understanding Axioms vs Canons

**Axioms** define semantic concepts (Id, Email, Currency) and their APIs:
- Each axiom file contains both the type definition AND the API functions (`emailOf`, `currencyOf`)
- Example: `axioms/email.ts` defines EmailAxiom type and exports `emailOf()` function

**Canons** aggregate axioms and map them to specific notations:
- REST API canon: maps axioms to `id`, `type`, `email`
- MongoDB canon: maps axioms to `_id`, `_type`, `email`
- JSON-LD canon: maps axioms to `@id`, `@type`, `email`

Canons don't have APIs - they configure how axiom APIs work with different data formats

## Getting Started

Each example includes:
- **Narrative documentation** that teaches concepts through prose
- **Complete code samples** with full TypeScript typing
- **In-source tests** that demonstrate and validate behavior
- **Real-world scenarios** showing practical applications
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
# Run a single-file example
npx tsx examples/01-basic-id-axiom.ts

# Run a folder example
npx tsx examples/02-module-style-canon/usage.ts

# Run multiple examples
npx tsx examples/01-basic-id-axiom.ts && npx tsx examples/02-module-style-canon/usage.ts
```

## Testing

Examples use Vitest's in-source testing pattern in their entry points. The examples serve as:
1. **Living documentation** - Narrative code that teaches concepts
2. **Integration tests** - Verify complete workflows work correctly
3. **Regression tests** - Ensure changes don't break functionality

Run the tests with:
```bash
npm test
```

## Writing New Examples

See [CONTRIBUTING.md](./CONTRIBUTING.md) in the examples directory for guidelines on:
- Structuring examples as narrative documentation
- When to use single-file vs folder-based examples
- Naming conventions for axioms, canons, and supporting files
- Writing tests that teach
