# 2021 Adult Hygiene Interactive Template Mapping

- Status: Draft for clinical review
- Date: 2026-07-25
- Clinical review status: Not yet reviewed
- Source template: `adult-hygiene-2021`
- Interactive slug: `adult-hygiene-2021`
- Proposed interactive route:
  `/templates/clinic/adult-hygiene-2021/interactive`
- Source baseline commit: `7d3d21c`
- Proposed lifecycle status: `draft`
- Governing decisions:
  - [ADR 0001: Support Local Customizable Documentation Catalogues](../adr/0001-support-local-customizable-documentation-catalogues.md)
  - [ADR 0002: Separate Clinic and Interactive Template Libraries](../adr/0002-separate-clinic-and-interactive-template-libraries.md)
  - [ADR 0003: Define Interactive Template Conversion and Provenance](../adr/0003-define-interactive-template-conversion-and-provenance.md)
  - [ADR 0004: Colocate Clinical Conversions with Source Templates](../adr/0004-colocate-clinical-conversions-with-source-templates.md)

## Purpose

This draft maps every line of the approved public
[2021 Adult Hygiene source template](../../lib/clinic-templates/registry.ts)
to a proposed interactive control and generated-note behavior. It is intended
for clinical review before implementation.

The source text has been unchanged since baseline commit `7d3d21c`. The
proposed Patient ID, Note started timestamp, validation, catalogue, reset, and
navigation behavior follow the accepted Recare Exam pilot. Those behaviors are
identified as extensions because they are not present in this source template.

## Scope

The proposed conversion will:

- preserve the clinical intent, recognizable wording, and source order;
- generate a copyable 2021 Adult Hygiene note;
- keep completed and partial form data in memory only;
- reuse the existing browser-local provider catalogues;
- require deliberate documentation of findings and performed actions;
- use synthetic fixtures and test values; and
- begin as a development-only `draft`.

The proposed conversion will not:

- integrate with ClearDent or another EMR;
- claim that `[AUTO: ...]` values are automatically available;
- store completed or partial forms;
- add clinical recommendations or decision support;
- save patient-specific or encounter-specific values to a catalogue;
- infer findings, diagnoses, treatment, or intervals from empty controls; or
- make a new field catalogue-capable without a separate approved field audit.

## Classification Legend

- `appCore`: stable application vocabulary whose meaning affects controls or
  output.
- `catalogue`: an allowlisted editable field backed by explicitly saved,
  browser-local suggestions under ADR 0001.
- `narrative`: unrestricted documentation text.
- `patient-specific`: encounter-specific data that must never be saved to a
  reusable catalogue.
- `administrative`: encounter-specific operational data kept in memory only.

Unless stated otherwise, controls start blank or **Not documented**. Negative
findings, completed treatment, reviewed instructions, and other clinical facts
are never preselected.

## Proposed Screen Structure

1. Patient and Visit Context
2. Visit Team
3. Consent, Medical History, and Sterilization
4. Patient Concerns and Hygiene Findings
5. Periodontal Assessment
6. Oral Hygiene and Education
7. Treatment
8. Appliances and Relevant History
9. Intervals and Next Visit
10. Generated Note

## Field Mapping

### Patient and Visit Context

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A00 | Proposed consistency extension; not in source | Required editable text: **Patient ID** | `patient-specific` | `PATIENT ID: {text}` |
| A01 | Proposed consistency extension; not in source | Read-only browser-local **Note started** timestamp set at page load or confirmed reset | `administrative` | `NOTE STARTED: {YYYY-MM-DD HH:mm}` |
| A02 | `Last Recall Date: [AUTO: Last Recall Date]` | Optional date input: **Last recall date** | `patient-specific` | `Last Recall Date: {YYYY-MM-DD}` |

Patient names are not collected. Patient ID and all encounter state remain
only in memory. Copying is proposed to require Patient ID and at least one
Visit Team field, matching the Recare Exam pilot.

### Visit Team

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A03 | `DENTIST: [SELECT/INSERT: Dentists]` | Catalogue-backed editable text: **Dentist** | `catalogue` | `DENTIST: {text}` when entered |
| A04 | `RDH: [SELECT/INSERT: Hygienist]` | Catalogue-backed editable text: **RDH** | `catalogue` | `RDH: {text}` when entered |
| A05 | `RDA: [SELECT/INSERT: RDA]` | Catalogue-backed editable text: **RDA** | `catalogue` | `RDA: {text}` when entered |

