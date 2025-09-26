# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the @relational-fabric/canon package.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made during the development of a project. They provide context for why decisions were made and help future contributors understand the reasoning behind the current architecture.

## ADR Format

Each ADR follows the format defined by [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):

1. **Title** - A descriptive title
2. **Status** - Proposed, Accepted, Deprecated, or Superseded
3. **Context** - The forces at play, including technological, political, social, and project local
4. **Decision** - The change that we're proposing or have made
5. **Consequences** - What becomes easier or more difficult to do and any risks introduced by this change

## ADR Index

- [ADR-001: TypeScript Package Setup](./0001-typescript-package-setup.md)
- [ADR-002: ESLint Configuration with Antfu](./0002-eslint-configuration-with-antfu.md)
- [ADR-003: Documentation Linting Inclusion](./0003-documentation-linting-inclusion.md)
- [ADR-004: TypeScript Configuration Separation](./0004-typescript-configuration-separation.md)
- [ADR-005: ESLint Configuration Abstraction](./0005-eslint-configuration-abstraction.md)

## Creating New ADRs

We use [adr-tools](https://github.com/npryce/adr-tools) to manage ADRs. This ensures consistency and provides helpful commands for ADR management.

### Prerequisites

Install adr-tools (already included as a dev dependency):
```bash
npm install
```

### Creating a New ADR

1. **Navigate to the ADR directory:**
   ```bash
   cd docs/adrs
   ```

2. **Create a new ADR:**
   ```bash
   npx adr new "Descriptive Title of Your Decision"
   ```

3. **Edit the generated ADR file** with your decision details

4. **Update the status** as the decision progresses through the lifecycle

### ADR Management Commands

#### Using npm scripts (recommended):
- **List all ADRs:** `npm run adr:list`
- **Create new ADR:** `npm run adr:new "Title"`
- **Generate table of contents:** `npm run adr:index`

#### Direct adr-tools commands:
- **List all ADRs:** `npx adr list`
- **Create new ADR:** `npx adr new "Title"`
- **Link ADRs:** `npx adr link <from> <to> <relationship>`
- **Generate table of contents:** `npx adr generate toc`
- **Help:** `npx adr help`

### Manual Process (if adr-tools unavailable)

If adr-tools is not available, you can create ADRs manually:

1. Copy the template from `template.md`
2. Rename it to `XXXX-descriptive-title.md` where XXXX is the next sequential number
3. Fill in the template with your decision
4. Update this README to include the new ADR in the index
5. Update the status as the decision progresses through the lifecycle

## ADR Lifecycle

- **Proposed** - The decision is under consideration
- **Accepted** - The decision has been made and implemented
- **Deprecated** - The decision is no longer recommended but may still be in use
- **Superseded** - The decision has been replaced by a newer ADR
