# Slice 3: Recare Tooth-Level Findings

- Status: Approved for implementation
- Date: 2026-08-01
- Target conversion: `recare-exam`
- Interactive route: `/templates/clinic/recare-exam/interactive`
- Parent decision:
  [Gingival Description and IOE: Approved Routing and Delivery Plan](2026-07-28_gingival-description-and-ioe.md)
- Promoted from:
  [Deferred Slice 3: Recare Tooth-Level Findings](2026-07-28_gingival-description-and-ioe/deferred-slices.md#promoted-slice-3-recare-tooth-level-findings)

This request promotes the deferred Teeth concept into an independently
reviewable third slice. The clinical decisions and exact generated-output
contract were approved on 2026-08-01. Implement this slice independently with
its own tests, changeset, pull request, and rollback boundary.

## Goal

Add an optional structured Teeth assessment to the existing Recare Exam
Odontogram and Caries Risk area. Model its interaction on the Adult Hygiene
**Gingival Description** status and **Structured gingival observations**
disclosure without sharing form state between conversions.

The extension must:

- preserve every accepted Recare control and output line;
- start Not assessed and make no assertion from empty or absent state;
- keep tooth findings, odontogram status, and caries-risk state independent;
- support one or more teeth or areas for an observation without imposing a
  tooth-numbering system;
- keep all patient-specific values in the active page's memory; and
- add no diagnosis, risk level, treatment, recommendation, or follow-up by
  inference.

## Recorded Decisions

| #   | Topic                                | 2026-08-01 direction                                                                                                                                                             |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Teeth WNL wording                    | Approve `Teeth intact, with no caries or mobility noted.`                                                                                                                        |
| 2   | Assessment model                     | Give Teeth its own Not assessed / WNL / Findings status. Model the UI on Adult Hygiene Gingival Description and its Structured gingival observations disclosure.                 |
| 3   | Tooth numbering                      | Use encounter-only free text. Do not validate, translate, or assume Universal, FDI, Palmer, primary, permanent, or another notation.                                             |
| 4   | One or more teeth                    | Permit more than one Tooth/area value on an observation.                                                                                                                         |
| 5   | Caries surface                       | Use encounter-only free text for now. Do not normalize or infer surfaces.                                                                                                        |
| 6   | Mobility                             | Offer M0, M1, M2, and M3 using the Miller Index. Do not derive a grade from entered prose or other clinical state.                                                               |
| 7   | Discoloration and fluorosis location | Use a multi-value Tooth/area interaction like the Adult Hygiene location and Tooth/area fields, including encounter-only custom text.                                            |
| 8   | Repeated instances                   | Allow repeatable Caries, Initial/noncavitated caries lesion, Discoloration, Mobility, Enamel hypoplasia, and Fluorosis rows with independent annotations.                       |
| 9   | Generated wording                    | Approve the generated-note contract and examples in this document.                                                                                                               |
| 10  | Odontogram placement                 | Move the existing **Odontogram up to date** checkbox to the bottom of the new structured Teeth input area. Its state and output remain unchanged.                                |
| 11  | Initial caries lesions               | Add **Initial/noncavitated caries lesion** as a finding distinct from unspecified Caries. Support optional Active / Inactive activity without inferring management or treatment. |

## Compatibility Boundary

Preserve the existing Recare state, interaction, catalogues, and output for:

- `odontogramUpToDate` and its exact output `ODONTOGRAM UP TO DATE`;
- Caries risk level;
- ordered caries-risk factors;
- Caries risk notes; and
- every section outside Odontogram and Caries Risk.

The new Teeth assessment is additive. A missing Teeth property in an
old-shaped Recare object is equivalent to Not assessed and emits nothing.
When the new assessment is unused, the generated note must remain
byte-for-byte compatible with the pre-slice output.

A tooth finding must never automatically:

- check or uncheck **Odontogram up to date**;
- select, change, or clear a caries-risk level;
- add or remove a caries-risk factor;
- alter Caries risk notes; or
- change another Recare assessment.

Likewise, checking the odontogram checkbox or editing Caries Risk must not
create, remove, or modify a tooth finding.

## Approved UI Contract

Within the existing **Odontogram and Caries Risk** section, render controls in
this order:

1. a primary **Teeth** fixed-choice status: Not assessed / WNL / Findings;
2. a disclosure labelled **Structured tooth-level observations**;
3. the existing **Odontogram up to date** checkbox at the bottom of that
   structured Teeth area; and
4. the existing Caries Risk controls, unchanged.

The structured disclosure follows the accepted Gingival Description pattern:

- it summarizes the explicit status and documented-observation count;
- it starts collapsed for a blank encounter;
- Findings automatically reveals the detailed controls;
- it provides an explicit **Apply normal structured observations** action;
- it provides an explicit **Clear tooth-level findings** action;
- it never preselects a normal observation on an empty form; and
- it uses confirmation before replacing or permanently clearing documented
  observations.

When the status is Findings, provide an approved optional encounter-only
**Additional tooth findings** text field for clinically relevant wording not
represented by the fixed observations. It is not a reusable catalogue and
must not be used to derive structured state.

## Approved State Model

Add an optional, backward-compatible Teeth assessment containing:

- status: `not_assessed`, `wnl`, or `findings`;
- finding entries containing a stable instance ID and normalized Teeth option
  ID;
- repeatable entries for Caries, Initial/noncavitated caries lesion,
  Discoloration, Mobility, Enamel hypoplasia, and Fluorosis;
- per-finding one or more Tooth/area text values where required, and zero or
  more where optional;
- per-Caries and per-initial-lesion optional free-text Surface(s);
- per-initial-lesion optional activity: `active` or `inactive`;
- the fixed No mobility observation represented by Miller Index `M0`;
- per-Mobility required Miller Index value: `M1`, `M2`, or `M3`;
- an optional encounter-only comment per finding; and
- optional encounter-only Additional tooth findings text.

The canonical selection is the fixed option ID. Do not store catalogue
`noteFragment` text, classification labels, or generated prose in form state.
Unknown or retired IDs must be ignored safely without crashing or producing
invented text.

All annotations are patient-specific and memory-only. They must not enter a
browser-local catalogue, saved preference, URL, analytics event, or generated
form JSON.

## Approved Fixed Observations and Annotations

Render the fixed observations in the reviewed catalogue order:

| Observation                        | Classification   | Approved annotations                                                                  |
| ---------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| Intact                             | Normal           | Optional comment                                                                      |
| No caries                          | Normal           | Optional comment                                                                      |
| No mobility                        | Normal           | Miller Index M0, optional comment                                                     |
| Caries                             | Abnormal         | Required Tooth/area, free-text Surface(s), optional comment                           |
| Initial/noncavitated caries lesion | Abnormal         | Required Tooth/area, free-text Surface(s), Active/Inactive activity, optional comment |
| Fracture                           | Abnormal         | Required Tooth/area, optional comment                                                 |
| Discoloration                      | Abnormal         | Tooth/area, optional comment                                                          |
| Mobility                           | Abnormal         | Required Tooth/area, required Miller Index M1/M2/M3, optional comment                 |
| Enamel hypoplasia                  | Normal variation | Tooth/area, optional comment                                                          |
| Fluorosis                          | Normal variation | Tooth/area, optional comment                                                          |

Normal and normal-variation classifications are vocabulary metadata only.
They must not preselect observations, change status, affect visual urgency, or
infer diagnosis or management.

### Tooth/area interaction

Reuse the shared multi-combobox behavior used by Adult Hygiene location and
Tooth/area fields. Offer the existing anatomical quick choices where useful:

- maxilla;
- mandible;
- full mouth;
- Q1, Q2, Q3, and Q4; and
- S1 through S6.

Allow any number of encounter-only custom values. Tooth numbers and ranges are
free text, so entries such as a single tooth, multiple teeth, or a range are
preserved as entered. The application must not correct, translate, or infer a
numbering system. Normalized duplicate text may be rejected, but no clinical
normalization is permitted.

### Caries surfaces and initial-lesion activity

For Caries and Initial/noncavitated caries lesion, label the encounter-only
field **Surface(s)** and accept unrestricted text. Do not present a fixed
surface vocabulary, reject unfamiliar notation, or derive either finding from
the field. Empty Surface(s) remains a valid undocumented annotation and does
not remove the explicitly selected observation.

For Initial/noncavitated caries lesion only, offer an optional **Activity**
fixed selector with Active and Inactive choices and no default. Activity is
independent from lesion presence, Caries Risk, and treatment planning. Do not
infer it from tooth, surface, appearance, radiographs, risk factors, notes, or
another field.

Selecting Initial/noncavitated caries lesion records a present tooth-level
finding. It must set Teeth to Findings and be mutually exclusive with WNL and
No caries. It must not automatically create a Treatment Option, Treatment Plan,
recommendation, monitoring instruction, nonrestorative intervention, or
restorative intervention.

This slice intentionally has no structured management field. If management is
clinically documented, it remains an independent explicit entry in the
existing Treatment Options, Treatment Plan, or another accepted free-text
field. The application must not derive management from lesion stage or
activity.

### Mobility grade

Use M0, M1, M2, and M3 as the complete Miller Index vocabulary. M0 is the
structured representation of the fixed No mobility observation. A Mobility
finding requires exactly one of M1, M2, or M3. Never store or emit both No
mobility/M0 and a Mobility M1–M3 finding.

Label the fixed selector **Mobility — Miller Index** and store the selected
code, not its display description. Do not infer mobility from periodontal
classification evidence or use this observation to alter periodontal stage.

Clinical chairside definitions or tooltips for M0–M3 must not be invented by
implementation. Add them only if separately supplied and approved.

## Status and WNL Behavior

- The empty default is Not assessed.
- Not assessed or a completely absent assessment emits nothing.
- WNL requires an explicit user action.
- Applying WNL stores the reviewed normal IDs for Intact, No caries, and No
  mobility so the preset remains inspectable.
- Selecting WNL when documented values exist requires confirmation before
  replacing only the Teeth assessment with the WNL preset.
- Selecting, editing, or adding a finding after WNL changes the status to
  Findings.
- WNL and Findings must never emit together.
- Clearing the assessment returns it to Not assessed and does not change the
  odontogram checkbox or Caries Risk.

## Approved Generated-Note Contract

### Omission

Not assessed or absent state emits no Teeth heading or clinical assertion.

### WNL

WNL emits the approved sentence exactly, with one terminal period:

```text
Teeth intact, with no caries or mobility noted.
```

### Findings

Findings emits one block before the existing odontogram and Caries Risk output:

```text
Teeth:
  - {Observation}{supported annotations}.
  Additional observations: {entered Additional tooth findings text}.
```

Formatting rules:

- emit one bullet per selected fixed observation in catalogue order;
- use the reviewed observation label as the bullet wording;
- place supported annotations in one parenthetical, separated by semicolons;
- use annotation labels `tooth/area`, `surface`, `activity`, `Miller Index`,
  and `notes`;
- join multiple Tooth/area values with `, ` in their displayed order;
- omit unsupported and empty clauses;
- omit Additional observations when its field is empty;
- normalize terminal punctuation to exactly one period per bullet or line;
- do not emit an empty Teeth heading; and
- do not add diagnosis, severity, etiology, symptoms, risk, treatment,
  recommendation, or follow-up wording.

### Approved examples

Single caries observation:

```text
Teeth:
  - Caries (tooth/area: 14; surface: DO).
```

Initial lesion with explicitly documented activity:

```text
Teeth:
  - Initial/noncavitated caries lesion (tooth/area: 15; surface: O; activity: inactive).
```

The same finding without an activity selection remains valid and does not
invent one:

```text
Teeth:
  - Initial/noncavitated caries lesion (tooth/area: 15; surface: O).
```

Several teeth sharing one mobility grade:

```text
Teeth:
  - Mobility (tooth/area: 31, 41; Miller Index: M2).
```

Mixed findings:

```text
Teeth:
  - Caries (tooth/area: 14, 15; surface: occlusal; notes: synthetic finding).
  - Initial/noncavitated caries lesion (tooth/area: 25; surface: D; activity: active).
  - Fracture (tooth/area: 26).
  - Discoloration (tooth/area: maxillary anterior).
  - Enamel hypoplasia (tooth/area: 12).
  - Fluorosis (tooth/area: maxilla).
  Additional observations: Synthetic tooth-level observation for review.
```

When explicitly documented, normal observations use the same block:

```text
Teeth:
  - Intact.
  - No caries.
  - No mobility.
```

The existing independent outputs retain their current form and follow the
Teeth block when selected:

```text
Teeth:
  - Caries (tooth/area: 14; surface: DO).
ODONTOGRAM UP TO DATE
Caries risk: Moderate caries risk due to high frequency of sugar intake.
```

The coexistence above records three separate explicit statements. It must not
be interpreted as synchronization between them.

## Approved Repeatability and Exclusivity

Caries, Initial/noncavitated caries lesion, Discoloration, Mobility, Enamel
hypoplasia, and Fluorosis use repeatable rows. Every row owns its own
Tooth/area values, Surface(s), activity, Miller grade, and comment as supported.
Other fixed findings remain single selections with their own annotations.

Apply these reviewed conflicts bidirectionally:

- No caries conflicts with Caries and Initial/noncavitated caries lesion;
- No mobility/M0 conflicts with every Mobility M1–M3 row;
- Intact conflicts with Caries, Initial/noncavitated caries lesion, and
  Fracture; and
- Intact may coexist with discoloration, Mobility, enamel hypoplasia, and
  fluorosis when explicitly documented.

Selecting an incompatible observation removes the conflicting selection only
after applying the same confirmation behavior used by the accepted Gingival
Description interaction when documented annotations would be lost. WNL
replacement retains its separately specified confirmation behavior.

## Approved Annotation Requirements

- Tooth/area is required for Caries, Initial/noncavitated caries lesion,
  Fracture, and Mobility.
- A Mobility finding requires one Miller grade from M1, M2, or M3.
- Initial-lesion Activity remains optional and is never inferred.
- Surface(s) remains optional free text.
- Tooth/area remains optional for Discoloration, Enamel hypoplasia, and
  Fluorosis.
- The Additional tooth findings field is approved as encounter-only free text.

The Recare mapping, normalized catalogue, and schema are implementation
contracts for these decisions. Do not reinterpret the audit-only Word document
or source tables.

## Validation Required for Implementation

Focused unit and browser tests must prove that:

- old-shaped and current Recare state preserve exact output when Teeth is
  absent or Not assessed;
- WNL requires explicit action and emits only the approved sentence;
- Findings never emits WNL wording;
- only supported annotations are collected and emitted;
- Tooth/area and Surface(s) preserve clinician-entered text;
- Initial/noncavitated caries lesion conflicts with WNL and No caries;
- initial-lesion activity remains optional, stores only Active or Inactive, and
  is never inferred;
- initial-lesion stage or activity never creates or changes management,
  treatment, monitoring, recommendation, or Caries Risk;
- multiple Tooth/area values remain ordered and encounter-only;
- No mobility stores M0, Mobility stores only M1, M2, or M3, and contradictory
  values cannot coexist;
- the approved exclusivity behavior prevents contradictory output;
- unknown or retired IDs neither crash nor generate invented prose;
- tooth findings never modify odontogram or caries-risk state;
- odontogram and Caries Risk never modify tooth findings;
- moving the odontogram checkbox does not change its state or output;
- reset and synthetic-demo loading correctly handle nested Teeth state;
- no patient-specific Teeth value is persisted; and
- keyboard, pointer, touch, focus-visible, and screen-reader behavior matches
  the accepted shared controls.

Run formatter, lint, type-check, focused unit tests, browser tests, and the
production build. Add a changeset. Keep the implementation in its own pull
request and rollback boundary.

## Rollback Boundary

The slice must remain additive and removable as one unit:

- optional Teeth state and fixture data;
- Teeth controls and the odontogram-checkbox placement change;
- Teeth summary formatting;
- Teeth catalogue/schema additions;
- focused tests;
- mapping update; and
- changeset.

Rolling back this slice must restore the prior Odontogram and Caries Risk UI
without migrating or rewriting existing Recare encounter state.
