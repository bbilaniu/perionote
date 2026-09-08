# Migrate ESLint to v10 with compatible Next.js plugins

Status: Deferred pending plugin compatibility; no scheduled date.

ESLint 9 reached end of life on 2026-08-06. The dependency review upgraded the
project to its final 9.39.5 patch, but that does not restore upstream support.
Migrating to ESLint 10 is the next tooling maintenance priority.

The latest published versions checked during this review still exclude ESLint 10
from their peer dependency ranges:

| Required Next.js lint plugin | Version | Highest supported ESLint major |
| --- | --- | --- |
| `eslint-plugin-react` | 7.37.5 | 9 |
| `eslint-plugin-import` | 2.32.0 | 9 |
| `eslint-plugin-jsx-a11y` | 6.10.2 | 9 |

`eslint-config-next` 16.3.4 and `typescript-eslint` 8.69.0 accept ESLint 10,
and the project's Node 24 runtime meets its requirements. The three plugins
above remain the compatibility blockers. Keep Dependabot updates enabled so
available upgrades remain visible; do not force peer dependencies or disable
existing rules to make the installation pass.

## Completion criteria

1. Verify that the plugins supplied by the selected `eslint-config-next` release
   support ESLint 10, or review equivalent maintained replacements separately.
2. Review ESLint 10's configuration lookup, JSX handling, and removed rule APIs.
3. Upgrade on a branch from beta and verify a clean `npm ci` without peer
   dependency overrides.
4. Run zero-warning lint and the required local CI checks. Keep any application
   fixes in separate commits and avoid bulk autofixes.
5. Confirm hosted CI on the PR before promotion to main, then archive this request.

References: [ESLint support policy](https://eslint.org/version-support/),
[v10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0).
