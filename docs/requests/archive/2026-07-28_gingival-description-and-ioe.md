# Gingival Description and IOE: Approved Routing and Delivery Plan

- Status: Implemented and archived
- Date: 2026-07-28
- Target conversions:
  - `adult-hygiene-2021`
  - `recare-exam`

This is the coordination document for the Gingival Description and intraoral
examination work. It is not a one-shot implementation prompt. Implement the
work as two independently reviewed slices:

1. [Slice 1: Adult Hygiene Gingival Description](2026-07-28_gingival-description-and-ioe/slice-1-adult-hygiene-gingival-description.md)
2. [Slice 2: Recare Intraoral and Occlusal Findings](2026-07-28_gingival-description-and-ioe/slice-2-recare-intraoral-and-occlusal-findings.md)

Do not combine both slices into one implementation pull request. Each slice
must have its own mapping changes, generated-output contract, tests, changeset,
clinical review, and rollback boundary.

## Supporting Artifacts

Use:

- `lib/templates/catalogues/gingival-ioe.catalog.json` (runtime catalogue)
- `docs/requests/archive/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.schema.json` (historical schema)

The catalogue's `normalizedSections` object is the source of truth for the new
fixed clinical vocabulary. `DH Note.docx` and `source.sourceTables` are
audit-only references. Do not parse or reinterpret the Word document during
implementation.

The catalogue is a cross-template vocabulary source. It does not assign every
concept to Adult Hygiene. Template ownership is determined by the routing
decisions below and the accepted source-conversion mappings.

## Approved Routing

| Catalogue concept    | Owning conversion   | Approved treatment                                                                                                                                  |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gingival Description | 2021 Adult Hygiene  | Add an independent structured assessment beside the existing ClearDent-derived periodontal fields                                                   |
| Buccal mucosa        | Recare Exam         | Add structured observations within the existing Intraoral control                                                                                   |
| Tongue               | Recare Exam         | Add structured observations within the existing Intraoral control                                                                                   |
| Floor of mouth       | Recare Exam         | Add structured observations within the existing Intraoral control                                                                                   |
| Palate (hard/soft)   | Recare Exam         | Add structured observations within the existing Intraoral control                                                                                   |
| Oropharynx           | Recare Exam         | Add structured observations within the existing Intraoral control                                                                                   |
| Saliva               | Recare Exam         | Add structured observations within the existing Intraoral control; keep separate from caries-risk state                                             |
| Gingiva inside IOE   | No new direct owner | Do not create independent IOE Gingiva state or output                                                                                               |
| Occlusion            | Recare Exam         | Reuse the existing molar, skeletal, overjet, and overbite fields; add one catalogue-backed Additional occlusal findings control in the same section |
| Teeth                | Deferred            | Do not implement tooth-level findings in either slice                                                                                               |

Concepts implemented in one conversion must not read, synchronize with, or
derive state from the other conversion. Completed form state remains isolated
in the active page's memory.

## Compatibility Model

Follow the additive pattern established by the Adult Hygiene OHE extension:

- accepted source-conversion controls remain present and retain their current
  labels, state, editability, catalogue behavior, and generated output;
- new controls start empty or Not assessed;
- empty or absent new state produces no clinical assertion;
- existing generated output remains byte-for-byte unchanged when a new
  extension is unused; and
- newly documented observations add output without replacing accepted source
  lines.

In Adult Hygiene, specifically preserve:

- `Bleeding`, including its existing fixed choices and Other value;
- `Recession`, including unrestricted existing text; and
- `Health/Gingivitis`, including the
  `periodontal.health-gingivitis` catalogue and its ClearDent starter values.

These existing lines may coexist with a new Gingival Description block when
both are explicitly documented. That intentional coexistence is not accidental
duplicate output.

In Recare, specifically preserve:

- the existing `Intraoral` Not assessed / WNL / Findings status;
- the existing Intraoral findings textarea;
- right and left molar occlusion;
- skeletal occlusion;
- overjet in millimetres;
- overbite in percent;
- the current ClearDent-derived occlusion catalogue suggestions; and
- the current output when no new structured observation is selected.

## Shared Interpretation Rules

1. Use `normalizedSections`, not `source.sourceTables`, for implementation.
2. Do not recreate or change Chief Concern in either conversion.
3. Do not add completed-form persistence, saved forms, or form JSON
   import/export. Encounter state remains memory-only under ADR 0003.
4. Distinguish fixed application vocabulary from ADR 0001 browser-local
   catalogues:
   - fixed structured IOE and gingival options use stable normalized option IDs;
   - catalogue-backed editable occlusal findings snapshot their selected text
     into encounter state, following the existing catalogue contract.
5. Never store `generatedNoteText` or `noteFragment` as the canonical selected
   value.
6. An absent or unselected assessment means Not assessed, not WNL.
7. WNL requires an explicit user action.
8. WNL and documented findings are mutually exclusive within the new
   assessment state. Follow the slice-specific confirmation and clearing rules.
9. Support simultaneous findings and per-finding annotations where specified.
10. Respect location, laterality, tooth, surface, measurement, grade, comment,
    and similar metadata only in the slice to which a concept is routed.
11. Do not infer diagnoses, pathology, causes, symptoms, counselling,
    recommendations, treatment, or follow-up from observations.
12. Normal and normal-variation classifications describe the option vocabulary;
    they do not preselect findings or suppress clinically entered observations.
13. Unknown or retired fixed option IDs must not crash rendering or generated
    output.

## Resolved Clinical and Product Decisions

- Fissured tongue and coated tongue are `normal_variation` observations. They
  are not automatically pathological and are not included in the WNL preset.
- Every item in Additional occlusal findings supports an optional
  encounter-specific location.
- Additional occlusal findings is an allowlisted browser-local catalogue with
  reviewed public starters and deliberately remembered user values.
- A remembered occlusal finding stores only reusable wording. Location,
  measurement, comment, and other patient-specific annotations remain
  encounter-only.
- Existing `Cl I`, `Cl II`, and `Cl III` occlusion starters remain unchanged.
  Do not add duplicate `Class I`, `Class II`, or `Class III` spellings.
- Overjet remains measurable in millimetres.
- Overbite may be recorded in percent, millimetres, or both.
- Reduced salivary flow does not automatically select a caries-risk factor in
  Slice 2.
- Selecting Intraoral WNL while findings exist requires confirmation and then
  clears the existing Intraoral findings text and new structured findings.
- Selecting or entering an Intraoral finding sets the existing Intraoral status
  to Findings.
- Intraoral WNL retains the concise existing output `Intraoral: WNL.` rather
  than generating one WNL line per structure.

## Deferred Work

Track approved later work in:

[Deferred and Subsequent Slices](2026-07-28_gingival-description-and-ioe/deferred-slices.md)

Do not silently pull deferred work into either implementation slice.
