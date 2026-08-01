# 2021 Adult Hygiene Interactive Template Mapping

- Status: Accepted for implementation
- Date: 2026-07-25
- Clinical review status: Accepted 2026-07-25
- Consent control review: Approved 2026-07-25
- Catalogue extension review: Approved 2026-07-25
- Source template: `adult-hygiene-2021`
- Interactive slug: `adult-hygiene-2021`
- Interactive route:
  `/templates/clinic/adult-hygiene-2021/interactive`
- Source baseline commit: `7d3d21c`
- Lifecycle status: `pilot` (promoted 2026-07-26)
- Governing decisions:
  - [ADR 0001: Support Local Customizable Documentation Catalogues](../adr/0001-support-local-customizable-documentation-catalogues.md)
  - [ADR 0002: Separate Clinic and Interactive Template Libraries](../adr/0002-separate-clinic-and-interactive-template-libraries.md)
  - [ADR 0003: Define Interactive Template Conversion and Provenance](../adr/0003-define-interactive-template-conversion-and-provenance.md)
  - [ADR 0004: Colocate Clinical Conversions with Source Templates](../adr/0004-colocate-clinical-conversions-with-source-templates.md)

## Purpose

This accepted specification maps every line of the approved public
[2021 Adult Hygiene source template](../../lib/clinic-templates/registry.ts)
to an approved interactive control and generated-note behavior.

The source text has been unchanged since baseline commit `7d3d21c`. The
approved Patient ID, Note started timestamp, validation, catalogue, reset, and
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
- begin as a development-only `draft`, then become production-visible only
  after explicit promotion to `pilot`.

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

| Extracted kind                                            | Proposed use                                                                                          | Public-build rule                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Complete `closed_vocabulary`                              | Proposed structured application choices, subject to clinical review                                   | Only reviewed, generic choices may be tracked                       |
| `closed_or_template_vocabulary`                           | Editable catalogue-backed field or structured control after review                                    | Do not assume the visible screenshot list is complete               |
| `clinic_catalog` or `template_catalog`                    | Browser-local catalogue imported deliberately by the user                                             | No private values or real staff names in source, fixtures, or seeds |
| `template_phrase_catalog`                                 | Free text, reviewed public starters, or a local catalogue only when complete source text is available | Never turn screenshot ellipses into documentation                   |
| Any incomplete, scrolling, abbreviated, or truncated list | Evidence for control design, not an authoritative seed list                                           | Preserve free-text entry and flag incomplete coverage               |

Provider rosters may be transformed locally into the existing Dentist, RDH,
and RDA catalogue groups. The transformation output must remain ignored and be
imported through the catalogue page; the application must never load the
private extraction directly.

The same approach can later support other clinic templates. Field identifiers,
generic import logic, and explicitly reviewed non-identifying options may be
tracked. Extracted staff names and unreviewed private values may not.

## Catalogue Extension

The Adult Hygiene conversion extends the existing catalogue allowlist with
twelve browser-local groups. Eleven ship with the reviewed, complete starter
values listed below. Anesthetic remains unseeded pending redesign:

| Catalogue key                    | Section                    | Adult Hygiene field                       | ClearDent extraction field             | Public seeds         | Control use                                                          |
| -------------------------------- | -------------------------- | ----------------------------------------- | -------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `patient.chief-concerns`         | Records and Chief Concern  | Patient chief concern                     | Not imported                           | 5 reviewed options   | Multiple values; `Nothing` is mutually exclusive                     |
| `medical-history.review`         | Medical History            | Medical history reviewed                  | `medical-and-dental-history-status`    | 4 complete options   | Single value                                                         |
| `periodontal.fmp-done`           | Periodontal Assessment     | FMP done                                  | `full-mouth-periodontal-charting-done` | 5 complete options   | Single value                                                         |
| `periodontal.health-gingivitis`  | Periodontal Assessment     | Health/Gingivitis                         | `health`                               | 4 complete options   | Single value                                                         |
| `oral-hygiene.compliance`        | Oral Hygiene and Education | Oral hygiene compliance                   | `ohi-compliance`                       | 6 complete options   | Single value                                                         |
| `oral-hygiene.aids-reviewed`     | Oral Hygiene and Education | OH aids reviewed/recommended              | `ohi-aids-reviewed-recommended`        | 8 complete options   | Multiple values                                                      |
| `hygiene-treatment.completed`    | Treatment                  | Treatment completed today: treatment type | `hygiene-treatment`                    | 8 complete options   | Structured rows; reusable treatment type plus multi-value Tooth/area |
| `hygiene-treatment.anesthetic`   | Treatment                  | Anesthetic                                | `hygiene-anaesthetic`                  | None—rework required | Single value                                                         |
| `hygiene-treatment.desensitizer` | Treatment                  | Desensitizer                              | `desensitizer`                         | 4 complete options   | Single value                                                         |
| `scheduling.recall-interval`     | Intervals and Next Visit   | Recommended recall interval               | `recommended-recall-interval`          | 3 complete options   | Single value                                                         |
| `scheduling.hygiene-interval`    | Intervals and Next Visit   | Recommended hygiene interval              | `recommended-hygiene-interval`         | 4 complete options   | Single value                                                         |
| `scheduling.next-visit`          | Intervals and Next Visit   | Next visit                                | `next-visit`                           | 7 complete options   | Single value                                                         |

The exact public starter labels are:

