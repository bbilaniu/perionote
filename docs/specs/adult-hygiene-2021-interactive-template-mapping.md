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

The mapping was also cross-checked locally against a private, ignored ClearDent
UDF extraction supplied on 2026-07-25. That extraction contains clinic staff
values and must not be committed, bundled, quoted in public fixtures, or read by
the production build. This tracked specification records only field
classifications and coverage limitations; it does not reproduce the private
roster or clinic catalogue.

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

## Private ClearDent Option Handling

The private extraction identifies 23 UDF groups used by this source template,
in addition to the three provider rosters. The implementation should treat
them according to their evidence and ownership:

| Extracted kind | Proposed use | Public-build rule |
| --- | --- | --- |
| Complete `closed_vocabulary` | Proposed structured application choices, subject to clinical review | Only reviewed, generic choices may be tracked |
| `closed_or_template_vocabulary` | Editable catalogue-backed field or structured control after review | Do not assume the visible screenshot list is complete |
| `clinic_catalog` or `template_catalog` | Browser-local catalogue imported deliberately by the user | No private values or real staff names in source, fixtures, or seeds |
| `template_phrase_catalog` | Free text or local catalogue only when complete source text is available | Never turn screenshot ellipses into documentation |
| Any incomplete, scrolling, abbreviated, or truncated list | Evidence for control design, not an authoritative seed list | Preserve free-text entry and flag incomplete coverage |

Provider rosters may be transformed locally into the existing Dentist, RDH,
and RDA catalogue groups. The transformation output must remain ignored and be
imported through the catalogue page; the application must never load the
private extraction directly.

The same approach can later support other clinic templates. Field identifiers
and generic import logic may be tracked, but extracted staff names, private
phrases, and clinic product lists may not.

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
| A06 | Class 5 indicator sentence and `[SELECT/INSERT: Cl5 Indicator Strip Checked]` | Status: **Not documented / No / Yes** | `appCore`; complete ClearDent vocabulary available | Preserve the complete source sentence followed by `No` or `Yes` |
| A07 | `Miele Sterilization Codes Scanned:` | Editable text: **Miele sterilization codes** | `administrative` | `Miele Sterilization Codes Scanned: {text}` when entered |
| A08 | Informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Status: **Not documented / Patient / Parent / Legal guardian**; optional **Consent details** text | Consent source: `appCore`; details: `patient-specific` | `Informed verbal consent given by {selected source} for treatment today.` plus entered details |
| A09 | `Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]` | Catalogue-backed editable text: **Medical history reviewed** | Current value: `patient-specific`; reusable complete phrases: `catalogue` | `Medical history reviewed: {selected or entered text}` |
| A10 | `Premedication Required: [SELECT/INSERT: PREMED]` | Status: **Not documented / Not required / Required**; optional details when required | Status: `appCore`; details: `patient-specific` | `Premedication Required: No.` or `Premedication Required: Yes—{details}.` |

The private ClearDent list contains Parent and Legal guardian. Patient is
proposed as the non-guardian choice because patient names cannot be supplied by
the application. Clinical review must confirm that interpretation. Empty
sterilization-code text does not imply that codes were not scanned. All four
visible medical-history phrases are now complete in the private extraction and
may be imported into a browser-local catalogue. They are not public seeds, and
free text remains valid.

### Patient Concerns and Hygiene Findings

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A11 | `Patient Chief Concern: [SELECT/INSERT: PATIENT CC]` | Editable text with reviewed generic quick choices: **Patient chief concern** | Entered text: `patient-specific`; quick choices: `appCore` | `Patient Chief Concern: {text}` |
| A12 | `Hygiene Area of Concern:` | Textarea: **Hygiene area of concern** | `patient-specific` | `Hygiene Area of Concern: {text}` |
| A13 | `Plaque: [SELECT/INSERT: PLAQUE]` | Structured choice with editable **Other** value: **Plaque** | Choice: `appCore`; Other: `patient-specific` | `Plaque: {selected or entered text}` |
| A14 | `Stain: [SELECT/INSERT: STAIN]` | Structured choice with editable **Other** value: **Stain** | Choice: `appCore`; Other: `patient-specific` | `Stain: {selected or entered text}` |
| A15 | `Calculus: [SELECT/INSERT: CALCULUS]` | Structured choice with editable **Other** value: **Calculus** | Choice: `appCore`; Other: `patient-specific` | `Calculus: {selected or entered text}` |
| A16 | `Bleeding: [SELECT/INSERT: BLEEDING]` | Structured choice with editable **Other** value: **Bleeding** | Choice: `appCore`; Other: `patient-specific` | `Bleeding: {selected or entered text}` |

