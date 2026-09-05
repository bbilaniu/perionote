# Rapid Entry v1

Status: implemented in the **2026 Adult Hygiene** workspace; chairside speed and
clinical acceptance remain to be evaluated with the checklist below.

## Architecture

The Entry mode switch selects Rapid Entry or Detailed within
`AdultHygiene2026Template`. Both views edit the same `AdultHygiene2026Form`
instance. There is no second encounter schema, translation on mode changes,
new record type, or draft migration. Detailed remains the initial mode until
chairside testing supports changing that default. The selected interface mode
is remembered locally, separately from encounter data. Storage failures do not
prevent mode changes.

`AdultHygieneRapidEntry` provides native radio and checkbox choices, optional
text disclosures, and the existing location chooser. Shared examination,
periodontal classification, radiographs, education, and completed-care controls
retain their existing handlers. Rapid presentation options on shared controls
leave the other templates' behavior unchanged. The existing section navigator
uses a horizontal layout in Rapid Entry to leave more width for clinical choices.
Gingival option groups and periodontal diagnosis, extent, stage, grade, and
status groups each use the full available width. Options wrap as needed, with
override reasons and comments underneath their corresponding group. Structured
measurements remain expandable. Detailed retains its two-column layout.
The final Open Detailed action shares the bottom navigation row with Return to
top, wrapping on narrow screens.
Caries Risk Assessment uses the same flat presentation as other primary Rapid
sections. Treatment completed today retains its shared card.

`useLocalInteractiveDraft` still owns the current draft ID, ten-second autosave,
page-hide save, recovery, clear/new actions, and seven-day retention. Mode
switches do not create or save a separate draft. Patient ID and at least one
provider remain required only at the existing copy-validation point. Existing
provider defaults, Class 5 and PPE defaults are preserved; Rapid Entry adds no
clinical defaults.

## Mappings

| Rapid controls | Existing encounter fields / behavior |
| --- | --- |
| Consent, medical history, chief concern | Existing consent flags, `medicalHistoryReview`, `patientChiefConcern`; exclusive Nothing uses the existing selection rule |
| Vitals readings | Direct Add reading action in Visit, with repeatable blood pressure, heart rate and time fields; existing calculations, output and draft behavior |
| Sterilization codes | Direct `mieleCodes` input; existing Class 5 and PPE behavior |
| Caries-risk category | Direct radios for `cambra123Assessment.finalRiskLevel`; same clinician selection handler and expandable assessment details |
| Apply Dyclonine rinse | Existing catalogue action and local anesthesia entry defaults; duplicate prevention and assessment details retained |
| Brushing and flossing frequencies | Separate full-width rows with wrapping options; `brushingFrequency`, `flossingFrequency`; same established choice strings and custom wording |
| Plaque / calculus / stain / bleeding | Existing `*Choice` strings encode amount, distribution and supported location facets; `*Areas` and `*Comment` retain location detail |
| Gingival findings | Existing catalogue option IDs and conflict rules in `gingivalDescription`; normal shortcut retains the existing replacement confirmation |
| Periodontal diagnosis and classification | Diagnosis and distribution always visible, including before any findings are entered; classification controls are directly visible for the selected diagnosis, while measurements remain expandable. Existing `periodontalClassification` and its diagnosis/context/stage/grade handlers and decision support; no inferred diagnosis |
| EOE / IOE | Existing exam status, narrative, structured findings and confirmation handlers; individual structure controls remain expandable |
| Radiographs and common completed care | Existing source-linked radiographs, structured procedure rows, editable quantities and products |
| OHE topics | `oheTopicsReviewed`; existing OHE recap synchronization updates derived treatment details and preserves customized recaps |
| Recommendations | Existing recommendation flag, interval and next-visit strings; the existing combined treatment plan takes precedence when present |

Finding amounts preserve established terminology: mild/moderate/heavy for
plaque and calculus, slight/moderate/heavy for stain, and mild/moderate/severe
for bleeding. Bleeding choices do not infer a BOP percentage. Marginal and
interproximal are the supported plaque/calculus facets; supra/subgingival is
not invented. Choosing None removes those facets and confirms before clearing
documented areas or comments. Clearing a finding selection removes its choice
text; separately entered areas/comments remain editable. Unfamiliar choice
wording is displayed intact and requires explicit replacement before using
direct facets.

Example: plaque Moderate + Generalized + interproximal stores
`Generalized moderate interproximal` and the existing formatter produces
`Plaque: Generalized moderate interproximal.` Both modes produce the same text.

