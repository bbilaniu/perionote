# Slice 2: Recare Intraoral and Occlusal Findings

- Status: Approved for implementation after independent Slice 1 delivery
- Date: 2026-07-28
- Target conversion: `recare-exam`
- Interactive route: `/templates/clinic/recare-exam/interactive`
- Parent decision:
  [Gingival Description and IOE: Approved Routing and Delivery Plan](../2026-07-28_gingival-description-and-ioe.md)

Implement this slice independently from the Adult Hygiene work. Do not modify
the Adult Hygiene conversion in this slice.

## Goal

Extend the existing Recare Exam Intraoral and occlusion controls with
DH Note-derived structured observations. Follow the additive pattern used for
Additional OHE topics:

- preserve every accepted Recare control and output line;
- add optional structured detail to the existing owner;
- make no clinical assertion from empty new state; and
- preserve exact current output when all additions are unused.

Do not add a second Intraoral or generic Occlusion section.

## Source of Truth

Use:

- `hygienenote-gingival-ioe.catalog.json`
- `hygienenote-gingival-ioe.schema.json`

Both files are in this directory. Use the routed options in
`normalizedSections.ioe`.

`DH Note.docx` and `source.sourceTables` are audit-only. Do not parse or
reinterpret the Word document.

Validate the catalogue against the Draft 2020-12 schema before implementation.
Also check semantically that:

- routed fixed option IDs are unique;
- supported annotations have valid types and units;
- both coated and fissured tongue are `normal_variation`;
- Additional occlusal finding starters have a documented normalized-source
  crosswalk; and
- no deferred Teeth option is pulled into runtime code.

## Required Mapping Update

Before changing form code, update:

`docs/specs/recare-exam-interactive-template-mapping.md`

Record:

- this request and the reviewed catalogue as additive provenance;
- how structured observations extend the existing Intraoral control;
- WNL and Findings transition behavior;
- exact structured Intraoral output;
- the new Additional occlusal findings catalogue and ownership rules;
- optional per-finding location;
- dual-unit overbite behavior;
- compatibility with all accepted Recare fields and output; and
- synthetic WNL, structured-finding, occlusal-finding, and dual-overbite
  examples.

Do not change the original clinic source text in
`lib/clinic-templates/registry.ts`.

## In-Scope Intraoral Structures

Add structured observations from:

- `ioe.buccal_mucosa`
- `ioe.tongue`
- `ioe.floor_of_mouth`
- `ioe.palate`
- `ioe.oropharynx`
- `ioe.saliva`

Place them inside the existing Recare Intraoral control. Preserve its existing:

- `intraoralStatus`;
- `intraoralFindings` textarea;
- Not assessed / WNL / Findings choices; and
- output when no structured observation is selected.

Do not implement:

- independent `ioe.gingiva` state or output;
- any `ioe.teeth` option;
- a per-structure status or per-structure WNL control; or
- a second top-level IOE section.

Detailed Teeth work is deferred in
[Deferred and Subsequent Slices](deferred-slices.md).

## Structured Intraoral State

Add optional, backward-compatible structured Intraoral findings state
containing:

- the stable normalized option ID;
- the owning structure ID;
- optional location values where supported;
- optional laterality where supported;
- optional measurement and unit where supported; and
- an optional encounter-specific comment.

Use stable normalized IDs for these fixed observations. Generate their wording
from the checked-in catalogue. Do not store `noteFragment`, classification
labels, or generated prose in form state.

Summary formatting must tolerate a runtime Recare object in which the new
property is absent. Unknown or retired IDs must be ignored safely and must not
generate invented text.

Keep all structured observations, locations, measurements, and comments in the
active page's memory only.

## Intraoral Interaction Rules

- Not assessed is the empty default.
- Selecting, typing, or editing any Intraoral finding sets
  `intraoralStatus` to Findings.
- Selecting a structured normal or normal-variation observation still uses
  Findings status because an observation was explicitly documented.
- Fissured tongue and coated tongue are normal variations. Do not label or style
  them as pathological, and do not infer a cause or treatment.
- WNL is never inferred from empty controls.
- Selecting WNL while the existing findings textarea or any structured
  finding is non-empty must request confirmation.
- Confirming WNL clears the existing Intraoral findings textarea and all new
  structured Intraoral state, then sets the status to WNL.
- Cancelling the confirmation leaves all state unchanged.
- Changing from WNL by selecting or entering a finding sets the status to
  Findings.
- The Intraoral status transition must not clear or modify occlusion, caries
  risk, appliances, or another Recare section.

Do not implement the catalogue's per-structure or bulk-WNL model as competing
state. Adapt WNL to the accepted single Recare Intraoral status.

## Structured Intraoral Generated Output

Not assessed with no findings emits nothing.

WNL retains the exact accepted output:

`Intraoral: WNL.`

When Findings contains only the existing free-text value and no structured
selection, retain the exact current single-line output.

When at least one structured selection exists, emit one Intraoral block:

```text
Intraoral:
  - {Structure}: {noteFragment}; location: {location}; measurement: {value unit}; notes: {comment}.
  Observations: {existing intraoralFindings text}.
```

Rules:

- emit selected structures and options in catalogue order;
- emit one bullet per selected observation;
- omit unsupported or empty annotation clauses;
- omit the Observations line when the existing textarea is empty;
- use catalogue `noteFragment` wording without adding diagnosis, etiology,
  symptoms, education, treatment, recommendation, or follow-up;
- do not display classification labels in clinical output;
- do not emit an empty Intraoral heading; and
- never emit separate Gingiva or Teeth structured output.

## Saliva and Caries Risk Boundary

