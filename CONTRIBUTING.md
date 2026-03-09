# Contributing to PerioNote

This repository is built for collaborative development of dental and periodontal note templates.

The project supports:

- native TSX templates
- imported legacy JSX templates
- summary builders
- preview pages
- fixture tests
- Playwright coverage
- GitHub + Codex collaboration

## Contribution Principles

When contributing to PerioNote, prioritize:

- small, reviewable changes
- working previews over perfect architecture
- stable summary output
- safe imports of legacy JSX
- gradual cleanup instead of large rewrites

## Branching Rules

Do not commit directly to `main`.

Always create a branch.

Recommended naming:

- `feat/...` for new features
- `fix/...` for bug fixes
- `refactor/...` for cleanup
- `test/...` for tests
- `docs/...` for documentation
- `codex/...` for Codex-generated implementation work

Examples:

- `feat/import-plaque-template`
- `fix/summary-newline-formatting`
- `refactor/extract-finding-row`
- `test/add-playwright-smoke-template-browser`
- `docs/add-migration-checklist`
- `codex/import-legacy-gingival-template`

## Pull Request Rules

All changes must go through a pull request.

Each PR should explain:

- what changed
- why it changed
- whether the change affects native or imported templates
- whether summary output changed
- whether tests were added or updated
- what still remains unfinished

### Include in the PR when relevant

- screenshots for UI-visible changes
- note output before/after examples
- links to fixtures or tests
- migration notes if a legacy template was imported

## Review Checklist

Before merging, review for:

- preview route renders successfully
- component compiles without syntax errors
- summary output still reads correctly
- no unrelated files were changed unnecessarily
- no unnecessary dependency was added
- fixture expectations match the new behavior
- screenshots are present for visible UI changes
- tests pass or known failures are documented

## Imported Legacy Template Workflow

Imported templates should follow the quick-import strategy.

### Required steps

1. archive the original JSX in `legacy/imported-jsx/...`
2. create a TSX wrapper in `components/templates/imported/...`
3. add a preview route in `app/templates/...`
4. make it render
5. extract summary generation into `lib/templates/summary/...`
6. add fixture-based Vitest coverage
7. add a Playwright smoke test
8. document known limitations

### Do not do this on first import unless necessary

- rewrite the whole UI
- fully normalize styling
- aggressively refactor shared structures
- redesign the template layout

The goal is **working import first**.

## Native Template Workflow

For new templates built directly in PerioNote:

1. create the template component in `components/templates/native/...`
2. add a preview page
3. add a summary builder
4. add fixture data
5. add Vitest coverage
6. add a Playwright smoke test
7. register the template in the template registry

## Testing Expectations

### Minimum expected for a template PR

- preview route renders
- one fixture-based summary test exists
- summary output remains readable and segmented

### Preferred for stable templates

- Playwright smoke test
- at least one interactive E2E test
- regression coverage for note formatting

## Summary Output Guidelines

PerioNote summaries should prefer:

- headings
- indentation
- clear grouped sections
- short lines
- chart-friendly formatting

Avoid dense paragraph-only summaries unless explicitly requested for a specific template.

## File Organization Expectations

Use the repository structure consistently.

### Production paths

- `components/templates/native/`
- `components/templates/imported/`
- `lib/templates/summary/`
- `lib/templates/fixtures/`
- `app/templates/`
- `tests/vitest/`
- `tests/playwright/`

### Archive path

- `legacy/imported-jsx/`

## Working with Codex

Codex should work on focused tasks only.

Before using Codex:

- define the exact goal
- define which files may change
- define the expected output
- define the non-goals

Do not ask Codex to do import, redesign, refactor, and full test coverage all at once.

See [`docs/codex-workflow.md`](./docs/codex-workflow.md).

## Commit Guidance

Prefer small commits with clear messages.

Examples:

- `Import legacy gingival description template`
- `Extract gingival summary builder`
- `Add fixture test for bleeding summary`
- `Add preview page smoke test`

## Definition of Done

### Imported template is done enough to use when:

- original JSX is archived
- wrapper renders successfully
- preview page exists
- summary output works
- one fixture test exists
- one smoke test exists
- known limitations are documented

### Native template is done when:

- template renders
- preview page exists
- summary builder exists
- fixture test exists
- smoke test exists
- template is registered

## What to Avoid

Avoid:

- direct pushes to `main`
- giant multi-purpose PRs
- silent output-format changes without fixture updates
- deleting archived legacy JSX after import
- mixing unrelated refactors into bug-fix PRs
- adding dependencies casually

## When in Doubt

Choose the smaller change.

If a template is messy, make it render first. Then clean it up in follow-up PRs.

