# ADR-0010: VitePress Documentation Solution

* Status: accepted
* Date: 2025-01-26

## Context and Problem Statement

Canon requires a documentation solution that can publish to GitHub Pages while maintaining minimal impact on the existing codebase structure. The solution must handle primary markdown documentation, ADRs, planning materials, and a technology radar visualization. Previous experience with Docusaurus revealed limitations in integrating custom HTML content, which is a critical requirement for embedding the technology radar and other interactive elements.

## Decision Drivers

* Minimal impact on existing codebase structure
* Ability to integrate custom HTML content (especially for tech radar)
* Support for existing markdown documentation without conversion
* Appropriate handling of ADRs as architectural decisions
* Separate planning section for strategic materials
* Fast build times and modern tooling
* TypeScript support and modern development experience
* Proven adoption by other TypeScript libraries

## Considered Options

* Docusaurus - React-based documentation generator
* VitePress - Vue.js-based documentation generator
* Nextra - Next.js-based documentation generator
* Astro - Multi-framework static site generator
* Eleventy - JavaScript-based static site generator
* Antora - Enterprise documentation generator
* Hugo - Go-based static site generator

## Decision Outcome

Chosen option: "VitePress", because it provides the best balance of simplicity, flexibility, and proven adoption by major TypeScript libraries while allowing seamless integration of custom HTML content.

### Positive Consequences

* Minimal configuration required - works out of the box with existing markdown
* Custom HTML integration through Vue components and direct HTML embedding
* Fast build times powered by Vite
* Full TypeScript support
* Proven by Vue.js, Vite, Pinia, and other major libraries
* Excellent GitHub Pages integration
* Clean separation of documentation sections (docs, ADRs, planning, radar)
* Markdown-first approach preserves existing documentation structure

### Negative Consequences

* Adds Vue.js dependency (though minimal footprint)
* Requires learning basic Vue component syntax for custom HTML integration
* Documentation team needs familiarity with VitePress configuration

## Pros and Cons of the Options

### VitePress

* Good, because minimal configuration and works with existing markdown
* Good, because seamless custom HTML integration through Vue components
* Good, because fast build times and modern tooling
* Good, because proven by major TypeScript libraries
* Good, because excellent GitHub Pages support
* Bad, because requires Vue.js knowledge for advanced customizations

### Docusaurus

* Good, because React-based with extensive plugin ecosystem
* Good, because built-in ADR support
* Bad, because restrictive custom HTML integration
* Bad, because complex configuration for simple use cases
* Bad, because previous negative experience with HTML integration

### Nextra

* Good, because React-based with component flexibility
* Good, because growing adoption in React ecosystem
* Bad, because requires Next.js knowledge
* Bad, because more complex than needed for documentation

### Astro

* Good, because framework-agnostic with maximum flexibility
* Good, because can use any frontend framework
* Bad, because overkill for documentation needs
* Bad, because steeper learning curve

### Eleventy

* Good, because pure HTML/JS with maximum control
* Good, because extremely fast builds
* Bad, because requires more custom development
* Bad, because less opinionated structure for documentation

### Antora

* Good, because enterprise-grade documentation features
* Good, because multi-component support
* Bad, because complex setup for single-project documentation
* Bad, because designed for multi-repository scenarios

### Hugo

* Good, because extremely fast builds
* Good, because flexible templating
* Bad, because Go-based (different ecosystem)
* Bad, because requires learning Go templating syntax

## Links

* [VitePress Documentation](https://vitepress.dev/)
* [Vue.js Documentation](https://vuejs.org/) - Built with VitePress
* [Vite Documentation](https://vitejs.dev/) - Built with VitePress