Saliva is a direct Intraoral observation in this slice. Preserve the existing
Hyposalivation caries-risk catalogue item, but do not:

- automatically add Hyposalivation when reduced salivary flow is selected;
- automatically add reduced salivary flow when Hyposalivation is selected;
- automatically remove either observation when the other is cleared; or
- infer xerostomia, symptoms, diagnosis, treatment, or recommendations.

The possible explicit suggestion linking these controls is deferred.

## Existing Occlusion Controls

Preserve:

- right molar occlusion and its N/A action;
- left molar occlusion and its N/A action;
- skeletal occlusion and its N/A action;
- the existing `clinical-exam.molar-occlusion` catalogue;
- the existing `clinical-exam.skeletal-occlusion` catalogue;
- existing `Cl I`, `Cl II`, and `Cl III` starter labels;
- overjet in millimetres; and
- overbite in percent.

Do not add duplicate `Class I`, `Class II`, or `Class III` starters. Do not
automatically fan a generic class selection into right molar, left molar, or
skeletal state.

## Overbite in Percent and Millimetres

Keep the existing optional Overbite (%) input and state. Add an independent
optional Overbite (mm) input beside it.

Neither value is required and neither implies that overbite is increased.
Do not automatically select or remove an Additional occlusal finding based on
a measurement.

Generated output:

- percent only: preserve `Overbite: {value}%.`
- millimetres only: `Overbite: {value} mm.`
- both: `Overbite: {percent}%; {millimetres} mm.`

Preserve the existing order of surrounding occlusion lines.

## Additional Occlusal Findings

Add one catalogue-backed multi-value control labelled:

`Additional occlusal findings`

Place it in the existing Recare Clinical Exam section after the overjet and
overbite inputs. Do not create a new section.

Add a new allowlisted browser-local catalogue key:

`clinical-exam.additional-occlusal-findings`

Approved public starters after the 2026-07-30 clinical wording review:

- Open bite
- Crossbite
- Increased overjet
- Increased overbite

Map each public starter to its normalized catalogue source ID for provenance.
Do not preselect a starter and do not visually imply that starters are
preferred findings.

The source phrase `Slight malocclusion` remains in the raw audit transcription
only. It is clinically non-specific and must not appear as a normalized option
or public starter.

Users may type an additional finding that is not in the starter list. Follow
the existing ADR 0001 catalogue contract:

- free entry remains valid;
- typing alone never saves;
- saving requires an explicit Remember action;
- remembered wording remains in the current browser profile;
- user entries may use existing catalogue management behavior;
- selecting a suggestion snapshots its current text into encounter state;
- catalogue editing or deletion must not rewrite an active selection; and
- location, measurement, comments, and other patient-specific annotations are
  never stored in the catalogue.

Every selected starter or custom finding supports optional
encounter-specific location. Provide reusable location interaction with
reviewed quick choices:

- Anterior
- Posterior
- Right
- Left
- Maxilla
- Mandible

Also allow editable Tooth/area or region text. Permit more than one location
when clinically documented. Locations belong to the selected encounter
finding, not to its catalogue entry.

Generated output:

`Additional occlusal findings: {finding} (location: {locations}); {finding} (location: {locations}).`

Omit the location parenthetical when none is documented. Preserve selected
order and current text snapshots. Do not infer diagnosis, severity,
orthodontic treatment need, or referral.

## Demo, Reset, Privacy, and Accessibility

- Extend the Recare synthetic fixture using only synthetic annotations and
  values.
- Deep-copy all new nested findings and locations when loading the demo.
- Reset restores structured Intraoral findings, Overbite (mm), and Additional
  occlusal findings to empty state.
- The demo must never remember a catalogue value.
- Completed form state remains in memory only.
- Only deliberately remembered reusable occlusal wording may enter the
  browser-local catalogue.
- Reuse shared controls and catalogue infrastructure.
- Provide keyboard, pointer, touch, focus-visible, and screen-reader behavior
  consistent with existing Recare controls.

## Required Validation

Test that:

- old-shaped Recare state and the current fixture produce the exact pre-change
  summary when additions are absent;
- existing Intraoral free-text-only and WNL output remain byte-for-byte
  compatible;
- structured selection sets Intraoral to Findings;
- WNL confirmation clears existing and structured Intraoral findings but no
  unrelated state;
- cancelling WNL confirmation preserves all findings;
- coated and fissured tongue are normal variations without pathological
  output;
- supported locations, laterality, measurements, and comments are emitted;
- unsupported annotations are neither shown nor emitted;
- saliva never silently modifies caries-risk state;
- right/left molar and skeletal fields and their ClearDent catalogue behavior
  remain unchanged;
- no duplicate Class I/II/III starters are introduced;
- overbite supports percent, millimetres, and both with the approved output;
- every Additional occlusal finding supports optional location;
- starter, custom, and deliberately remembered occlusal findings work;
- typing, selecting, loading the demo, or adding location never remembers a
  value automatically;
- patient-specific location is absent from catalogue exports;
- unknown or retired fixed IDs do not crash or generate invented text;
- Teeth and IOE Gingiva state are not introduced;
- Chief Concern remains unchanged; and
- no completed-form persistence or JSON form import/export is added.

Run the relevant formatter, lint, type-check, unit tests, browser tests,
catalogue import/export tests, and production build.

The final report must identify:

- mapping and code files changed;
- compatibility decisions;
- fixed and browser-local catalogue integration;
- generated-note behavior;
- WNL transition behavior;
- validation results;
- any unresolved review item affecting this slice; and
- confirmation that no Slice 1 or deferred work was included.
