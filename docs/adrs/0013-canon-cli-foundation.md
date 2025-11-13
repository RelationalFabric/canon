# ADR-0013: Canon CLI Foundation

- Status: proposed
- Date: 2025-11-12

## Context and Problem Statement

Canon promises a "batteries-included" project scaffold that starts with installing the package, running a guided command, and emerging with the same workflows we maintain in this repository. Today, consumers must copy scripts and structure by hand. We need a first-class CLI that can:

- Bootstrap a new project (`canon init`)
- Apply opinionated templates (e.g., examples, docs, ADR stubs)
- Safely modify existing files (augment `package.json`, update configs, append scripts)

The selected tooling must be widely adopted, TypeScript-friendly, and something we can expose to consumers so they benefit from the same foundations in their own automation.

## Decision Drivers

- **Developer Trust**: Use mature, well-supported libraries recognised as best-in-class.
- **TypeScript Support**: Full type safety for both Canon authors and consumers.
- **Extensibility**: Ability to layer additional commands/templates without rewrites.
- **Consumer Reuse**: Any library we rely on should be easy for downstream teams to reuse directly.
- **DX Consistency**: Align with Canon’s ES module posture and modern Node.js runtime.

## Considered Options

### CLI Framework

1. `commander`
2. `yargs`
3. `@oclif/core` (Oclif)

### Template & File Authoring

1. `yeoman-generator`
2. `plop` (Handlebars-based)
3. `hygen`

### Programmatic File Updates

1. Direct `fs` / `fs-extra` manipulation
2. `ts-morph` for TypeScript & `jsonc-parser` for JSON
3. `jscodeshift` with custom codemods

## Decision Outcome

Chosen stack:

- **CLI Framework**: `@oclif/core`
- **Templating / Scaffolding**: `hygen`
- **File & AST Updates**: `ts-morph` (TypeScript) + `jsonc-parser` (JSON/JSONC) + `fs-extra` for filesystem ergonomics

### Rationale

- **Oclif** is widely adopted (Heroku, Salesforce, Netlify), has first-class TypeScript support, plugin architecture, and built-in help/version handling. It aligns with our ES module packaging and ships nice DX primitives we can re-export for consumers.
- **Hygen** focuses on fast, convention-driven scaffolding with templates baked into the repo. It is battle-tested (RedwoodJS, Shopify) and keeps templates as simple Markdown/Handlebars partials that consumers can extend. CLI invocation is shell-friendly, and programmatic APIs let us drive it from our own commands.
- **ts-morph + jsonc-parser** provide safe, structured updates:
  - `ts-morph` handles AST-aware TypeScript modifications without writing custom codemods.
  - `jsonc-parser` updates JSON/JSONC files while preserving comments—critical for `tsconfig`, `package.json`, and configuration files.
  - `fs-extra` rounds out ergonomic filesystem tasks (copy, ensureDir, etc.), widely used and stable.

Collectively, this stack is mainstream, actively maintained, TypeScript-first, and easy to surface to downstream projects.

### Positive Consequences

- Consumers install Canon and instantly gain access to `canon` CLI plus Oclif primitives for their own automation.
- Templates live alongside sources, enabling documentation-driven scaffolding that matches our docs/examples.
- Structured mutations reduce the risk of corrupting consumer files.
- Aligns with modern CLI expectations (autocomplete-ready, consistent UX).

### Negative Consequences

- Oclif adds install size and a small runtime dependency tree.
- Hygen introduces a handlebars-style templating syntax that contributors must learn.
- ts-morph can be heavy for large AST operations and increases build time for CLI commands manipulating TypeScript.

## Pros and Cons of the Options

### `@oclif/core`

- ✅ Rich CLI ergonomics, plugin ecosystem, TypeScript templates.
- ✅ Automatically generates help/version, handles config directory conventions.
- ❌ Larger footprint than lightweight parsers (commander/yargs).

### `commander`

- ✅ Lightweight, minimal dependencies.
- ❌ Limited scaffolding for advanced CLI UX (plugins, config loading).
- ❌ Manual TypeScript typings for commands/options.

### `yargs`

- ✅ Mature option parser with positional/command branching.
- ❌ Mixed TypeScript story (declaration-heavy, opaque generics).
- ❌ Less structured project layout guidance than Oclif.

### `hygen`

- ✅ Fast, file-based templates with low ceremony.
- ✅ Extensible via prompts, partials, helpers.
- ❌ Template logic expressed in Handlebars, prone to “stringly” errors if abused.

### `plop`

- ✅ Simple API, integrates with handlebars.
- ❌ Focused on interactive scaffolding; harder to script for unattended workflows.
- ❌ Lacks built-in file update helpers compared to Hygen generators.

### `ts-morph + jsonc-parser`

- ✅ Works entirely in TypeScript, preserves formatting/comments where possible.
- ✅ Fine-grained control over AST nodes and JSON edits.
- ❌ Higher learning curve than raw `fs` writes.

### `fs-extra`

- ✅ Industry-standard for filesystem utilities.
- ✅ Already part of many dev workflows; familiar to contributors.
- ❌ Minimal abstraction for semantic edits (needs pairing with AST/templating tools).

### `jscodeshift`

- ✅ Great for large-scale codemods.
- ❌ Heavyweight setup, requires Babel/TypeScript transformers.
- ❌ Overkill for incremental config edits targeted by the CLI.

## Decision Status

Status is **proposed**. Once accepted, we will:

1. Add `@oclif/core`, `hygen`, `ts-morph`, `jsonc-parser`, and `fs-extra` as runtime dependencies.
2. Scaffold a `canon` CLI entry point with initial `init` command and plumbing to run Hygen generators.
3. Re-export relevant utilities (e.g., Hygen helpers, ts-morph project factories) for consumers wanting to extend Canon’s behavior.
4. Update documentation and project setup guides to reference the CLI workflow.

## Consequences and Follow-Up

- Align the package’s bin configuration to expose `canon`.
- Design templates for base project structure, examples, and docs using Hygen directories.
- Define safety checks for file overrides (prompt before overwriting, support `--force`).
- Document how consumers can extend Canon via Hygen templates or Oclif plugins.
