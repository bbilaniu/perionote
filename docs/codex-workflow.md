# Codex Workflow

Use Codex for focused, reviewable tasks in PerioNote.

## Scope each Codex task

- one template import, or
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
