# Examples

This directory contains practical examples demonstrating how to use the @relational-fabric/canon package.

## Available Examples

### [01-basic-id-axiom](./01-basic-id-axiom.md)

Learn how Canon enables universal code that works across different data formats using the Id axiom

**Keywords:** axiom, canon, id, json-ld, universal functions

**Difficulty:** introductory

**Pattern:** Single-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/01-basic-id-axiom.ts)

### [02-module-style-canon](./02-module-style-canon.md)

Learn how to create reusable, shareable canons that can be published as npm packages

**Keywords:** canon, module, reusable, npm, mongodb

**Difficulty:** introductory

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/02-module-style-canon)

**Referenced files:**
- `./mongodb-canon.ts`

### [03-multi-axiom-canon](./03-multi-axiom-canon.md)

Working with complex entities that implement multiple axioms (Id, Type, Version, Timestamps, References)

**Keywords:** multi-axiom, comprehensive, entity, timestamps, references, version

**Difficulty:** intermediate

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/03-multi-axiom-canon)

### [04-format-conversion-examples](./04-format-conversion-examples.md)

Converting data between different formats (REST API, MongoDB, JSON-LD) using Canon's universal type system

**Keywords:** format-conversion, rest-api, mongodb, json-ld, transformation

**Difficulty:** intermediate

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/04-format-conversion-examples)

### [05-error-handling-and-edge-cases](./05-error-handling-and-edge-cases.md)

Gracefully handling errors, edge cases, and validation in Canon applications

**Keywords:** error-handling, validation, edge-cases, safe-functions, robustness

**Difficulty:** intermediate

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/05-error-handling-and-edge-cases)

### [06-real-world-business-scenarios](./06-real-world-business-scenarios.md)

Practical business logic implementation using Canon for order processing, customer management, and workflows

**Keywords:** business-logic, order-processing, workflow, e-commerce, domain-models

**Difficulty:** advanced

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/06-real-world-business-scenarios)

### [07-custom-axioms-example](./07-custom-axioms-example.md)

Creating and using custom axioms (Email, Currency, Status, Priority) for domain-specific requirements

**Keywords:** custom-axioms, domain-specific, email, currency, status, priority

**Difficulty:** advanced

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/07-custom-axioms-example)

### [08-protocol-system](./08-protocol-system.md)

Learn how Canon's protocol system enables polymorphic dispatch across different types

**Keywords:** protocol, polymorphism, dispatch, interface, extension

**Difficulty:** intermediate

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/08-protocol-system)

### [09-lazy-module-pattern](./09-lazy-module-pattern.md)

Learn how Canon's lazy module pattern enables capability-based implementation selection

**Keywords:** lazy module, capability, selection, implementation, fallback

**Difficulty:** intermediate

**Pattern:** Multi-file example

**Source:** [View on GitHub](https://github.com/RelationalFabric/canon/tree/main/examples/09-lazy-module-pattern)

## Getting Started

Each example includes:
- **Narrative documentation** that teaches concepts through prose
- **Complete code samples** with full TypeScript typing
- **In-source tests** that demonstrate and validate behavior
- **Real-world scenarios** showing practical applications

## Running Examples

You can run examples directly using tsx:

```bash
# Run a single-file example
npx tsx examples/01-basic-id-axiom.ts

# Run a folder example
npx tsx examples/02-module-style-canon/index.ts
```
