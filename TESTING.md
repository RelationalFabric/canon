# Testing Strategy

Canon uses a multi-layered testing approach combining [Vitest's in-source testing](https://vitest.dev/guide/in-source) with example-driven integration tests.

## Testing Architecture

### 1. In-Source Unit Tests

Unit tests are colocated with source files using Vitest's `if (import.meta.vitest)` pattern, similar to Rust's module tests. This approach provides:

- **Tight Coupling**: Tests live next to implementation
- **Private Access**: Tests can access private functions and state
- **Quick Feedback**: Tests run as part of the development workflow
- **Production Stripping**: Test code is removed in production builds

**Files with In-Source Tests:**

- `src/runtime/core.ts` - Functional core tests
- `src/runtime/registry.ts` - Global registry tests
- `src/utils/objects.ts` - Object utility tests

**Example:**

```typescript
// Implementation
export function isPojo(value: unknown): value is Pojo {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// In-source tests
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('isPojo', () => {
    it('should return true for plain objects', () => {
      expect(isPojo({})).toBe(true)
      expect(isPojo({ id: '123' })).toBe(true)
    })
  })
}
```

### 2. Example-Driven Integration Tests

Integration tests are located in the `examples/` directory and serve triple duty:

1. **Documentation** - Show how to use the framework
2. **Integration Testing** - Verify complete workflows
3. **Regression Testing** - Ensure changes don't break functionality

**Current Examples:**

- `examples/01-basic-id-axiom.ts` - Basic canon usage with multiple formats
- `examples/02-module-style-canon.ts` - Module-style canon definition pattern

## Running Tests

### Unit Tests (In-Source)

```bash
# Run all unit tests once
npm test  # or: npm run check:test
```

### Integration Tests (Examples)

```bash
# Examples are included in main test suite
npm test

# Run specific example
npx tsx examples/01-basic-id-axiom.ts
```

### All Checks

```bash
# All checks (TypeScript + ESLint + Tests)
npm run check:all
```

## Configuration

### vitest.config.ts

The Vitest configuration enables in-source testing:

```typescript
export default defineConfig({
  test: {
    // Include source files for in-source testing
    includeSource: ['src/**/*.{js,ts}'],
    // Exclude certain files
    exclude: ['**/node_modules/**', '**/dist/**', '**/radar/**'],
  },
  // Strip test code in production builds
  define: {
    'import.meta.vitest': 'undefined',
  },
})
```

### tsconfig.json

TypeScript needs the vitest/importMeta types:

```json
{
  "compilerOptions": {
    "types": ["vitest/importMeta"]
  }
}
```

## Writing Tests

### In-Source Unit Tests

Add tests at the end of source files:

```typescript
// Your implementation code here

// In-source tests
if (import.meta.vitest) {
  const { describe, it, expect, beforeEach, afterEach } = import.meta.vitest

  describe('functionName', () => {
    it('should do something', () => {
      expect(result).toBe(expected)
    })
  })
}
```

**Guidelines:**

- Keep tests focused on the module's functionality
- Test private functions when appropriate
- Use `beforeEach`/`afterEach` to manage state
- Avoid global side effects (or clean them up)

### Example Integration Tests

Create new examples in the `examples/` directory:

```typescript
/**
 * Example: Feature Name
 *
 * Demonstrates specific feature or pattern
 */

import { createLogger, feature } from '../src/index.js'

const logger = createLogger('docs:testing:feature')

function exampleUsage() {
  logger.info('=== Example ===\n')
  // Show feature usage
  logger.log('Result:', feature())
}

function main() {
  logger.info('Canon Framework: Feature Example\n')
  exampleUsage()
  logger.info('\n✅ Example completed!')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
```

**Guidelines:**

- Use numbered prefixes (`01-`, `02-`, etc.)
- Include comprehensive comments
- Show real-world usage patterns
- Output results to console
- Update `examples/README.md` with new examples

## Test Coverage

Coverage reports can be generated with vitest directly:

```bash
npx vitest run --coverage
```

Coverage includes:

- `src/**/*.{js,ts}` files
- Excludes: test files, radar, examples

Reports are available in:

- Terminal: Text summary
- Files: `coverage/index.html`

## Best Practices

### Do:

- ✅ Write unit tests for core functionality
- ✅ Write examples for user-facing features
- ✅ Test both success and error cases
- ✅ Keep tests focused and isolated
- ✅ Clean up global state in tests
- ✅ Use descriptive test names

### Don't:

- ❌ Put integration tests in source files
- ❌ Create `.test.ts` files (use in-source instead)
- ❌ Test implementation details
- ❌ Leave global state polluted
- ❌ Skip test cleanup

## CI/CD Integration

Tests run automatically in CI:

```bash
# In CI pipeline
npm run check:all     # All checks (TypeScript + ESLint + Tests)

# Or run individually
npm run check:types   # TypeScript only
npm run check:lint    # ESLint only
npm run check:test    # Tests only
```

## Debugging Tests

### VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["vitest"],
  "console": "integratedTerminal"
}
```

### Command Line

```bash
# Debug specific test file
npx vitest run src/runtime/core.ts --reporter=verbose

# UI mode for interactive debugging
npx vitest --ui
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [In-Source Testing Guide](https://vitest.dev/guide/in-source)
- [Vitest API Reference](https://vitest.dev/api/)