These fields reuse the existing `visit-team.dentist`, `visit-team.rdh`, and
`visit-team.rda` catalogues. They ship with no real staff names or public
suggestions. At least one of the three is proposed as required before copying.

### Consent, Medical History, and Sterilization

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A06 | Class 5 indicator sentence and `[SELECT/INSERT: Cl5 Indicator Strip Checked]` | Unchecked checkbox: **Class 5 indicators checked** | `appCore` | Preserve the complete source sentence only when checked |
| A07 | `Miele Sterilization Codes Scanned:` | Editable text: **Miele sterilization codes** | `administrative` | `Miele Sterilization Codes Scanned: {text}` when entered |
| A08 | Informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Unchecked checkbox: **Informed verbal consent obtained for treatment today**; optional **Consent details** text | Consent state: `appCore`; details: `patient-specific` | `Informed verbal consent obtained for treatment today.` plus entered details |
| A09 | `Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]` | Status: **Not documented / Reviewed—no changes / Reviewed—updated**; details required for updated status | Status: `appCore`; details: `patient-specific` | `Medical history reviewed: no changes reported.` or `Medical history reviewed: {details}` |
| A10 | `Premedication Required: [SELECT/INSERT: PREMED]` | Status: **Not documented / Not required / Required**; optional details when required | Status: `appCore`; details: `patient-specific` | `Premedication Required: No.` or `Premedication Required: Yes—{details}.` |

The patient-name markers are omitted because there is no EMR integration and
Patient ID already supplies the proposed encounter reference. Empty
sterilization-code text does not imply that codes were not scanned.

### Patient Concerns and Hygiene Findings

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A11 | `Patient Chief Concern: [SELECT/INSERT: PATIENT CC]` | Textarea: **Patient chief concern** | `patient-specific` | `Patient Chief Concern: {text}` |
| A12 | `Hygiene Area of Concern:` | Textarea: **Hygiene area of concern** | `patient-specific` | `Hygiene Area of Concern: {text}` |
| A13 | `Plaque: [SELECT/INSERT: PLAQUE]` | Editable text: **Plaque** | `patient-specific` | `Plaque: {text}` |
| A14 | `Stain: [SELECT/INSERT: STAIN]` | Editable text: **Stain** | `patient-specific` | `Stain: {text}` |
| A15 | `Calculus: [SELECT/INSERT: CALCULUS]` | Editable text: **Calculus** | `patient-specific` | `Calculus: {text}` |
| A16 | `Bleeding: [SELECT/INSERT: BLEEDING]` | Editable text: **Bleeding** | `patient-specific` | `Bleeding: {text}` |

The four hygiene-finding fields remain unrestricted text in this draft because
the source does not expose the underlying EMR vocabulary. Importing the more
complex finding controls from another interactive template would be a clinical
workflow change and is not assumed here.

### Periodontal Assessment

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A17 | `PSR/Pocketing: _ _ _ / _ _ _` | Six optional short text inputs grouped as **PSR/Pocketing**, visually separated after the third value | `patient-specific` | `PSR/Pocketing: {1} {2} {3} / {4} {5} {6}` using entered positions |
| A18 | `Recession:` | Editable text: **Recession** | `patient-specific` | `Recession: {text}` |
| A19 | `FMP Done: [SELECT/INSERT: FMP DONE]` | Status: **Not documented / No / Yes** | `appCore` | `FMP Done: No.` or `FMP Done: Yes.` |
| A20 | `Health/Gingivitis: [SELECT/INSERT: HEALTH]` | Editable text: **Health/Gingivitis** | `patient-specific` | `Health/Gingivitis: {text}` |
| A21 | `Periodontitis Stage: [SELECT/INSERT: PERIODONTITIS: STAGING]` | Optional closed choice: **Not documented / Stage I / Stage II / Stage III / Stage IV** | `appCore` | `Periodontitis Stage: {selected stage}.` |
| A22 | `Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]` | Optional closed choice: **Not documented / Grade A / Grade B / Grade C** | `appCore` | `Periodontitis Grade: {selected grade}.` |

The six PSR/Pocketing inputs preserve the source's six-position shape without
imposing an undocumented numeric range or automatically calculating a result.
Stage and grade are independent in the source; the draft therefore does not
hide, derive, or require one based on the other.

