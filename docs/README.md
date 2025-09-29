# Canon Documentation

This directory contains the comprehensive documentation for the Canon project.

## 📚 Documentation

The full documentation is available at: **https://relationalfabric.github.io/canon/**

### Quick Navigation

- **[Getting Started](https://relationalfabric.github.io/canon/)** - Overview and quick start guide
- **[Canons](https://relationalfabric.github.io/canon/canons)** - Understanding Canon types and their implementation
- **[Axioms](https://relationalfabric.github.io/canon/axioms)** - Deep dive into axiomatic primitives
- **[Examples](https://relationalfabric.github.io/canon/examples/)** - Comprehensive examples of core axioms
- **[ADRs](https://relationalfabric.github.io/canon/adrs/)** - Architecture Decision Records
- **[Planning](https://relationalfabric.github.io/canon/planning/)** - Strategic planning and technology radar

## 🚀 Quick Start

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

## 📖 Local Development

To run the documentation locally:

```bash
npm run docs:dev
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines and how to contribute to Canon.

---

**Note**: This README is for GitHub navigation. For the complete interactive documentation, visit the [official documentation site](https://relationalfabric.github.io/canon/).