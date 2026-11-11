# Sagas

A saga is one branch's plan and its record of progress. The shape is the point. Extra files, folders, and tooling wait until a saga actually needs them.

This is the canon form of the saga pattern. `planning/` holds all planning material. The radar, the roadmap, and methodology stay here permanently, and permanent docs may link to them. The root of `planning/` stays uncluttered. Transient work lives in subdirectories:

- `saga/` holds sagas.
- `rrs/` holds remediation records, named `R###-slug.md`. Create `rrs/` only when there is a record to put in it.
- `process/` holds these pattern docs.

## One active saga per branch

The active saga for a branch is `planning/saga/README.md`. It starts with:

- an id, `S###`
- a title
- a purpose
- a goal and how that goal is measured
- the ADRs or debt in scope
- Status

Then a `## Plan` section: the units of work and the open questions. The last section is `## Ledger`.

## Ledger

The ledger opens with a gates matrix. The columns are:

`unit | commit | push | scoped tests | scoped checks | full tests | full checks | smoke`

Each cell is `required`, `N/A`, or `opt-in`. The matrix is configuration. It is never ticked to show progress.

Progress goes in a Notes subsection under the matrix, newest first. A note is committed at every pause.

## When something is wrong

Inquiry goes in this order: observation, hypothesis, probe, issue, candidates, plan, work. An issue is a diagnosis, not a fix. Never diagnose by shipping a fix.

Optional flat child files are added only when they are needed: `observations/o###`, `hypotheses/h###`, `issues/i###`, `candidates/c###`. Do not create those directories in advance.

## When the work ships

The meaning of the work lands in the docs and the ADRs. The saga file is then removed. `saga/` is empty before the pull request goes to review.
