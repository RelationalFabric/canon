# ADR-002: ESLint Configuration with Antfu

* Status: accepted
* Date: 2025-01-26

## Context and Problem Statement

The package needed a modern, comprehensive ESLint configuration for code quality and consistency. The configuration should work well with TypeScript, Node.js, and provide a good developer experience with automatic fixing capabilities.

## Decision Drivers

* Need for modern ESLint configuration that works with TypeScript
* Requirement for consistent code formatting and style
* Desire for automatic fixing capabilities
* Need for configuration that works with Node.js projects
* Requirement for minimal configuration overhead
* Need for configuration that can be easily shared across projects

## Considered Options

* Use basic ESLint with manual rule configuration
* Use @typescript-eslint/recommended configuration
* Use @antfu/eslint-config (antfu's configuration)
* Use other popular ESLint configurations (Airbnb, Standard, etc.)

## Decision Outcome

Chosen option: "Use @antfu/eslint-config", because it provides a modern, opinionated configuration that works well with TypeScript and Node.js, includes automatic fixing, and is actively maintained.

### Positive Consequences

* Modern, opinionated configuration with sensible defaults
* Excellent TypeScript support
* Automatic fixing capabilities for many issues
* Consistent code style across the project
* Minimal configuration required
* Good performance and developer experience
* Active maintenance and updates

### Negative Consequences

* Opinionated configuration may not suit all preferences
* Requires ESLint 9+ (modern version)
* Some rules may be stricter than other configurations

## Implementation Details

* ESLint version: ^9.10.0
* Configuration: @antfu/eslint-config ^3.0.0
* Features: TypeScript support, Node.js support, automatic fixing
* Scripts: `lint`, `lint:fix`, `check` (TypeScript + ESLint)
* Configuration file: `eslint.config.js`

## Links

* [@antfu/eslint-config](https://github.com/antfu/eslint-config)
* [ESLint Configuration Guide](https://eslint.org/docs/latest/use/configure/)
