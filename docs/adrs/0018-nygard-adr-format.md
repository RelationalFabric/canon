---
format: y-statement
---

# ADR-0018: Nygard ADR Format

- Status: proposed
- Date: 2026-11-01

## Statement

Every architectural ADR uses Michael Nygard's format and only these sections, in this order: Title, Status (with Date), Context, Decision, Consequences. Policy ADRs keep the Y-statement format from ADR-0007. New ADRs start from `docs/adrs/template.md`.

## Rationale

ADRs so far have used three different heading sets: MADR-style (Considered Options, Decision Drivers, Pros and Cons), a plain Context/Decision/Consequences layout, and variants that add Open Questions and Implementation Details. `docs/adrs.md` already names Nygard's format but supplied no template, so authors copied whichever ADR was nearest. Every extra section is either unused or fits within Nygard's three: drivers and options go in Context, implementation notes go in Decision, and open questions and follow-ups go in Consequences.

## Implications

- `docs/adrs/template.md` holds the Nygard template, and `docs/adrs.md` points to it.
- New ADRs, including those still proposed, use the template.
- Accepted ADRs are not rewritten; their content stays as decided.
