# Migration Checklist

Use this checklist for each legacy JSX import.

1. archive `original.jsx` in `legacy/imported-jsx/<slug>/`
2. add `notes.md` with known limitations
3. create wrapper in `components/templates/imported/` (`.jsx` or `.tsx`)
4. register template in `components/templates/registry.ts`
5. confirm `/templates/<slug>` renders in the browser
6. add Playwright smoke test in `tests/playwright/`
7. optionally extract summary builder in `lib/templates/summary/`
8. optionally add fixture + Vitest coverage
