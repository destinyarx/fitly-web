# Domain docs

These rules tell engineering skills how to read this repository's domain documentation.

## Before exploring

- Read the root `CONTEXT.md`.
- If a root `CONTEXT-MAP.md` appears later, use it to locate the context relevant to the task.
- Read ADRs under `docs/adr/` that affect the area being changed.

If one of these files does not exist, continue without reporting its absence. Domain-modeling skills may create missing documents when the team resolves new terms or decisions.

## Layout

This is a single-context repository:

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

Do not introduce per-feature context documents or a `CONTEXT-MAP.md` unless the repository becomes a genuine multi-context workspace.

## Use the glossary

Use the terms defined in `CONTEXT.md` in issue titles, specifications, refactor proposals, tests, and code. Do not replace established domain terms with casual synonyms.

If a needed concept is missing, first decide whether the proposed term duplicates an existing concept. Record a real gap for later domain modeling.

## Flag ADR conflicts

If proposed work contradicts an ADR, name the ADR and explain why the decision should be reopened. Do not silently override it.
