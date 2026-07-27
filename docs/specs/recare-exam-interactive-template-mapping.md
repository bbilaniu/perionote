# Recare Exam Interactive Template Mapping

- Status: Accepted for implementation
- Date: 2026-07-24
- Clinical review status: Accepted 2026-07-25
- Source template: `recare-exam`
- Interactive slug: `recare-exam`
- Interactive route: `/templates/clinic/recare-exam/interactive`
- Source baseline commit: `7d3d21c`
- Lifecycle status: `pilot`
- Governing decisions:
  - [ADR 0001: Support Local Customizable Documentation Catalogues](../adr/0001-support-local-customizable-documentation-catalogues.md)
  - [ADR 0002: Separate Clinic and Interactive Template Libraries](../adr/0002-separate-clinic-and-interactive-template-libraries.md)
  - [ADR 0003: Define Interactive Template Conversion and Provenance](../adr/0003-define-interactive-template-conversion-and-provenance.md)
  - [ADR 0004: Colocate Clinical Conversions with Source Templates](../adr/0004-colocate-clinical-conversions-with-source-templates.md)
- Catalogue implementation:
  [Recare Exam Local Catalogue Pilot Proposal](../requests/2026-07-25_recare-exam-local-catalogue-pilot-proposal.md)

## Purpose

This accepted specification maps every line of the approved public
[Recare Exam source template](../../lib/clinic-templates/registry.ts) to a
reviewed interactive control and generated-note behavior. It also includes the
user-requested Patient ID and note-start timestamp extensions, which are not
present in the source template.

Functional approval advances the conversion to lifecycle status `pilot`. Pilot
conversions are included in production and remain visibly labelled under ADR
0003; this approval does not advance the conversion to `ready`.

## Scope

The pilot will:

- preserve the clinical intent and recognizable wording of the source;
- use explicit controls for stable semantic values;
- retain free text where the source vocabulary is not known to be closed;
- generate a copyable Recare Exam note;
- keep all completed and partial form data in memory only;
- use synthetic fixtures and test values;
- provide browser-local catalogues for the approved provider, radiograph,
  occlusion, and reusable treatment-item fields;
- provide deliberate local catalogue import and export; and
- establish the provenance, lifecycle, and testing pattern for later
  conversions.

The pilot will not:

- integrate with ClearDent or another EMR;
- claim that `[AUTO: ...]` values are automatically available;
- store completed or partial forms;
- add clinical recommendations or decision support;
- silently infer WNL findings, treatment, or next-visit decisions; or
- refactor every existing interactive form before the pilot works.

## Classification Legend

- `appCore`: stable application vocabulary whose meaning affects controls or
  output.
- `catalogue`: an allowlisted editable field that may use explicitly saved
  browser-local suggestions under ADR 0001.
- `narrative`: unrestricted documentation text.
- `patient-specific`: encounter-specific data that must never be saved to a
  reusable catalogue.
- `administrative`: encounter-specific operational data, also kept in memory
  only.

Unless stated otherwise, all controls start blank or **Not documented**. WNL,
negative findings, treatment choices, and other clinical facts are never
preselected.

## Screen Structure

1. Patient and Visit Context
2. Visit Team
3. Consent, Medical History, and Sterilization
4. Records and Chief Concern
5. Clinical Exam
6. Appliances and Relevant History
7. Treatment and Next Visit
8. Generated Note

A required **Patient ID** field and a read-only **Note started** timestamp are
included as user-requested extensions. The timestamp records the browser-local
date and time when the page loads or the form is reset after confirmation.
Patient names are not collected. Like all form data, these values remain only
in memory until the generated note is explicitly copied. At least one Visit
Team field—Dentist, RDA, or RDH—is also required before copying.

## Field Mapping

### Patient and Visit Context

