# ADR-005: ESLint Configuration Abstraction

- Status: accepted
- Date: 2025-01-26

## Context and Problem Statement

The ESLint configuration was directly using @antfu/eslint-config in the `eslint.config.js` file. To make the package more useful for consumers and provide a cleaner API, we needed to abstract the ESLint configuration into a reusable function that could be imported and customized.

## Decision Drivers

- Need to provide reusable ESLint configuration for consumers
- Desire to abstract antfu implementation details
- Requirement for easy customization and extension
- Need for consistent configuration across related projects
- Desire to provide a clean, simple API
- Need to support merging of custom options with defaults

## Considered Options

- Keep direct antfu usage in eslint.config.js
- Create wrapper function with basic options
- Create abstraction with defu merging capabilities
- Create separate ESLint configuration package

## Decision Outcome

Chosen option: "Create abstraction with defu merging capabilities", because it provides a clean API while allowing full customization through object merging.

### Positive Consequences

- Clean, abstracted API for consumers
- Easy customization through object merging
- Hides antfu implementation details
- Consistent base configuration across projects
- Flexible extension capabilities
- Simple function-based API

### Negative Consequences

- Additional dependency (defu)
- Slightly more complex internal structure
- Need to maintain abstraction layer

## Implementation Details

- **Abstraction file**: `eslint.js` with `createEslintConfig(options)` function
- **Dependency**: `defu` for object merging
- **Package export**: `"./eslint": "./eslint.js"`
- **Default configuration**: TypeScript, Node.js, standard ignores
- **Merging**: Custom options override defaults using defu
- **API**: Simple function call with optional parameter

## Usage Examples

**Basic usage:**

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig()
```

**With custom options:**

```javascript
import createEslintConfig from '@relational-fabric/canon/eslint'

export default createEslintConfig({
  ignores: ['custom-ignore'],
  rules: {
    'no-console': 'warn',
  },
})
```

**For the package:**

```javascript
// eslint.config.js
import createEslintConfig from './eslint.js'

export default createEslintConfig()
```

## Links

- [defu - Object Merging Library](https://github.com/unjs/defu)
- [@antfu/eslint-config](https://github.com/antfu/eslint-config)
