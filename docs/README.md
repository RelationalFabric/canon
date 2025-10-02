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

- **[Canons](./canons.md)** - Core principles and guidelines
- **[Axioms](./axioms.md)** - Fundamental assumptions and rules
- **[Examples](./examples/README.md)** - Practical usage examples
- **[Radar Methodology](./radar-methodology.md)** - Technology assessment approach

## Architecture Decisions

- **[ADRs](./adrs.md)** - Architecture Decision Records documenting key decisions

## Planning & Strategy

- **[Technology Radar](../planning/radar/README.md)** - Technology recommendations and assessments
- **[Planning Overview](../planning/README.md)** - Strategic direction and roadmap

## Development Notes

**Build Process**: The documentation build process automatically renames all `README.md` files to `index.md` within the docs directory to work with VitePress routing. This is handled by the build scripts in `package.json`:

- `npm run docs:dev` and `npm run docs:build` rename README.md → index.md
- `npm run docs:restore` renames index.md → README.md for editing

When editing documentation, use `npm run docs:restore` first to convert index.md files back to README.md, make your changes, then run the build commands.
