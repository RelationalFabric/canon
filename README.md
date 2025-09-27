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

## Technology Radar

Canon maintains a comprehensive [Technology Radar](radar/) that tracks our recommendations for tools, techniques, features, and data formats. The radar helps consumers understand what technologies to adopt, trial, assess, or avoid when building with Canon.

- **View Radar Data**: [radar/data.yaml](radar/data.yaml) - Human-readable YAML format
- **Radar Methodology**: [docs/radar-methodology.md](docs/radar-methodology.md) - How we maintain the radar
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

### ADR Management

This project uses Architecture Decision Records (ADRs) to document architectural decisions:

- `npm run adr:list` - List all ADRs
- `npm run adr:new "Title"` - Create a new ADR
- `npm run adr:index` - Generate table of contents (in ADR directory)

## License

MIT