- **Patient chief concern:** `Nothing`; `Sore gums upon brushing/flossing`; `Dissatisfaction with the appearance of teeth due to yellowing/stain`; `Food catches between teeth`; `Sensitivity to hot and cold`.
- **Medical history reviewed:** `YES- NO CHANGES`; `YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX`; `YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX`; `YES- UPDATED MEDS`.
- **FMP done:** `YES, ALL FINDINGS DISCUSSED WITH PATIENT`; `NO, COMPLETED WITHIN A YEAR`; `NO, IN ORTHO`; `NO, NOT APPLICABLE`; `NO, RAN OUT OF TIME - WILL EVALUATE AT NEXT VISIT`.
- **Health/Gingivitis:** `HEALTH INTACT PERIODONTAL SUPPORT`; `GINGIVITIS INTACT PERIODONTAL SUPPORT`; `HEALTH- REDUCED PERIODONTAL SUPPORT`; `GINGIVITIS- REDUCED PERIODONTAL SUPPORT`.
- **Oral hygiene compliance:** `Poor`; `Fair`; `Good`; `Excellent`; `Poor–fair`; `Fair–good`.
- **OH aids reviewed/recommended:** `SULCABRUSH`; `SUPERFLOSS`; `FLOSS THREADERS`; `C-SHAPE FLOSSING`; `PROPER TOOTHBRUSHING TECHNIQUE`; `INTERPROXIMAL BRUSH`; `SOFT PICKS`; `PROPER USE OF ELECTRIC TOOTHBRUSH`.
- **Treatment completed today:** `1U scale (cavitron and hand scaling)`; `2U scale (cavitron and hand scaling)`; `3U scale (cavitron and hand scaling)`; `4U scale (cavitron and hand scaling)`; `FMP`; `1U polish`; `Fluoride varnish`; `Crystal X-PUR`.
- **Desensitizer:** `NONE`; `PREVIDENT FL`; `VOCO FL`; `crystal x-pur`.
- **Recommended recall interval:** `12-month recall`; `6-month recall`; `9-month recall`.
- **Recommended hygiene interval:** `3-month scale`; `4-month scale`; `6-month scale`; `N/A`.
- **Next visit:** `6 MONTH SCALE`; `12 MONTH RECALL`; `3 MONTH SCALE`; `4 MONTH SCALE`; `6 MONTH RECALL`; `9 MONTH RECALL`; `FOLLOW-UP HYGIENE`.

These starter values are suggestions only and are never preselected. The two
truncated Health/Gingivitis entries and one truncated OHI-aids entry remain
excluded. The Anesthetic list must be redesigned before it can receive public
starter values. The shared Medical history reviewed catalogue and the Adult
Hygiene-only catalogue groups are lifecycle `pilot`, matching the
production-visible Adult Hygiene and Recare Exam pilots.

Every blank catalogue-backed suggestion list offers a separate eye-slash
action that hides a suggestion without selecting it or changing encounter
values. Hidden suggestions remain recoverable through **Manage Catalogues**.

The existing provider keys remain shared:

| Catalogue key        | ClearDent extraction field |
| -------------------- | -------------------------- |
| `visit-team.dentist` | `dentists`                 |
| `visit-team.rdh`     | `hygienist`                |
| `visit-team.rda`     | `rda`                      |

The new keys expand the `CatalogueKey` allowlist and catalogue-management
sections. They do not change the stored item shape, so
`StoredCatalogueStateV1`, the local-storage key, and catalogue export format
remain version 1. Older application builds may reject exports containing the
new keys; rejection is safe and must not alter their existing local data.

### Single-value catalogue fields

Single-value fields reuse the accessible editable `CatalogueCombobox`
interaction:

- selecting a suggestion snapshots its label into the active form;
- unlisted free text remains valid;
- typing never saves automatically;
- **Remember this value** is an explicit browser-local action; and
- editing, hiding, or deleting a catalogue entry never changes the current
  form value or previously copied notes.

### Ordered catalogue fields

Patient chief concerns and OH aids use a reusable
`CatalogueMultiCombobox` interaction rather than placing several catalogue
labels into one opaque string:

- the form stores an ordered in-memory array of snapshotted text values;
- selecting a suggestion appends it unless an equivalent value is already
  selected;
- an editable **Other** entry may be added without saving it;
- remembering an Other value requires a separate explicit action;
- each selected value can be removed or reordered without changing the
  catalogue;
- comparisons use the catalogue's normalized, case-insensitive equivalence;
- reset and navigation discard the selected array with the rest of the form;
  and
- generated output joins selected values with `; ` in their displayed order.

For Patient chief concern, `Nothing` is mutually exclusive. Selecting it
removes every other concern, and selecting or adding another concern removes
`Nothing`. Custom concerns remain encounter-only unless the user deliberately
chooses **Remember and add**. An unchecked
**List each concern on a separate line in the note** checkbox keeps the default
semicolon-separated inline output. Checking it renders the same selected
values as an indented bullet list under the Patient Chief Concern heading.

Treatment completed today uses ordered structured rows. Each row contains a
catalogue-backed editable treatment type and optional multi-value Tooth/area.
Treatment types retain the explicit remember behavior above. Tooth/area offers
`maxilla`, `mandible`, `full mouth`, `Q1`, `Q2`, `Q3`, `Q4`, `S1`, `S2`, `S3`,
`S4`, `S5`, or `S6` as fixed choices and permits custom text for the current
note. Custom Tooth/area text cannot be remembered or added to a catalogue.
Fixed choices are emitted in the order listed here, followed by custom values
in entry order; normalized duplicates are rejected. Rows and their selected
values can be added, removed, and reordered independently. Tooth/area uses a
compact multi-combobox: its anchored menu filters the fixed choices, remains
open while fixed or custom values are selected, and offers non-matching text
as an encounter-only custom value. **Done**, Escape, the trigger, or an
intentional outside click closes the menu. The closed Tooth/area control shows
all selected values in full. The reusable control supports optional removable
selection chips, which are disabled here to keep treatment rows compact.
Encounter-only custom selections remain visible and deselectable inside the
open menu. Fixed and custom selections use the same right-aligned sky checkmark
and blue hover/focus treatment as the application's single-choice menus.
The fixed choices use a clinician-facing anatomical layout: arch and full-mouth
choices first, quadrants in two columns as `Q1 Q2 / Q4 Q3`, and sextants in
three columns as `S1 S2 S3 / S6 S5 S4`. Each grid cell reserves space for its
selection checkmark. This visual order does not change the canonical generated
note order.

