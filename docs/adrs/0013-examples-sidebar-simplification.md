# ADR-0013: Examples Sidebar Simplification

- Status: accepted
- Date: 2025-11-08

## Context

The VitePress documentation sidebar listed individual example pages beneath an `Examples` heading. The list had to be maintained manually and diverged from the canonical `docs/examples/` index that is generated from source files. Contributors regularly add or rename examples, which makes the hardcoded sidebar fragile and increases the risk of broken navigation.

## Decision

Replace the nested examples submenu with a single `Examples` link that points to `docs/examples/`. Rely on the examples index page and its generated table of contents to surface individual scenarios rather than duplicating them in the sidebar config.

## Consequences

### Positive

- Sidebar maintenance now aligns with the generated examples index; no manual updates when new examples land.
- Navigation remains consistent regardless of how many examples exist or how they are ordered.

### Negative

- Readers must click one level deeper to access a specific example instead of selecting it directly from the sidebar.

### Neutral

- The change is limited to navigation metadata; example content and generation scripts remain untouched.

## Related Decisions

- ADR-0011: Examples Documentation Generation from Source Files.
