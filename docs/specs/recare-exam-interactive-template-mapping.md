# Recare Exam Interactive Template Mapping

- Status: Accepted for implementation
- Date: 2026-07-24
- Clinical review status: Accepted 2026-07-25
- Source template: `recare-exam`
- Interactive slug: `recare-exam`
- Source baseline commit: `7d3d21c`
- Initial lifecycle status: `draft`
- Governing decisions:
  - [ADR 0001: Support Local Customizable Documentation Catalogues](../adr/0001-support-local-customizable-documentation-catalogues.md)
  - [ADR 0002: Separate Clinic and Interactive Template Libraries](../adr/0002-separate-clinic-and-interactive-template-libraries.md)
  - [ADR 0003: Define Interactive Template Conversion and Provenance](../adr/0003-define-interactive-template-conversion-and-provenance.md)

## Purpose

This accepted specification maps every line of the approved public
[Recare Exam source template](../../lib/clinic-templates/registry.ts) to a
reviewed interactive control and generated-note behavior. It also includes the
user-requested Patient ID, form-start timestamp, and copy-time timestamp
extensions, which are not present in the source template.

Acceptance authorizes implementation with lifecycle status `draft`; it does not
authorize publishing the interactive template as `pilot` or `ready`.

## Scope

The pilot will:

- preserve the clinical intent and recognizable wording of the source;
- use explicit controls for stable semantic values;
- retain free text where the source vocabulary is not known to be closed;
- generate a copyable Recare Exam note;
- keep all completed and partial form data in memory only;
- use synthetic fixtures and test values; and
- establish the provenance, lifecycle, and testing pattern for later
  conversions.

The pilot will not:

- integrate with ClearDent or another EMR;
- claim that `[AUTO: ...]` values are automatically available;
- store completed or partial forms;
- implement ADR 0001 catalogue persistence;
- add clinical recommendations or decision support;
- silently infer WNL findings, treatment, or next-visit decisions; or
- refactor every existing interactive form before the pilot works.

## Classification Legend

- `appCore`: stable application vocabulary whose meaning affects controls or
  output.
- `catalogue-later`: suitable for a future explicitly saved local catalogue,
  but editable text in this pilot.
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

A required **Patient ID** field and a read-only **Form started** timestamp are
included as user-requested extensions. The timestamp records the browser-local
date and time when the page loads. Patient names are not collected. Like all
form data, these values remain only in memory until the generated note is
explicitly copied. At least one Visit Team field—Dentist, RDA, or RDH—is also
required before copying.

## Field Mapping

### Patient and Visit Context

| ID  | Source                                               | Control                                                        | Classification     | Generated output                      |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------ | ------------------------------------- |
| R00 | User-requested extension; not in the source template | Required editable text: **Patient ID**                         | `patient-specific` | `PATIENT ID: {text}`                  |
| R35 | User-requested extension; not in the source template | Read-only browser-local **Form started** timestamp at page load | `administrative`   | `FORM STARTED: {YYYY-MM-DD HH:mm}`    |

### Visit Team

| ID  | Source                               | Control                    | Classification    | Generated output               |
| --- | ------------------------------------ | -------------------------- | ----------------- | ------------------------------ |
| R01 | `DENTIST: [SELECT/INSERT: Dentists]` | Editable text: **Dentist** | `catalogue-later` | `DENTIST: {text}` when entered |
| R02 | `RDA: [SELECT/INSERT: RDA]`          | Editable text: **RDA**     | `catalogue-later` | `RDA: {text}` when entered     |
| R03 | `RDH: [SELECT/INSERT: Hygienist]`    | Editable text: **RDH**     | `catalogue-later` | `RDH: {text}` when entered     |

Provider fields will not ship with real staff values or public suggestions.
Future locally saved provider values require explicit catalogue behavior under
ADR 0001. Dentist, RDA, and RDH are individually optional, but at least one of
the three must contain non-whitespace text before the note can be copied.

### Consent, Medical History, and Sterilization

