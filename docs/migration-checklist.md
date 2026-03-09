# Migration Checklist

Use this checklist for each legacy JSX import.

1. archive `original.jsx` in `legacy/imported-jsx/<slug>/`
2. add `notes.md` with known limitations
3. create TSX wrapper in `components/templates/imported/`
4. add route in `app/templates/<slug>/`
5. extract summary builder in `lib/templates/summary/`
6. add fixture in `lib/templates/fixtures/`
7. add Vitest coverage in `tests/vitest/`
8. add Playwright smoke test in `tests/playwright/`
