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

**Build Process**: The documentation build process automatically renames all `README.md` files to `index.md` within the docs directory to work with VitePress routing. This is handled by the build scripts in `package.json`:

- `npm run docs:dev` and `npm run docs:build` rename README.md → index.md
- `npm run docs:restore` renames index.md → README.md for editing

When editing documentation, use `npm run docs:restore` first to convert index.md files back to README.md, make your changes, then run the build commands.