| ID  | Source                                                                                                     | Control                                                                                                | Classification                                        | Generated output                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| R04 | First informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Checkbox: **Informed verbal consent obtained for treatment today**; optional **Consent details** text  | Consent state: `appCore`; details: `patient-specific` | `Informed verbal consent obtained for treatment today.` plus entered details              |
| R05 | `MEDICAL history reviewed & INCLUDES: [SELECT/INSERT: MedHx/DentalHx]`                                     | Status: **Not documented / Reviewed—no changes / Reviewed—updated**; textarea shown for update details | Status: `appCore`; details: `patient-specific`        | `Medical history reviewed: no changes reported.` or `Medical history reviewed: {details}` |
| R06 | `Premedication Required: [SELECT/INSERT: PREMED]`                                                          | Status: **Not documented / Not required / Required**; optional details when required                   | Status: `appCore`; details: `patient-specific`        | `Premedication required: No.` or `Premedication required: Yes—{details}.`                 |
| R07 | Class 5 indicator sentence                                                                                 | Checkbox: **Class 5 indicators checked**                                                               | `appCore`                                             | Preserve the source sentence only when explicitly checked                                 |
| R08 | `Miele Sterilization codes scanned:`                                                                       | Editable text: **Miele sterilization codes**                                                           | `administrative`                                      | `Miele Sterilization codes scanned: {text}` when entered                                  |
| R09 | Second informed-consent line                                                                               | No second control; merge with R04                                                                      | Source duplicate                                      | No duplicate output                                                                       |

The two consent lines are confirmed duplicates and produce one line. Patient
first and last names are intentionally omitted from the consent sentence
because Hygienenote has no EMR integration and does not store patient records.
The separate required Patient ID extension remains in memory only. The reviewed
medical-history and premedication statuses use **Not documented** as their
neutral initial state.

### Records and Chief Concern

| ID  | Source                                         | Control                                                              | Classification                                 | Generated output                                            |
| --- | ---------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| R10 | `Radiographs: [SELECT/INSERT: Radiographs]`    | Status: **Not documented / No / Yes**; optional editable **Details** | Status: `appCore`; details: `patient-specific` | `Radiographs: {Yes/No}.` or `Radiographs: {Yes/No}—{details}.`      |
| R11 | `Intraoral photos: [SELECT/INSERT: Intraoral]` | Status: **Not documented / No / Yes**; optional editable **Details** | Status: `appCore`; details: `patient-specific` | `Intraoral photos: {Yes/No}.` or `Intraoral photos: {Yes/No}—{details}.` |
| R12 | `a) Patients chief concern:`                   | Textarea: **Patient's chief concern**                               | `patient-specific`                             | `Patient's chief concern: {text}`                           |

Radiographs and intraoral photos use explicit Yes/No statuses plus editable
details. A documented Yes or No is included in the generated note; unanswered
statuses are omitted.

### Clinical Exam

| ID  | Source                                | Control                                                               | Classification                                   | Generated output                                               |
| --- | ------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| R13 | `b) Extraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Extraoral: WNL.` or `Extraoral: {findings}`                   |
| R14 | `c) TMJ- WNL`                         | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `TMJ: WNL.` or `TMJ: {findings}`                               |
| R15 | `Palpation of the Masseter Test: WNL` | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Palpation of the masseter test: WNL.` or the entered findings |
| R16 | `Load TMJ joint Test: WNL`            | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Load TMJ joint test: WNL.` or the entered findings            |
| R17 | `d) Intraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea          | Status: `appCore`; findings: `patient-specific`  | `Intraoral: WNL.` or `Intraoral: {findings}`                   |
| R18 | `Oral Habits-`                        | Editable text: **Oral habits**                                        | `patient-specific`                               | `Oral habits: {text}`                                          |
| R19 | `Molar Occlusion-`                    | Separate editable **Right** and **Left molar occlusion** fields, each with an explicit **N/A** action | Text: `patient-specific`; N/A: `appCore` | `Molar occlusion—right: {text or N/A}` and `Molar occlusion—left: {text or N/A}` |
| R20 | `Skeletal Occlusion- N/A`             | Editable text: **Skeletal occlusion** with an explicit **N/A** action | Text: `patient-specific`; N/A: `appCore`         | `Skeletal occlusion: N/A.` or `Skeletal occlusion: {text}`     |
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
| --- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| R23 | `Do they use a CPAP?`                         | Status: **Not documented / No / Yes**                                                                           | `appCore`          | `CPAP use: No.` or `CPAP use: Yes.`                                            |
| R24 | `Does patient have a Splint?`                 | Status: **Not documented / No / Yes** labelled **Has an occlusal splint**                                       | `appCore`          | `Occlusal splint: No.` when No; combined with R25 when Yes                      |
| R25 | `Do they use Splint?`                         | Status: **Not documented / No / Yes** labelled **Uses the occlusal splint**, shown when ownership is Yes       | `appCore`          | `Occlusal splint: Yes; {uses/does not use/use not documented}.`                |
| R26 | `Have they had orthodontics?`                 | Status: **Not documented / No / Yes**                                                                           | `appCore`          | `Orthodontic history: No.` or `Orthodontic history: Yes.`                      |
| R27 | `Do they wear Retainers? Fixed or removable?` | Status: **Not documented / None / Fixed / Removable / Fixed and removable**                                     | `appCore`          | `Retainers: {selected status}.`                                                |
| R28 | `Do they have Partial Dentures`               | Status: **Not documented / No / Yes** labelled **Partial/complete removable dentures**                          | `appCore`          | `Partial/complete removable dentures: No.` or `Partial/complete removable dentures: Yes.` |
| R29 | Smile or teeth improvement question           | Textarea: **What would the patient like to improve about their smile or teeth?**                                | `patient-specific` | `Patient would like to improve: {text}`                                        |
| R30 | `Additional Comments-`                        | Textarea: **Additional comments**                                                                               | `patient-specific` | `Additional comments: {text}`                                                  |

