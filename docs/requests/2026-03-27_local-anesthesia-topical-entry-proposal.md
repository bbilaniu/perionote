# Request: Local Anesthesia Topical Entry Proposal

## Goal
Refactor the `Local Anesthesia` section so it can accurately document both injected anesthetic and topical anesthetic applications, including sulcular products such as `ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%`.

## Background
The current `Local Anesthesia` workflow is injection-centric:
- the repeatable cards are labeled `Injection entries`,
- each entry requires an `Injection type`,
- the summary formatter assumes every repeatable entry is an injection,
- benzocaine is partially modeled outside the repeatable entry system as a separate toggle.

That structure works for infiltrations and nerve blocks, but it does not map cleanly to topical workflows such as:
- mucosal topical anesthetic application,
- sulcular application of ORAQIX,
- future topical products that are not administered by syringe injection.

ORAQIX is a good example of the mismatch:
- it is not injected,
- it is applied into the sulcus,
- it uses a cartridge-like delivery format,
- but it should not be charted as an injection.

## Problem Statement
The current model forces all repeatable local-anesthesia activity through injection terminology and injection-only fields.

Current friction points:
- `Injection entries` is too narrow for real-world hygiene workflows.
- `Injection type` is required even when the product is topical.
- `Benzocaine 20% applied to the injection site` exists as a separate toggle rather than as a structured entry.
- The formatter cannot distinguish between injected and topical anesthetic events.
- Adding ORAQIX only to the product list improves selection, but not the underlying documentation model.

## Proposal

### 1) Rename `Injection entries` to `Local anesthesia entries`
Broaden the terminology of the repeatable-entry area so it covers both injected and topical anesthetic events.

Recommended UI text changes:
- `Injection entries` -> `Local anesthesia entries`
- `Injection entry #1` -> `Local anesthesia entry #1`
- `Add injection entry` should no longer be the only add action

This is the minimum terminology change needed to make the section clinically coherent once topical entries are supported.

### 2) Add a per-entry administration route
Do not implement a single section-wide toggle for `application` vs `injection`.

Recommended behavior:
- each local-anesthesia entry should carry its own route,
- supported routes:
  - `Injection`
  - `Topical`

Why this should be per-entry rather than section-wide:
- a single visit may include both injected anesthetic and topical anesthetic,
- a global toggle would force the entire section into one mode,
- per-entry route preserves flexibility without duplicating the whole section UI.

### 3) Split route-specific fields by entry type
Keep shared fields for all entries, but only show route-specific controls when relevant.

Recommended shared fields for every entry:
- `Route`
- `Quadrant`
- `Anesthetic product`
- `Amount (ml)`
- `Time administered`

Recommended injection-only field:
- `Injection type`

Recommended topical-only field:
- `Application type`

Recommended topical application-type options:
- `Mucosal application`
- `Sulcular application`

Recommended interaction:
- if route is `Injection`, show `Injection type` and hide `Application type`
- if route is `Topical`, show `Application type` and hide `Injection type`
- keep `Quadrant`, `Product`, `Amount`, and `Time administered` available in both cases

### 4) Prefer two add buttons instead of defaulting every new entry to topical
Do not make the first added entry topical by default.

Recommended UI actions:
- `Add injection entry`
- `Add topical entry`

Behavior:
- `Add injection entry` creates a new entry with `route = Injection`
- `Add topical entry` creates a new entry with `route = Topical`

Why this is preferred:
- it makes user intent explicit,
- it avoids hidden defaults,
- it supports mixed workflows in the same visit,
- it is faster than adding an entry and then correcting the route.

If the implementation needs a smaller first pass, a single `Add entry` button is acceptable, but the new entry should still start with an explicit `Route` field rather than assuming everything is topical.

### 5) Filter products by route
The available product list should depend on whether the entry is an injection or a topical application.

Recommended product behavior:
- `Injection` route shows the current injectable local anesthetics
- `Topical` route shows topical products only

Recommended topical products for initial support:
- `Benzocaine 20% paste`
- `ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%`

Recommended injection products for initial support:
- existing injectable products already in the template

This avoids clinically incorrect combinations such as selecting an injection type for ORAQIX or using sulcular application language with an injectable carpule anesthetic.

### 6) Set route/product-aware default amounts
Keep the `Amount (ml)` field editable, but prefill it intelligently for new topical entries and product selection.

Recommended defaults:
- `Benzocaine 20% paste` -> `0.5`
- `ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%` -> `1.7`

Recommended behavior:
- when a new topical entry is created with a known default product, prefill the amount
- when the product changes and the amount is still blank, populate the product default
- do not overwrite a user-entered amount after the field has been manually edited

No change is needed to `Time administered`.

### 7) Replace the benzocaine toggle with structured topical entry behavior
The existing toggle `Benzocaine 20% applied to the injection site` should not remain as a parallel charting path once topical entries exist.

