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
- Initial lifecycle status: `draft`
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
| `template_phrase_catalog` | Free text, reviewed public starters, or a local catalogue only when complete source text is available | Never turn screenshot ellipses into documentation |
| Any incomplete, scrolling, abbreviated, or truncated list | Evidence for control design, not an authoritative seed list | Preserve free-text entry and flag incomplete coverage |

Provider rosters may be transformed locally into the existing Dentist, RDH,
and RDA catalogue groups. The transformation output must remain ignored and be
imported through the catalogue page; the application must never load the
private extraction directly.

The same approach can later support other clinic templates. Field identifiers,
generic import logic, and explicitly reviewed non-identifying options may be
tracked. Extracted staff names and unreviewed private values may not.

## Catalogue Extension

The Adult Hygiene conversion extends the existing catalogue allowlist with
eleven browser-local groups. Ten ship with the reviewed, complete starter
values listed below. Anesthetic remains unseeded pending redesign:

| Catalogue key | Section | Adult Hygiene field | ClearDent extraction field | Public seeds | Control use |
| --- | --- | --- | --- | --- | --- |
| `medical-history.review` | Medical History | Medical history reviewed | `medical-and-dental-history-status` | 4 complete options | Single value |
| `periodontal.fmp-done` | Periodontal Assessment | FMP done | `full-mouth-periodontal-charting-done` | 5 complete options | Single value |
| `periodontal.health-gingivitis` | Periodontal Assessment | Health/Gingivitis | `health` | 4 complete options | Single value |
| `oral-hygiene.compliance` | Oral Hygiene and Education | Oral hygiene compliance | `ohi-compliance` | 6 complete options | Single value |
| `oral-hygiene.aids-reviewed` | Oral Hygiene and Education | OH aids reviewed/recommended | `ohi-aids-reviewed-recommended` | 8 complete options | Multiple values |
| `hygiene-treatment.completed` | Treatment | Treatment completed today | `hygiene-treatment` | 8 complete options | Multiple values |
| `hygiene-treatment.anesthetic` | Treatment | Anesthetic | `hygiene-anaesthetic` | None—rework required | Single value |
| `hygiene-treatment.desensitizer` | Treatment | Desensitizer | `desensitizer` | 4 complete options | Single value |
| `scheduling.recall-interval` | Intervals and Next Visit | Recommended recall interval | `recommended-recall-interval` | 3 complete options | Single value |
| `scheduling.hygiene-interval` | Intervals and Next Visit | Recommended hygiene interval | `recommended-hygiene-interval` | 4 complete options | Single value |
| `scheduling.next-visit` | Intervals and Next Visit | Next visit | `next-visit` | 7 complete options | Single value |

The exact public starter labels are:

- **Medical history reviewed:** `YES- NO CHANGES`; `YES- NP- CLEARED, NO CONTRAINDICATIONS TO TX`; `YES- UPDATED, BUT NO CONTRAINDICATIONS TO TX`; `YES- UPDATED MEDS`.
- **FMP done:** `YES, ALL FINDINGS DISCUSSED WITH PATIENT`; `NO, COMPLETED WITHIN A YEAR`; `NO, IN ORTHO`; `NO, NOT APPLICABLE`; `NO, RAN OUT OF TIME`.
- **Health/Gingivitis:** `HEALTH INTACT PERIODONTAL SUPPORT`; `GINGIVITIS INTACT PERIODONTAL SUPPORT`; `HEALTH- REDUCED PERIODONTAL SUPPORT`; `GINGIVITIS- REDUCED PERIODONTAL SUPPORT`.
- **Oral hygiene compliance:** `Poor`; `Fair`; `Good`; `Excellent`; `Poor–fair`; `Fair–good`.
- **OH aids reviewed/recommended:** `SULCABRUSH`; `SUPERFLOSS`; `FLOSS THREADERS`; `C-SHAPE FLOSSING`; `PROPER TB TECHNIQUE`; `INTERPROXIMAL BRUSH`; `SOFT PICKS`; `PROPER USE OF ETB`.
- **Treatment completed today:** `1U scale (cavitron and hand scaling)`; `2U scale (cavitron and hand scaling)`; `3U scale (cavitron and hand scaling)`; `4U scale (cavitron and hand scaling)`; `FMP`; `1U polish`; `Fluoride varnish`; `Crystal X-PUR`.
- **Desensitizer:** `NONE`; `PREVIDENT FL`; `VOCO FL`; `crystal x-pur`.
- **Recommended recall interval:** `12-month recall`; `6-month recall`; `9-month recall`.
- **Recommended hygiene interval:** `3-month scale`; `4-month scale`; `6-month scale`; `N/A`.
- **Next visit:** `6 MOS SCALE`; `12 MRC`; `3 MOS SCALE`; `4 MOS SCALE`; `6 MRC`; `9 MRC`; `FOLLOW-UP HYGIENE`.