The extraction contains complete visible lists for Stain and Bleeding. The
revised extraction also supplies nine individually complete, non-identifying
Plaque choices and nine Calculus choices. The application may track these as
reviewed generic choices rather than private clinic catalogue values:

| Plaque choices | Calculus choices |
| --- | --- |
| Localized mild interproximal | Localized mild interproximal |
| Localized moderate interproximal | Localized moderate interproximal |
| Localized heavy interproximal | Localized heavy interproximal |
| Generalized mild interproximal | Localized mild marginal |
| Generalized moderate interproximal | Localized moderate marginal |
| Generalized heavy interproximal | Localized heavy marginal |
| Localized mild marginal | Generalized mild marginal/interproximal |
| Localized moderate marginal | Generalized moderate marginal/interproximal |
| Localized heavy marginal | Generalized heavy marginal/interproximal |

The labels above expand the remaining ClearDent shorthand: `LOC` to
**Localized**, `GEN` to **Generalized**, `MOD` to **Moderate**, and `MARG` to
**Marginal**. Generated output uses these expanded labels. Each control retains
an editable **Other** value because unknown documentation must remain valid and
the Plaque screenshot scrollbar means additional values may not have been
captured. No finding is selected by default or saved automatically.

### Periodontal Assessment

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A17 | `PSR/Pocketing: _ _ _ / _ _ _` | Six optional short text inputs grouped as **PSR/Pocketing**, visually separated after the third value | `patient-specific` | `PSR/Pocketing: {1} {2} {3} / {4} {5} {6}` using entered positions |
| A18 | `Recession:` | Editable text: **Recession** | `patient-specific` | `Recession: {text}` |
| A19 | `FMP Done: [SELECT/INSERT: FMP DONE]` | Catalogue-backed editable text: **FMP done** | Current value: `patient-specific`; reusable complete phrases: `catalogue` | `FMP Done: {selected or entered text}` |
| A20 | `Health/Gingivitis: [SELECT/INSERT: HEALTH]` | Catalogue-backed editable text: **Health/Gingivitis** | Current value: `patient-specific`; reusable options: `catalogue` | `Health/Gingivitis: {text}` |
| A21 | `Periodontitis Stage: [SELECT/INSERT: PERIODONTITIS: STAGING]` | Optional closed choice: **Not documented / Stage I / Stage II / Stage III / Stage IV / N/A** | `appCore`; complete ClearDent vocabulary available | `Periodontitis Stage: {selected stage}.` |
| A22 | `Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]` | Optional closed choice: **Not documented / Grade A / Grade B / Grade C / N/A** | `appCore`; complete ClearDent vocabulary available | `Periodontitis Grade: {selected grade}.` |

The six PSR/Pocketing inputs preserve the source's six-position shape without
imposing an undocumented numeric range or automatically calculating a result.
All five visible FMP phrases are now complete and may be imported privately.
Four of the six visible Health/Gingivitis phrases are complete; the other two
remain unresolved and must be excluded from import until their full wording is
known. Stage and grade have complete ClearDent lists, including N/A. They
remain independent because the source does not define a conditional
relationship.

### Oral Hygiene and Education

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A23 | `Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]` | Structured choice with editable **Other** value: **Oral hygiene compliance** | Choice: `appCore`; Other: `patient-specific` | `Oral hygiene compliance: {selected or entered text}` |
| A24 | Fixed home-care instruction sentence | Unchecked checkbox: **Standard home-care instruction reviewed** | `appCore` | Preserve the source sentence only when checked |
| A25 | `OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]` | Catalogue-backed editable multi-value control: **OH aids reviewed/recommended** | Current selections: `patient-specific`; reusable options: `catalogue` | `OH Aids Reviewed/Recommended: {selected and entered values}` |
| A26 | `REVIEWED DISEASE PROCESS WITH PATIENT TODAY` | Unchecked checkbox: **Disease process reviewed with patient today** | `appCore` | Preserve the source sentence only when checked |
| A27 | `Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]` | Two optional structured choices with editable **Other** values: **Flossing frequency** and **Brushing frequency** | Choice: `appCore`; Other: `patient-specific` | `Patient is currently: {documented flossing}; {documented brushing}.` |
| A28 | `Hygiene goal:` | Textarea: **Hygiene goal** | `patient-specific` | `Hygiene goal: {text}` |

The fixed home-care and disease-process statements describe actions and are
therefore never included by default. Compliance, flossing, and brushing have
complete visible ClearDent lists and can be reviewed as structured application
choices. Eight of nine visible OHI-aids values are complete; one remains
unresolved, and the scrollbar means additional values may not have been
captured. Only complete private values may be deliberately imported.

