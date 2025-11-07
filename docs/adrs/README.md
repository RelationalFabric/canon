# Architecture Decision Records

## ADR List

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./0001-typescript-package-setup.md) | TypeScript Package Setup | 🟢 Accepted | 2025-01-26 |
| [ADR-002](./0002-eslint-configuration-with-antfu.md) | ESLint Configuration with Antfu | 🟢 Accepted | 2025-01-26 |
| [ADR-003](./0003-documentation-linting-inclusion.md) | Documentation Linting Inclusion | 🟢 Accepted | 2025-01-26 |
| [ADR-004](./0004-typescript-configuration-separation.md) | TypeScript Configuration Separation | 🟢 Accepted | 2025-01-26 |
| [ADR-005](./0005-eslint-configuration-abstraction.md) | ESLint Configuration Abstraction | 🟢 Accepted | 2025-01-26 |
| [ADR-006](./0006-unbuilt-typescript-library.md) | Unbuilt TypeScript Library | 🟢 Accepted | 2025-01-26 |
| [ADR-007](./0007-y-statement-format.md) | Y-Statement Format for ADRs | 🟢 Accepted | 2025-01-26 |
| [ADR-008](./0008-dual-export-strategy.md) | Dual Export Strategy | 🟢 Accepted | 2025-01-26 |
| [ADR-009](./0009-node-js-version-requirement.md) | Node.js Version Requirement | 🟢 Accepted | 2025-01-26 |
| [ADR-0010](./0010-vitepress-documentation-solution.md) | VitePress Documentation Solution | 🟢 Accepted | 2025-01-26 |
| [ADR-0011](./0011-examples-documentation-generation-from-source-files.md) | Examples Documentation Generation from Source Files | 🟢 Accepted | 2025-01-26 |
| [ADR-0012](./0012-type-testing-framework.md) | Type Testing Framework | 🟢 Accepted | 2025-11-04 |

## ADR Process

1. Use `cd docs/adrs && npx adr new "Meaningful Decision Title"` to draft a new record.
2. Update the table with `npm run build:adr` so the index stays in sync.
3. Commit the new ADR together with any code or documentation changes it describes.