The catalogue-management page manages the underlying reusable suggestions, not
the current encounter's selected values.

### Private ClearDent transformation

Implementation will include a local-only transformation command that accepts
an explicitly supplied ignored input and writes an ignored catalogue import
file. The production application and static build never read the extraction.

The transformation must:

1. validate the extraction envelope and every mapped field;
2. use only the allowlisted crosswalk above;
3. import only options whose `truncated_in_screenshot` value is `false`;
4. preserve the reviewed normalized label and source ordering;
5. exclude empty labels and normalized duplicates;
6. generate opaque stable item identifiers without embedding labels or staff
   names;
7. create active, non-favorite user-owned catalogue items;
8. include no patient, form, note, theme, or unrelated UDF data;
9. validate its output using the same catalogue-import validator used by the
   application;
10. print counts and field identifiers only, never private labels; and
11. refuse to overwrite an existing output file unless explicitly requested.

For the current extraction, the transform excludes the two unresolved
Health/Gingivitis entries and one unresolved OHI-aids entry. The three
unresolved TMJ entries are outside this template and its allowlist.

## Approved Structured Choice Vocabularies

The following reviewed, generic, non-identifying choices may be tracked in the
public application. They are form choices, not clinical recommendations, and
none is selected by default.

| Field                                 | Approved choices                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Patient chief concern catalogue seeds | Nothing; Sore gums upon brushing/flossing; Dissatisfaction with the appearance of teeth due to yellowing/stain; Food catches between teeth; Sensitivity to hot and cold                                                                                                             |
| Stain                                 | None; Localized slight; Localized moderate; Localized heavy; Generalized slight; Generalized moderate; Generalized heavy                                                                                                                                                            |
| Bleeding                              | Localized mild; Localized moderate; Localized severe; Generalized mild; Generalized moderate; Generalized severe                                                                                                                                                                    |
| Periodontitis stage                   | Stage I (P1); Stage II (P2); Stage III (P3); Stage IV (P4); N/A                                                                                                                                                                                                                     |
| Periodontitis grade                   | Grade A: slow rate; Grade B: moderate rate; Grade C: rapid rate; N/A                                                                                                                                                                                                                |
| Oral hygiene compliance               | Poor; Fair; Good; Excellent; Poor–fair; Fair–good                                                                                                                                                                                                                                   |
| Additional OHE topics reviewed        | Bass brushing; C-shape flossing technique; Sulcabrush and interdental brush technique; Caries theory; Caries risk factors; Periodontitis theory; Periodontitis risk factors; Review benefits of Prevident or Opti-Rinse; Importance of maintaining the recommended hygiene interval |
| Flossing frequency                    | Flossing 1x/day; Flossing 2x/day; Flossing 3x/day; Never flossing; Flossing 1–2x/week; Flossing 3x/week; Seldom flossing                                                                                                                                                            |
| Brushing frequency                    | Brushing 1x/day; Brushing 2x/day; Brushing 3x/day; Never brushing                                                                                                                                                                                                                   |
| Recommended recall interval           | 12-month recall; 6-month recall; 9-month recall                                                                                                                                                                                                                                     |
| Recommended hygiene interval          | 3-month scale; 4-month scale; 6-month scale; N/A                                                                                                                                                                                                                                    |

Fields that retain an explicit **Other** control accept free text so imported,
historical, and currently undocumented values remain valid. Flossing and
brushing frequency instead accept custom text directly in their editable
suggestion boxes. The Plaque and Calculus choices are recorded separately in
their field section because their two lists are most easily reviewed side by
side.

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

## Approved Screen Structure

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

| ID  | Source                                        | Proposed control                                                                       | Classification     | Generated output                            |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- |
| A00 | Proposed consistency extension; not in source | Required editable text: **Patient ID**                                                 | `patient-specific` | `PATIENT ID: {text}`                        |
| A01 | Proposed consistency extension; not in source | Read-only browser-local **Note started** timestamp set at page load or confirmed reset | `administrative`   | `----- {Month D, YYYY h:mm:ss AM/PM} -----` |
| A02 | `Last Recall Date: [AUTO: Last Recall Date]`  | Optional date input: **Last recall date**                                              | `patient-specific` | `Last Recall Date: {YYYY-MM-DD}`            |

The Note started form field displays `YYYY-MM-DD HH:mm`; its generated-note
output uses the readable dashed header shown in the table.

Patient names are not collected. Patient ID and all encounter state remain
only in memory. Copying is proposed to require Patient ID and at least one
Visit Team field, matching the Recare Exam pilot.

### Visit Team

| ID  | Source                               | Proposed control                            | Classification | Generated output  |
| --- | ------------------------------------ | ------------------------------------------- | -------------- | ----------------- |
| A03 | `DENTIST: [SELECT/INSERT: Dentists]` | Catalogue-backed editable text: **Dentist** | `catalogue`    | `DENTIST: {text}` |
| A04 | `RDH: [SELECT/INSERT: Hygienist]`    | Catalogue-backed editable text: **RDH**     | `catalogue`    | `RDH: {text}`     |
| A05 | `RDA: [SELECT/INSERT: RDA]`          | Catalogue-backed editable text: **RDA**     | `catalogue`    | `RDA: {text}`     |