## Outputs and legacy compatibility

The existing `buildAdultHygiene2026Summary` remains the only generator for this
workspace. Complete, Hygiene and Recare projections, preview, and clipboard
behavior are unchanged. Complete includes the combined encounter. Hygiene
omits EOE/IOE; Recare omits hygiene findings and completed hygiene treatment,
as specified by the existing output contract.

The separate **2021 Adult Hygiene** and standalone **Recare Exam** workspaces
have independent schemas, draft IDs and generators. The repository has no
general Common Form adapter exporting a 2026 encounter into those workspaces.
Rapid Entry therefore supports the existing unified **Recare output**, but
does not add cross-workspace export into either legacy form or an exact 2021
output. Existing legacy output regressions continue to cover their unchanged
generators. Any future legacy adapter should consume the shared encounter,
not implement a Rapid-specific generator.

## Deliberately secondary or omitted

- Toothbrush and flossing types used at home are direct multiselect questions,
  shared with Detailed and the other interactive forms. See
  [Oral hygiene methods](oral-hygiene-methods.md). Reviewed/recommended aids remain
  separate education fields.
- Full PSR entry, tooth-level caries/restorative findings, occlusion, appliances,
  combined treatment planning, booked dates, and uncommon histories remain in
  Detailed. Entered values survive every mode switch.
- Gingival locations/measurements, periodontal evidence, CAMBRA assessment details, anesthesia details,
  expanded EOE/IOE structures, education goals and custom radiograph types reuse
  existing expanded controls. Complex cases may still need typing or dropdowns.
- Common catalogue choices follow local catalogue order and hidden preferences.
  Additional or custom single-choice values remain available through Other or
  Detailed; existing custom selections are always shown.
- There is no new analytics dependency or collection of patient content. Actual
  speed relative to the clinician's current click-based workflow is unmeasured.

## Chairside usability checklist (no patient information)

1. Use synthetic versions of three representative visits: routine recall,
   localized findings, and periodontal maintenance. Have the clinician specify
   the expected documentation before timing. Set provider defaults once.
2. Complete each scenario in Rapid Entry and in the comparison workflow. Alternate
   their order and allow a practice run. Begin timing when the encounter opens;
   stop when the reviewed note is ready to copy.
3. Record only scenario code, interface, elapsed seconds, clicks, dropdown opens,
   typed-character count, keyboard/mouse switches, Detailed-mode visits, and
   which sections needed More/Other. Count identifier entry separately.
4. Verify that no undocumented normal findings appear, all required qualifiers
   survive, changing/clearing choices updates the note, and all applicable output
   modes include the expected content. Record only pass/fail and a generic issue
   category, never identifiers, note text, chart screenshots or clinical details.
5. Switch modes, edit an uncommon finding, switch back, wait for autosave, and
   reload. Confirm that the same draft restores with all values intact.
6. Accept the routine path when it needs no routine narrative typing or repeated
   dropdowns and is at least as fast as the comparison workflow, with no loss of
   clinically necessary documentation. Use measured friction to adjust exposed
   options before making Rapid Entry the initial default.

Automated coverage: `tests/vitest/rapidEntry.test.ts` and
`tests/playwright/rapid-entry.spec.ts`, plus the existing state, output,
catalogue, draft, navigation and Detailed-workflow regression suites.

## Implementation verification

- Production build, TypeScript and all 288 unit tests pass.
- All twelve Rapid Entry Chromium tests pass, including exclusive gingival
  groups, conditional stage/grade, output projections, mode round trips,
  autosave/reload, confirmation cancellation, custom wording and keyboard input.
  Direct sterilization, caries category and Dyclonine controls are covered at
  desktop and mobile widths, including shared Detailed state and clearing.
  Direct vitals coverage verifies repeat readings, averages, timestamps, removal,
  mode switches and draft reload at both widths.
- Desktop and 390px mobile screenshots were visually reviewed.
- Lint has no errors and two existing warnings in `next.config.ts` and
  `scripts/codex-patch-branches.mjs`.
- The full Chromium run was not green. After fixing the new gingival-control
  issue, four browser/page timeout failures passed on rerun. The remaining
  fourteen older workflow failures were reproduced against an unchanged HEAD
  checkout, including catalogue, legacy clinical-output expectations, navigation
  labels and layout assertions. Existing tests were not weakened.
- Real chairside timing and clinical acceptance are still pending.
