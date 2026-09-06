# Issue tracker: local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

## Conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Put the specification at `.scratch/<feature-slug>/spec.md`.
- Put implementation issues at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`.
- Number issue files from `01`. Do not combine every ticket into one file.
- Record triage state in a `Status:` line near the top of each issue. See `triage-labels.md` for the accepted values.
- Append conversation history under a `## Comments` heading.

## Publishing to the issue tracker

When a skill says to publish an issue or specification, create the corresponding file under `.scratch/<feature-slug>/`, including its parent directories when needed.

## Fetching a ticket

Read the referenced issue path. The user will normally provide the path or issue number.

## Wayfinding operations

The map has one child file per ticket.

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions so far, and Fog.
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`, with `Type:` and `Status:` lines.
- Allowed wayfinding types: `research`, `prototype`, `grilling`, and `task`.
- Allowed wayfinding statuses: `claimed` and `resolved`.
- Blocking: record `Blocked by: NN, NN`. A ticket becomes unblocked when every listed ticket is `resolved`.
- Frontier: scan for the first numbered ticket that is open, unblocked, and unclaimed.
- Claim: set `Status: claimed` and save before starting work.
- Resolve: add the answer under `## Answer`, set `Status: resolved`, then append a short context pointer to the map.