These fields reuse the existing `visit-team.dentist`, `visit-team.rdh`, and
`visit-team.rda` catalogues. They ship with no real staff names or public
suggestions. At least one of the three is proposed as required before copying.

### Consent, Medical History, and Sterilization

| ID  | Source                                                                                               | Proposed control                                                                                                           | Classification                                                            | Generated output                                                                                |
| --- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A06 | Class 5 indicator sentence and `[SELECT/INSERT: Cl5 Indicator Strip Checked]`                        | Unchecked checkbox: **Class 5 indicators checked**, positioned next to Miele sterilization codes                           | `appCore`                                                                 | Preserve the complete source sentence followed by `Yes` only when explicitly checked            |
| A07 | `Miele Sterilization Codes Scanned:`                                                                 | Editable text: **Miele sterilization codes**                                                                               | `administrative`                                                          | `Miele Sterilization Codes Scanned: {text}` when entered                                        |
| A08 | Informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Three independent unchecked checkboxes: **Patient**, **Parent**, and **Legal guardian**; optional **Consent details** text | Consent sources: `appCore`; details: `patient-specific`                   | `Informed verbal consent given by {selected sources} for treatment today.` plus entered details |
| A09 | `Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]`                                          | Catalogue-backed editable text: **Medical history reviewed**                                                               | Current value: `patient-specific`; reusable complete phrases: `catalogue` | `Medical history reviewed: {selected or entered text}`                                          |
| A10 | `Premedication Required: [SELECT/INSERT: PREMED]`                                                    | Status: **Not documented / Not required / Required**; optional details when required                                       | Status: `appCore`; details: `patient-specific`                            | `Premedication Required: No.` or `Premedication Required: Yes—{details}.`                       |

Patient, Parent, and Legal guardian are independent because more than one may
give consent. None is preselected. When several are checked, generated output
joins them in that order with commas and `and`, for example
`PATIENT, PARENT and LEGAL GUARDIAN`. Patient names remain omitted because the
application cannot supply them. Empty sterilization-code text does not imply
that codes were not scanned. All four visible medical-history phrases are now
complete in the private extraction and are approved as public starter values.
They are suggestions only, no value is preselected, and free text remains
valid.

### Patient Concerns and Hygiene Findings

| ID  | Source                                               | Proposed control                                                                                                                                                           | Classification                                                                             | Generated output                                                                                       |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| A11 | `Patient Chief Concern: [SELECT/INSERT: PATIENT CC]` | Ordered catalogue-backed multi-value **Patient chief concern** with encounter-only custom entries; `Nothing` is mutually exclusive; optional per-note list-format checkbox | Current values: `patient-specific`; reusable values: `catalogue`; format: `administrative` | Inline `Patient Chief Concern: {values joined with "; "}` by default, or heading plus indented bullets |
| A12 | `Hygiene Area of Concern:`                           | Textarea: **Hygiene area of concern**                                                                                                                                      | `patient-specific`                                                                         | `Hygiene Area of Concern: {text}`                                                                      |
| A13 | `Plaque: [SELECT/INSERT: PLAQUE]`                    | Grouped **Extent** and **Intensity** facets plus multi-value **Location**, with independent **Plaque comment**                                                             | Facets: `appCore`; comment: `patient-specific`                                             | `Plaque: {extent intensity location(s)}; {comment}.`; comment-only state uses `Plaque comment:`        |
| A14 | `Stain: [SELECT/INSERT: STAIN]`                      | **None**, or grouped **Extent** and **Intensity** facets, with independent **Stain comment**                                                                               | Facets: `appCore`; comment: `patient-specific`                                             | `Stain: {extent intensity}; {comment}.`; comment-only state uses `Stain comment:`                      |
| A15 | `Calculus: [SELECT/INSERT: CALCULUS]`                | Grouped **Extent**, **Intensity**, and multi-value **Location** facets, with independent **Calculus comment**                                                              | Facets: `appCore`; comment: `patient-specific`                                             | `Calculus: {extent intensity location(s)}; {comment}.`; comment-only state uses `Calculus comment:`    |
| A16 | `Bleeding: [SELECT/INSERT: BLEEDING]`                | Grouped **Extent** and **Severity** facets, with independent **Bleeding comment**                                                                                          | Facets: `appCore`; comment: `patient-specific`                                             | `Bleeding: {extent severity}; {comment}.`; comment-only state uses `Bleeding comment:`                 |

The extraction contains complete visible lists for Stain and Bleeding. The
revised extraction also supplies nine individually complete, non-identifying
Plaque choices and nine Calculus choices. The application may track these as
reviewed generic choices rather than private clinic catalogue values:

| Plaque choices                     | Calculus choices                            |
| ---------------------------------- | ------------------------------------------- |
| Localized mild interproximal       | Localized mild interproximal                |
| Localized moderate interproximal   | Localized moderate interproximal            |
| Localized heavy interproximal      | Localized heavy interproximal               |
| Generalized mild interproximal     | Localized mild marginal                     |
| Generalized moderate interproximal | Localized moderate marginal                 |
| Generalized heavy interproximal    | Localized heavy marginal                    |
| Localized mild marginal            | Generalized mild marginal/interproximal     |
| Localized moderate marginal        | Generalized moderate marginal/interproximal |
| Localized heavy marginal           | Generalized heavy marginal/interproximal    |

The labels above expand the remaining ClearDent shorthand: `LOC` to
**Localized**, `GEN` to **Generalized**, `MOD` to **Moderate**, and `MARG` to
**Marginal**. Generated output uses these expanded labels. Each control has an
independent encounter-specific comment that neither clears nor replaces its
structured finding. When both are present, the comment is appended to the
finding's output line. A comment may also be documented without a structured
finding. No finding is selected by default or saved automatically.