### Treatment

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A29 | `Treatment recommended:` and `1) HYGIENE MAINTENANCE` | Unchecked option: **Hygiene maintenance** plus editable **Other treatment recommended** textarea | `patient-specific` clinical decision | A `Treatment recommended:` block containing only explicitly selected or entered items |
| A30 | `Treatment completed today: [SELECT/INSERT: RDH: Treatment]` | Catalogue-backed editable multi-value control: **Treatment completed today** | Current selections: `patient-specific`; reusable options: `catalogue` | `Treatment completed today: {selected and entered values}` |
| A31 | `Anesthetic: [SELECT/INSERT: HYGIENE ANESTHETIC]` | Catalogue-backed editable text: **Anesthetic** | Current value: `patient-specific`; reusable options: `catalogue` | `Anesthetic: {text}` |
| A32 | `Desensitizer: [SELECT/INSERT: DESENSITIZER]` | Catalogue-backed editable text: **Desensitizer** | Current value: `patient-specific`; reusable options: `catalogue` | `Desensitizer: {text}` |

Hygiene maintenance is an explicit option, not a default or recommendation.
All eight visible Treatment completed values and all visible Anesthetic and
Desensitizer values are now complete. They remain clinic catalogues: they may
be populated through a private local import but must not become public seeds.
Selecting an item records text only and never infers dose, amount, safety,
appropriateness, or treatment.

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
| A39 | `Recommended Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]` | Structured choice with editable **Other** value: **Recommended recall interval** | Choice: `appCore`; Other: `patient-specific` | `Recommended Recall Interval: {selected or entered text}` |
| A40 | `Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]` | Structured choice with editable **Other** value: **Recommended hygiene interval** | Choice: `appCore`; Other: `patient-specific` | `Recommended Hygiene Interval: {selected or entered text}` |
| A41 | `Next visit: [SELECT/INSERT: NEXT VISIT]` | Catalogue-backed editable text: **Next visit** | Current value: `patient-specific`; reusable options: `catalogue` | `Next visit: {text}` |
| A42 | `Date Booked:` | Optional date input: **Date booked** | `administrative` | `Date Booked: {YYYY-MM-DD}` |

Recall and hygiene intervals have complete visible ClearDent lists and can be
reviewed as structured choices while retaining **Other**. Next visit is a
clinic/template catalogue and may be populated only through deliberate private
local import. These fields document patient-specific clinical or scheduling
decisions and are never inferred from other fields.

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
3. **Sterilization, consent, and history:** Confirm the proposed Class 5
   Yes/No control, consent-source choices, omission of patient names, and use of
   the four complete medical-history phrases as a private local catalogue.
4. **Hygiene findings:** Confirm Plaque, Stain, Calculus, and Bleeding should
   use the extracted non-identifying choices plus **Other**; confirm the fully
   expanded Plaque and Calculus labels and generated wording listed above.
5. **PSR/Pocketing:** Confirm six short inputs, their order, permitted values,
   and whether partially completed sextants should be copied.
6. **FMP Done:** Confirm the five complete extracted phrases should be imported
   into an editable local catalogue.
7. **Health/Gingivitis:** Confirm an editable local catalogue is appropriate,
   importing only the four complete entries and excluding the two unresolved
   entries.
8. **Periodontitis:** Confirm the complete extracted Stage I–IV/N/A and Grade
   A–C/N/A choices, their generated wording, and whether stage and grade should
   have any conditional relationship.
9. **Home care:** Confirm the two fixed education statements require explicit
   checkboxes and that the source wording should be preserved.
10. **Compliance and frequencies:** Confirm the complete extracted compliance,
    flossing, and brushing lists can become structured choices with **Other**,
    and confirm their generated wording.
11. **Treatment:** Confirm hygiene maintenance is an unchecked option and the
    now-complete Treatment completed, Anesthetic, and Desensitizer private
    lists should be imported as editable local catalogues with no public seeds.
12. **Night guard and retainers:** Confirm the proposed conditional night-guard
    controls and retainer choices.
13. **PPE:** Confirm the fixed PPE statement requires explicit confirmation
    rather than appearing automatically.
14. **Intervals:** Confirm recall and hygiene interval use the complete
    extracted choices plus **Other**, while Next visit uses a private imported
    local catalogue.
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
- an ignored, local transformation step that validates the private extraction,
  excludes truncated options, and produces catalogue-import data without
  changing the public build;
- accessible labels, groups, error messages, and keyboard interactions; and
- a clinical review date recorded before promotion from `draft` to `pilot`.
