---
layout: home

hero:
  name: "@relational-fabric/canon"
  text: "Universal Type Primitives & Axiomatic Systems"
  tagline: "Build robust, data-centric applications with consistent type blueprints and a curated library ecosystem"
  actions:
    - theme: brand
      text: Get Started
      link: /docs/
    - theme: alt
      text: View on GitHub
      link: https://github.com/RelationalFabric/canon

features:
  - icon: 🎯
    title: Universal Type Primitives
    details: Battle-tested types from the TypeScript ecosystem providing a solid foundation for data-centric applications
  - icon: 🧩
    title: Axiomatic Systems
    details: Atomic building blocks (axioms) that enable lazy typing and adaptability across different data formats
  - icon: 📐
    title: Canonical Type Blueprints
    details: Universal type definitions (canons) that implement axioms for JSON-LD, MongoDB, REST APIs, and more
  - icon: 🔄
    title: Lazy Typing with Identity
    details: Preserve canonical identity while adapting to different data structures and formats
  - icon: 📚
    title: Curated Library Ecosystem
    details: Known good set of libraries and modules as a canonical starting point for your projects
  - icon: 🛠️
    title: Canonical APIs
    details: Standardized interfaces for data structures with sensible defaults when choice is available
  - icon: 🏗️
    title: Modern TypeScript
    details: Based on Node.js 22+ with latest TypeScript features, ES modules, and comprehensive tooling
  - icon: 📖
    title: Architecture Decisions
    details: Documented ADRs and transparent technology radar for strategic planning
---

**Canon** solves the "empty room problem" by providing universal type primitives and axiomatic systems for building robust, data-centric applications. Instead of starting from scratch with each new project, Canon offers consistent design decisions and type blueprints that can be shared across projects and data formats.

## What is Canon?

Canon is a modern TypeScript package that provides:

### Universal Type Primitives
- Battle-tested types from the TypeScript ecosystem
- Foundation for building data-centric applications
- Type-safe operations and proven patterns

### Axiomatic Systems
- **Axioms**: Atomic building blocks that define semantic concepts (ID, type, version, timestamps, references)
- **Lazy typing**: Adapt types to different data structures while preserving canonical identity
- **Cross-format compatibility**: Work seamlessly with JSON-LD, MongoDB, REST APIs, and more

### Canonical Type Blueprints (Canons)
- Universal type definitions that implement axioms for specific data formats
- Multiple canons can coexist, each representing different formats
- Consistent semantic concepts across all formats

### Curated Library Ecosystem
Canon serves as a **canonical starting point** by providing:
- **Pre-configured TypeScript setup** - Base configurations that work out of the box
- **Curated dependency set** - Known good versions of essential libraries:
  - **type-fest** & **ts-essentials** for utility types
  - **uuid** & **nanoid** for identity generation
  - **object-hash** for content-based hashing
  - **immutable.js** for immutable data structures
- **Standardized patterns** - Consistent approaches to common problems
- **Best practice implementations** - Proven solutions for type safety and data handling
- **Canonical APIs** - Standardized interfaces that work across different data structures
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
    'no-console': 'warn'
  }
})
```

## Requirements

This package requires the following peer dependencies:

- **Node.js**: 22.0.0 or higher
- **TypeScript**: 5.0.0 or higher
- **ESLint**: 9.0.0 or higher

## Core Concepts

### Axioms
Axioms are atomic building blocks that enable lazy typing and adaptability. They define semantic concepts that can be found in different data structures:

- **Id**: Unique identifiers across different systems
- **Type**: Type information and classification
- **Version**: Versioning and change tracking
- **Timestamps**: Creation and modification times
- **References**: Relationships between entities

See [docs/axioms.md](docs/axioms.md) for the complete type system architecture.

### Canons
Canons are universal type blueprints that implement axioms for specific data formats. They provide:

- **Declarative Style**: Local configurations for specific use cases
- **Module Style**: Shareable configurations across projects
- **Type Safety**: Full TypeScript support with compile-time checking
- **Format Flexibility**: Support for JSON-LD, MongoDB, REST APIs, and more

See [docs/canons.md](docs/canons.md) for implementation patterns.

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
- **Compatibility**: Support for JSON-LD, MongoDB, REST APIs, and custom formats
- **Extensibility**: Add your own axioms and canons as needed

## Planning and Strategy

Canon maintains transparent planning and strategic direction:

- **Technology Radar**: [planning/radar/](planning/radar/) - Technology recommendations and assessments
- **Strategic Vision**: [planning/](planning/) - Long-term direction and positioning
- **Development Roadmap**: [planning/](planning/) - Detailed development phases and milestones
- **Architecture Decisions**: [docs/adrs/](docs/adrs/) - Documented ADRs for major decisions
- **Update Radar**: `npm run radar:convert` - Convert YAML to CSV for visualization

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

- `npm run check` - Type check and lint the package
- `npm run dev` - Run TypeScript in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Documentation Scripts

- `npm run docs:dev` - Start VitePress development server
- `npm run docs:build` - Build documentation for production (with automatic file renaming)
- `npm run docs:preview` - Preview built documentation
- `npm run docs:restore` - Manually restore README.md files from index.md

**Note**: The documentation build process uses a GitHub-first approach. All files use `README.md` naming in the repository for GitHub compatibility. During build, files are temporarily renamed to `index.md` for VitePress routing, then automatically restored. Always edit `README.md` files directly.

### ADR Management

This project uses Architecture Decision Records (ADRs) to document architectural decisions:

- `npm run adr:list` - List all ADRs
- `npm run adr:new "Title"` - Create a new ADR
- `npm run adr:index` - Generate table of contents (in ADR directory)

### Technology Radar Management

- `npm run radar:convert` - Convert YAML radar data to CSV for visualization
- `npm run radar:validate` - Validate radar configuration and data

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
