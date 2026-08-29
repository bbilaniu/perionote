# Contributing to HygieneNote

Keep changes focused, reviewable, and safe for clinical documentation. The
generated note is part of the product contract: wording changes require the
same care as state or UI changes.

## Workflow

1. Branch from the intended integration branch.
2. Make one coherent change.
3. Add or update tests for changed behavior and generated text.
4. Run the relevant checks.
5. Add a changeset for a user-visible change.
6. Open a pull request with the rationale, validation, and any remaining work.

Do not commit patient-identifying or clinic-identifying data. Use synthetic
values in fixtures, screenshots, examples, and tests.

## Validation

Run the checks proportional to the change:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

- Unit tests are required for state, formatter, catalogue, and summary logic.
- Playwright coverage is required for new or changed user workflows.
- Include screenshots for visible layout changes.
- WebKit (`npm run test:e2e:webkit`) is advisory unless the change targets
  WebKit compatibility.

If a check cannot be run, explain why in the pull request.

## Clinical-output changes

For any change to generated documentation:

- show representative before/after output in the pull request;
- preserve empty-state behavior so the app makes no undocumented assertion;
- avoid inferred diagnoses, treatments, or findings;
- update fixtures and exact-output expectations; and
- identify any clinical review still required.

Current mapping documents and decision tables live under [`docs/specs`](./docs/specs).
Accepted architecture constraints live under [`docs/adr`](./docs/adr).

## Source templates and conversions

Source clinic templates belong in `lib/clinic-templates/registry.ts`.
Interactive conversions belong in `components/templates/native/`, with state
and generated-note logic under `lib/templates/`. Register conversions in
`components/clinic-templates/conversionRegistry.ts` and preserve their source
revision and review provenance.

For the uncommon case of importing a standalone legacy template, follow
[`docs/legacy-imports.md`](./docs/legacy-imports.md).

## Documentation

- Update a specification when the current behavior contract changes.
- Add an ADR for a consequential architecture decision.
- Put actionable proposals in `docs/requests/` and state their status.
- Move completed, rejected, or abandoned requests to `docs/requests/archive/`.
- Do not treat archived requests as current implementation guidance.

The [documentation index](./docs/README.md) describes the full taxonomy.