### Oral Hygiene and Education

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A23 | `Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]` | Editable text: **Oral hygiene compliance** | `patient-specific` | `Oral hygiene compliance: {text}` |
| A24 | Fixed home-care instruction sentence | Unchecked checkbox: **Standard home-care instruction reviewed** | `appCore` | Preserve the source sentence only when checked |
| A25 | `OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]` | Textarea: **OH aids reviewed/recommended** | `patient-specific` | `OH Aids Reviewed/Recommended: {text}` |
| A26 | `REVIEWED DISEASE PROCESS WITH PATIENT TODAY` | Unchecked checkbox: **Disease process reviewed with patient today** | `appCore` | Preserve the source sentence only when checked |
| A27 | `Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]` | Two optional short text inputs: **Flossing frequency** and **Brushing frequency**, each labelled `times/day` | `patient-specific` | `Patient is currently: flossing {value}x/day; brushing {value}x/day.` using documented values |
| A28 | `Hygiene goal:` | Textarea: **Hygiene goal** | `patient-specific` | `Hygiene goal: {text}` |

The fixed home-care and disease-process statements describe actions and are
therefore never included by default. The frequency inputs remain text pending
clinical confirmation of acceptable values and formatting.

### Treatment

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A29 | `Treatment recommended:` and `1) HYGIENE MAINTENANCE` | Unchecked option: **Hygiene maintenance** plus editable **Other treatment recommended** textarea | `patient-specific` clinical decision | A `Treatment recommended:` block containing only explicitly selected or entered items |
| A30 | `Treatment completed today: [SELECT/INSERT: RDH: Treatment]` | Textarea: **Treatment completed today** | `patient-specific` | `Treatment completed today: {text}` |
| A31 | `Anesthetic: [SELECT/INSERT: HYGIENE ANESTHETIC]` | Editable text: **Anesthetic** | `patient-specific` | `Anesthetic: {text}` |
| A32 | `Desensitizer: [SELECT/INSERT: DESENSITIZER]` | Editable text: **Desensitizer** | `patient-specific` | `Desensitizer: {text}` |

Hygiene maintenance is an explicit option, not a default or recommendation.
Anesthetic and desensitizer remain unrestricted text and are not
catalogue-backed. Catalogue support for products would require a separate
review to ensure that choosing a product never infers dose, amount, safety, or
treatment.

### Appliances and Relevant History

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A33 | `Does patient have a NightGuard?` | Status: **Not documented / No / Yes**, labelled **Has a night guard** | `appCore` | `Night guard: No.` when No; combined with A34 when Yes |
| A34 | `Do they use NightGuard?` | Status: **Not documented / No / Yes**, labelled **Uses the night guard**, shown when ownership is Yes | `appCore` | `Night guard: Yes; {uses/does not use/use not documented}.` |
| A35 | `Have they had orthodontics?` | Status: **Not documented / No / Yes** | `appCore` | `Orthodontic history: No.` or `Orthodontic history: Yes.` |
| A36 | `Do they wear Retainers? Fixed or removable?` | Status: **Not documented / None / Fixed / Removable / Fixed and removable** | `appCore` | `Retainers: {selected status}.` |
| A37 | `Additional Notes:` | Textarea: **Additional notes** | `patient-specific` | `Additional Notes: {text}` |

Retainer status remains available regardless of orthodontic-history selection.
The form will not infer that a negative or undocumented history makes a
retainer response impossible.

### Intervals and Next Visit

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A38 | Fixed PPE sentence | Unchecked checkbox: **Standard PPE statement applies** | `appCore` | Preserve the source sentence only when checked |
| A39 | `Recommended Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]` | Editable text: **Recommended recall interval** | `patient-specific` | `Recommended Recall Interval: {text}` |
| A40 | `Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]` | Editable text: **Recommended hygiene interval** | `patient-specific` | `Recommended Hygiene Interval: {text}` |
| A41 | `Next visit: [SELECT/INSERT: NEXT VISIT]` | Editable text: **Next visit** | `patient-specific` | `Next visit: {text}` |
| A42 | `Date Booked:` | Optional date input: **Date booked** | `administrative` | `Date Booked: {YYYY-MM-DD}` |

Intervals and next-visit text are not catalogues in this draft. They document
patient-specific clinical or scheduling decisions and are never inferred from
other fields.

