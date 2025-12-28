# Type Testing Utilities

Canon provides zero-runtime-cost helpers for asserting type relationships at compile time. Use them to guard against regressions and to document expectations directly in your code.

## Quick Start

```ts
import type { Expect, IsFalse, IsTrue } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

interface User {
  id: string
  role: 'admin' | 'user'
}

// Positive assertion – `id` must be a string
invariant<Expect<User['id'], string>>()

// Negative assertion – `role` should not be a number
invariant<IsFalse<Expect<User['role'], number>>>()

// Exact match in both directions
type CanonicalRole = 'admin' | 'user'
invariant<Expect<User['role'], CanonicalRole>>()
invariant<Expect<CanonicalRole, User['role']>>()
```

## API Reference

- `Expect<A, B>` – resolves to `true` when `A` extends `B`, otherwise `false`.
- `IsTrue<A>` – shorthand for `Expect<A, true>`.
- `IsFalse<A>` – resolves to `true` when `A` is exactly `false`.
- `invariant<T extends true>()` – runtime no-op that fails to compile if `T` is not `true`.

## Best Practices

- Prefer positive assertions (`Expect<T, Expected>`) and accompany negative checks with `@ts-expect-error` comments.
- Co-locate invariants near the types they verify so the intent stays visible during reviews.
- Prefix invariants with `void` when you do not need the return value – this keeps ESLint happy in expression contexts.
- Combine invariants with helper aliases such as `type Assert<T extends true> = T` when you need to express complex relationships without introducing runtime statements.

## Self-Validation Patterns

```ts
import type { Expect, IsFalse, IsTrue } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

invariant<Expect<true, true>>()
invariant<Expect<'value', string>>()
invariant<IsFalse<Expect<string, number>>>()

// @ts-expect-error - Expect should fail when the left side does not extend the right.
invariant<Expect<{ id: string }, { id: number }>>()

// @ts-expect-error - IsTrue rejects non-true values.
invariant<IsTrue<false>>()

// @ts-expect-error - IsFalse only accepts precisely `false`.
invariant<IsFalse<true>>()
```

## Integration Tips

- **IDE Feedback** – failed invariants surface as regular TypeScript errors. Jump to definition from the error to inspect the assertion.
- **CI/CD** – invariants run automatically when you execute `npm run check:types` (`tsc --noEmit`). No additional tooling is required.
- **Examples** – use the utilities inside example files with `invariant<Expect<...>>()` to keep lint checks satisfied.

## Advanced Usage

### Domain-Specific Helpers

```ts
import type { Expect } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

type ElementType<T> = T extends Array<infer E> ? E : never

invariant<Expect<ElementType<string[]>, string>>()
invariant<Expect<ElementType<Array<{ id: string }>>, { id: string }>>()
```

### Conditional Assertions

```ts
import type { Expect } from '@relational-fabric/canon'
import { invariant } from '@relational-fabric/canon'

type NonEmptyArray<T> = T extends [unknown, ...unknown[]] ? true : false

invariant<Expect<NonEmptyArray<[number]>, true>>()
invariant<Expect<NonEmptyArray<[]>, false>>()
```

### Error Message Clarity

Name intermediate types before asserting them so that TypeScript produces clean diagnostics:

```ts
type EmailAddress = User['email']

// @ts-expect-error - Emails are strings, not numbers
invariant<Expect<EmailAddress, number>>()
```

These utilities are lightweight enough to use directly in production code, tests, and examples. Because they erase at runtime, they keep bundles lean while still documenting intent.