The interactive controls reuse the grouped fixed-choice menu. Extent,
intensity, and severity sections permit one selection each. Plaque and
Calculus location permit both **marginal** and **interproximal**, emitted as
`marginal/interproximal`. This initial
implementation intentionally permits every cross-section combination instead
of encoding clinical compatibility rules. Selecting **None** for Stain clears
its other facets, and selecting another Stain facet clears **None**. Existing
complete strings are parsed into the same facets when demo or imported values
are loaded.

### Periodontal Assessment

| ID   | Source                                                                                                                                                                                                                                                                      | Proposed control                                                                                                                                                                                       | Classification                                                                                                                                 | Generated output                                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A17  | `PSR/Pocketing: _ _ _ / _ _ _`                                                                                                                                                                                                                                              | Six optional short text inputs grouped as **PSR/Pocketing**, labelled clockwise as **Sextant 1**, **2**, **3**, **6**, **5**, **4**                                                                    | `patient-specific`                                                                                                                             | `PSR/Pocketing: {1} {2} {3} / {6} {5} {4}` using entered sextants                                                                                                                  |
| A18  | `Recession:`                                                                                                                                                                                                                                                                | Editable text: **Recession**                                                                                                                                                                           | `patient-specific`                                                                                                                             | `Recession: {text}`                                                                                                                                                                |
| A19  | `FMP Done: [SELECT/INSERT: FMP DONE]`                                                                                                                                                                                                                                       | Catalogue-backed editable text: **FMP done**                                                                                                                                                           | Current value: `patient-specific`; reusable complete phrases: `catalogue`                                                                      | `FMP Done: {selected or entered text}`                                                                                                                                             |
| A20  | `Health/Gingivitis: [SELECT/INSERT: HEALTH]` and the [reviewed periodontal redesign](../requests/ClearDent%20Custom%20Fields%20and%20Periodontal%20Redesign.md)                                                                                                             | Diagnosis-independent **Periodontal assessment findings** using periodontium, exact BOP and maximum PPD, attachment loss, RBL, and treated-periodontitis stability findings; classification remains conditional | Stable context IDs, semantic measurements, and assessment states: `appCore`; entered evidence, confirmation, and overrides: `patient-specific` | A confirmed classification preserves the familiar `Health/Gingivitis:` heading and uppercase ClearDent block while charting actual entered measurements and declared findings       |
| A20a | Additive [Gingival Description Slice 1](../requests/2026-07-28_gingival-description-and-ioe/slice-1-adult-hygiene-gingival-description.md), using the reviewed fixed [catalogue](../requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.catalog.json) | Explicit **Gingival Description** status followed by a progressive structured multi-finding fieldset, before the diagnosis category and Health/Gingivitis classification                               | Stable option IDs: `appCore`; extent, location, measurement, and notes: encounter-only `patient-specific`; status defaults to `not_assessed`   | Omitted when absent or Not assessed; one WNL line or one compact per-dimension findings block                                                                                      |
| A21  | [Reviewed periodontal redesign](../requests/ClearDent%20Custom%20Fields%20and%20Periodontal%20Redesign.md)                                                                                                                                                                  | Diagnosis category and separate extent/distribution choices                                                                                                                                            | Choices: `appCore`; encounter selection: `patient-specific`                                                                                    | `Periodontal diagnosis: {extent} periodontitis...` when documented                                                                                                                 |
| A22  | Stage severity and complexity criteria                                                                                                                                                                                                                                      | Exact typed measurements; synchronized Maximum PPD and deeper-pocket BOP controls shared with Periodontal assessment findings; mutually exclusive bone-loss pattern, furcation, and ridge-defect selectors; and a multi-select for advanced functional complexity findings | Stable criterion IDs and units: `appCore`; entered evidence: `patient-specific`                                                                | Confirmed evidence is generated from the checked-in criterion catalogue                                                                                                            |
| A23  | Grade progression criteria and modifiers                                                                                                                                                                                                                                    | Direct, indirect, and phenotype evidence plus smoking and diabetes controls                                                                                                                            | Stable criterion IDs, semantic operators, and units: `appCore`; entered evidence: `patient-specific`                                           | Confirmed grade basis and entered modifiers are generated from structured state                                                                                                    |
| A24  | Stage and grade                                                                                                                                                                                                                                                             | Candidate display followed by independent clinician selections and confirmation checkboxes; override reason appears when the selection differs                                                         | Candidate: derived; selection, confirmation, and override reason: `patient-specific`                                                           | Only confirmed stage/grade and basis are charted; an entered override reason is included                                                                                           |
| A25  | Current periodontal status                                                                                                                                                                                                                                                  | 2018-aligned fixed choice filtered for compatibility with a confirmed treated-periodontitis context                                                                                                   | Choice: `appCore`; encounter selection: `patient-specific`                                                                                     | `Periodontal status: {selected status}.`; incompatible legacy combinations are omitted                                                                                            |

The six PSR/Pocketing inputs preserve the source's six-position shape and use
the clinically approved clockwise order `1 2 3 / 6 5 4`, without imposing an
undocumented numeric range or automatically calculating a result.
All five visible FMP phrases are now complete and are public starter values.
The legacy editable `periodontal.health-gingivitis` catalogue is no longer an
encounter control and cannot contribute free text to generated notes. Its
storage key remains readable for backward-compatible catalogue imports and
existing browser-local data. The six reviewed replacement contexts are fixed
application vocabulary and are generated only from confirmed structured state.

