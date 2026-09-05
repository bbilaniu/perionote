#!/usr/bin/env bash
set -euo pipefail

git diff --exit-code HEAD -- package.json package-lock.json CHANGELOG.md .changeset
node scripts/check-versioning.mjs --release

version="$(node -p 'require("./package.json").version')"
tag="v${version}"
archive_branch="archive/${tag}"
archive_ref="refs/heads/${archive_branch}"
head_commit="$(git rev-parse HEAD)"

# Require the published tag, not an unpushed local tag or the current beta tip.
git fetch origin "refs/tags/${tag}:refs/tags/${tag}"
tag_commit="$(git rev-parse "refs/tags/${tag}^{commit}")"
if [[ "${tag_commit}" != "${head_commit}" ]]; then
  echo "Release tag ${tag} points to ${tag_commit}, not checked-out commit ${head_commit}." >&2
  exit 1
fi

remote_ref="$(git ls-remote --heads origin "${archive_ref}")"
remote_commit="${remote_ref%%[[:space:]]*}"
if [[ -n "${remote_commit}" && "${remote_commit}" != "${tag_commit}" ]]; then
  echo "Archive branch ${archive_branch} already points to ${remote_commit}, not ${tag_commit}." >&2
  exit 1
fi

if [[ -z "${remote_commit}" ]]; then
  # The empty expected value makes this creation-only, even if another writer
  # creates the branch between the lookup and push. An existing branch cannot move.
  git push --force-with-lease="${archive_ref}:" origin "${tag_commit}:${archive_ref}"
fi

remote_ref="$(git ls-remote --heads origin "${archive_ref}")"
remote_commit="${remote_ref%%[[:space:]]*}"
if [[ "${remote_commit}" != "${tag_commit}" ]]; then
  echo "Archive branch ${archive_branch} was not created for ${tag_commit}." >&2
  exit 1
fi

echo "Archive branch ${archive_branch} points to ${tag_commit}."
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Release archive"
    echo "- Tag: \`${tag}\`"
    echo "- Commit: \`${tag_commit}\`"
    echo "- Branch: \`${archive_branch}\`"
    echo "- Cloudflare preview: Check the separate Workers Build for this branch."
  } >> "${GITHUB_STEP_SUMMARY}"
fi
