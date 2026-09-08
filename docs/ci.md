# CI and release gates

`ci.yml` validates every PR, pushes to `main` and `beta`, and manual dispatches.
The `quality` job runs `npm ci`, installs Chromium and its Linux dependencies,
then executes `npm run ci:local`: version metadata, zero-warning ESLint, unit
tests, a production static export, and Chromium tests against that exact export.
Next.js's build also checks TypeScript. Standalone Playwright commands still
build first; `test:e2e:built` explicitly opts into serving an existing export.

On main, quality uploads `out/` only after every check succeeds. The artifact
name contains the source SHA and producing run attempt. Its name is passed as
a job output so retrying only a failed deployment still selects the original
validated artifact. The reusable Pages workflow consumes it from the same CI
run, without checking out code or rebuilding. It skips a superseded main commit.
No cross-run artifact lookup or privileged `workflow_run` handler is involved.

The reusable Version workflow also depends on quality. It opens the version PR,
tags releases, archives tagged source, and fast-forwards Beta only to the
validated SHA. Beta sync requires the checkout to match `GITHUB_SHA`, skips a
superseded main commit, and refuses divergent/newer Beta history. It never
force-pushes. The normal Git push also rejects incompatible concurrent updates.
Tags and archives retain their existing retry behavior. Pages does not depend
on tagging. Manual dispatch validates any selected ref but publishes only main
and does not start Version; use failed-job retries in the original push run to
retry release work.

## Runtime and diagnostics

Chromium is required; WebKit remains advisory per CONTRIBUTING.md. CI uses two
browser workers, one retry, rejects focused tests, and fails on flaky tests even
when a retry passes. Traces, screenshots, and video are retained on failure; the
HTML report and test-results directory are uploaded for seven days whenever the
job has not been cancelled. Failures before Playwright starts may have no report.
The suite has a ten-minute global timeout, individual tests have thirty seconds,
and the validation step has twenty-two minutes within a thirty-minute job.
Release jobs have ten-minute limits; Pages has an eight-minute action timeout
within a ten-minute job. Cancellation can prevent diagnostic upload.

PR/Beta runs cancel superseded runs. Concurrency groups include the event type
and PR number or ref. Main pushes serialize without interruption; manual
dispatches use a separate group so they cannot replace a pending main push and
skip its versioning/Beta synchronization. Pages deployments still share their
deployment lock across event types. Within each group, GitHub concurrency can
replace pending runs; branch-tip checks prevent an old rerun from knowingly
promoting a superseded commit.
These checks are not a transaction with subsequent changes to main, but every
published artifact and every automatic Beta target has passed validation.

## Permissions and dependency maintenance

Default permissions are `contents: read`. Validation does not persist checkout
credentials. Pages alone receives `pages: write` and `id-token: write`; version
and Dependabot expiry PR creation receive `pull-requests: write`. Release/tag/archive/Beta jobs
receive `contents: write` for their specific Git operations. Privileged jobs do
not restore dependency caches. PR code receives neither deployment credentials
nor release permissions, including fork and Dependabot PRs.

