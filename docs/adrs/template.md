# ADR-XXXX: [Title]

* Status: proposed
* Date: YYYY-MM-DD

## Context and Problem Statement

[Describe the context and problem statement, e.g., in free form using two to three sentences. You may want to articulate the problem in form of a question.]

## Decision Drivers

* [driver 1, e.g., a force, facing concern, …]
* [driver 2, e.g., a force, facing concern, …]
* … <!-- numbers of drivers can vary -->

## Considered Options

* [option 1]
* [option 2]
* [option 3]
* … <!-- numbers of options can vary -->

## Decision Outcome

Chosen option: "[option 1]", because [justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force force | … | comes out best (see below)].

### Positive Consequences <!-- optional -->

* [e.g., improvement of quality attribute satisfaction, follow-up decisions required, …]
* …

### Negative Consequences <!-- optional -->

* [e.g., compromising quality attribute, follow-up decisions required, …]
* …

## Pros and Cons of the Options <!-- optional -->

### [option 1]

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

### [option 2]

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

### [option 3]

* Good, because [argument a]
* Good, because [argument b]
* Bad, because [argument c]
* … <!-- numbers of pros and cons can vary -->

## Links <!-- optional -->

* [Link type] [Link to ADR] <!-- example: Refined by [ADR-0005](0005-example.md) -->
* … <!-- numbers of links can vary -->

---

# Y-Statement Template

For policy decisions and ongoing constraints, use the Y-statement format:

```markdown
---
format: y-statement
---

# ADR-XXXX: [Title]

* Status: [proposed | accepted | rejected | deprecated | superseded]
* Date: [YYYY-MM-DD when the decision was last updated]

## Statement

[The policy or constraint being established - start with a clear, concise statement]

## Rationale

[Why this policy exists - expand on the reasoning]

## Implications

[What this means for future decisions - detail the consequences and requirements]

## References

* [Link type] [Link to ADR or external resource]
* …
```

## Process for Y-Statements

1. **Start with the Statement**: Begin with a clear, concise policy statement
2. **Grow as needed**: Add Rationale and Implications if further detail is required
3. **Use front matter**: Always include `format: y-statement` in front matter
4. **Maintain ADR sequence**: Follow normal ADR numbering
