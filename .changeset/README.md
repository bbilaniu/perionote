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

Run `npm run versioning:check` locally to check version metadata. CI also runs
this check and permits pending changesets during development. The workflow uses
`npm run release` (`changeset tag`) to create the local tag before pushing that
specific tag; contributors should normally let the workflow perform this step.

This repository does not publish an npm package or automatically create GitHub
Release entries. Git tags record source versions; GitHub Pages deployment
remains controlled by `deploy-pages.yml` and is independent of tagging.