| ID  | Source                                               | Control                                                        | Classification     | Generated output                      |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------ | ---------------------------------- |
| R00 | User-requested extension; not in the source template | Required editable text: **Patient ID**                         | `patient-specific` | `PATIENT ID: {text}`                  |
| R35 | User-requested extension; not in the source template | Read-only browser-local **Note started** timestamp at page load or confirmed reset | `administrative`   | `NOTE STARTED: {YYYY-MM-DD HH:mm}`    |

### Visit Team

| ID  | Source                               | Control                    | Classification    | Generated output               |
| --- | ------------------------------------ | ------------------------------------------- | -------------- | ------------------------------ |
| R01 | `DENTIST: [SELECT/INSERT: Dentists]` | Catalogue-backed editable text: **Dentist** | `catalogue` | `DENTIST: {text}` when entered |
| R02 | `RDA: [SELECT/INSERT: RDA]`          | Catalogue-backed editable text: **RDA**     | `catalogue` | `RDA: {text}` when entered     |
| R03 | `RDH: [SELECT/INSERT: Hygienist]`    | Catalogue-backed editable text: **RDH**     | `catalogue` | `RDH: {text}` when entered     |

Provider fields do not ship with real staff values or public suggestions. A
user may deliberately remember a value in the current browser profile under
the approved catalogue proposal. Dentist, RDA, and RDH are individually
optional, but at least one of the three must contain non-whitespace text before
the note can be copied.

### Consent, Medical History, and Sterilization

| ID  | Source                                                                                                     | Control                                                                                                               | Classification                                                  | Generated output                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| R07 | Class 5 indicator sentence                                                                                 | Unchecked checkbox: **Class 5 indicators checked**                                                                    | `appCore`                                                       | Preserve the source sentence only when explicitly checked                        |
| R08 | `Miele Sterilization codes scanned:`                                                                       | Editable text: **Miele sterilization codes**, positioned next to Class 5                                              | `administrative`                                                | `Miele Sterilization codes scanned: {text}` when entered                         |
| R04 | First informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Three independent unchecked checkboxes: **Patient**, **Parent**, and **Legal guardian**; optional **Consent details** | Consent sources: `appCore`; details: `patient-specific`         | `Informed verbal consent given by {selected sources} for treatment today.`       |
| R05 | `MEDICAL history reviewed & INCLUDES: [SELECT/INSERT: MedHx/DentalHx]`                                     | Catalogue-backed editable text: **Medical history reviewed**, positioned next to Premedication                       | Current value: `patient-specific`; reusable phrases: `catalogue` | `Medical history reviewed: {selected or entered text}`                           |
| R06 | `Premedication Required: [SELECT/INSERT: PREMED]`                                                          | Status: **Not documented / Not required / Required**; optional details when required                                  | Status: `appCore`; details: `patient-specific`                  | `Premedication required: No.` or `Premedication required: Yes—{details}.`        |
| R09 | Second informed-consent line                                                                               | No second control; merge with R04                                                                                     | Source duplicate                                                | No duplicate output                                                              |

The on-screen order is Class 5 and Miele, Consent given by, then Medical history
reviewed and Premedication. The generated note retains its existing source
order: consent, medical history, premedication, Class 5, then Miele. The two
source consent lines are confirmed duplicates and produce one line. Consent
sources are independent because more than one may apply. Patient names are
intentionally omitted because Hygienenote has no EMR integration and does not
store patient records. The required Patient ID extension remains in memory
only. Medical history uses the same four public starter suggestions and
browser-local catalogue as Adult Hygiene; free text remains valid and no value
is preselected. Premedication retains **Not documented** as its neutral initial
state.

### Records and Chief Concern