These starter values are suggestions only and are never preselected. The two
truncated Health/Gingivitis entries and one truncated OHI-aids entry remain
excluded. The Anesthetic list must be redesigned before it can receive public
starter values. The shared Medical history reviewed catalogue is lifecycle
`pilot` because it is also used by the production-visible Recare Exam pilot;
the other Adult Hygiene-only catalogue groups remain `draft`.

The existing provider keys remain shared:

| Catalogue key | ClearDent extraction field |
| --- | --- |
| `visit-team.dentist` | `dentists` |
| `visit-team.rdh` | `hygienist` |
| `visit-team.rda` | `rda` |

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

### Multi-value catalogue fields

OH aids and Treatment completed require a reusable
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

| Field | Approved choices |
| --- | --- |
| Patient chief concern quick choices | Nothing; Sensitivity |
| Stain | None; Localized slight; Localized moderate; Localized heavy; Generalized slight; Generalized moderate; Generalized heavy |
| Bleeding | Localized mild; Localized moderate; Localized severe; Generalized mild; Generalized moderate; Generalized severe |
| Periodontitis stage | Stage I (P1); Stage II (P2); Stage III (P3); Stage IV (P4); N/A |
| Periodontitis grade | Grade A: slow rate; Grade B: moderate rate; Grade C: rapid rate; N/A |
| Oral hygiene compliance | Poor; Fair; Good; Excellent; Poor–fair; Fair–good |
| Flossing frequency | Flossing 1x/day; Flossing 2x/day; Flossing 3x/day; Never flossing; Flossing 1–2x/week; Flossing 3x/week; Seldom flossing |
| Brushing frequency | Brushing 1x/day; Brushing 2x/day; Brushing 3x/day; Never brushing |
| Recommended recall interval | 12-month recall; 6-month recall; 9-month recall |
| Recommended hygiene interval | 3-month scale; 4-month scale; 6-month scale; N/A |

