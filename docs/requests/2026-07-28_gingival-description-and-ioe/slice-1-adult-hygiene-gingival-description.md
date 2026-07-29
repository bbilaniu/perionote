# Slice 1: Adult Hygiene Gingival Description

- Status: Approved for implementation
- Date: 2026-07-28
- Target conversion: `adult-hygiene-2021`
- Interactive route:
  `/templates/clinic/adult-hygiene-2021/interactive`
- Parent decision:
  [Gingival Description and IOE: Approved Routing and Delivery Plan](../2026-07-28_gingival-description-and-ioe.md)

Implement this slice independently from the Recare work. Do not modify the
Recare Exam conversion in this slice.

## Goal

Add the DH Note-derived structured Gingival Description assessment to the 2021
Adult Hygiene interactive conversion without replacing any accepted
ClearDent-derived control or generated-note line.

This is an additive extension analogous to Additional OHE topics reviewed.
When the extension is empty or absent, current Adult Hygiene behavior and
generated output must remain unchanged.

## Source of Truth

Use:

- `hygienenote-gingival-ioe.catalog.json`
- `hygienenote-gingival-ioe.schema.json`

Both files are in this directory. Use
`normalizedSections.gingivalDescription` for implementation.

`DH Note.docx` and `source.sourceTables` are audit-only. Do not parse or
reinterpret the Word document.

Validate the catalogue against the Draft 2020-12 schema before implementation.
Also check semantically that option IDs are unique and every
`wnlPreset.selectedOptionIds` value resolves to a real gingival option.

## Required Mapping Update

Before changing form code, update:

`docs/specs/adult-hygiene-2021-interactive-template-mapping.md`

Record:

- this request and the reviewed catalogue as additive provenance;
- UI placement;
- form-state classification;
- WNL behavior;
- exact generated-note placement and formatting;
- omission behavior;
- compatibility with Bleeding, Recession, and Health/Gingivitis; and
- synthetic WNL and mixed-finding examples.

Do not change the original clinic source text in
`lib/clinic-templates/registry.ts`. The interactive extension is derived
behavior, not a rewrite of the ClearDent source reference.

## Compatibility Boundary

Preserve the existing Adult Hygiene controls and output for:

- `Bleeding`, including all fixed choices and the editable Other value;
- `Recession`, including unrestricted existing text; and
- `Health/Gingivitis`, including the
  `periodontal.health-gingivitis` catalogue and ClearDent starter values.

Do not rename, move, merge, clear, synchronize, infer, or replace these fields.
Do not add DH Note-derived options to their browser-local catalogues.

Place the new Gingival Description control immediately after
Health/Gingivitis in the Periodontal Assessment UI. Place its generated block
after the existing `Health/Gingivitis:` line and before Periodontitis Stage.
The relative order and wording of all accepted existing lines must remain
unchanged.

If the clinician documents both the original Recession field and structured
gingival recession, emit both explicit observations. Likewise, do not suppress
Bleeding or Health/Gingivitis because Gingival Description is present.

Do not create an independent `ioe.gingiva` assessment or an IOE Gingiva output
line.

## State Model

Add optional, backward-compatible Gingival Description state containing:

- assessment status: `not_assessed`, `wnl`, or `findings`;
- selected stable normalized option IDs;
- one or more selected findings where the catalogue permits multiple
  selection;
- per-finding extent;
- per-finding location values where supported;
- per-finding measurement and unit where supported; and
- per-finding comment where supported.

The empty-form factory must initialize the new assessment as Not assessed.
Summary formatting must also tolerate a runtime object in which the entire new
property is absent.

Keep this patient-specific state in active page memory only. Do not add form
persistence, draft recovery, local storage, URLs, analytics, or form JSON
import/export.

Store normalized option IDs as the canonical fixed selections. Generate text
from the current checked-in catalogue. Do not store `generatedNoteText`,
`noteFragment`, classification labels, or generated prose in form state.

Unknown or retired option IDs must be ignored safely by controls and the
summary builder. They must not produce invented text or crash the form.

## Control Behavior

