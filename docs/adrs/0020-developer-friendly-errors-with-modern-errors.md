# ADR-0020: Developer-Friendly Errors with modern-errors

Date: 2026-11-12

## Status

Proposed

## Context

Canon throws plain `Error` and `TypeError` values. A thrown value carries a message and nothing else. A caller cannot branch on the kind of failure without matching message text. The message does not say which ADR the rule comes from, or how to fix the call. When several things are wrong in one operation, for example a batch that registers many definitions, the caller sees the first failure only.

S006 is about to add two new failures, a `/` in a Theory label (unit 5) and a Theory that shadows an inherited term (unit 8, S006 decision 25). Unit 8 is blocked on unit 5's open choice between a built-in `TypeError` and a canon error class. That choice is better made once, for all errors, than twice for two throw sites.

Canon already has a policy for third-party libraries, and this ADR follows it without changing it:

- ADR-0008 (dual export strategy): a library is blessed into the kit, `src/kit.ts`, under an opinionated name, and is also re-exported unchanged from `src/_/<library>.ts` so the original contract stays reachable.
- ADR-0006 (unbuilt TypeScript library): a library canon uses and passes to consumers is declared in both `dependencies` and `optionalDependencies`, so consumers get the same version canon uses.
- The kit today holds, for example, `Immutable`, `objectHash` and `Files`, with transparent re-exports in `src/_/immutable.ts` and `src/_/object-hash.ts`.

`modern-errors` fits that policy. Facts checked against the npm registry on 2026-11-12:

- Version 7.1.4, MIT licence, published 2025-10-09, the `latest` dist-tag. ESM only, `engines.node >=18.18.0` (canon requires Node 22 or later, ADR-0009). It ships TypeScript types.
- 10 direct dependencies and 13 packages in total. A clean install is about 275 KB of files, of which `modern-errors` itself is 97,459 bytes unpacked.
- It supports error classes composed by subclassing, per-error `props`, wrapping an inner error through the standard `cause` option, and an `errors` option that aggregates several errors into one, for any error class and not only `AggregateError`.
- Plugins are separate packages, each with `modern-errors` as a peer dependency. The two considered here: `modern-errors-serialize` 6.1.1 (MIT, adds 3 packages and about 117 KB) and `modern-errors-cli` 6.0.0 (MIT, adds 8 packages and about 178 KB). Others exist (bugs, clean, http, process, switch, winston, beautiful) and are not considered.

Alternatives considered: keep built-in errors and a convention for message text (no structure, nothing enforces it); hand-write a canon error base class (reimplements cause merging, aggregation and props, which this library already covers and tests).

## Decision

1. We will bless `modern-errors` into canon's kit, following ADR-0008 and ADR-0006 as they stand, and set no new third-party policy. That means:
   - a transparent re-export at `src/_/modern-errors.ts`;
   - an opinionated entry in `src/kit.ts` under a kit-facing name `<KitName>`;
   - declaration in both `dependencies` and `optionalDependencies`, as ADR-0006 requires.

2. Canon's own errors are built through the kit, not by importing `modern-errors` directly. Canon has one base error, `<BaseError>`, and every canon error is a subclass composed from it.

3. Each canon error carries, as machine-readable properties:
   - a stable code, in the format `<code format>`, so callers branch on the code and never on message text;
   - details about the failure, as structured data;
   - the ADR that the failed rule comes from;
   - a hint on how to fix it.

   The code is part of canon's public contract once released. Changing one is a breaking change.

4. An operation that can fail in several places reports every problem, not the first. A batch such as `allOrNothing` throws one aggregate error, using the library's `errors` option, holding one error per problem. A failure that wraps another keeps the original as its `cause`. A batch that fails leaves no partial state, as today.

5. S006 units 5 (no `/` in Theory labels) and 8 (no shadowed inherited terms, decision 25) are the first users of the kit's errors. This ADR must be Accepted and merged before either implements it. The remaining throw sites migrate in a later unit, planned in the saga and not here.

6. Plugins are taken only where a consumer need is shown, and none is decided here (open question 5).

7. Whether errors are themselves described as Theories is left open (open question 6). Nothing in this ADR depends on the answer.

This ADR sets direction only. Class layout, the property schema, the code catalogue and the migration order are tactical and go in the saga.

## Consequences

Easier:

- Callers branch on a stable code and read details as data.
- Each failure points to the ADR that requires the rule and says how to fix the call.
- A batch failure shows every problem at once.
- Unit 5's open error-type choice is closed by this ADR.

Harder, and risks:

- One more runtime dependency: 13 packages and about 275 KB installed, all MIT. Because canon ships its TypeScript source (ADR-0006), consumers install it with canon. Plugins would add to that, at the figures above.
- Error codes become public contract.
- The library is ESM only. Canon is ESM, so this is not a constraint today.
- Declaring the library in both `dependencies` and `optionalDependencies` follows ADR-0006. In the repository today only `defu` is declared in both, and the other kit libraries are in `dependencies` only. This ADR does not change that, and the existing divergence from ADR-0006 stays a separate matter.
- Until the later migration unit lands, canon has two styles of error side by side.

Open questions (for approval before any name or choice is final; placeholders above stand until answered):

1. Is `modern-errors` blessed for consumers (kit entry and transparent re-export both public), or internal to canon only?
2. What is the kit-facing name, `<KitName>`? The existing kit names are opinionated (`Immutable`, `objectHash`, `Files`).
3. What is the base class name, `<BaseError>`, and what are the subclass names? The first two subclasses are needed by units 5 and 8.
4. What is the format of the stable code, `<code format>`? For example, whether it carries the ADR number.
5. Which plugins, if any? `modern-errors-serialize` (errors crossing a process or network boundary) and `modern-errors-cli` (canon's own CLI) are the two considered, with the cost above.
6. Are errors described as Theories, in line with S006 decision 22 (Theory and Morphism are themselves Theories)? Or are they plain classes with no Theory?
