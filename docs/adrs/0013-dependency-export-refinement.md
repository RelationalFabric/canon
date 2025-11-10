# ADR-0013: Dependency Export Refinement

- Status: accepted
- Date: 2025-11-10

## Context

Canon originally exposed all third-party dependencies under a wildcard `./_/*` subpath. Any module placed inside `src/_` (or even temporarily during refactors) became a public export, creating an incentive to "kitchen sink" the package surface. The pattern also allowed stray utilities such as `typescript` and `@antfu/eslint-config` to leak as first-class exports even when they were not meant for downstream consumption.

At the same time, we defined local TypeScript declarations for packages like `object-hash`, but those declarations were not shipped to consumers because the `types/` directory was excluded from the published files. Consumers received untyped bindings despite our internal safety net.

We needed a narrower, intentional export surface that reflects the curated kit philosophy while honouring consumers who rely on the transparent `_` namespace.

## Decision

1. Replace the `./_/*` export pattern with explicit entries for each supported transparent dependency (`defu`, `immutable`, `object-hash`, `yaml`), removing the implicit wildcard.
2. Drop the `@relational-fabric/canon/_/antfu` re-export. Consumers can import `@antfu/eslint-config` directly when they need the full configuration surface; the kit now exposes only the curated `createEslintConfig` helper.
3. Inline the `object-hash` type definitions into `src/_/object-hash.ts` and publish the `types/` directory so consumers receive the same TypeScript guarantees as the Canon codebase.
4. Point the `./eslint` subpath export to an explicit type declaration to ensure `createEslintConfig` remains typed for consumers of the targeted subpath.

## Consequences

### Positive

- Public exports now change only when we intentionally add a new mapping, which keeps the API surface understandable for downstream packages.
- `object-hash` consumers finally receive the enriched type information that Canon uses internally.
- The ESLint helper remains available but without implying the rest of Antfu’s configuration is formally supported as part of Canon.
- Publishing the `types/` directory aligns runtime and type-time guarantees.

### Negative

- Existing consumers of `@relational-fabric/canon/_/antfu` must update their imports to use `createEslintConfig` or depend on `@antfu/eslint-config` directly.
- Adding a new transparent dependency now requires an explicit export map entry, adding minor bookkeeping.

### Neutral

- The `_` namespace continues to exist for advanced scenarios, but it is now curated rather than automatic.

## Related Decisions

- ADR-0005: ESLint Configuration Abstraction
- ADR-0008: Dual Export Strategy
