# Documentation

Welcome to the Canon documentation. This section provides comprehensive guides, examples, and reference materials for using the @relational-fabric/canon package.

## Core Concepts

### [Axioms](./axioms.md)
Fundamental building blocks and type system that enable lazy typing and adaptability. Axioms define semantic concepts (like ID, type, version) that can be found in different data structures.

### [Canons](./canons.md)
Universal type blueprints that implement axioms for specific data formats. Multiple canons can exist simultaneously, each representing different formats, but they all implement the same semantic concepts.

## Examples

Explore practical implementations of core axioms:

- **[Deduplicating Entities](./examples/deduplicating-entities.md)** - Learn how to identify and merge duplicate entities
- **[Tree Walk Over Mixed Entities](./examples/tree-walk-over-mixed-entities.md)** - Navigate complex data structures
- **[User Authentication Tokens](./examples/user-authentication-tokens.md)** - Implement secure token handling

## Architecture Decisions

This project uses Architecture Decision Records (ADRs) to document important architectural decisions:

- **[ADR Index](./adrs.md)** - Complete list of all architectural decisions
- **[Recent ADRs](./adrs/)** - Individual ADR documents

## Planning & Strategy

### [Technology Radar](../planning/radar/)
Transparent technology recommendations and assessments. View our [Interactive Radar](../planning/radar/radar.html) to see current technology positions.

### [Radar Methodology](./radar-methodology.md)
Detailed methodology for maintaining and updating our technology radar.

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

## Requirements

- **Node.js**: 22.0.0 or higher
- **TypeScript**: 5.0.0 or higher  
- **ESLint**: 9.0.0 or higher