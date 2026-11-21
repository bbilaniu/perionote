#!/usr/bin/env bash
set -euo pipefail

# HEAD is the commit validated by the caller, never a moving checkout of main.
head_commit="$(git rev-parse HEAD)"
if [[ "$head_commit" != "${GITHUB_SHA:?The validated commit is required}" ]]; then
  echo "Checkout does not match the validated commit $GITHUB_SHA." >&2
  exit 1
fi

git fetch origin refs/heads/main:refs/remotes/origin/main refs/heads/beta:refs/remotes/origin/beta
if [[ "$(git rev-parse origin/main)" != "$head_commit" ]]; then
  echo "Main has advanced; skipping Beta synchronization for $head_commit."
  exit 0
fi

# A divergent or newer beta is never reset. A concurrent update is also
# protected by Git's normal fast-forward-only push (no force or merge).
git merge-base --is-ancestor origin/beta "$head_commit"
git push origin "$head_commit:refs/heads/beta"