Render the catalogue dimensions in source order:

1. Color
2. Contour / Shape
3. Consistency
4. Surface / Texture
5. Position / Size

Support multiple simultaneous options within each dimension.

Each selected finding may independently be generalized or localized. Different
generalized and localized findings may coexist. Reuse existing project
selectors and conventions for arch, quadrant, sextant, tooth, tooth range,
surface, laterality, and editable region text where applicable.

Only show annotations supported by the selected option's metadata. In
particular:

- structured gingival recession supports location and a millimetre
  measurement;
- unsupported measurements, surfaces, teeth, or laterality must not be
  collected;
- tooth numbers from source examples must never become defaults; and
- selecting an observation must not infer inflammation, cyanosis, diagnosis,
  etiology, symptoms, education, treatment, or follow-up.

Comments and patient-specific annotations must never be offered to a reusable
catalogue.

## WNL Behavior

Provide the explicit action named by `wnlPreset.label`.

Activating it must:

1. require a deliberate user action;
2. if new Gingival Description findings already exist, confirm before clearing
   only that new structured state;
3. set the status to `wnl`;
4. select the exact IDs in `wnlPreset.selectedOptionIds` so the applied preset
   remains inspectable; and
5. leave existing Bleeding, Recession, Health/Gingivitis, and all other Adult
   Hygiene state untouched.

Selecting, editing, or adding a finding after WNL changes the new assessment to
`findings`; WNL and findings must never be emitted simultaneously.

Clearing the new assessment returns it to `not_assessed`, not WNL.

## Generated-Note Contract

Not assessed or absent state emits nothing.

WNL emits one line using the reviewed catalogue text:

`Gingival Description: {wnlPreset.generatedNoteText}`

Normalize terminal punctuation so the line ends with exactly one period.

Findings emit one block:

```text
Gingival Description:
  - {Dimension}: {noteFragment}; extent: {generalized/localized}; location: {documented location}; measurement: {value unit}; notes: {comment}.
```

Rules:

- emit one bullet for each selected finding, in catalogue dimension and option
  order;
- omit annotation clauses that were not documented or are unsupported;
- preserve entered location and comment text without adding clinical
  conclusions;
- use the catalogue's `noteFragment` for fixed clinical wording;
- use `mm` for gingival-recession measurement;
- do not emit an empty heading; and
- do not generate a second Gingiva or IOE Gingiva block.

Add exact synthetic output examples to the mapping and focused summary tests
before treating the output contract as complete.

## Demo, Reset, and Accessibility

- Extend the synthetic fixture using only synthetic annotations.
- Deep-copy all new nested collections when loading the demo.
- Reset must restore the new assessment to Not assessed.
- Reuse the shared form-control and listbox/combobox primitives.
- Provide keyboard, pointer, touch, focus-visible, and screen-reader behavior
  consistent with the accepted Adult Hygiene controls.
- Do not preselect normal observations in the empty form.

## Required Validation

Test that:

- a current or old-shaped Adult Hygiene form with no Gingival Description
  produces the exact pre-change summary;
- Bleeding, Recession, and Health/Gingivitis keep their current controls,
  catalogues, and output;
- those three original lines can coexist with a new Gingival Description block;
- absent new state produces no clinical assertion;
- WNL requires explicit action and uses the exact preset IDs;
- selecting a finding after WNL prevents contradictory output;
- localized and generalized findings can coexist;
- recession supports location and millimetre measurement;
- normal variations are not labelled pathological;
- unsupported annotations are not shown or emitted;
- unknown or retired IDs do not crash or generate invented text;
- Chief Concern is unchanged;
- no form persistence or JSON form import/export is introduced;
- reset and demo loading correctly handle nested state; and
- only one Gingival Description block is generated.

Run the relevant formatter, lint, type-check, unit tests, browser tests, and
production build.

The final report must identify:

- mapping and code files changed;
- compatibility decisions;
- fixed catalogue integration;
- generated-note behavior;
- validation results;
- any unresolved catalogue review item affecting this slice; and
- confirmation that no Slice 2 or deferred work was included.
