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
- Plugins are separate packages, each with `modern-errors` as a peer dependency. `modern-errors-serialize` 6.1.1 is MIT and adds 3 packages and about 117 KB. `modern-errors-cli` 6.0.0 is MIT and adds 8 packages and about 178 KB. `modern-errors-http` and `modern-errors-bugs` also exist. Others (clean, process, switch, winston, beautiful) are not considered.

Alternatives considered: keep built-in errors and a convention for message text (no structure, nothing enforces it); hand-write a canon error base class (reimplements cause merging, aggregation and props, which this library already covers and tests).

## Decision

1. We will bless `modern-errors` into canon's kit, following ADR-0008 and ADR-0006 as they stand, and set no new third-party policy. The rule for the line between the kit and `_/` is: whatever canon itself uses comes from the kit. Every part of `modern-errors` that canon uses, plugins included, is exposed through `src/kit.ts` under opinionated kit-facing names. `src/_/modern-errors.ts` is a transparent re-export that only forwards the library for what canon does not use. The library is declared in both `dependencies` and `optionalDependencies`, as ADR-0006 requires.

2. Canon's own errors are built through the kit, not by importing `modern-errors` directly. Canon has one base error, `<BaseError>`, and every canon error is a subclass composed from it. The kit is also the supported way for a consumer to define its own errors, so the facilities below are written for canon and consumers alike, not for canon's needs only.

3. Each error carries, as machine-readable properties:
   - a stable code, in the format `<code format>`, so callers branch on the code and never on message text;
   - details about the failure, as structured data;
   - a reference, as a URI, to the rule the failure comes from. It may point to a canon ADR or to a consumer's own documentation page. It is a URI and not an ADR number, so consumers can use it;
   - hints on how to fix it (decision 4).

   A code is part of the public contract of whoever defines it. Changing a released code is a breaking change.

4. Hints are structured and open to new kinds. They are not a single string. An error may carry several hints, of different kinds, and the set of kinds can grow without changing the error model. The kinds we expect to need, described and not named here, are:
   - a plain-text fix;
   - a suggested value, for a "did you mean" case;
   - a replacement or edit that a tool could apply;
   - a link to documentation;
   - an example snippet;
   - related locations or URIs.

   The names of the kinds are open (open question 4).

5. There are two helpers, in the kit, with names still open (open question 1):
   - one defines an error kind from a code, a message template and a hint. Canon and consumers use it alike, and canon's own errors are defined only this way;
   - one collects failures and throws once, as an aggregate error holding every problem, with the original failures kept as `cause`. `allOrNothing` and any other batch use it. A batch that fails leaves no partial state, as today.

6. The `modern-errors-serialize` plugin is part of the kit from the start. Canon uses it, so under the rule in decision 1 it comes from the kit. The `cli`, `http` and `bugs` plugins stay behind `src/_/` until canon uses them, at which point they move to the kit. Other plugins are not considered.

7. S006 units 5 (no `/` in Theory labels) and 8 (no shadowed inherited terms, decision 25) are the first users. This ADR must be Accepted and merged before either implements it. The remaining throw sites migrate in a later unit, planned in the saga and not here.

8. Whether errors are themselves described as Theories is left open (open question 5). Nothing in this ADR depends on the answer.

This ADR sets direction only. Class layout, the property schema, the hint representation, the code catalogue and the migration order are tactical and go in the saga.

## Consequences

Easier:

- Callers branch on a stable code and read details as data.
- Each failure points to the rule it comes from and carries structured hints, which a tool can act on as well as a person.
- Consumers define their own errors in the same way as canon.
- A batch failure shows every problem at once.
- Unit 5's open error-type choice is closed by this ADR.

Harder, and risks:

- One more runtime dependency: 13 packages and about 275 KB installed, all MIT. Because canon ships its TypeScript source (ADR-0006), consumers install it with canon. The serialize plugin adds 3 packages and about 117 KB. The `cli`, `http` and `bugs` plugins add nothing until canon uses them.
- Error codes become public contract, for canon and for each consumer that defines its own.
- Hints are open to new kinds, so the hint model must stay stable while the set of kinds grows.
- The library is ESM only. Canon is ESM, so this is not a constraint today.
- Declaring the library in both `dependencies` and `optionalDependencies` follows ADR-0006. In the repository today only `defu` is declared in both, and the other kit libraries are in `dependencies` only. This ADR does not change that, and the existing divergence from ADR-0006 stays a separate matter.
- Until the later migration unit lands, canon has two styles of error side by side.

Open questions (for approval before any name or choice is final; placeholders above stand until answered):

1. What are the names of the kit-facing entries (the library, and the serialize plugin), of the two helpers (define an error kind, collect and throw once), and of the reference property? The existing kit names are opinionated (`Immutable`, `objectHash`, `Files`).
2. What is the base class name, `<BaseError>`, and what are the subclass names? The first two subclasses are needed by units 5 and 8.
3. What is the format of the stable code, `<code format>`? For example, whether it carries the ADR number.
4. What are the names of the hint kinds (plain-text fix, suggested value, applicable edit, documentation link, example snippet, related locations), and of the property that holds the hints?
5. Are errors described as Theories, in line with S006 decision 22 (Theory and Morphism are themselves Theories)? Or are they plain classes with no Theory?

Decided here, not open: the serialize plugin is in the kit; `cli`, `http` and `bugs` stay behind `src/_/` until canon uses them.