R27 remains available regardless of the orthodontic-history answer. The form
will not assume that a negative or undocumented orthodontic history makes a
retainer value impossible. The UI and generated note use **Occlusal splint**
and **Partial/complete removable dentures**. Every documented negative,
affirmative, or selected-status answer appears in the generated note for CPAP,
occlusal splint, orthodontic history, retainers, and removable dentures.

### Treatment and Next Visit

| ID  | Source                                             | Control                                                                                               | Classification                                                     | Generated output                                                                  |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| R31 | `Treatment Options:` and `1) HYGIENE MAINTENANCE`  | Explicit unchecked option: **Hygiene maintenance** plus editable **Other treatment options** textarea | `patient-specific` clinical decision; never automatically selected | A `Treatment Options:` block containing only explicitly selected or entered items |
| R32 | `Treatment Plan:` and `1) HYGIENE MAINTENANCE`     | Explicit unchecked option: **Hygiene maintenance** plus editable **Other treatment plan** textarea    | `patient-specific` clinical decision; never automatically selected | A `Treatment Plan:` block containing only explicitly selected or entered items    |
| R33 | `Next Visit: [UNRESOLVED PLACEHOLDER: NEXT VISIT]` | Editable text: **Next visit**                                                                         | `patient-specific`                                                 | `Next Visit: {text}`                                                              |
| R34 | `Date Booked:`                                     | Optional date input: **Date booked**                                                                  | `administrative`                                                   | `Date Booked: {YYYY-MM-DD}`                                                       |

The source's hygiene-maintenance lines are preserved as explicit options, not
defaults or recommendations. Selecting a treatment option does not
automatically select the same treatment plan, and neither field infers the next
visit.

Treatment Options and Treatment Plan remain separate sections. The source's
undeclared `NEXT VISIT` placeholder maps to unrestricted text. Dates generated
by the template, including Date Booked, use `YYYY-MM-DD`.

## Generated-Note Order

The note should preserve the source order, preceded by the user-requested
copy-time timestamp, Patient ID, and form-start timestamp extensions:

1. Copy-time timestamp
2. Patient ID
3. Form-start timestamp
4. Visit team
5. Consent
6. Medical history and premedication
7. Sterilization documentation
8. Radiographs and intraoral photos
9. Chief concern
10. Clinical exam
11. Appliances and relevant history
12. Patient improvement request and additional comments
13. Treatment options
14. Treatment plan
15. Next visit and date booked

Unanswered fields are omitted. Section headings with no output are also
omitted. The generated note must not contain placeholder labels such as
`undefined`, `Not assessed`, or `[UNRESOLVED PLACEHOLDER: ...]`.

When the user successfully invokes **Copy note**, the application prepends a
fresh timestamp using the browser's local date and time in 24-hour
`YYYY-MM-DD HH:mm` format. The timestamp records the copy action, not the
appointment time or Date Booked. It is generated for the clipboard payload and
is not persisted.

### Illustrative Output Shape

The following uses tokens rather than real clinical or staff information:

