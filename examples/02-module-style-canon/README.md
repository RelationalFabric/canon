# Module-Style Canon Example

This example demonstrates how to create a reusable canon module that can be shared across projects or published as an npm package.

## File Structure

```
02-module-style-canon/
├── mongodb-canon.ts    # Canon definition (what you'd publish)
├── usage.ts            # How consumers use the canon
└── README.md           # This file
```

## Pattern Overview

The module-style pattern separates **definition** from **registration**, making canons portable and reusable.

### mongodb-canon.ts (The Module)

This file would be published as a package (e.g., `@my-org/canon-mongodb`):

```typescript
export type MongoDbCanon = Canon<Record<string, unknown>>
export const mongoDbCanon = defineCanon({ axioms: {} })
```

**Key Point:** Uses `defineCanon()` which just returns the config without registering it.

### usage.ts (The Consumer)

This shows how applications would use the published canon:

```typescript
import { mongoDbCanon } from '@my-org/canon-mongodb'

// Register at app startup
registerCanons({ MongoDb: mongoDbCanon })

// Use everywhere
const id = idOf(mongoDocument)
```

## Why This Pattern?

**Module-Style vs Declarative:**

- **Declarative** (`declareCanon`): For internal, app-specific canons
- **Module-Style** (`defineCanon`): For shared, reusable canons

**Benefits:**

1. **Reusable** - One canon definition, many projects
2. **Testable** - Can verify canon structure before registration
3. **Composable** - Import only the canons you need
4. **Versionable** - Publish canons as versioned npm packages

## Real-World Scenario

Imagine you maintain several Node.js apps that all use MongoDB:

1. **Create canon package:** `@acme/canon-mongodb`
2. **Publish once:** Contains MongoDB canon definition
3. **Use everywhere:** All apps import and register it
4. **Update once:** Fix or enhance in one place, all apps benefit

This is exactly how framework-level canons (like JSON-LD, PostgreSQL, Redis) would be distributed.