## Proposed Generated-Note Order

The note preserves source order, preceded by the proposed consistency
extensions:

1. Patient ID
2. Note started timestamp
3. Last recall date
4. Visit team
5. Sterilization
6. Consent, medical history, and premedication
7. Patient concerns and hygiene findings
8. Periodontal assessment
9. Oral hygiene and education
10. Treatment
11. Appliances, relevant history, and additional notes
12. PPE statement
13. Recommended intervals
14. Next visit and date booked

Unanswered fields and empty section headings are omitted. The generated note
must not contain `undefined`, empty placeholder markers, **Not documented**, or
unresolved `[AUTO]` and `[SELECT/INSERT]` text.

The visible preview contains the complete generated note. **Copy note** writes
that preview to the clipboard unchanged and does not add a copy-time timestamp.

## Form State, Reset, and Navigation

The conversion follows the Recare Exam behavior:

- completed and partial form state remains in memory only;
- resetting requires confirmation;
- confirmed reset clears encounter values and sets **Note started** to the
  current browser-local date and time;
- reset does not alter browser-local catalogues;
- reload, back, forward, closing, or leaving warns after the form has been
  started;
- accepting navigation discards encounter state;
- returning to the page does not restore encounter state; and
- deliberately saved provider catalogue values remain available because they
  are reusable preferences rather than form state.

The exact browser warning text is controlled by the browser where required.

## Proposed Copy Requirements

Before **Copy note** succeeds:

1. Patient ID must contain non-whitespace text; and
2. at least one of Dentist, RDH, or RDA must contain non-whitespace text.

All clinical fields remain optional unless the clinical review below approves
additional validation. The form must not treat missing clinical documentation
as a negative or normal finding.

## Clinical Review Required

Please review each area below before this draft is accepted for implementation:

1. **Consistency extensions:** Confirm Patient ID, Note started, the reset and
   navigation warnings, and the proposed copy requirements.
2. **Last recall date:** Confirm manual date entry and `YYYY-MM-DD` output are
   appropriate replacements for the unavailable EMR `[AUTO]` value.
3. **Sterilization and consent:** Confirm the proposed checkboxes and omission
   of patient names from the consent sentence.
4. **Hygiene findings:** Confirm Plaque, Stain, Calculus, and Bleeding should
   initially remain free text rather than use the more structured controls from
   another interactive form.
5. **PSR/Pocketing:** Confirm six short inputs, their order, permitted values,
   and whether partially completed sextants should be copied.
6. **FMP Done:** Confirm whether the proposed Not documented/No/Yes control
   matches the source vocabulary.
7. **Health/Gingivitis:** Confirm whether this should remain free text or use a
   closed clinical vocabulary.
8. **Periodontitis:** Confirm the Stage I–IV and Grade A–C choices and whether
   stage and grade should have any conditional relationship.
9. **Home care:** Confirm the two fixed education statements require explicit
   checkboxes and that the source wording should be preserved.
10. **Frequencies:** Confirm the desired flossing and brushing controls,
    accepted values, and generated wording.
11. **Treatment:** Confirm hygiene maintenance is an unchecked option and
    Anesthetic, Desensitizer, and treatment-completed details remain free text.
12. **Night guard and retainers:** Confirm the proposed conditional night-guard
    controls and retainer choices.
13. **PPE:** Confirm the fixed PPE statement requires explicit confirmation
    rather than appearing automatically.
14. **Intervals:** Confirm recall, hygiene, and next-visit values remain
    unrestricted text and are not reusable catalogues.
15. **Output:** Confirm capitalization, punctuation, section order, omission
    behavior, and date formatting.

## Technical Acceptance After Clinical Approval

Implementation should not advance beyond `draft` until the clinical review
areas are resolved. A later pilot implementation must include:

- machine-readable provenance for source `adult-hygiene-2021` at baseline
  `7d3d21c`;
- an explicit summary builder and synthetic fixture;
- unit coverage for output, omission, and conditional behavior;
- Playwright coverage for the primary workflow, copy prerequisites, reset,
  navigation warning, and non-restoration after reload;
- catalogue tests proving provider values are reusable but encounter state is
  not;
- accessible labels, groups, error messages, and keyboard interactions; and
- a clinical review date recorded before promotion from `draft` to `pilot`.