```text
DATE: {YYYY-MM-DD HH:mm at the moment of copying}
PATIENT ID: {entered patient ID}
FORM STARTED: {YYYY-MM-DD HH:mm when the page loaded}
DENTIST: {entered dentist}
RDA: {entered RDA}
RDH: {entered RDH}

Informed verbal consent obtained for treatment today.
Medical history reviewed: {documented status or details}
Premedication required: {documented answer}

Radiographs: {Yes/No and optional details}
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

CPAP use: {documented answer}
Occlusal splint: {documented ownership and use}
Orthodontic history: {documented answer}
Retainers: {documented answer}
Partial/complete removable dentures: {documented answer}

Patient would like to improve: {entered text}
Additional comments: {entered text}

Treatment Options:
  - {explicit selection or entered option}

Treatment Plan:
  - {explicit selection or entered plan}

Next Visit: {entered text}
Date Booked: {YYYY-MM-DD}
```

The blank lines, headings, capitalization, punctuation, and indentation shown
above are accepted. Output uses one blank line between non-empty groups and
does not leave extra blank lines when an entire group is omitted.

## Interaction and Privacy Rules

- Form values live only in React component memory.
- The browser-local **Form started** timestamp is captured once when the page
  loads and is not refreshed by loading demo data, resetting, or copying.
- Reloading or leaving the route discards the form.
- No form value is written to browser storage, URLs, analytics, telemetry,
  error reporting, an API, fixtures, or source files.
- Copying the generated note requires an explicit user action.
- A copy attempt must not write to the clipboard unless Patient ID and at least
  one of Dentist, RDA, or RDH contain non-whitespace text.
- A failed copy attempt shows visible field-level validation, explains the
  provider-group requirement, and moves focus to the first unresolved error.
- A successful copy attempt generates the current browser-local timestamp and
  includes it only in the copied note.
- A visible **Reset form** action should require confirmation when the form has
  entered values.
- Demo data, if offered, must be clearly synthetic and require an explicit
  action to load.
- Provider fields are not remembered until a later ADR 0001 implementation
  explicitly supports them as local catalogue values.
- Patient-specific, administrative, measurement, findings, treatment, and
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

- All 36 mapping IDs—34 source mappings plus the Patient ID and form-start
  timestamp extensions—are
  implemented or explicitly removed through an approved revision of this
  specification.
- The source consent duplication is resolved and produces no accidental
  duplicate output.
- Patient names are not collected.
- Patient ID is required before copying, remains in memory only, and appears in
  copied output.
- A read-only browser-local Form started timestamp is captured at page load,
  remains in memory only, and appears next to Patient ID in the form and copied
  output.
- At least one of Dentist, RDA, or RDH is required before copying.
- No clipboard write occurs when either copy prerequisite is unmet.
- Successful copy output begins with the copy-time timestamp in
  `YYYY-MM-DD HH:mm` browser-local time.
- Date Booked output uses `YYYY-MM-DD`.
- WNL and negative findings require explicit user selection.
- Right and left molar occlusion are documented independently, and each has an
  explicit, non-preselected N/A action.
- Radiographs and intraoral photos use explicit Yes/No statuses with editable
  details, and documented Yes and No answers appear in the generated note.
- The UI and generated note use **Occlusal splint**, and every documented
  negative, affirmative, or selected-status appliance/history answer appears
  in the generated note.
- The UI and generated note use **Partial/complete removable dentures**.
- Treatment options and plans are never preselected.
- Unknown editable values render and appear unchanged in generated output.
- Blank fields and empty headings are omitted cleanly.
- Non-empty output groups are separated by exactly one blank line.
- Reloading the page restores an empty form, not prior form data.
- No form-state storage or network submission is introduced.
- Generated-note tests use synthetic values.
- Browser tests cover the main workflow, reset behavior, copy prerequisites,
  copy-time timestamp, paragraph spacing, and non-persistence.
- Registry metadata identifies source `recare-exam`, source baseline
  `7d3d21c`, and lifecycle status.
- The template remains `draft` during implementation. It may advance to
  `pilot` only after the implementation meets these criteria and its generated
  output matches the accepted shape.

## Implementation Sequence

1. Add the minimal ADR 0003 registry metadata and draft exclusion behavior.
2. Write the pure initial-state and summary-builder tests.
3. Implement the Recare Exam form with in-memory state.
4. Add synthetic demo data and summary expectations.
5. Add Playwright workflow and non-persistence tests.
6. Compare generated output with the accepted example.
7. Record implementation review and advance from `draft` to `pilot`.
