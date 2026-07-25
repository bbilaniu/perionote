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
private application version, and updates `CHANGELOG.md`.

This repository does not publish an npm package. Version pull requests are for
release history only; GitHub Pages deployment remains controlled by
`deploy-pages.yml`.
