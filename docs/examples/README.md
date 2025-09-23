# Canon Examples

This directory contains comprehensive examples demonstrating different aspects and use cases of Canon. Each example is a complete, working demonstration that shows how to solve real-world problems using Canon's core axioms and custom extensions.

## Examples Overview

### [Tree Walk Over Mixed Entities](./tree-walk.md)
**Focus**: Custom axioms for parent/child relationships, universal tree operations
- Demonstrates how to define custom axioms for domain-specific relationships
- Shows universal tree walking across mixed data sources and shapes
- Handles different field names (`parentId` vs `parent` vs `parent_id`)
- Perfect for file systems, organizational charts, or any hierarchical data

### [Multi-Source Integration](./multi-source-integration.md)
**Focus**: Universal data integration across multiple APIs and formats
- Integrates products from Shopify, WooCommerce, Magento, and JSON-LD APIs
- Shows how to build universal import/export systems
- Demonstrates format independence in real-world scenarios
- Ideal for e-commerce, data migration, or API aggregation projects

### [Optimistic Concurrency Control](./optimistic-concurrency.md)
**Focus**: Version management and conflict resolution across data sources
- Implements optimistic concurrency control using Canon's versioning
- Shows conflict detection and resolution strategies
- Works across internal DB, REST API, and WebSocket sources
- Essential for collaborative applications and real-time systems

### [Custom Axioms for Domain-Specific Needs](./custom-axioms.md)
**Focus**: Extending Canon with custom axioms for specialized use cases
- Defines custom axioms for geolocation, permissions, and user roles
- Shows how to handle complex domain-specific data structures
- Demonstrates conversion between different formats for the same concept
- Perfect for content management, geospatial, or permission-based systems

## How to Use These Examples

1. **Start with the overview** - Each example begins with a clear explanation of the problem it solves
2. **Follow the step-by-step approach** - Examples are structured to build understanding progressively
3. **Focus on the patterns** - Look for how Canon enables universal code across different data sources
4. **Adapt to your needs** - Use the patterns as templates for your specific use cases

## Key Patterns Demonstrated

### Universal Data Access
All examples show how to write code that works across different data sources without format-specific logic.

### Custom Axiom Definition
Examples demonstrate how to extend Canon with domain-specific concepts beyond the core axioms.

### Format Independence
Each example handles multiple data formats (REST, JSON-LD, GraphQL, internal DB) with the same code.

### Type Safety
All examples maintain TypeScript type safety across different data sources and formats.

## Choosing the Right Example

- **Building a file system or hierarchical UI?** → Start with [Tree Walk](./tree-walk.md)
- **Integrating multiple APIs or data sources?** → Start with [Multi-Source Integration](./multi-source-integration.md)
- **Need conflict resolution or collaborative features?** → Start with [Optimistic Concurrency](./optimistic-concurrency.md)
- **Working with domain-specific data structures?** → Start with [Custom Axioms](./custom-axioms.md)

## Next Steps

After working through these examples, you'll understand how to:
- Define custom axioms for your domain
- Build universal data integration layers
- Handle concurrency and conflicts across sources
- Create format-independent business logic
- Extend Canon for specialized use cases

Each example is designed to be a complete, working solution that you can adapt to your specific needs.