# ADR-003: Documentation Linting Inclusion

* Status: accepted
* Date: 2025-01-26

## Context and Problem Statement

The repository contains extensive documentation files with TypeScript/JavaScript code examples that were not being linted. This led to inconsistent code style in documentation and potential confusion for contributors. The question was whether to include documentation files in the ESLint configuration or exclude them.

## Decision Drivers

* Need for consistent code style in documentation
* Documentation contains TypeScript/JavaScript code examples
* Desire for code examples to be valid and properly formatted
* Need to maintain code quality standards across all files
* Requirement for contributors to follow consistent patterns
* Need to catch syntax errors in code examples

## Considered Options

* Exclude all documentation files from ESLint
* Include only specific documentation files
* Include all documentation files with ESLint
* Use separate ESLint configuration for documentation

## Decision Outcome

Chosen option: "Include all documentation files with ESLint", because it ensures consistent code style and catches errors in code examples, improving the overall quality of the documentation.

### Positive Consequences

* Consistent code style across all files including documentation
* Code examples in documentation are properly formatted and valid
* Catches syntax errors in documentation code examples
* Maintains high code quality standards
* Contributors learn proper formatting through documentation
* Documentation serves as examples of best practices

### Negative Consequences

* More files to lint (increased processing time)
* Need to fix formatting issues in documentation
* Some documentation-specific rules may not apply to code examples
* Potential for false positives in markdown content

## Implementation Details

* ESLint configuration includes all documentation files
* Fixed 639 linting errors across documentation files
* Updated ESLint configuration to include docs/, reference/, and *.md files
* Used automatic fixing where possible, manual fixes for parsing errors
* Maintained code readability while ensuring compliance

## Links

* [ESLint Configuration - File Patterns](https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-with-arbitrary-extensions)