Periodontal evidence uses the checked-in catalogue and candidate rules in
`lib/templates/periodontalClassification.ts`, documented by the
[candidate-classification decision table](periodontal-classification-decision-table.md).
Periodontal assessment findings, extent/distribution, stage evidence, grade evidence,
and grade modifiers remain available while the diagnosis category is Not
assessed. Entering those findings does not select or imply a diagnosis and does
not add periodontal classification text to the note. Diagnosis-specific
candidates, clinician confirmation, and generated output remain gated by the
selected diagnosis category.
The periodontal assessment, stage, grade, and modifier controls are grouped in a
**Structured periodontal observations** disclosure before the diagnosis category.
It is collapsed as **Not assessed** for a blank encounter, reports the number of
documented observations when populated, and automatically expands when existing
or demo observations load. PSR/Pocketing, Recession, and FMP Done remain visible in
their familiar positions outside this disclosure. Candidate interpretation and
clinician confirmation also remain outside it so they stay available when the
supporting findings are collapsed.
Patient-specific Stage and Grade evidence are separate nested disclosures with
their own documented-observation summaries. Both remain available before a
diagnosis is selected and never infer Periodontitis. Selecting **Periodontitis /
history of periodontitis** opens Structured periodontal observations and Stage
evidence; Grade remains collapsed unless the clinician opens it or grade
evidence/modifiers are already documented. Candidate interpretation,
confirmation, and generated Stage/Grade output remain conditional on that
diagnosis/history category. A successfully treated patient stays in this category
when current findings meet periodontal health thresholds; health is represented
by the confirmed treated-periodontitis context and periodontal disease stability
rather than by relabelling the patient with the simple Periodontal health
diagnosis category.
Complexity findings use a bone-loss pattern selector with a conditional vertical
bone-loss measurement, a highest-furcation selector, a worst-ridge-defect
selector, and an advanced functional complexity multi-select. These controls
continue to store the original criterion IDs, so classification and generated
note wording remain compatible with previously saved evidence.
Changing a selected stage or grade clears its previous confirmation. Candidate
classification never writes to the note by itself.

#### Additive Gingival Description contract

The Slice 1 extension does not rename, move, synchronize, or replace Bleeding,
Recession, or FMP Done. Structured gingival observations now precede the
periodontal diagnosis category. The retired
`periodontal.health-gingivitis` browser-local catalogue remains unchanged for
backward-compatible data handling, but is not rendered in the encounter form.
An absent Gingival Description property is treated exactly like Not assessed.

The primary **Gingival Description** status control is aligned with the other
Periodontal Assessment fields immediately before periodontal classification. It exposes
the single shared Not assessed / WNL / Findings state. A separate
**Structured gingival observations** fieldset owns the explanatory text,
normal-observation shortcut, clear action, and detailed observations. Findings
also reveals an optional patient-specific **Gingival Description findings**
field beside the primary status for custom observations not represented by the
fixed catalogue. The fieldset uses the same disclosure treatment as Structured
periodontal observations: it starts collapsed as **Not assessed** for a blank
encounter, shows the number of documented structured observations (including
custom text as one observation), and automatically expands for Findings.
Selecting WNL while the disclosure is collapsed leaves it collapsed while the
header reports the ten documented normal observations.

Expanding the disclosure always shows the detailed controls, independently of
the shared status. They render Color, Contour / Shape, Consistency, Surface /
Texture, and Position / Size in reviewed catalogue order. Each dimension uses a
grouped multi-select menu. Clinically exclusive subgroups replace their prior
selection, while compatible findings remain additive; selecting No recession
also removes recession and root exposure, and selecting either abnormal finding
removes No recession. Each selected option is an independent finding with
optional generalized/localized extent, supported location, optional encounter
note, and a measurement only where catalogue metadata permits it. Gingival
recession is the only current option with an `mm` measurement. Selecting or
editing an observation sets Findings; removing the last observation does not
silently change the explicit status.

Supported gingival locations use the same shared multi-combobox interaction as
Treatment completed today's Tooth/area field, with a gingival-specific preset.
Fixed choices include maxilla, mandible, quadrants, sextants, facial/buccal,
lingual/palatal, interproximal, marginal, and attached gingiva; encounter-only
custom locations support tooth numbers and other specific regions. Full mouth
is omitted because Generalized extent already expresses that scope. Existing
location arrays and custom strings remain compatible.

Not assessed retains structured values and suppresses them from the note; they
remain available whenever the disclosure is open. Selecting Findings again
restores their output. The explicit **Clear gingival description** action
permanently clears the structured and custom values and returns to Not assessed
only after confirmation when values exist. Unknown or retired IDs are ignored
rather than converted to invented prose.

**WNL:** Choosing WNL from the shared status control stores the ten reviewed
preset IDs. If retained findings exist, confirmation is required before only
the new assessment is replaced. WNL hides detailed controls and emits exactly:

```text
Gingival Description: Gingiva coral pink, firm and resilient, with knife-edged margins, papillae filling the embrasures, appropriate stippling of attached gingiva, and no recession or overgrowth noted.
```

**Apply normal structured observations** establishes that same reviewed WNL
preset and reveals its ten detailed selections for inspection. While they
remain untouched, the status and generated note remain WNL and use the
canonical sentence above. Editing any option or annotation changes the status
to Findings and switches to compact structured output. Existing non-WNL
structured or custom observations require confirmation before replacement.

**Mixed synthetic findings:** a generalized color observation and localized
measured recession emit:

```text
Gingival Description:
  - Color: coral pink (extent: generalized).
  - Position / Size: gingival recession (extent: localized; location: facial 31–33; measurement: 2 mm; notes: synthetic finding).
```

