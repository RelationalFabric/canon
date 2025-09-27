---
format: y-statement
---

# ADR-009: Node.js Version Requirement

* Status: accepted
* Date: 2025-01-26

## Statement

We require Node.js 22+ as the minimum supported version for all packages in the Canon ecosystem.

## Rationale

- Node.js 18 reached End-of-Life in April 2025
- Node.js 22 is the current Active LTS version
- Modern tooling requires modern runtime features
- Security updates and performance improvements are essential
- Aligns with the package's purpose of providing cutting-edge configurations

## Implications

- All package.json engines must specify `>=22.0.0`
- Documentation must reflect Node 22+ requirement
- CI/CD pipelines must use Node 22+
- Consumer projects must upgrade to Node 22+ to use Canon packages

## References

- [Node.js Release Schedule](https://nodejs.org/en/about/releases/)
- [ADR-001: TypeScript Package Setup](./0001-typescript-package-setup.md) - Original Node.js requirement
- [ADR-007: Y-Statement Format for ADRs](./0007-y-statement-format.md) - Format decision