#!/usr/bin/env bash
set -euo pipefail

# Compare the first parent on main so both merge and squash commits work,
# regardless of the version PR's title. Ordinary pushes must not tag an old version.
if ! git rev-parse --verify HEAD^ >/dev/null 2>&1; then
  echo "No previous commit; skipping release tag."
  exit 0
fi

previous_version="$(git show HEAD^:package.json | node -p 'JSON.parse(require("node:fs").readFileSync(0, "utf8")).version')"
version="$(node -p 'require("./package.json").version')"

if [[ "${version}" == "${previous_version}" ]]; then
  echo "Application version unchanged (${version}); skipping release tag."
  exit 0
fi

git diff --exit-code HEAD -- package.json package-lock.json CHANGELOG.md .changeset
npm run versioning:check -- --release

tag="v${version}"
head_commit="$(git rev-parse HEAD)"
git fetch --tags origin

if git show-ref --verify --quiet "refs/tags/${tag}"; then
  tag_commit="$(git rev-parse "refs/tags/${tag}^{commit}")"
  if [[ "${tag_commit}" != "${head_commit}" ]]; then
    echo "Release tag ${tag} already points to ${tag_commit}, not ${head_commit}." >&2
    exit 1
  fi
else
  npm run release
fi

tag_commit="$(git rev-parse "refs/tags/${tag}^{commit}")"
if [[ "${tag_commit}" != "${head_commit}" ]]; then
  echo "Release tag ${tag} was not created for ${head_commit}." >&2
  exit 1
fi

git push origin "refs/tags/${tag}"
echo "Release tag ${tag} points to ${head_commit}."

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "tag=${tag}" >> "${GITHUB_OUTPUT}"
fi
