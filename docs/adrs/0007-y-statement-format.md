# ADR-007: Y-Statement Format for ADRs

* Status: accepted
* Date: 2025-01-26

## Context and Problem Statement

We need to document policy decisions and ongoing constraints that are different from architectural decisions. Traditional ADR format is designed for architectural decisions with context, options, and consequences. However, some decisions are more like policy statements that establish ongoing constraints or principles.

## Decision Drivers

* Need to document policy decisions alongside architectural decisions
* Requirement to maintain a single ADR timeline
* Desire to distinguish between architectural and policy decisions
* Need for clear format indication
* Requirement to preserve ADR numbering sequence

## Considered Options

* Separate Y-statements file outside ADR system
* Modified ADR format for policy decisions
* Front matter to indicate format variation
* Completely separate numbering system

## Decision Outcome

Chosen option: "Front matter to indicate format variation", because it maintains the ADR timeline while clearly distinguishing policy decisions from architectural decisions.

### Positive Consequences

* **Single Timeline**: All decisions in one ADR sequence
* **Clear Distinction**: Front matter indicates format type
* **Preserved Structure**: Traditional ADR format maintained for architectural decisions
* **Flexible Format**: Y-statement format available for policy decisions
* **Status Tracking**: Y-statements can still have status and date

### Negative Consequences

* **Format Complexity**: Two different formats in same system
* **Learning Curve**: Contributors need to understand both formats
* **Tooling**: May need special handling for different formats

## Implementation Details

### Y-Statement Format
```markdown
---
format: y-statement
---

# ADR-XXX: Title

* Status: accepted
* Date: YYYY-MM-DD

## Statement
[The policy or constraint being established]

## Rationale
[Why this policy exists]

## Implications
[What this means for future decisions]
```

### Front Matter Usage
- `format: y-statement` - Indicates Y-statement format
- No front matter - Indicates traditional ADR format
- Status and date still required for both formats

## Usage Guidelines

**Use Traditional ADR Format For:**
- Architectural decisions
- Technology choices
- Design patterns
- Implementation approaches

**Use Y-Statement Format For:**
- Policy decisions
- Ongoing constraints
- Principles and standards
- Requirements and mandates

## Links

* [Architecture Decision Records](https://adr.github.io/)
* [Y-Statements](https://y-statements.com/)
