# Drip-feed

Agent-driven work on a canon branch is released one unit at a time. It is slower, and the state of the branch stays predictable.

## Units

Split the work into units. One unit is one commit. One long-lived agent works the branch. The model is set per unit: Composer 2.5 for an M unit and for executing a committed plan; Grok 4.7 for an S or H unit, and for planning, review, and diagnosis. Fast mode stays off.

## The unit brief

A brief names the files and symbols, what changes, the validation commands, what is out of scope, and which earlier units it depends on. It does not depend on later units. There is no design freedom. If the unit cannot be done as written, the agent stops and reports. It does not improvise.

## Push, then stop

The agent pushes with the normal git hooks. It does not pass `--no-verify`, set `HUSKY=0`, force-push, or rebase. It then stops and reports the commit SHA, the hook output, and a file:line summary of the change.

## Review before the next unit

Before the next unit is released, a reviewer checks:

- the remote head is the reported SHA
- the hooks actually ran
- the diff matches the brief and adds nothing out of scope
- checks and CI are green, or any red is not attributable to the unit
- failures are diagnosed from evidence

Then the ledger note is updated.

## Overrun

If the agent goes past the brief, stop it. Review the overrun as its own unit. Keep it only when it is in scope and clean. Otherwise revert it. Tighten the next brief.
