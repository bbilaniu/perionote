# HygieneNote

HygieneNote is a local-first Next.js application for completing, reviewing,
and copying structured dental hygiene notes. It also preserves the clinic note
templates and the provenance used to build their interactive conversions.

The application is a workflow aid, not the authoritative patient record or an
autonomous clinical decision system. Generated text remains visible for
clinician review before it is copied to the record.

## What is in the app

- `/templates/clinic` — copyable versions of source clinic templates
- `/templates/clinic/<slug>/interactive` — interactive clinic conversions
- `/templates/interactive` — standalone interactive templates
- `/templates/<slug>` — standalone template and compatibility routes
- `/catalogues` — browser-local, user-managed documentation suggestions
- `/drafts` — temporary browser-local recovery drafts

The interactive clinic conversions currently cover child, adolescent, adult,
and recare workflows. Their lifecycle and provenance are defined in
[`components/clinic-templates/conversionRegistry.ts`](./components/clinic-templates/conversionRegistry.ts).

## Local-first data boundary

Encounter data, recovery drafts, provider defaults, and deliberately remembered
catalogue suggestions stay in the current browser profile. HygieneNote does not
provide a patient-record backend. Do not add patient-identifying information to
fixtures, source templates, documentation, or committed catalogue seeds.

See the accepted [architecture decisions](./docs/adr/README.md) for the storage,
catalogue, conversion, and provenance contracts.

## Project layout

```text
app/                         Next.js routes
components/clinic-templates Clinic template browser and conversion registry
components/templates        Interactive template components and registry
components/catalogues       Browser-local catalogue UI
components/drafts           Recovery-draft UI
lib/clinic-templates        Source clinic template registry
lib/templates               State, summary builders, fixtures, and catalogues
tests/vitest                Unit and generated-note regression tests
tests/playwright            Browser workflow tests
docs/                       Current decisions, specifications, and work records
legacy/imported-jsx         Preserved legacy source material
```

## Development

HygieneNote requires Node.js 24 and npm.

```bash
npm install
npm run dev
```

Common checks:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Install Chromium once before the browser suite:

```bash
npx playwright install chromium
```

`npm run dev`, `npm run build`, and Playwright use separate Next.js output
directories so they can run without corrupting one another's generated files.
Use the npm scripts instead of invoking `next dev` directly.

WebKit is an optional compatibility check:

```bash
npx playwright install webkit
npm run test:e2e:webkit
```

## Documentation

Start with the [documentation index](./docs/README.md). It distinguishes
authoritative decisions and specifications from active requests and archived
implementation records.

For contribution expectations, including changesets and clinical-output review,
see [CONTRIBUTING.md](./CONTRIBUTING.md). Released changes are recorded in
[CHANGELOG.md](./CHANGELOG.md).

## Deployment

The app is configured as a static Next.js export. The GitHub Pages workflow
builds `out/` and publishes it from `main`; the repository's custom domain is
recorded in `CNAME`.
