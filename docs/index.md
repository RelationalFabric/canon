---
layout: home

hero:
  name: "@relational-fabric/canon"
  text: "Modern TypeScript Package Template"
  tagline: "ESLint and TypeScript configurations for starting new projects"
  actions:
    - theme: brand
      text: Get Started
      link: /
    - theme: alt
      text: View on GitHub
      link: https://github.com/RelationalFabric/canon

features:
  - icon: 🚀
    title: Modern TypeScript
    details: Based on Node.js LTS with latest TypeScript features and ES modules support
  - icon: 🔧
    title: ESLint Configuration
    details: Powered by @antfu/eslint-config with automatic fixing capabilities
  - icon: 📦
    title: Reusable Configurations
    details: Extendable configurations that can be shared across projects
  - icon: 📚
    title: Comprehensive Documentation
    details: Complete documentation with examples, ADRs, and planning materials
  - icon: 🎯
    title: Technology Radar
    details: Transparent technology recommendations and assessments
  - icon: 🏗️
    title: Architecture Decisions
    details: Documented ADRs for all major architectural decisions
---

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

This package requires the following peer dependencies:

- **Node.js**: 22.0.0 or higher
- **TypeScript**: 5.0.0 or higher  
- **ESLint**: 9.0.0 or higher

## Package Exports

- **Main package**: `@relational-fabric/canon` - The main package (currently empty)
- **TypeScript config**: `@relational-fabric/canon/tsconfig` - Base TypeScript configuration
- **ESLint config**: `@relational-fabric/canon/eslint` - ESLint configuration function