Existing explicit periodontal documentation intentionally coexists with this
block. No independent IOE Gingiva state or output is created. Selecting or
editing a finding after WNL changes the assessment to Findings. Findings are
grouped into one compact bullet per catalogue dimension, with selected options
in catalogue order and option-specific annotations in parentheses. Custom text
alone emits `Gingival Description: {custom findings}.`; beside structured
findings it emits an indented `Observations: {custom findings}.` line. The
state is active-page memory only and introduces no completed-form storage or
JSON import/export.

### Oral Hygiene and Education

| ID   | Source                                                                                  | Proposed control                                                                                                                                     | Classification                                                                         | Generated output                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A23  | `Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]`                              | Catalogue-backed editable text: **Oral hygiene compliance**, plus independent **Oral hygiene compliance comment**                                    | Current value and comment: `patient-specific`; reusable compliance values: `catalogue` | Separate `Oral hygiene compliance: {selected or entered text}` and `Oral hygiene compliance comment: {comment}` lines when documented |
| A24  | Fixed home-care instruction sentence                                                    | Unchecked checkbox: **Standard home-care instruction reviewed**                                                                                      | `appCore`                                                                              | Preserve the source sentence only when checked                                                                                        |
| A25  | `OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]`          | Catalogue-backed editable multi-value control: **OH aids reviewed/recommended**                                                                      | Current selections: `patient-specific`; reusable options: `catalogue`                  | `OH Aids Reviewed/Recommended: {selected and entered values}`                                                                         |
| A26  | `REVIEWED DISEASE PROCESS WITH PATIENT TODAY`                                           | Unchecked checkbox: **Disease process reviewed with patient today**                                                                                  | `appCore`                                                                              | Preserve the source sentence only when checked                                                                                        |
| A26a | Additive OHE extension                                                                  | Grouped fixed multi-value control: **Additional OHE topics reviewed**                                                                                | `appCore`; no value selected by default                                                | `OHE: {selected topics}` only when at least one topic is selected; paired theory and risk-factor topics are condensed                 |
| A26b | Additive OHE extension                                                                  | Optional textarea: **OHE notes**                                                                                                                     | `patient-specific`                                                                     | `OHE notes: {entered text}` only when entered                                                                                         |
| A27  | `Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]` | Two editable suggestion boxes: **Flossing frequency** and **Brushing frequency**; each accepts a standard suggestion or directly entered custom text | Suggestions: `appCore`; current entered values: `patient-specific`                     | `Patient is currently: {documented flossing}; {documented brushing}.`                                                                 |
| A28  | `Hygiene goal:`                                                                         | Textarea: **Hygiene goal**                                                                                                                           | `patient-specific`                                                                     | `Hygiene goal: {text}`                                                                                                                |

The fixed home-care and disease-process statements describe actions and are
therefore never included by default. Compliance has a complete visible
ClearDent list whose values are public catalogue starters. Its comment remains
independent and patient-specific. Flossing and brushing retain their reviewed
application suggestions while allowing custom wording directly in the same
field; there is no separate Other field and typed values are not saved.
In the form, these two frequency fields appear immediately beneath the Oral
hygiene compliance and comment row. Their generated-note position remains in
the accepted source order.
Eight of nine visible OHI-aids values are complete; one remains
unresolved, and the scrollbar means additional values may not have been
captured. The eight complete captured values are approved public starter
values; the unresolved value remains excluded.

The additive OHE topic and notes controls do not move, rename, or replace any
accepted 2021 fields or output lines. Both start empty. Existing notes
therefore remain unchanged unless a user explicitly documents an additional
topic or OHE note. The topic menu is visually grouped into home-care
techniques, disease and risk, and prevention and maintenance. It uses fixed
reviewed choices; non-standard discussion belongs in OHE notes.

### Treatment

| ID  | Source                                                       | Proposed control                                                                                                                                              | Classification                                                                                                        | Generated output                                                                                              |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A29 | `Treatment recommended:` and `1) HYGIENE MAINTENANCE`        | Unchecked option: **Hygiene maintenance** plus editable **Other treatment recommended** textarea                                                              | `patient-specific` clinical decision                                                                                  | A `Treatment recommended:` block containing only explicitly selected or entered items                         |
| A30 | `Treatment completed today: [SELECT/INSERT: RDH: Treatment]` | Ordered structured rows containing catalogue-backed editable **Treatment type** and optional multi-value **Tooth/area**, including encounter-only custom text | Row and Tooth/area: `patient-specific`; reusable treatment types: `catalogue`; fixed Tooth/area vocabulary: `appCore` | `Treatment completed today: {treatment type}{ — optional comma-separated Tooth/area values}` joined with `; ` |
| A31 | `Anesthetic: [SELECT/INSERT: HYGIENE ANESTHETIC]`            | Catalogue-backed editable text: **Anesthetic**                                                                                                                | Current value: `patient-specific`; reusable options: `catalogue`                                                      | `Anesthetic: {text}`                                                                                          |
| A32 | `Desensitizer: [SELECT/INSERT: DESENSITIZER]`                | Catalogue-backed editable text: **Desensitizer**                                                                                                              | Current value: `patient-specific`; reusable options: `catalogue`                                                      | `Desensitizer: {text}`                                                                                        |

Hygiene maintenance is an explicit option, not a default or recommendation.
All eight visible Treatment completed values and all four Desensitizer values
are approved public starter values. Anesthetic remains unseeded and must be
reworked before its options are reconsidered. Selecting an item records text
only and never infers dose, amount, safety, appropriateness, or treatment.
Tooth/area starts with no selection for every row. Any number of the 13
approved fixed choices may be selected simultaneously, and custom text may be
added to the current encounter. Tooth/area is not a catalogue: custom values
are discarded on reset or reload and cannot become reusable suggestions.

### Appliances and Relevant History

