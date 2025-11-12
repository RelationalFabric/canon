# Project Setup

Canon is designed to be the first dependency you add to a greenfield project. This guide walks through setting up a new repository with Canon as the foundational tooling layer so that the same scripts and workflows used in this repository work out of the box.

## Prerequisites

- Node.js `>= 22.0.0`
- npm `>= 10`
- Git (optional, but recommended for Husky hooks)

## 1. Initialize a New Project

```bash
mkdir my-canon-project
cd my-canon-project
npm init -y
```

## 2. Install Canon and Required Peers

Canon bundles the command-line tooling needed by the default workflows. Install Canon alongside its required peer dependencies:

```bash
npm install --save-dev @relational-fabric/canon eslint typescript
```

- `@relational-fabric/canon` provides the curated scripts and workflows
- `eslint` and `typescript` satisfy peer dependency requirements

## 3. Adopt Canon's TypeScript Configuration

Create `tsconfig.json` at the project root:

```json
{
  "extends": "@relational-fabric/canon/tsconfig",
  "compilerOptions": {
    "outDir": "./.build",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

This extends the Node.js LTS configuration with Canon's strict defaults.

## 4. Configure ESLint

Create `eslint.config.js`:

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig()
```

Need custom rules? Pass options to `createEslintConfig({ ... })` and Canon will merge them on top of the curated baseline.

## 5. Wire Up Package Scripts

Copy the scripts below into your `package.json`. All referenced binaries (e.g., `npm-run-all`, `tsx`, `vitest`, `vitepress`, `adr`) are bundled with Canon and available via `node_modules/.bin`.

```json
{
  "scripts": {
    "check:lint": "eslint .",
    "check:lint:fix": "eslint . --fix",
    "check:types": "tsc --noEmit",
    "check:test": "vitest run",
    "check:test:watch": "vitest run --watch",
    "check:test:coverage": "vitest run --coverage",
    "check:radar": "tsx scripts/validate-radar.ts",
    "check:all": "npm-run-all check:lint check:types check:test check:radar",
    "check:all:fix": "npm-run-all check:lint:fix check:types check:test",
    "build:docs:examples": "tsx scripts/generate-examples-docs.ts",
    "build:docs": "npm run build:docs:examples && scripts/rename-readmes-for-build.sh && npx vitepress build && scripts/restore-readmes-from-build.sh",
    "build:radar": "tsx scripts/convert-radar.ts",
    "build:adr": "npm-run-all build:adr:toc build:adr:index",
    "build:adr:index": "node scripts/generate-adr-index.js",
    "build:adr:toc": "cd docs/adrs && npx adr generate toc",
    "dev": "tsx --watch src/index.ts",
    "test": "npm run check:test"
  }
}
```

Feel free to trim the list to match the workflows you intend to support on day one.

## 6. Project Structure

Create a minimal source layout:

```bash
mkdir -p src
echo "export const hello = 'world'" > src/index.ts
```

Run `npm run check:all` to verify that linting, type checking, tests, and radar validation succeed with the curated toolchain.

## 7. Optional Enhancements

- **Husky + Lint-Staged**: Add Git hooks by installing `husky` and `lint-staged`, then mirror the configuration from Canon's `package.json`.
- **Documentation**: Use the provided `build:docs` workflow to generate VitePress docs once you're ready to publish.
- **ADR Workflow**: The `adr` CLI ships with Canon. Run `npx adr new "Decision Title"` to record architecture decisions from day zero.

## Next Steps

- Continue with the [Getting Started guidance](../README.md#getting-started) for overviews of axioms, canons, and reference material.
- Explore the [Examples](../examples/README.md) directory to see the tooling applied to real-world scenarios.
