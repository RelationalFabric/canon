---
layout: home

hero:
  name: '@relational-fabric/canon'
  text: 'Universal Type Primitives & Axiomatic Systems'
  tagline: 'Build robust, data-centric applications with consistent type blueprints and a curated library ecosystem'
  actions:
    - theme: brand
      text: Get Started
      link: /docs/
    - theme: alt
      text: View on GitHub
      link: https://github.com/RelationalFabric/canon

features:
  - icon: 🔄
    title: Lazy Typing Pattern
    details: Write type-safe code against semantic concepts while deferring specific implementations through axioms, canons, and universal APIs
  - icon: 🧩
    title: Axioms
    details: Define semantic concepts independent of data shape - the "what" of your type system
  - icon: 📐
    title: Canons
    details: Provide shape-specific implementations of axioms - the "how" for each data source
  - icon: 🛠️
    title: Universal APIs
    details: Functions that work across all canons - the "interface" for your application code
  - icon: 🎯
    title: Universal Type Primitives
    details: Battle-tested types from the TypeScript ecosystem providing a solid foundation for data-centric applications
  - icon: 📚
    title: Curated Library Ecosystem
    details: Known good set of libraries and modules as a canonical starting point for your projects
  - icon: 🏗️
    title: Modern TypeScript
    details: Based on Node.js 22+ with latest TypeScript features, ES modules, and comprehensive tooling
  - icon: 📖
    title: Architecture Decisions
    details: Documented ADRs and transparent technology radar for strategic planning
---

**Canon** solves the "empty room problem" by providing universal type primitives and axiomatic systems for building robust, data-centric applications. Instead of starting from scratch with each new project, Canon offers consistent design decisions and type blueprints that can be shared across projects and data shapes.

## What is Canon?

Canon is a modern TypeScript package that enables **lazy typing** - writing type-safe code against semantic concepts while deferring specific implementations to runtime configuration. This is achieved through three complementary parts:

### The Lazy Typing Triplet

#### 1. Axioms - Define Semantic Concepts

Axioms define **what** semantic concepts mean, independent of any specific data shape:

- Define the semantic concept (e.g., "unique identifier", "type classification", "temporal data")
- Specify the type structure without implementation details
- Enable compile-time type safety through TypeScript interfaces

#### 2. Canons - Implement for Shapes

Canons provide **how** each axiom is implemented for specific data shapes:

- Provide shape-specific field names and structures
- Multiple canons can coexist for different data sources
- Register both type-level and runtime configurations

#### 3. Universal APIs - Work Across Shapes

Universal APIs provide **the interface** your application code uses:

- Single API that works across all registered canons
- Type-safe functions that adapt to different data shapes
- No shape-specific code in your business logic

### Additional Capabilities

#### Universal Type Primitives

- Battle-tested types from the TypeScript ecosystem
- Foundation for building data-centric applications
- Type-safe operations and proven patterns

#### Type Testing Utilities

- Zero-runtime-cost compile-time type assertions
- Guard against type regressions with `Expect<A, B>`
- Document type expectations directly in code
- Positive and negative type checks with `IsTrue` and `IsFalse`

#### Curated Library Ecosystem

Canon serves as a **canonical starting point** by providing:

- **Pre-configured TypeScript setup** - Base configurations that work out of the box
- **Curated dependency set** - Known good versions of essential libraries for common needs
- **Standardized patterns** - Consistent approaches to common problems
- **Best practice implementations** - Proven solutions for type safety and data handling
- **Sensible defaults** - Recommended choices when selecting data structures

This approach reduces decision fatigue and provides confidence in your technology stack while recognizing that in many real-world scenarios you must work with existing data structures.

## Quick Start

### Install

```bash
npm install @relational-fabric/canon
```

### Use TypeScript Configuration