Actions are pinned to upstream release SHAs: checkout 7.0.1, setup-node 7.0.0,
upload-artifact 7.0.1, upload-pages-artifact 5.0.0, deploy-pages 5.0.0, and
Changesets action 1.9.0. Changesets action v2 requires CLI v3, so its major update
and the CLI major update are deferred for a coordinated migration. See the
[upstream migration notes](https://github.com/changesets/action/blob/v2.1.2/CHANGELOG.md).
Weekly Dependabot PRs target the default branch for Actions and npm, with five
open PRs per ecosystem. Next/config and React/types updates are grouped. Updates
are reviewed through the same PR gate; no automatic merging is configured.
Node is selected from package.json, matching the local Volta pin.

## Temporary Dependabot ignores

Put an expiry annotation immediately before an `ignore` entry, at the same
indentation, with no intervening blank line or comment:

```yaml
      # ignore-until: 2026-10-28
      - dependency-name: "@types/node"
        versions: ["^26.0.0"]
```

`dependabot-expiry.yml` runs daily at 08:37 UTC and supports manual dispatch on
the default branch. It compares the current UTC calendar date using `>=`, so a
delayed or missed run catches expired dates on its next run. GitHub schedules
are best effort, not exact-time guarantees. The workflow must reach the default
branch before scheduled runs start.

The built-in-only preflight skips dependency installation when nothing is due.
When a date is due, `npm ci --ignore-scripts` installs locked dependencies and a
YAML parser validates the annotations and resulting edit. Only expired entries
and any resulting empty `ignore` key are removed. Future/undated rules, unrelated comments,
quoting, and line endings are preserved. Invalid dates, misplaced annotations,
and unsupported annotated flow mappings/anchors fail without writing the file.
The annotation belongs to a whole ignore entry, not an individual version range.

The workflow creates or updates one PR from the reserved branch
`automation/expired-dependabot-ignores`, committing only `.github/dependabot.yml`.
It never merges or upgrades dependencies. Review and merge the removal PR before
Dependabot can propose those updates again on its regular schedule. If an update
needs more time, extend the date on the default branch; the next check updates
the pending PR or closes it when no removals remain. Avoid manual edits to this
automation-owned branch. Bot-command ignores stored separately by Dependabot
are not managed by this workflow.

PR creation uses `GITHUB_TOKEN` with job-scoped contents/PR write permission and
a five-minute timeout. Checkout credentials are not persisted, and no privileged
dependency cache is restored. On 2026-09-07, the repository's Actions setting
already allowed PR creation; no setting was changed. GitHub-created PR workflow
runs may require **Approve workflows to run**, as with version PRs. Scheduling,
PR creation/update/closure, and that approval path still require hosted testing.

Preview a date locally without modifying the configuration:

```bash
node scripts/expire-dependabot-ignores.mjs --preview --date 2026-10-28
npm run test -- tests/vitest/dependabotExpiry.test.ts
```

`--check` performs only the dependency-free annotation preflight; `--preview`
performs full validation. `--write` applies the validated edit locally. The
workflow always uses the actual UTC date; it exposes no date-override input.

See [GitHub scheduling](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
and [token-triggered PR workflow approval](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow).

## Live settings inspected on 2026-09-07

Read-only GitHub API inspection of `bbilaniu/perionote` found:

- Neither main nor beta has classic branch protection or effective ruleset rules.
- `Protect Main` is disabled and contains no required status checks.
- `Protect release archives` is active.
- Dependabot security updates and repository auto-merge are disabled.

No settings were changed. After a hosted run confirms the displayed check name,
consider requiring `quality` for main and beta PRs and preventing direct pushes.
Beta's intended bot fast-forward needs an explicit policy decision when adding
protection. Enabling Dependabot security updates is also a separate settings
change; this config supplies scheduled version-update PRs.

A `GITHUB_TOKEN` Beta push does not trigger another Actions run, so automatic
sync relies on validation of the identical main SHA. Human Beta pushes do run CI.
The existing Cloudflare Git integration builds independently of GitHub Actions;
this change gates automatic Beta promotion, not direct human Beta pushes or
Cloudflare's rebuild. Protecting those paths requires separate hosting/repository
settings and is outside this change. Version PRs created with `GITHUB_TOKEN`
start PR workflows in an approval-required state; a maintainer must approve those
runs. See GitHub's [token event behavior](https://docs.github.com/en/actions/concepts/security/github_token).

## Local verification on 2026-09-07

- Clean `npm ci` on Node 24.18.0/npm 11.16.0 succeeded without lockfile changes;
  npm reported zero vulnerabilities.
- `CI=true npm run ci:local` passed: version metadata, zero-warning ESLint,
  329 unit tests across 33 files, production export with TypeScript checking,
  and all 201 Chromium tests. Chromium took 4.6 minutes with no retries needed.
- Five new local-Git integration cases cover Beta fast-forward/retry, a wrong
  checkout SHA, superseded main, divergent Beta, and newer Beta.
- An isolated deliberate browser failure produced trace ZIPs, screenshots,
  video, and an HTML report on both attempts. The probe was removed afterward.
- Actionlint 1.7.12, YAML parsing, shell syntax, and `git diff --check` passed.
  Changesets status confirmed no package version bump for the empty
  infrastructure changeset.

The existing Playwright suite initially failed to load its package.json import
under Node 24. A separate one-line test commit adds the required
[JSON import attribute](https://nodejs.org/api/esm.html#import-attributes).
No application behavior changed. WebKit was not run; it remains advisory.

## Hosted verification still required

Check PR (including fork/Dependabot), main, Beta, and manual-dispatch runs; confirm
failed quality skips both downstream workflows. With a main push active and a
second main push pending, dispatch CI manually on main and confirm the pending
push survives and runs versioning/Beta synchronization after validation.
Inspect failure diagnostics and Linux browser runtime. Verify same-run Pages
artifact consumption, failed-job
retry artifact selection, Pages environment/OIDC authorization, Changesets PR
creation, release/archive operations, and the bot Beta push. Local runs cannot
verify GitHub's job scheduler, token/environment permissions, artifact service,
Dependabot scheduling, or external Cloudflare builds.