| ID  | Source                                         | Control                                                              | Classification                                 | Generated output                                            |
| --- | ---------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| R10 | `Radiographs: [SELECT/INSERT: Radiographs]`    | Ordered catalogue-backed multi-value control: **Radiographs** | Current selections: `patient-specific`; reusable values: `catalogue` | `Radiographs: {selected and entered values}` |
| R11 | `Intraoral photos: [SELECT/INSERT: Intraoral]` | Status: **Not documented / No / Yes**; optional editable **Details** | Status: `appCore`; details: `patient-specific` | `Intraoral photos: {Yes/No}.` or `Intraoral photos: {Yes/No}—{details}.` |
| R12 | `a) Patients chief concern:`                   | Textarea: **Patient's chief concern**                               | `patient-specific`                             | `Patient's chief concern: {text}`                           |

Radiographs uses the complete visible options from the reviewed local JSON
extraction as public starters: `PAN`, `1 BW`, `2 BW`, `3 BW`, `4 BW`, `5 BW`,
`6 BW`, `1 PA`, and `2 PA`. The source list has a scrollbar, so free entry and
explicit browser-local additions remain available. Selected entries can be
removed and reordered without modifying the catalogue. Intraoral photos
continues to use an explicit Yes/No status plus editable details.

### Clinical Exam

| ID  | Source                                | Control                                                               | Classification                                   | Generated output                                               |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| R13 | `b) Extraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Extraoral: WNL.` or `Extraoral: {findings}`                   |
| R14 | `c) TMJ- WNL`                         | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `TMJ: WNL.` or `TMJ: {findings}`                               |
| R15 | `Palpation of the Masseter Test: WNL` | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Palpation of the masseter test: WNL.` or the entered findings |
| R16 | `Load TMJ joint Test: WNL`            | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Load TMJ joint test: WNL.` or the entered findings            |
| R17 | `d) Intraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Intraoral: WNL.` or `Intraoral: {findings}`                   |
| R18 | `Oral Habits-`                        | Editable text: **Oral habits**                                        | `patient-specific`                               | `Oral habits: {text}`                                          |
| R19 | `Molar Occlusion-`                    | Separate catalogue-backed editable **Right** and **Left molar occlusion** fields, each with an explicit **N/A** action | Text: `catalogue`; N/A: `appCore` | `Molar occlusion—right: {text or N/A}` and `Molar occlusion—left: {text or N/A}` |
| R20 | `Skeletal Occlusion- N/A`             | Catalogue-backed editable text: **Skeletal occlusion** with an explicit **N/A** action | Text: `catalogue`; N/A: `appCore`         | `Skeletal occlusion: N/A.` or `Skeletal occlusion: {text}`     |
| R21 | `Overjet- mm`                         | Optional numeric input: **Overjet (mm)**                              | Measurement: `patient-specific`; unit: `appCore` | `Overjet: {number} mm.`                                        |
| R22 | `Overbite- %`                         | Optional numeric input: **Overbite (%)**                              | Measurement: `patient-specific`; unit: `appCore` | `Overbite: {number}%.`                                         |

All five exam-status controls start at **Not assessed**. Choosing **Findings**
reveals an editable textarea. WNL must be actively selected and is never inferred
from an empty findings field.

The pilot will not impose undocumented clinical minimums, maximums, or decimal
precision on overjet or overbite. Basic numeric parsing may prevent nonnumeric
output, but clinical ranges require a sourced decision.

Masseter palpation and TMJ load testing remain separate controls. The source's
skeletal-occlusion `N/A` value is an explicit action and is not preselected.
Right and left molar occlusion likewise have independent explicit N/A actions;
neither is preselected.

### Appliances and Relevant History

| ID  | Source                                        | Control                                                                                                         | Classification     | Generated output                                                               |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------- |
| R23 | `Do they use a CPAP?` plus approved ownership clarification | Status: **Not documented / No / Yes** labelled **Has a CPAP?**; when Yes, show **Uses the CPAP?** with the same statuses | `appCore` | `CPAP: No.` when No; when Yes, `CPAP: Yes; {uses/does not use/use not documented}.` |
| R24 | `Does patient have a Splint?`                 | Status: **Not documented / No / Yes** labelled **Has an occlusal splint**                                       | `appCore`          | `Occlusal splint: No.` when No; combined with R25 when Yes                      |
| R25 | `Do they use Splint?`                         | Status: **Not documented / No / Yes** labelled **Uses the occlusal splint**, shown when ownership is Yes       | `appCore`          | `Occlusal splint: Yes; {uses/does not use/use not documented}.`                |
| R26 | `Have they had orthodontics?`                 | Status: **Not documented / No / Yes**                                                                           | `appCore`          | `Orthodontic history: No.` or `Orthodontic history: Yes.`                      |
| R27 | `Do they wear Retainers? Fixed or removable?` | Status: **Not documented / None / Fixed / Removable / Fixed and removable**                                     | `appCore`          | `Retainers: {selected status}.`                                                |
| R28 | `Do they have Partial Dentures`               | Status: **Not documented / No / Yes** labelled **Partial/complete removable dentures**                          | `appCore`          | `Partial/complete removable dentures: No.` or `Partial/complete removable dentures: Yes.` |
| R29 | Smile or teeth improvement question           | Textarea: **What would the patient like to improve about their smile or teeth?**                                | `patient-specific` | `Patient would like to improve: {text}`                                        |
| R30 | `Additional Comments-`                        | Textarea: **Additional comments**                                                                               | `patient-specific` | `Additional comments: {text}`                                                  |

The CPAP ownership and use controls behave like the occlusal-splint pair.
Changing ownership away from Yes clears the conditional use status. R27
remains available regardless of the orthodontic-history answer. The form
will not assume that a negative or undocumented orthodontic history makes a
retainer value impossible. The UI and generated note use **Occlusal splint**
and **Partial/complete removable dentures**. Every documented negative,
affirmative, or selected-status answer appears in the generated note for CPAP,
occlusal splint, orthodontic history, retainers, and removable dentures.

### Treatment and Next Visit

| ID  | Source                                             | Control                                                                                               | Classification                                                     | Generated output                                                                  |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| R31 | `Treatment Options:` and `1) HYGIENE MAINTENANCE`  | Ordered editable rows with a catalogue-backed **Treatment type** and optional encounter-only **Tooth/area**             | Treatment type: `catalogue` when explicitly remembered; each row and tooth/area: `patient-specific`; never automatically selected | An ordered `Treatment Options:` block containing `Treatment type` and, when present, ` — Tooth/area` |
| R32 | `Treatment Plan:` and `1) HYGIENE MAINTENANCE`     | Independent ordered editable rows with the same fields; while empty, offer **Copy Treatment Options to Treatment Plan** | Treatment type: `catalogue` when explicitly remembered; each row and tooth/area: `patient-specific`; never automatically selected | An ordered `Treatment Plan:` block containing only explicitly entered or explicitly copied rows      |
| R33 | `Next Visit: [UNRESOLVED PLACEHOLDER: NEXT VISIT]` | Editable text: **Next visit**                                                                         | `patient-specific`                                                 | `Next Visit: {text}`                                                              |
| R34 | `Date Booked:`                                     | Optional date input: **Date booked**                                                                  | `administrative`                                                   | `Date Booked: {YYYY-MM-DD}`                                                       |

The shared treatment-type catalogue has only one public starter: **Hygiene
maintenance**. It is an explicit option, not a default or recommendation.
Each list supports adding, removing, reordering, and editing rows inline.
Treatment types may be repeated so that the same treatment can document
different teeth or areas. **Remember treatment type** saves only the type;
the optional Tooth/area value always remains in the current note. Selecting a
treatment option does not automatically select the same treatment plan. The
blank Treatment type suggestion list offers a separate eye-slash action that
hides a suggestion without selecting it or changing any treatment row. Hidden
suggestions remain recoverable through **Manage Catalogues**. The
copy action appears only while Treatment Plan has no documented rows and
snapshots the current ordered Treatment Options after an explicit click.
Copied rows receive independent identities, so later edits do not affect the
source rows. Neither field infers the next visit.

Treatment Options and Treatment Plan remain separate controls. The source's
undeclared `NEXT VISIT` placeholder maps to unrestricted text. Dates generated
by the template, including Date Booked, use `YYYY-MM-DD`.

## Generated-Note Order

The note should preserve the source order, preceded by the user-requested
Patient ID and note-start timestamp extensions:

1. Patient ID
2. Form-start timestamp
3. Visit team
4. Consent
5. Medical history and premedication
6. Sterilization documentation
7. Radiographs and intraoral photos
8. Chief concern
9. Clinical exam
10. Appliances and relevant history
11. Patient improvement request and additional comments
12. Treatment options
13. Treatment plan
14. Next visit and date booked

Unanswered fields are omitted. Section headings with no output are also
omitted. The generated note must not contain placeholder labels such as
`undefined`, `Not assessed`, or `[UNRESOLVED PLACEHOLDER: ...]`.

The visible preview contains the complete generated note. A successful
**Copy note** action writes that preview to the clipboard unchanged and does
not add a separate copy-time timestamp.

### Illustrative Output Shape

The following uses tokens rather than real clinical or staff information:

```text
PATIENT ID: {entered patient ID}
NOTE STARTED: {YYYY-MM-DD HH:mm when the page loaded or reset was confirmed}
DENTIST: {entered dentist}
RDA: {entered RDA}
RDH: {entered RDH}