Recommended approach:
- retire the dedicated benzocaine toggle,
- represent benzocaine through the same repeatable-entry structure as other anesthetic events,
- optionally add a quick action such as `Add topical benzocaine` that inserts a prefilled topical entry.

Why this matters:
- it removes duplicate documentation paths,
- it keeps all local-anesthetic events in one structure,
- it makes summary generation more consistent.

### 8) Update the summary formatter to support both route types
The current formatter assumes every structured entry is an injection. That should change.

Recommended output behavior:
- keep the section heading:
  `Local anesthetic administered: No C/I to LA`
- output each entry using route-specific phrasing

Recommended injection format:
`IA/L Q3: Mepivacaine 3% without epinephrine 1.8 ml (at 9:25 AM)`

Recommended topical format:
`Sulcular application Q3: ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5% 1.7 ml (at 9:25 AM)`

Alternative acceptable topical format:
`Topical sulcular application Q3: ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5% 1.7 ml (at 9:25 AM)`

Recommended totaling behavior:
- continue to total by product across all entries,
- output totals regardless of route if a valid numeric amount is present,
- example:
  `Total: ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5% 1.7 ml`

### 9) Preserve post-anesthetic assessment behavior
The assessment panel can remain shared across all local-anesthesia activity.

Recommended behavior:
- continue using:
  - `No adverse reactions noted`
  - `Adequate anesthesia achieved`
- continue highlighting the assessment block when local-anesthesia activity is documented without assessment

This should apply whether the activity is injected or topical.

## Suggested Data Model

Recommended shape for each entry:

```ts
type LocalAnesthesiaEntry = {
  route: "Injection" | "Topical";
  injectionType: string;
  applicationType: "Mucosal application" | "Sulcular application" | "";
  quadrant: string;
  anestheticProduct: string;
  amountMl: string;
  timeAdministered: string;
};
```

Recommended implementation notes:
- `injectionType` may remain a string for the first pass
- `applicationType` should be blank unless `route === "Topical"`
- an entry should be valid for summary output when:
  - route is set,
  - quadrant is set,
  - product is set,
  - amount is set,
  - and the route-specific field is set if required

## Suggested Implementation Plan

### Phase 1: Model and UI terminology
- rename `Injection entries` to `Local anesthesia entries`
- add `route` and `applicationType` to the entry model
- update the add-entry controls to support both injected and topical entries

### Phase 2: Product and default logic
- separate injection and topical product lists
- add ORAQIX and benzocaine to the topical product set
- implement default amount behavior for topical products

### Phase 3: Summary and cleanup
- update formatter logic for route-specific output
- remove the legacy benzocaine toggle path
- update tests to cover mixed injected/topical scenarios

## Acceptance Criteria
- The section uses `Local anesthesia entries` terminology instead of `Injection entries`.
- Users can add both injected and topical anesthetic entries in the same visit.
- Topical entries do not require an injection type.
- Topical entries support:
  - `Mucosal application`
  - `Sulcular application`
- `ORAQIX® (lidocaine and prilocaine periodontal gel) 2.5%/2.5%` is available only in the topical product path.
- `Benzocaine 20% paste` is available in the topical product path.
- Topical products prefill route-appropriate default amounts without overwriting manual edits.
- `Time administered` continues to behave exactly as it does now.
- Summary output distinguishes between injected and topical entries.
- The benzocaine documentation path is unified into the repeatable entry model.
- Existing post-anesthetic assessment behavior remains intact.

## Risks and Tradeoffs
- Removing the benzocaine toggle changes a familiar fast-path workflow, so a quick-add action may be needed to preserve speed.
- Adding route-specific behavior increases the complexity of the entry card slightly.
- If product filtering and defaulting are implemented carelessly, the UI may unexpectedly overwrite user-entered amounts.

## Recommendation
Proceed with a structured refactor rather than a terminology-only patch.

The key decision is:
- rename the repeatable area to `Local anesthesia entries`,
- model route per entry,
- support route-specific fields and product lists,
- unify benzocaine and ORAQIX under the same structured-entry workflow.

This is the cleanest long-term design because it matches real clinical use, supports mixed workflows, and avoids forcing topical anesthetics into an injection-only data model.

## Codex Task Framing

### Suggested task title
`refactor(local-anesthesia): support topical and injected anesthesia entries`

### Allowed files to edit
- `components/templates/imported/GingivalDescriptionWebformImportedTemplate.jsx`
- `tests/playwright/templates.spec.ts`

### Expected output
- local-anesthesia UI supports injected and topical entries
- ORAQIX is charted as topical rather than injection
- benzocaine is modeled through the same repeatable-entry system
- summary output reflects route-specific phrasing
- Playwright coverage exists for both entry types

### Non-goals
- no redesign of unrelated hygiene-note sections
- no extraction of the legacy JSX file into smaller components in the same task
- no broader terminology rewrite outside the local-anesthesia section unless required for consistency
