# PerioNote

PerioNote is a Next.js + Tailwind workspace for building, previewing, importing, and testing periodontal and dental hygiene note templates.

It is designed for two kinds of work at the same time:

- a **template library** of reusable TSX components and summary builders
- a **preview app** where templates can be opened, filled, and visually reviewed

The repo is also structured to support **quick import of legacy ChatGPT-generated JSX templates**, followed by gradual cleanup into a more maintainable TSX-based architecture.

## Goals

- preview templates in the browser
- import existing standalone JSX templates quickly
- generate polished, segmented clinical note output
- support fixture-based testing for summaries
- support Playwright preview and E2E testing
- support safe GitHub + Codex collaboration
- support local development and preview deploys

## Tech Stack

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Vitest** for summary and helper tests
- **Playwright** for preview and E2E tests
- **GitHub** for source control and PR workflow
- **Codex** for scoped implementation tasks

## Architecture

PerioNote is intentionally both:

- a **runnable app**
- a **template component library**

That allows contributors to:

- open templates directly in the browser
- refine summary formatting safely
- import older JSX templates without blocking on a full refactor
- extract shared logic over time

## Recommended Repository Structure

```text
PerioNote/
  app/
    page.tsx
    templates/
      page.tsx
      [templateSlug]/
        page.tsx

  components/
    templates/
      registry.ts
      shared/
      native/
      imported/

  lib/
    templates/
      summary/
      fixtures/
      adapters/
      validation/

  legacy/
    imported-jsx/

  tests/
    vitest/
    playwright/

  docs/
    codex-workflow.md
    contributor-workflow.md
    migration-checklist.md

  .github/
    workflows/
```

## Template Types

### Native templates
These are templates written directly for PerioNote in TSX.

### Imported templates
These are templates migrated from older standalone JSX files. The import strategy is **render first, refactor later**.

## Expected Template Shape

A mature template should eventually have:

- a TSX component
- a preview page
- a summary builder
- a sample fixture
- a Vitest test
- a Playwright smoke test

Example:

```text
components/templates/native/GingivalDescriptionForm.tsx
lib/templates/summary/buildGingivalDescriptionSummary.ts
lib/templates/fixtures/gingivalDescription.fixture.ts
app/templates/gingival-description/page.tsx
tests/vitest/gingivalDescriptionSummary.test.ts
tests/playwright/gingival-description.spec.ts
```

## Legacy Import Strategy

Imported ChatGPT-generated JSX files should follow this order:

1. archive the original file in `legacy/imported-jsx/`
2. create a wrapper TSX component in `components/templates/imported/`
3. make it render in the preview app
4. extract summary generation into `lib/templates/summary/`
5. add fixture-based tests
6. add preview smoke tests
7. clean up structure gradually

Do not block imports on perfect typing or architecture.

## Development Workflow

### Standard flow

1. pull latest `main`
2. create a branch
3. make a focused change
4. run relevant tests
5. open a PR
6. review and merge

### Branch examples

- `feat/import-gingival-template`
- `fix/summary-indentation`
- `refactor/extract-summary-builder`
- `test/add-playwright-smoke-gingival`
- `codex/add-template-registry`

## Testing Strategy

### Vitest
Use for:

- summary builders
- formatter helpers
- fixtures
- note output expectations

### Playwright smoke tests
Every preview page should have a smoke test that confirms:

- the route loads
- the template title appears
- the summary panel appears

### Playwright E2E
Use full E2E only for important or stable templates.

## Summary Style

Generated notes should prefer:

- headings
- indentation
- short lines
- no wall-of-text summaries unless explicitly requested

Example:

```text
Visit Details:
  Date: 2026-03-08
History and Exam:
  Patient concerns: Bleeding gums.
Gingival Description:
  Color: Pink (generalized; teeth #5; location Facial; distribution Marginal; Mild).
Next Appointment:
  Planned care: 4 bitewings and re-evaluation.
  Recall frequency: 4 months.
```

## Local Commands

Expected commands:

```bash
npm install
npm run dev
npm run test
npm run test:e2e
npm run lint
```

First-time E2E setup:

```bash
npx playwright install chromium
```

## Preview Deploys

PerioNote should support both:

- local preview during development
- automatic preview deploys for branch review on iPad, MacBook, or desktop

## Codex

Codex should be used for small, scoped tasks.

Good Codex tasks:

- import one legacy template
- extract one summary builder
- add one fixture test
- add one preview smoke test

Avoid mixing import, redesign, refactor, and full testing in one Codex task.

See [`docs/codex-workflow.md`](./codex-workflow.md) for the workflow.

## Contribution Guidelines

Before opening a PR, make sure:

- the template renders
- summary output still works
- no obvious TSX parse issues were introduced
- fixtures are updated if output changed
- screenshots are included for visible UI changes

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full contributor workflow.

## Current Priority

1. bootstrap Next.js + Tailwind
2. add template registry
3. create template browser page
4. import existing JSX templates
5. extract summary builders
6. add fixture and smoke coverage
7. enable preview deploys
8. formalize Codex PR workflow

## Design Principle

PerioNote is a clinical template workspace.

The priority is to make templates:

- usable
- previewable
- testable
- reviewable

Start by making templates work. Improve structure incrementally.
