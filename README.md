---
layout: home

hero:
  name: "@relational-fabric/canon"
  text: "Modern TypeScript Package Template"
  tagline: "ESLint and TypeScript configurations for starting new projects"
  actions:
    - theme: brand
      text: Get Started
      link: /docs/
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

# @relational-fabric/canon

A modern TypeScript package template with ESLint and TypeScript configurations for starting new projects.

## Features

- **Modern TypeScript configuration** based on Node.js LTS
- **ESLint configuration** with @antfu/eslint-config
- **Reusable configurations** that can be extended by other projects
- **ES modules** with TypeScript source
- **Development tools** for linting and ADR management

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

### Use ESLint Configuration with Custom Options

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

## Package Exports

- **Main package**: `@relational-fabric/canon` - The main package (currently empty)
- **TypeScript config**: `@relational-fabric/canon/tsconfig` - Base TypeScript configuration
- **ESLint config**: `@relational-fabric/canon/eslint` - ESLint configuration function

## Planning and Strategy

Canon maintains transparent planning and strategic direction separate from the published package:

- **Technology Radar**: [planning/radar/](planning/radar/) - Technology recommendations and assessments
- **Strategic Vision**: [planning/](planning/) - Long-term direction and positioning
- **Development Roadmap**: [planning/](planning/) - Detailed development phases and milestones
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

## License

MIT