Informed verbal consent given by {selected sources} for treatment today.
Medical history reviewed: {selected or entered text}
Premedication required: {documented answer}

Radiographs: {ordered selected and entered values}
Intraoral photos: {Yes/No and optional details}
Patient's chief concern: {entered text}

Extraoral: {WNL or findings}
TMJ: {WNL or findings}
Palpation of the masseter test: {WNL or findings}
Load TMJ joint test: {WNL or findings}

Intraoral: {WNL or findings}
Oral habits: {entered text}
Molar occlusion—right: {entered text or N/A}
Molar occlusion—left: {entered text or N/A}
Skeletal occlusion: {entered text or N/A}
Overjet: {number} mm.
Overbite: {number}%.

CPAP: {documented ownership and use}
Occlusal splint: {documented ownership and use}
Orthodontic history: {documented answer}
Retainers: {documented answer}
Partial/complete removable dentures: {documented answer}

Patient would like to improve: {entered text}
Additional comments: {entered text}

Treatment Options:
  - {treatment type}{ — optional tooth/area}

Treatment Plan:
  - {treatment type}{ — optional tooth/area}

Next Visit: {entered text}
Date Booked: {YYYY-MM-DD}
```

The blank lines, headings, capitalization, punctuation, and indentation shown
above are accepted. Output uses one blank line between non-empty groups and
does not leave extra blank lines when an entire group is omitted.

## Interaction and Privacy Rules

- Form values live only in React component memory.
- The browser-local **Note started** timestamp is captured once when the page
  loads. Loading demo data or copying does not refresh it. A confirmed reset
  replaces it with the current browser-local date and time.
- Reloading or leaving the route discards the form.
- No form value is written to browser storage, URLs, analytics, telemetry,
  error reporting, an API, fixtures, or source files.
- Copying the generated note requires an explicit user action.
- A copy attempt must not write to the clipboard unless Patient ID and at least
  one of Dentist, RDA, or RDH contain non-whitespace text.
- A failed copy attempt shows visible field-level validation, explains the
  provider-group requirement, and moves focus to the first unresolved error.
- A successful copy attempt writes the visible preview unchanged and does not
  generate or append a copy-time timestamp.
- The visible **Reset form** action always requires confirmation, including
  when all editable fields are empty.
- Cancelling reset leaves the fields and Note started timestamp unchanged.
- Confirming reset clears all editable fields and refreshes Note started to the
  current browser-local date and time.
- Demo data, if offered, must be clearly synthetic and require an explicit
  action to load.
- Provider, radiograph, occlusion, and reusable treatment-type values are remembered
  only through the explicit local catalogue interaction approved under ADR 0001. Typing, selecting, loading demo data, copying, or resetting the form
  never saves a catalogue value.
- Selected radiographs and structured Treatment Options and Treatment Plan
  rows remain encounter-specific even when a treatment type originated in a
  catalogue. Tooth/area values are never catalogue candidates.
- Other patient-specific, administrative, measurement, findings, and
  next-visit values are never catalogue candidates under this mapping.

## Reuse and Implementation Boundaries

The pilot should reuse established behavior without copying the existing large
interactive webform.

Potential reuse:

- `TemplateShell` or a small successor for the form/summary layout;
- existing date and time formatting utilities where applicable;
- summary punctuation and indentation helpers after they are made generic;
- the current EOE/IOE pattern as a behavioral reference; and
- current copy-to-clipboard and demo-loading interaction patterns.

Likely pilot-specific work:

- a Recare Exam form-state type;
- a pure `buildRecareExamSummary` function;
- a synthetic fixture;
- a `RecareExamTemplate` component;
- provenance and lifecycle registry metadata; and
- focused Vitest and Playwright coverage.

This specification does not require extracting every possible shared component
before the pilot. A control should be shared when its semantics and output
contract are genuinely the same, not only because two fields look similar.

## Acceptance Criteria

- All 36 mapping IDs—34 source mappings plus the Patient ID and note-start
  timestamp extensions—are
  implemented or explicitly removed through an approved revision of this
  specification.
- The source consent duplication is resolved and produces no accidental
  duplicate output.
- Patient names are not collected.
- Patient ID is required before copying, remains in memory only, and appears in
  copied output.
- A read-only browser-local Note started timestamp is captured at page load or
  confirmed reset, remains in memory only, and appears next to Patient ID in
  the form and copied output.
- At least one of Dentist, RDA, or RDH is required before copying.
- No clipboard write occurs when either copy prerequisite is unmet.
- The visible preview includes the Note started timestamp, and successful copy
  output matches that preview exactly.
- Date Booked output uses `YYYY-MM-DD`.
- WNL and negative findings require explicit user selection.
- Right and left molar occlusion are documented independently, and each has an
  explicit, non-preselected N/A action.
- Radiographs uses the reviewed starter vocabulary with ordered add, remove,
  and reorder behavior; intraoral photos retains explicit Yes/No plus details.
- CPAP uses independent ownership and conditional use statuses matching the
  occlusal-splint interaction.
- The UI and generated note use **Occlusal splint**, and every documented
  negative, affirmative, or selected-status appliance/history answer appears
  in the generated note.
- The UI and generated note use **Partial/complete removable dentures**.
- Treatment options and plans are never preselected, support ordered catalogue
  entries, and copy from Options to an empty Plan only after an explicit click.
- Unknown editable values render and appear unchanged in generated output.
- Blank fields and empty headings are omitted cleanly.
- Non-empty output groups are separated by exactly one blank line.
- Reloading the page restores an empty form, not prior form data.
- No form-state storage or network submission is introduced.
- Generated-note tests use synthetic values.
- Browser tests cover the main workflow, mandatory reset confirmation,
  reset-time refresh, copy prerequisites, preview/copy parity, note-start
  timestamp, paragraph spacing, and non-persistence.
- Registry metadata identifies source `recare-exam`, source baseline
  `7d3d21c`, and lifecycle status.
- The template is `pilot` after functional approval. It may advance to `ready`
  only after final clinical review confirms the implemented workflow and
  generated output.

## Implementation Sequence

1. Add the minimal ADR 0003 registry metadata and draft exclusion behavior.
2. Write the pure initial-state and summary-builder tests.
3. Implement the Recare Exam form with in-memory state.
4. Add synthetic demo data and summary expectations.
5. Add Playwright workflow and non-persistence tests.
6. Compare generated output with the accepted example.
7. Record implementation review and advance from `draft` to `pilot`.