| ID  | Source                                        | Proposed control                                                                                      | Classification     | Generated output                                            |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| A33 | `Does patient have a NightGuard?`             | Status: **Not documented / No / Yes**, labelled **Has a night guard**                                 | `appCore`          | `Night guard: No.` when No; combined with A34 when Yes      |
| A34 | `Do they use NightGuard?`                     | Status: **Not documented / No / Yes**, labelled **Uses the night guard**, shown when ownership is Yes | `appCore`          | `Night guard: Yes; {uses/does not use/use not documented}.` |
| A35 | `Have they had orthodontics?`                 | Status: **Not documented / No / Yes**                                                                 | `appCore`          | `Orthodontic history: No.` or `Orthodontic history: Yes.`   |
| A36 | `Do they wear Retainers? Fixed or removable?` | Status: **Not documented / None / Fixed / Removable / Fixed and removable**                           | `appCore`          | `Retainers: {selected status}.`                             |
| A37 | `Additional Notes:`                           | Textarea: **Additional notes**                                                                        | `patient-specific` | `Additional Notes: {text}`                                  |

Retainer status remains available regardless of orthodontic-history selection.
The form will not infer that a negative or undocumented history makes a
retainer response impossible.

### Intervals and Next Visit

| ID  | Source                                                                | Proposed control                                                                                                             | Classification                                                                        | Generated output                                                                                                                                  |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A38 | Fixed PPE sentence                                                    | Unchecked checkbox: **Standard PPE statement applies**                                                                       | `appCore`                                                                             | Preserve the source sentence only when checked                                                                                                    |
| A39 | `Recommended Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]`   | Catalogue-backed editable text: **Recommended recall interval**, plus independent **Recommended recall interval comments**   | Current value and comments: `patient-specific`; reusable interval values: `catalogue` | Separate `Recommended Recall Interval: {selected or entered text}` and `Recommended recall interval comments: {comments}` lines when documented   |
| A40 | `Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]` | Catalogue-backed editable text: **Recommended hygiene interval**, plus independent **Recommended hygiene interval comments** | Current value and comments: `patient-specific`; reusable interval values: `catalogue` | Separate `Recommended Hygiene Interval: {selected or entered text}` and `Recommended hygiene interval comments: {comments}` lines when documented |
| A41 | `Next visit: [SELECT/INSERT: NEXT VISIT]`                             | Catalogue-backed editable text: **Next visit**                                                                               | Current value: `patient-specific`; reusable options: `catalogue`                      | `Next visit: {text}`                                                                                                                              |
| A42 | `Date Booked:`                                                        | Optional date input: **Date booked**                                                                                         | `administrative`                                                                      | `Date Booked: {YYYY-MM-DD}`                                                                                                                       |

Recall and hygiene intervals have complete visible ClearDent lists whose values
are public catalogue starters. Their comments remain independent and
patient-specific. All seven complete Next visit values are approved public
starter values. These fields document patient-specific clinical or scheduling
decisions and are never inferred from other fields.

## Approved Generated-Note Order

The note preserves source order, preceded by the approved consistency
extensions:

1. Note started timestamp
2. Patient ID
3. Visit team
4. Last recall date
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

Unanswered fields and empty section headings are omitted, except that the
Patient ID and all three Visit Team labels remain visible in the standardized
header. The generated note must not contain `undefined`, empty placeholder
markers, **Not documented**, or unresolved `[AUTO]` and `[SELECT/INSERT]` text.

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

## Approved Copy Requirements

Before **Copy note** succeeds:

1. Patient ID must contain non-whitespace text; and
2. at least one of Dentist, RDH, or RDA must contain non-whitespace text.

All other clinical fields remain optional. The form must not treat missing
clinical documentation as a negative or normal finding.

## Approved Clinical Review

Clinical review accepted the complete mapping on 2026-07-25, including:

1. Patient ID, Note started, copy requirements, reset, and navigation behavior.
2. Manual Last recall date entry and `YYYY-MM-DD` output.
3. Unchecked Class 5 confirmation, independent Patient/Parent/Legal guardian
   consent checkboxes, omission of patient names, and public starter values
   plus browser-local additions for Medical history reviewed.
4. The approved Plaque, Stain, Calculus, and Bleeding choices plus **Other**.
5. Six unrestricted short PSR/Pocketing inputs labelled and copied clockwise as
   `1 2 3 / 6 5 4`. Partially completed values retain their sextant positions
   without inferring missing values.
6. Public starter values and generated wording for FMP done and
   Health/Gingivitis, excluding unresolved source strings.
7. Independent approved Periodontitis stage and grade choices, each with a
   separately documented comments field and no inferred relationship.
8. Explicit unchecked confirmation for the fixed home-care,
   disease-process-review, and PPE statements.
9. Catalogue-backed Oral hygiene compliance with an independent comment, plus
   the approved flossing and brushing choices with **Other**.
10. Unchecked Hygiene maintenance; structured Treatment completed rows with
    public treatment-type starters, multi-select fixed Tooth/area choices, and
    encounter-only custom Tooth/area text; public Desensitizer starters; and an
    unseeded Anesthetic field pending redesign.
11. Conditional night-guard controls and the proposed retainer choices.
12. Catalogue-backed recall and hygiene intervals with independent comments,
    and public starter values for Next visit.
13. The proposed labels, capitalization, punctuation, generated-note order,
    omission behavior, and date formatting.

## Technical Acceptance After Clinical Approval

Implementation began at lifecycle status `draft`. The conversion was promoted
to `pilot` on 2026-07-26 after satisfying these requirements:

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
- the accepted clinical review date recorded in provenance; and
- functional acceptance of the implemented workflow before promotion from
  `draft` to `pilot`.
