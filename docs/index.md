# Documentation

Welcome to the @relational-fabric/canon documentation. This package provides modern TypeScript and ESLint configurations for starting new projects.

## Getting Started

### Installation

```bash
npm install @relational-fabric/canon
```

### TypeScript Configuration

```json
{
  "extends": "@relational-fabric/canon/tsconfig"
}
```

### ESLint Configuration

```javascript
// eslint.config.js
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig()
```

## Documentation Sections

- **[Canons](/docs/canons)** - Core principles and guidelines
- **[Axioms](/docs/axioms)** - Fundamental assumptions and rules
- **[Examples](/docs/examples/)** - Practical usage examples
- **[Radar Methodology](/docs/radar-methodology)** - Technology assessment approach

## Architecture Decisions

- **[ADRs](/adrs/)** - Architecture Decision Records documenting key decisions

## Planning & Strategy

- **[Technology Radar](/planning/radar/)** - Technology recommendations and assessments
- **[Planning Overview](/planning/)** - Strategic direction and roadmap

## Development Notes

**Build Process**: The documentation build process uses a GitHub-first approach with automatic file renaming:

- **Repository**: All documentation files use `README.md` naming for GitHub compatibility
- **Build Process**: `npm run docs:build` automatically renames `README.md` → `index.md` during VitePress build
- **Post-Build**: Files are automatically restored to `README.md` naming
- **Manual Restore**: Use `npm run docs:restore` if needed to restore files manually

**Always edit `README.md` files directly** - the build process handles all renaming automatically.
