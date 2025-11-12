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

```bash
npm install --save-dev @relational-fabric/canon eslint typescript
```

- `@relational-fabric/canon` ships the CLI, templates, and curated tooling
- `eslint` and `typescript` satisfy Canon’s peer dependencies

## 3. Run the Canon CLI

```bash
npx canon init
```

The CLI:

- Generates Canon-aligned starter files (`tsconfig.json`, `eslint.config.js`, `.gitignore`, `README.md`)
- Seeds `src/index.ts` with a sample export
- Adds every Canon workflow script to `package.json`
- Ensures `@relational-fabric/canon`, `eslint`, and `typescript` are recorded in `devDependencies`

### Common Flags

| Flag | Description |
| --- | --- |
| `--directory`, `-d` | Target directory (defaults to current working directory) |
| `--name`, `-n` | Project name used in generated files (defaults to directory name) |
| `--force` | Overwrite existing files that collide with Canon templates |

Examples:

```bash
npx canon init --directory ./packages/api --name api-service
npx canon init --force
```

## 4. Review Generated Scripts

The CLI wires the same scripts we maintain in this repository, including:

- `npm run check:all` — lint, type-check, test, and validate radar data
- `npm run check:all:fix` — auto-fix lint issues before running the remaining checks
- `npm run build:docs` — build VitePress documentation with Canon’s rename workflow
- `npm run build:adr` — regenerate ADR tables of contents and index files

Because Canon ships every underlying binary (`npm-run-all`, `tsx`, `vitest`, `vitepress`, `adr-tools`, `hygen`, `fs-extra`, etc.) as runtime dependencies, all scripts work immediately after installation.

## 5. Optional Enhancements

- **Husky + Lint-Staged**: Add Git hooks (`npm install --save-dev husky lint-staged`) and mirror Canon’s `package.json` configuration.
- **Custom ESLint Rules**: Update `eslint.config.js` and pass options into `createEslintConfig({ ... })`.
- **Additional Generators**: Extend the templates in `node_modules/@relational-fabric/canon/cli` or add your own Hygen generators.

## Next Steps

- Continue with the [Getting Started guidance](../README.md#getting-started) for foundational concepts.
- Explore the [Examples](../examples/README.md) directory to see real-world Canon usage.
- Review the [Reference kit documentation](../reference/kit.md) to learn about the curated exports now available in your project.
