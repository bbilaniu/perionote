# Codex Workflow

Use Codex for focused, reviewable tasks in HygieneNote.

## Scope each Codex task

- one wrapper-first legacy template import, or
- one summary builder extraction, or
- one fixture/test addition

## Required prompt details

- branch name
- allowed files to edit
- expected output
- non-goals

## Review before merge

- run `npm run lint`
- run `npm run test`
- run `npm run test:e2e` for preview-impacting changes
- include screenshots for visible UI changes

## Legacy import default

For legacy JSX, prefer:

1. wrap first (make it render with minimal changes)
2. smoke test the route
3. refactor/extract summaries later in separate PRs
