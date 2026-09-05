# Changesets

Changesets records user-visible changes and turns them into application version
and changelog updates.

For a feature or fix:

1. Run `npm run changeset`.
2. Select `hygienenote` and the appropriate semantic version increment.
3. Commit the generated Markdown file with the feature branch.

Changesets are not a required pull-request check. Contributors can edit
templates normally, including through GitHub's web editor; a maintainer can add
the release-note entry before merge when the change should appear in the
changelog.

Do not run `npm run version` on a feature branch. After changesets reach
`main`, the Version workflow opens or updates a `Version Packages` pull
request. Merging that pull request consumes the pending entries, updates the
private application version, and updates `CHANGELOG.md` and `package-lock.json`.

When that version update is merged into `main`, the Version workflow validates
the package and lockfile versions, the latest changelog heading, and the absence
of pending changesets, then creates and pushes `vX.Y.Z` at the merged commit.
It detects the version change relative to the commit's first parent, so merge
and squash merges work even if the PR title changes. Merge each version PR
separately; an ordinary commit at the end of a batch push does not trigger tagging.

Rerunning the workflow accepts a tag already pointing to the same commit and
refuses to move an existing tag to another commit. If tagging fails, fix the
cause and rerun the failed workflow at the original release commit. The `beta`
branch fast-forwards after tagging succeeds; ordinary pushes with no version
change skip tagging and still sync `beta`.

After a release tag is published, a separate archive job creates
`archive/vX.Y.Z` at that tag's exact commit. It checks the published tag against
the checkout, refuses an existing archive branch at another commit, and verifies
the remote branch after creation. Retries accept an archive already at the same
commit. Ordinary pushes do not start the archive job. The job summary records
the tag, commit and branch; Cloudflare's separate build reports deployment success.

The `Protect release archives` repository ruleset allows creation of
`archive/*` branches and blocks subsequent updates, force pushes and deletion,
with no bypass actors. Its configuration is tracked in
[`archive-branches.json`](../.github/rulesets/archive-branches.json). This file
documents the desired live GitHub ruleset; committing it alone does not install
or update repository rules. Administrators must manage that ruleset separately.

If archiving fails, rerun the archive job from the original release workflow.
Do not move a tag or archive branch to repair a failed build. A failed Cloudflare
build can be retried for the same branch and commit from the Cloudflare dashboard.

Run `npm run versioning:check` locally to check version metadata. CI also runs
this check and permits pending changesets during development. The workflow uses
`npm run release` (`changeset tag`) to create the local tag before pushing that
specific tag; contributors should normally let the workflow perform this step.

This repository does not publish an npm package or automatically create GitHub
Release entries. Git tags record source versions; GitHub Pages deployment
remains controlled by `deploy-pages.yml` and is independent of tagging.

## Cloudflare archive previews

The `perionote` Worker is connected to `bbilaniu/perionote`. Its dashboard
configuration was inspected on 2026-09-05:

| Setting | Value |
| --- | --- |
| Production branch | `beta` |
| Production URL | `https://beta.hygienenote.com` |
| Builds for non-production branches | Enabled |
| Build command | `npm run build` |
| Production deploy command | `npx wrangler deploy` |
| Non-production version command | `npx wrangler versions upload` |
| Node version | `24` |
| Build watch paths | Include `*`; exclude `node_modules/*`, `.git`, `docs/*` |
| Preview URLs | Enabled |

This includes new `archive/vX.Y.Z` branches in non-production builds. Their
versions are uploaded as previews without replacing the production deployment.
Open the branch's successful Workers Build to obtain its preview URL. The
`archive/` prefix identifies the frozen source branch; Cloudflare treats it as
a non-production branch. Build watch paths match files, not branch names.

Archive branch protection preserves source history. A successful archive job
does not prove that the external build succeeded or guarantee indefinite
Cloudflare preview retention. No past releases are backfilled automatically.

See Cloudflare's [branch build controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
and [preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/).