Each applicable control also provides **Other** free text so imported,
historical, and currently undocumented values remain valid. The Plaque and
Calculus choices are recorded separately in their field section because their
two lists are most easily reviewed side by side.

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
| A06 | Class 5 indicator sentence and `[SELECT/INSERT: Cl5 Indicator Strip Checked]` | Unchecked checkbox: **Class 5 indicators checked**, positioned next to Miele sterilization codes | `appCore` | Preserve the complete source sentence followed by `Yes` only when explicitly checked |
| A07 | `Miele Sterilization Codes Scanned:` | Editable text: **Miele sterilization codes** | `administrative` | `Miele Sterilization Codes Scanned: {text}` when entered |
| A08 | Informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Three independent unchecked checkboxes: **Patient**, **Parent**, and **Legal guardian**; optional **Consent details** text | Consent sources: `appCore`; details: `patient-specific` | `Informed verbal consent given by {selected sources} for treatment today.` plus entered details |
| A09 | `Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]` | Catalogue-backed editable text: **Medical history reviewed** | Current value: `patient-specific`; reusable complete phrases: `catalogue` | `Medical history reviewed: {selected or entered text}` |
| A10 | `Premedication Required: [SELECT/INSERT: PREMED]` | Status: **Not documented / Not required / Required**; optional details when required | Status: `appCore`; details: `patient-specific` | `Premedication Required: No.` or `Premedication Required: Yes—{details}.` |

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
| A17 | `PSR/Pocketing: _ _ _ / _ _ _` | Six optional short text inputs grouped as **PSR/Pocketing**, labelled clockwise as **Sextant 1**, **2**, **3**, **6**, **5**, **4** | `patient-specific` | `PSR/Pocketing: {1} {2} {3} / {6} {5} {4}` using entered sextants |
| A18 | `Recession:` | Editable text: **Recession** | `patient-specific` | `Recession: {text}` |
| A19 | `FMP Done: [SELECT/INSERT: FMP DONE]` | Catalogue-backed editable text: **FMP done** | Current value: `patient-specific`; reusable complete phrases: `catalogue` | `FMP Done: {selected or entered text}` |
| A20 | `Health/Gingivitis: [SELECT/INSERT: HEALTH]` | Catalogue-backed editable text: **Health/Gingivitis** | Current value: `patient-specific`; reusable options: `catalogue` | `Health/Gingivitis: {text}` |
| A21 | `Periodontitis Stage: [SELECT/INSERT: PERIODONTITIS: STAGING]` | Optional structured choice: **Not documented** or an approved Periodontitis stage value, plus independent **Periodontitis stage comments** | Choice: `appCore`; comments: `patient-specific` | Separate `Periodontitis Stage: {selected stage}.` and `Periodontitis stage comments: {comments}.` lines when documented |
| A22 | `Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]` | Optional structured choice: **Not documented** or an approved Periodontitis grade value, plus independent **Periodontitis grade comments** | Choice: `appCore`; comments: `patient-specific` | Separate `Periodontitis Grade: {selected grade}.` and `Periodontitis grade comments: {comments}.` lines when documented |

The six PSR/Pocketing inputs preserve the source's six-position shape and use
the clinically approved clockwise order `1 2 3 / 6 5 4`, without imposing an
undocumented numeric range or automatically calculating a result.
All five visible FMP phrases are now complete and are public starter values.
Four of the six visible Health/Gingivitis phrases are complete; the other two
remain unresolved and are excluded until their full wording is known. The four
complete phrases are public starter values. Stage and grade have complete
ClearDent lists, including N/A. Stage, grade, and each respective comments
field remain independent; selecting a structured value never clears comments.

### Oral Hygiene and Education

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A23 | `Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]` | Catalogue-backed editable text: **Oral hygiene compliance**, plus independent **Oral hygiene compliance comment** | Current value and comment: `patient-specific`; reusable compliance values: `catalogue` | Separate `Oral hygiene compliance: {selected or entered text}` and `Oral hygiene compliance comment: {comment}` lines when documented |
| A24 | Fixed home-care instruction sentence | Unchecked checkbox: **Standard home-care instruction reviewed** | `appCore` | Preserve the source sentence only when checked |
| A25 | `OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]` | Catalogue-backed editable multi-value control: **OH aids reviewed/recommended** | Current selections: `patient-specific`; reusable options: `catalogue` | `OH Aids Reviewed/Recommended: {selected and entered values}` |
| A26 | `REVIEWED DISEASE PROCESS WITH PATIENT TODAY` | Unchecked checkbox: **Disease process reviewed with patient today** | `appCore` | Preserve the source sentence only when checked |
| A27 | `Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]` | Two optional structured choices with editable **Other** values: **Flossing frequency** and **Brushing frequency** | Choice: `appCore`; Other: `patient-specific` | `Patient is currently: {documented flossing}; {documented brushing}.` |
| A28 | `Hygiene goal:` | Textarea: **Hygiene goal** | `patient-specific` | `Hygiene goal: {text}` |

