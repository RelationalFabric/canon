# ADR-001: TypeScript Package Setup

* Status: accepted
* Date: 2025-01-26

## Context and Problem Statement

The repository needed to be prepared as a modern TypeScript package with proper configuration, build system, and tooling. The package should target the latest TypeScript version and use modern Node.js LTS features while providing a clean development experience.

## Decision Drivers

* Need for modern TypeScript configuration based on Node.js LTS
* Requirement for proper package.json structure with correct entry points
* Need for build system that generates both JavaScript and TypeScript declarations
* Desire for consistent code quality through linting
* Requirement for ES module support
* Need for proper package exports for consumers

## Considered Options

* Use basic TypeScript configuration
* Use @tsconfig/node-lts as base configuration
* Create custom TypeScript configuration from scratch
* Use different package.json structure (CommonJS vs ES modules)

## Decision Outcome

Chosen option: "Use @tsconfig/node-lts as base configuration with ES modules", because it provides modern TypeScript features, Node.js LTS compatibility, and follows current best practices.

### Positive Consequences

* Modern TypeScript features and Node.js LTS compatibility
* Proper ES module support with type declarations
* Clean package structure with correct entry points
* Build system that generates both JS and TS declaration files
* Source maps for debugging
* Proper package exports for consumers

### Negative Consequences

* Requires Node.js 18+ (acceptable for modern packages)
* ES module syntax requires .js extensions in imports (handled properly)

## Implementation Details

* Package name: `@relational-fabric/canon`
* TypeScript version: ^5.4.0
* Base configuration: @tsconfig/node-lts
* Module system: ES modules
* Build output: dist/ directory with JS, TS declarations, and source maps
* Entry points: main, types, and exports fields in package.json

## Links

* [TypeScript Handbook - Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
* [Node.js LTS Schedule](https://nodejs.org/en/about/releases/)
