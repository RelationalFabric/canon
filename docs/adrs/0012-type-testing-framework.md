# ADR-0012: Type Testing Framework

* Status: accepted
* Date: 2025-11-04

## Context

Canon lacked a lightweight way to express compile-time expectations. Contributors relied on intuition or ad-hoc type aliases to catch regressions. We needed a consistent, documented mechanism to assert relationships between types without introducing runtime overhead.

## Decision

Introduce a dedicated type testing utility module that exports:

1. `Expect<A, B>` – resolves to `true` when `A` extends `B`.
2. `IsTrue<A>` – shorthand for positive assertions.
3. `IsFalse<A>` – shorthand for negative assertions.
4. `invariant<T extends true>()` – runtime no-op that fails compilation when `T` is not `true`.

The helpers live in `src/testing.ts` and are re-exported from the package entry. Core type modules include representative invariants using these utilities for self-validation.

## Consequences

### Positive

- Compile-time guarantees become first-class and enforceable via `tsc --noEmit`.
- Documentation can reference a single, canonical pattern for invariants.
- Utilities are tree-shakeable because they erase at runtime.

### Negative

- Developers must learn the new helpers and apply them consistently.
- Additional lint ordering rules now need to consider type-only specifiers.

### Neutral

- No changes to runtime behaviour; existing APIs remain untouched aside from the new exports.

## Related Decisions

- ADR-0011: Examples Documentation Generation from Source Files.