The fixed home-care and disease-process statements describe actions and are
therefore never included by default. Compliance has a complete visible
ClearDent list whose values are public catalogue starters. Its comment remains
independent and patient-specific. Flossing and brushing remain structured
application choices. Eight of nine visible OHI-aids values are complete; one remains
unresolved, and the scrollbar means additional values may not have been
captured. The eight complete captured values are approved public starter
values; the unresolved value remains excluded.

### Treatment

| ID | Source | Proposed control | Classification | Generated output |
| --- | --- | --- | --- | --- |
| A29 | `Treatment recommended:` and `1) HYGIENE MAINTENANCE` | Unchecked option: **Hygiene maintenance** plus editable **Other treatment recommended** textarea | `patient-specific` clinical decision | A `Treatment recommended:` block containing only explicitly selected or entered items |
| A30 | `Treatment completed today: [SELECT/INSERT: RDH: Treatment]` | Catalogue-backed editable multi-value control: **Treatment completed today** | Current selections: `patient-specific`; reusable options: `catalogue` | `Treatment completed today: {selected and entered values}` |
| A31 | `Anesthetic: [SELECT/INSERT: HYGIENE ANESTHETIC]` | Catalogue-backed editable text: **Anesthetic** | Current value: `patient-specific`; reusable options: `catalogue` | `Anesthetic: {text}` |
| A32 | `Desensitizer: [SELECT/INSERT: DESENSITIZER]` | Catalogue-backed editable text: **Desensitizer** | Current value: `patient-specific`; reusable options: `catalogue` | `Desensitizer: {text}` |

Hygiene maintenance is an explicit option, not a default or recommendation.
All eight visible Treatment completed values and all four Desensitizer values
are approved public starter values. Anesthetic remains unseeded and must be
reworked before its options are reconsidered. Selecting an item records text
only and never infers dose, amount, safety, appropriateness, or treatment.

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
| A39 | `Recommended Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]` | Catalogue-backed editable text: **Recommended recall interval**, plus independent **Recommended recall interval comments** | Current value and comments: `patient-specific`; reusable interval values: `catalogue` | Separate `Recommended Recall Interval: {selected or entered text}` and `Recommended recall interval comments: {comments}` lines when documented |
| A40 | `Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]` | Catalogue-backed editable text: **Recommended hygiene interval**, plus independent **Recommended hygiene interval comments** | Current value and comments: `patient-specific`; reusable interval values: `catalogue` | Separate `Recommended Hygiene Interval: {selected or entered text}` and `Recommended hygiene interval comments: {comments}` lines when documented |
| A41 | `Next visit: [SELECT/INSERT: NEXT VISIT]` | Catalogue-backed editable text: **Next visit** | Current value: `patient-specific`; reusable options: `catalogue` | `Next visit: {text}` |
| A42 | `Date Booked:` | Optional date input: **Date booked** | `administrative` | `Date Booked: {YYYY-MM-DD}` |

Recall and hygiene intervals have complete visible ClearDent lists whose values
are public catalogue starters. Their comments remain independent and
patient-specific. All seven complete Next visit values are approved public
starter values. These fields document patient-specific clinical or scheduling
decisions and are never inferred from other fields.

## Approved Generated-Note Order

The note preserves source order, preceded by the approved consistency
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
10. Unchecked Hygiene maintenance; public starter values for Treatment
    completed and Desensitizer; and an unseeded Anesthetic field pending
    redesign.
11. Conditional night-guard controls and the proposed retainer choices.
12. Catalogue-backed recall and hygiene intervals with independent comments,
    and public starter values for Next visit.
13. The proposed labels, capitalization, punctuation, generated-note order,
    omission behavior, and date formatting.

## Technical Acceptance After Clinical Approval

Implementation may now begin at lifecycle status `draft`. Promotion to `pilot`
requires:

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