```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

### Use ESLint Configuration

```javascript
// eslint.config.js
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig()
```

#### Providing Custom Options

```javascript
// eslint.config.js
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig({
  ignores: ['custom-ignore'],
  rules: {
    'no-console': 'warn',
  },
})
```

## Requirements

This package requires the following peer dependencies:

- **Node.js**: 22.0.0 or higher
- **TypeScript**: 5.0.0 or higher
- **ESLint**: 9.0.0 or higher

## Core Concepts

### The Lazy Typing Pattern

Canon implements **lazy typing** through three complementary components that work together:

#### Axioms

Axioms define semantic concepts independent of data shape. They specify **what** concepts your code works with, such as:

- Unique identifiers across different systems
- Type information and classification
- Versioning and change tracking
- Temporal data with conversion between representations
- Relationships between entities

See [docs/axioms.md](docs/axioms.md) for the complete type system architecture.

#### Canons

Canons provide shape-specific implementations of axioms. They specify **how** each semantic concept is represented in a particular data shape:

- **Declarative Style**: Local configurations for specific use cases
- **Module Style**: Shareable configurations across projects
- **Type Safety**: Full TypeScript support with compile-time checking
- **Multiple Shapes**: Each canon handles one data shape's implementation

See [docs/canons.md](docs/canons.md) for implementation patterns.

#### Universal APIs

Universal APIs provide functions that work across all registered canons. They are **the interface** your application code uses:

- Write code once that works with any registered canon
- Automatic adaptation to different data shapes
- Full type safety maintained across all shapes

See [reference/api.md](reference/api.md) for available APIs.

## Package Exports

- **Main package**: `@relational-fabric/canon` - Core axioms and canons
- **TypeScript config**: `@relational-fabric/canon/tsconfig` - Base TypeScript configuration
- **ESLint config**: `@relational-fabric/canon/eslint` - ESLint configuration function

## Key Patterns

### Module Augmentation

Register axioms and canons using TypeScript module augmentation:

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

### Naming Conventions

- **Axiom Keys**: PascalCase, plural for general concepts (`Timestamps`, `References`), singular for specific concepts (`Id`, `Type`)
- **Function Names**: Use relational `*Of` pattern (`idOf()`, `typeOf()`) not imperative `get*` patterns
- **Type Names**: PascalCase for all type definitions
- **Variables**: camelCase for all variables and parameters
- **Distinguished Keys**: Use `$` prefix only for Canon's internal keys (`$basis`, `$meta`)

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete conventions.

## Integration

Canon is designed to compose with existing TypeScript libraries and provides:

- **Type Safety**: Full TypeScript support with strict type checking
- **Flexibility**: Work with existing data structures or define new ones
- **Shape Agnostic**: Support for diverse data shapes through universal semantic interfaces
- **Extensibility**: Add your own axioms and canons as needed

## Planning and Strategy

Canon maintains transparent planning and strategic direction:

- **Technology Radar**: [planning/radar/](planning/radar/) - Technology recommendations and assessments
- **Strategic Vision**: [planning/](planning/) - Long-term direction and positioning
- **Development Roadmap**: [planning/](planning/) - Detailed development phases and milestones
- **Architecture Decisions**: [docs/adrs/](docs/adrs/) - Documented ADRs for major decisions
- **Update Radar**: `npm run build:radar` - Convert YAML to CSV for visualization

## Development

### Prerequisites

- Node.js 22+
- npm or yarn

### Setup

```bash
git clone <repository-url>
cd canon
npm install
```

### Available Scripts

**Checks (Validation):**

- `npm run check:all` - Run all checks (lint, type check, and tests)
- `npm run checks` - Alias for check:all
- `npm run check:types` - Type check all code (src + examples)
- `npm run check:types:src` - Type check source code only
- `npm run check:types:examples` - Type check examples only
- `npm run check:lint` - Lint code
- `npm run check:lint:fix` - Fix ESLint issues automatically
- `npm run check:radar` - Validate radar configuration
- `npm test` - Run tests (npm standard)
- `npm run check:test` - Run tests (includes examples)

**Development:**

- `npm run dev` - Run TypeScript in watch mode

**Documentation:**

- `npm run build:docs` - Build documentation for production
- `npm run build:docs:restore` - Restore README.md files from build

**Note**: The documentation build process uses a GitHub-first approach. All files use `README.md` naming in the repository for GitHub compatibility. During build, files are temporarily renamed to `index.md` for VitePress routing, then automatically restored. Always edit `README.md` files directly.

**Architecture Decision Records:**

- `cd docs/adrs && npx adr new "Title"` - Create a new ADR
- `npm run build:adr` - Build all ADR artifacts (TOC + index)
- `npm run build:adr:toc` - Generate table of contents
- `npm run build:adr:index` - Generate ADR index in documentation

**Technology Radar:**

- `npm run build:radar` - Convert YAML radar data to CSV

**Examples:**

- `npm run build:docs:examples` - Generate documentation from examples

## Documentation

Canon provides comprehensive documentation to help you understand and use the system:

### Core Documentation

- **[Getting Started](docs/)** - Introduction and quick start guide
- **[Axioms](docs/axioms.md)** - Fundamental building blocks and type system
- **[Canons](docs/canons.md)** - Universal type blueprints and implementation patterns
- **[Contributing](CONTRIBUTING.md)** - Conventions, naming patterns, and development workflow

### Reference Documentation

- **[API Reference](reference/api.md)** - Complete API documentation
- **[Core Axioms](reference/axioms.md)** - Detailed axiom specifications
- **[Canons Reference](reference/canons.md)** - Canon implementation guide
- **[Type Testing Utilities](docs/type-testing/)** - Compile-time type assertions and invariants
- **[Third-Party Integrations](reference/third-party.md)** - External library integrations

### Examples

- **[Deduplicating Entities](docs/examples/deduplicating-entities.md)** - Using axioms for entity deduplication
- **[Tree Walk Over Mixed Entities](docs/examples/tree-walk-over-mixed-entities.md)** - Working with heterogeneous data structures
- **[User Authentication Tokens](docs/examples/user-authentication-tokens.md)** - Implementing authentication patterns
- **[More Examples](docs/examples/)** - Additional examples and use cases

### Architecture

- **[ADRs](docs/adrs/)** - Architecture Decision Records
- **[Technology Radar](docs/radar-methodology.md)** - Technology assessment methodology

## License

MIT
