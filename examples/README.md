# Canon Framework Examples

This directory contains example-driven demonstrations of the Canon framework functionality.

## Running Examples

Each example can be run independently using tsx:

```bash
# Basic Id Axiom usage
npx tsx examples/01-basic-id-axiom.ts

# Module-style canon definition
npx tsx examples/02-module-style-canon/index.ts

# Protocol system
npx tsx examples/08-protocol-system/index.ts

# Lazy module pattern
npx tsx examples/09-lazy-module-pattern/index.ts
```

## Examples Overview

### 01-basic-id-axiom.ts

Demonstrates the fundamental usage of the Canon framework:

- Defining type-level canon configurations
- Registering runtime canon configurations
- Using the `idOf()` function across different formats
- Interface augmentation pattern
- Universal functions that work with any canon

**Key Concepts:**

- Declarative canon registration with `declareCanon()`
- Internal format (standard `id` field)
- JSON-LD format (semantic `@id` field)
- Universal API working across formats

### 02-module-style-canon/

Demonstrates the module-style pattern for shareable canons:

- Using `defineCanon()` to create reusable configurations
- Using `registerCanons()` for batch registration
- Exporting canon definitions for use in other projects
- MongoDB format with `_id` field

**Key Concepts:**

- Module-style canon definition
- Reusable canon configurations
- Batch registration
- Separation of definition and registration

### 08-protocol-system/

Demonstrates the Protocol System (ADR-0015):

- Defining protocols with `defineProtocol()`
- Extending protocols for built-in types (Array, String)
- Using pseudo-constructors (`Null`, `Undefined`, `ObjectFallback`)
- Checking protocol support with `satisfiesProtocol()`
- Writing generic functions using protocols

**Key Concepts:**

- Polymorphic dispatch based on type
- Protocol methods with documentation
- O(1) dispatch via constructor-based storage
- Pseudo-constructors for types without natural constructors

### 09-lazy-module-pattern/

Demonstrates the Lazy Module Pattern (ADR-0016):

- Creating lazy modules with `defineLazyModule()`
- Registering implementations with capability scores
- Automatic selection of the best implementation
- Option-based selection with `.select(opts)`
- Memoized selection results

**Key Concepts:**

- Capability-based implementation selection
- Always-available pure JS fallback
- Scoring system (UNSUPPORTED, RISKY, FALLBACK, BASELINE, GOOD, OPTIMAL)
- Cross-platform and architecture-aware code

## Testing Strategy

These examples serve as:

1. **Documentation** - Show how to use the framework
2. **Integration tests** - Verify the complete workflow works
3. **Regression tests** - Ensure changes don't break functionality

## Unit Tests

Unit tests are colocated with source files using the `.test.ts` extension:

- `src/runtime/core.test.ts` - Tests for functional core
- `src/runtime/registry.test.ts` - Tests for global registry
- `src/utils/objects.test.ts` - Tests for object utilities

## Adding New Examples

When adding new examples:

1. Use the `0X-descriptive-name.ts` naming convention
2. Include comprehensive comments explaining concepts
3. Demonstrate one key feature or pattern per file
4. Include console output showing results
5. Update this README with the new example
