# Recare Exam Interactive Template Mapping

- Status: Accepted for implementation
- Date: 2026-07-24
- Clinical review status: Accepted 2026-07-25
- Slice 3 clinical review status: Accepted 2026-08-01
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
- Additive Slice 2 provenance:
  [Recare Intraoral and Occlusal Findings](../requests/2026-07-28_gingival-description-and-ioe/slice-2-recare-intraoral-and-occlusal-findings.md), using the reviewed
  [`hygienenote-gingival-ioe.catalog.json`](../requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.catalog.json)
  normalized IOE catalogue.
- Additive Slice 3 provenance:
  [Recare Tooth-Level Findings](../requests/2026-08-01_recare-tooth-level-findings.md), clinically approved 2026-08-01 using the reviewed normalized
  [`hygienenote-gingival-ioe.catalog.json`](../requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.catalog.json)
  catalogue and
  [`hygienenote-gingival-ioe.schema.json`](../requests/2026-07-28_gingival-description-and-ioe/hygienenote-gingival-ioe.schema.json).

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
  occlusion, caries-risk-factor, and reusable treatment-item fields;
- provide deliberate local catalogue import and export;
- add an independent structured Teeth assessment within the existing
  Odontogram and Caries Risk owner; and
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
7. Odontogram and Caries Risk
8. Treatment and Next Visit
9. Generated Note

A required **Patient ID** field and a read-only **Note started** timestamp are
included as user-requested extensions. The timestamp records the browser-local
date and time when the page loads or the form is reset after confirmation. The
form field displays `YYYY-MM-DD HH:mm`; the generated note uses the readable
dashed header shown below. Patient names are not collected. Like all form data,
these values remain only in memory until the generated note is explicitly
copied. At least one Visit Team field—Dentist, RDA, or RDH—is also required
before copying.

## Field Mapping

### Patient and Visit Context

| ID  | Source                                               | Control                                                                            | Classification     | Generated output                            |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- |
| R00 | User-requested extension; not in the source template | Required editable text: **Patient ID**                                             | `patient-specific` | `PATIENT ID: {text}`                        |
| R35 | User-requested extension; not in the source template | Read-only browser-local **Note started** timestamp at page load or confirmed reset | `administrative`   | `----- {Month D, YYYY h:mm:ss AM/PM} -----` |

### Visit Team

| ID  | Source                               | Control                                     | Classification | Generated output  |
| --- | ------------------------------------ | ------------------------------------------- | -------------- | ----------------- |
| R01 | `DENTIST: [SELECT/INSERT: Dentists]` | Catalogue-backed editable text: **Dentist** | `catalogue`    | `DENTIST: {text}` |
| R02 | `RDA: [SELECT/INSERT: RDA]`          | Catalogue-backed editable text: **RDA**     | `catalogue`    | `RDA: {text}`     |
| R03 | `RDH: [SELECT/INSERT: Hygienist]`    | Catalogue-backed editable text: **RDH**     | `catalogue`    | `RDH: {text}`     |

Provider fields do not ship with real staff values or public suggestions. A
user may deliberately remember a value in the current browser profile under
the approved catalogue proposal. Dentist, RDA, and RDH are individually
optional, but at least one of the three must contain non-whitespace text before
the note can be copied.

### Consent, Medical History, and Sterilization

| ID  | Source                                                                                                     | Control                                                                                                               | Classification                                                   | Generated output                                                           |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| R07 | Class 5 indicator sentence                                                                                 | Unchecked checkbox: **Class 5 indicators checked**                                                                    | `appCore`                                                        | Preserve the source sentence only when explicitly checked                  |
| R08 | `Miele Sterilization codes scanned:`                                                                       | Editable text: **Miele sterilization codes**, positioned next to Class 5                                              | `administrative`                                                 | `Miele Sterilization codes scanned: {text}` when entered                   |
| R04 | First informed-consent line, including patient-name `[AUTO]` markers and `[SELECT/INSERT: CONSENT FOR TX]` | Three independent unchecked checkboxes: **Patient**, **Parent**, and **Legal guardian**; optional **Consent details** | Consent sources: `appCore`; details: `patient-specific`          | `Informed verbal consent given by {selected sources} for treatment today.` |
| R05 | `MEDICAL history reviewed & INCLUDES: [SELECT/INSERT: MedHx/DentalHx]`                                     | Catalogue-backed editable text: **Medical history reviewed**, positioned next to Premedication                        | Current value: `patient-specific`; reusable phrases: `catalogue` | `Medical history reviewed: {selected or entered text}`                     |
| R06 | `Premedication Required: [SELECT/INSERT: PREMED]`                                                          | Status: **Not documented / Not required / Required**; optional details when required                                  | Status: `appCore`; details: `patient-specific`                   | `Premedication required: No.` or `Premedication required: Yes—{details}.`  |
| R09 | Second informed-consent line                                                                               | No second control; merge with R04                                                                                     | Source duplicate                                                 | No duplicate output                                                        |

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

| ID  | Source                                         | Control                                                                                                                                            | Classification                                                                                                           | Generated output                                                                                         |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| R10 | `Radiographs: [SELECT/INSERT: Radiographs]`    | Ordered catalogue-backed multi-value control: **Radiographs**; the same value may be added more than once                                          | Current selections: `patient-specific`; reusable values: `catalogue`                                                     | `Radiographs: {selected and entered values, including repeats}`                                          |
| R11 | `Intraoral photos: [SELECT/INSERT: Intraoral]` | Status: **Not documented / No / Yes**; optional editable **Details**                                                                               | Status: `appCore`; details: `patient-specific`                                                                           | Omit Not documented; `Intraoral photos: No.`; `Intraoral photos: Yes.`; or `Intraoral photos: {details}.` |
| R12 | `a) Patients chief concern:`                   | Ordered catalogue-backed multi-value control: **Patient's chief concern**; `Nothing` is mutually exclusive; optional per-note list-format checkbox | Current values: `patient-specific`; reusable values: shared `patient.chief-concerns` catalogue; format: `administrative` | Inline `a) Patient's chief concern: {values joined with "; "}` by default, or heading plus indented bullets |

Radiographs uses the complete visible options from the reviewed local JSON
extraction as public starters: `PAN`, `1 BW`, `2 BW`, `3 BW`, `4 BW`, `5 BW`,
`6 BW`, `1 PA`, and `2 PA`. The source list has a scrollbar, so free entry and
explicit browser-local additions remain available. Selected entries can be
removed and reordered without modifying the catalogue. Intraoral photos
continues to use an explicit Yes/No status plus editable details. Not
documented emits nothing. No emits `Intraoral photos: No.` Yes with empty
details emits `Intraoral photos: Yes.`; otherwise, the entered details follow
the label directly.

Patient chief concerns share the same starter and browser-local catalogue as
Adult Hygiene. Custom values apply only to the current note unless deliberately
remembered. Selecting `Nothing` removes all other concerns; selecting or adding
another concern removes `Nothing`. The unchecked
**List each concern on a separate line in the note** checkbox preserves inline
output by default; checking it lists the selected concerns using an indented
bullet style.

### Clinical Exam

| ID  | Source                                | Control                                                                                                                | Classification                                   | Generated output                                                                 |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| R13 | `b) Extraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea                                                           | Status: `appCore`; findings: `patient-specific`  | `b) Extraoral: WNL.` or `b) Extraoral: {findings}`                               |
| R14 | `c) TMJ- WNL`                         | Status: **Not assessed / WNL / Findings**; findings textarea                                                           | Status: `appCore`; findings: `patient-specific`  | `c) TMJ: WNL.` or `c) TMJ: {findings}`                                           |
| R15 | `Palpation of the Masseter Test: WNL` | Status: **Not assessed / WNL / Findings**; findings textarea                                                           | Status: `appCore`; findings: `patient-specific`  | `Masseter palpation: WNL.` or the entered findings                               |
| R16 | `Load TMJ joint Test: WNL`            | Status: **Not assessed / WNL / Findings**; findings textarea                                                           | Status: `appCore`; findings: `patient-specific`  | `TMJ loading test: WNL.` or the entered findings                                 |
| R17 | `d) Intraoral- WNL`                   | Status: **Not assessed / WNL / Findings**; findings textarea                                                           | Status: `appCore`; findings: `patient-specific`  | `d) Intraoral: WNL.` or `d) Intraoral: {findings}`                               |

### Occlusion & Habits

The interface places R18–R22 and Additional occlusal findings in a separate
**Occlusion & Habits** card immediately after Clinical Exam. This visual
separation does not change generated-note order or wording.

| ID  | Source                                | Control                                                                                                                | Classification                                   | Generated output                                                                 |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| R18 | `Oral Habits-`                        | Editable text: **Oral habits**                                                                                         | `patient-specific`                               | `Oral habits: {text}`                                                            |
| R19 | `Molar Occlusion-`                    | Separate catalogue-backed editable **Right** and **Left molar occlusion** fields, each with an explicit **N/A** action | Text: `catalogue`; N/A: `appCore`                | `Molar occlusion—right: {text or N/A}` and `Molar occlusion—left: {text or N/A}` |
| R20 | `Skeletal Occlusion- N/A`             | Catalogue-backed editable text: **Skeletal occlusion** with an explicit **N/A** action                                 | Text: `catalogue`; N/A: `appCore`                | `Skeletal occlusion: N/A.` or `Skeletal occlusion: {text}`                       |
| R21 | `Overjet- mm`                         | Optional numeric input: **Overjet (mm)**                                                                               | Measurement: `patient-specific`; unit: `appCore` | `Overjet: {number} mm.`                                                          |
| R22 | `Overbite- %`                         | Optional numeric input: **Overbite (%)**                                                                               | Measurement: `patient-specific`; unit: `appCore` | `Overbite: {number}%.`                                                           |

### Slice 2 additive Intraoral and occlusal detail

The accepted R17 Intraoral owner now also contains optional structured
observations for Buccal mucosa, Tongue, Floor of mouth, Palate, Oropharynx,
and Saliva. Encounter state stores only normalized option and structure IDs
plus supported location, laterality, measurement/unit, and comment values.
Catalogue wording is resolved when the note is generated; unknown or retired
IDs are ignored. Gingiva and Teeth are deliberately excluded.

The existing shared **Intraoral** status dropdown and conditional legacy
findings field remain aligned with Extraoral, TMJ, masseter palpation, and TMJ
load testing in the main Clinical Exam flow. The separate **Structured
intraoral observations** fieldset owns only its explanatory text, normal
shortcut, and detailed structure controls. Those controls are visible only
while the shared status is Findings. Not assessed hides them without
discarding their values, so selecting Findings again restores them; hidden
values do not appear in the note. WNL also hides them and retains the existing
confirmation-before-clear transition described below.

Selecting or editing any finding changes the shared R17 status to Findings,
including normal and normal-variation observations. WNL is never inferred.
Choosing WNL while free text or structured observations exist asks for
confirmation: confirmation clears only both kinds of Intraoral findings and
sets WNL; cancellation changes nothing. WNL output is
`d) Intraoral: WNL.`, and free-text-only Findings retain the one-line output
under the conditional `d)` marker.

**Apply normal structured observations** is an explicit shortcut within the
same fieldset. It sets the shared R17 status to Findings and selects these
reviewed catalogue observations: Buccal mucosa—Pink, Moist, No lesions, No
swelling; Tongue—Pink, Moist, Symmetrical, No lesions; Floor of mouth—Pink,
Smooth, No swelling, No discoloration; Palate—Pink, Intact, No lesions, No
abnormal growths; Oropharynx—Uvula midline, No redness, No swelling, No
exudate; Saliva—Clear, Normal flow. The implementation stores these exact 22
option IDs rather than inferring them from catalogue classification. When
free text or structured observations already exist, the action asks for
confirmation before replacing only those Intraoral values; cancellation
changes nothing.

**Clear intraoral observations** is an explicit destructive action in the
same fieldset. When free text or structured observations exist, it asks for
confirmation before clearing both, returns the shared status to Not assessed,
and leaves all unrelated Recare fields unchanged. Cancellation changes
nothing.

Structured output is one compact bullet per selected structure. Structures
and their selected options use catalogue order regardless of selection order.
Supported annotations remain attached to their option in parentheses:

```text
Intraoral:
  - {Structure}: {catalogue noteFragment}; {catalogue noteFragment} (location: {location}; measurement: {value unit}; notes: {comment}).
  Observations: {existing free text}.
```

Unsupported and empty annotations are omitted. The normal shortcut therefore
produces six structure bullets, for example
`Buccal mucosa: pink; moist; no lesions; no swelling.` Saliva observations
never alter the separate caries-risk factors.

R22 keeps its optional percent value and adds independent **Overbite (mm)**.
Percent alone remains `Overbite: 30%.`; millimetres alone produces
`Overbite: 3 mm.`; both produce `Overbite: 30%; 3 mm.`. Neither measurement
selects a finding.

After the measurements, one catalogue-backed multi-value control owns
**Additional occlusal findings**. Its public starters map to normalized source
IDs as follows: Open bite → `ioe.occlusion.open_bite`; Crossbite →
`ioe.occlusion.crossbite`; Increased overjet →
`ioe.occlusion.increased_overjet`; Increased overbite →
`ioe.occlusion.increased_overbite`. No Class I/II/III starters are duplicated.
Following clinical wording review on 2026-07-30, the non-specific source phrase
`Slight malocclusion` remains audit-only and is excluded from normalized and
runtime choices.
Free entry is valid, while browser-local reuse requires the existing explicit
Remember action. Each selected text snapshot owns optional encounter-only
locations (Anterior, Posterior, Right, Left, Maxilla, Mandible, and editable
tooth/area or region text), emitted in selection order as:
`Additional occlusal findings: {finding} (location: {locations}); {finding}.`
Locations are never part of catalogue storage or exports.

Synthetic transition examples: an empty R17 remains Not assessed and emits
nothing; selecting Fissured tongue yields Findings and `Tongue: fissured`
without a pathology label; an Open bite at Anterior yields
`Additional occlusal findings: Open bite (location: Anterior).`; and entering
30 percent plus 3 mm yields the dual-unit output above. All pre-Slice-2 Recare
fields, ordering, N/A actions, catalogue ownership, and output remain
compatible when these additions are unused.

All five exam-status controls start at **Not assessed**. Choosing **Findings**
reveals an editable textarea. WNL must be actively selected and is never inferred
from an empty findings field.

The pilot will not impose undocumented clinical minimums, maximums, or decimal
precision on overjet or overbite. Basic numeric parsing may prevent nonnumeric
output, but clinical ranges require a sourced decision.

TMJ status, free text, structured TMJ clicking, Masseter palpation, and TMJ
loading are presented in one **Temporomandibular assessment** group. Selecting
clicking sets TMJ to Findings. Changing TMJ to WNL or Not assessed confirms
before clearing its free text and linked clicking.
Legacy drafts that contain clicking with another TMJ status expose explicit
keep-clicking or remove-clicking actions rather than being rewritten during
restore. Persisted fields and generated output remain unchanged.

Lymph-node status, free text, and structured **Palpable** finding are likewise
presented in one **Lymph nodes** assessment group. Selecting Palpable sets the
status to Findings and retains the established “palpable lymph nodes” generated
wording with laterality, location, and swelling. Changing the status to WNL or
Not assessed confirms before clearing the linked details. Older drafts without
the status fields expose explicit keep-or-remove conflict actions.

Masseter palpation and TMJ load testing retain independent status and findings
controls inside that fieldset. The redundant **Additional extraoral clinical
exam** title is omitted. The source's
skeletal-occlusion `N/A` value is an explicit action and is not preselected.
Right and left molar occlusion likewise have independent explicit N/A actions;
neither is preselected.

### Appliances and Relevant History

| ID  | Source                                                      | Control                                                                                                                  | Classification     | Generated output                                                                          |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------- |
| R23 | `Do they use a CPAP?` plus approved ownership clarification | Status: **Not documented / No / Yes** labelled **Has a CPAP?**; when Yes, show **Uses the CPAP?** with the same statuses | `appCore`          | `CPAP: No.` when No; when Yes, `CPAP: Yes; {uses/does not use/use not documented}.`       |
| R24 | `Does patient have a Splint?`                               | Status: **Not documented / No / Yes** labelled **Has an occlusal splint?**                                               | `appCore`          | `Occlusal splint: No.` when No; combined with R25 when Yes                                |
| R25 | `Do they use Splint?`                                       | Status: **Not documented / No / Yes** labelled **Uses the occlusal splint**, shown when ownership is Yes                 | `appCore`          | `Occlusal splint: Yes; {uses/does not use/use not documented}.`                           |
| R26 | `Have they had orthodontics?`                               | Status: **Not documented / No / Yes**                                                                                    | `appCore`          | `Orthodontic history: No.` or `Orthodontic history: Yes.`                                 |
| R27 | `Do they wear Retainers? Fixed or removable?`               | Status: **Not documented / None / Fixed / Removable / Fixed and removable**                                              | `appCore`          | `Retainers: {selected status}.`                                                           |
| R28 | `Do they have Partial Dentures`                             | Status: **Not documented / No / Yes** labelled **Partial/complete removable dentures**; when Yes, show **Removable dentures comments** | Status: `appCore`; comment: `patient-specific` | `Partial/complete removable dentures: No.`, `Partial/complete removable dentures: Yes.`, or the Yes answer followed by the entered comment |
| R29 | Smile or teeth improvement question                         | Textarea: **What would the patient like to improve about their smile or teeth?**                                         | `patient-specific` | `Patient-requested smile or dental improvements: {text}`                                  |
| R30 | `Additional Comments-`                                      | Textarea: **Additional comments**                                                                                        | `patient-specific` | `Additional comments: {text}`                                                             |

The CPAP ownership and use controls behave like the occlusal-splint pair.
Changing ownership away from Yes clears the conditional use status. R27
remains available regardless of the orthodontic-history answer. The form
will not assume that a negative or undocumented orthodontic history makes a
retainer value impossible. The UI and generated note use **Occlusal splint**
and **Partial/complete removable dentures**. Every documented negative,
affirmative, or selected-status answer appears in the generated note for CPAP,
occlusal splint, orthodontic history, retainers, and removable dentures. The
removable-dentures comment is visible and included in output only while the
status is Yes. A temporarily hidden comment is retained if the status changes
and is restored when Yes is selected again.

### Odontogram and Caries Risk

| ID  | Source                                                                        | Control                                                                                                            | Classification                                                               | Generated output                                       |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| R40 | Approved Slice 3 Teeth extension                                              | **Teeth** Not assessed / WNL / Findings plus **Structured tooth-level observations** and Additional tooth findings | Fixed vocabulary: `appCore`; all entries and annotations: `patient-specific` | Approved WNL sentence or one structured `Teeth:` block |
| R36 | User-requested extension based on frequently entered Additional Comments text | Unchecked checkbox: **Odontogram up to date**, moved to the bottom of the structured Teeth area                    | `appCore`                                                                    | `ODONTOGRAM UP TO DATE` only when explicitly checked   |
| R37 | Caries Risk card reused from the Very Short template                          | Fixed **Caries risk level**: None selected / Low / Moderate / High                                                 | `appCore`                                                                    | `{level} caries risk` when selected                    |
| R38 | Caries Risk card reused from the Very Short template                          | Ordered catalogue-backed multi-value **Caries risk factors**                                                       | Current selections: `patient-specific`; reusable factors: `catalogue`        | Append `due to {ordered factors}`                      |
| R39 | Caries Risk card reused from the Very Short template                          | Textarea: **Caries risk notes**                                                                                    | `patient-specific`                                                           | Append the entered rationale                           |

R40 is additive and backward-compatible. A missing Teeth property is Not
assessed and emits nothing. Its primary status and disclosure follow the Adult
Hygiene **Gingival Description** and **Structured gingival observations**
interaction: blank state is Not assessed, WNL requires an explicit action,
Findings reveals detailed controls, and clearing documented values requires
confirmation. The approved **Additional tooth findings** text remains
encounter-only and is never a catalogue value.

The explicit normal shortcut stores `ioe.teeth.intact`,
`ioe.teeth.no_caries`, and `ioe.teeth.no_mobility`. It emits exactly:

```text
Teeth intact, with no caries or mobility noted.
```

Findings use stable option IDs from the normalized catalogue. Caries,
Initial/noncavitated caries lesion, Discoloration, Mobility, Enamel hypoplasia,
and Fluorosis are repeatable rows. Each row owns its supported Tooth/area
values, free-text Surface(s), optional activity, required Miller grade, and
comment. Tooth/area is required for Caries,
Initial/noncavitated caries lesion, Fracture, and Mobility. It is optional for
Discoloration, Enamel hypoplasia, and Fluorosis. Tooth/area accepts multiple
values and encounter-only custom text without validating, translating, or
assuming a tooth-numbering system.

Initial/noncavitated caries lesion supports optional Active or Inactive
activity with no default. The application never infers activity from another
field. It also never derives monitoring, nonrestorative care, restorative
care, another management decision, or Caries Risk from lesion stage or
activity. This slice adds no structured management field.

M0 is the structured Miller Index representation of No mobility. Each Mobility
row requires M1, M2, or M3. No mobility/M0 and Mobility M1–M3 cannot coexist.
The application does not infer mobility from periodontal evidence or use it to
change periodontal classification.

Apply these option conflicts bidirectionally:

- No caries conflicts with Caries and Initial/noncavitated caries lesion;
- No mobility/M0 conflicts with Mobility M1–M3;
- Intact conflicts with Caries, Initial/noncavitated caries lesion, and
  Fracture; and
- Intact may coexist with Discoloration, Mobility, Enamel hypoplasia, and
  Fluorosis when explicitly documented.

When an incompatible selection would discard documented annotations, confirm
before clearing it. Cancellation leaves state unchanged. Unknown or retired
fixed IDs are ignored safely and never generate invented prose.

Findings output is one block in catalogue order before odontogram and Caries
Risk output. Empty abnormal rows are omitted, while selected standalone normal
observations remain meaningful. Repeatable rows retain encounter order within
their fixed option:

```text
Teeth:
  - {Observation}: {tooth/area} {surface} ({activity or Miller grade}) — {comment}.
  Additional observations: {entered Additional tooth findings text}.
```

Unsupported and empty clauses are omitted. Examples of the approved contract:

```text
Teeth:
  - Caries: 14 DO.
  - Initial/noncavitated caries lesion: 15 O (inactive).
  - Mobility: 31, 41 (M2).
```

The Teeth assessment, odontogram checkbox, and Caries Risk controls remain
independent in both directions. A tooth finding never checks the odontogram,
changes caries risk, or creates a Treatment Option or Treatment Plan. Moving
the checkbox changes only its visual placement and preserves its state and
exact output.

The odontogram checkbox and all Caries Risk controls start empty. The factor
catalogue uses the seven factors already present in the Very Short template as
public starters: **High frequency of sugar intake**, **Inadequate oral
hygiene**, **Insufficient exposure to fluoride**, **Heavily restored
dentition**, **Hyposalivation**, **History of caries in the last 36 months**,
and **Symptomatically driven dental visits**. Factors may be selected, entered,
removed, and reordered. Only an explicit **Remember and add** action stores a
new factor in the browser-local catalogue. Risk level, current factor
selections, and notes remain encounter-specific.

### Treatment and Next Visit

| ID  | Source                                             | Control                                                                                                                                                        | Classification                                                                                                                | Generated output                                                                      |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| R31 | `Treatment Options:` and `1) HYGIENE MAINTENANCE`  | Ordered editable rows with a catalogue-backed **Treatment type**, optional encounter-only **Tooth/area**, and checked-by-default per-note list-format checkbox | Treatment type: `catalogue` when explicitly remembered; each row and tooth/area: `patient-specific`; format: `administrative` | A numbered `Treatment Options:` list by default, or a semicolon-separated inline line |
| R32 | `Treatment Plan:` and `1) HYGIENE MAINTENANCE`     | Independent ordered editable rows with the same fields and format checkbox; while empty, offer **Copy Treatment Options to Treatment Plan**                    | Treatment type: `catalogue` when explicitly remembered; each row and tooth/area: `patient-specific`; format: `administrative` | A numbered `Treatment Plan:` list by default, or a semicolon-separated inline line    |
| R33 | `Next Visit: [UNRESOLVED PLACEHOLDER: NEXT VISIT]` | Editable text: **Next visit**                                                                                                                                  | `patient-specific`                                                                                                            | `Next Visit: {text}`                                                                  |
| R34 | `Date Booked:`                                     | Optional date input: **Date booked**                                                                                                                           | `administrative`                                                                                                              | `Date Booked: {YYYY-MM-DD}`                                                           |

The shared treatment-type catalogue has only one public starter: **Hygiene
maintenance**. It is an explicit option, not a default or recommendation.
Each control supports adding, removing, reordering, and editing rows inline.
Treatment types may be repeated so that the same treatment can document
different teeth or areas. **Remember treatment type** saves only the type;
the optional Tooth/area value always remains in the current note. Selecting a
treatment option does not automatically select the same treatment plan. The
blank catalogue-backed suggestion lists offer a separate eye-slash action that
hides a suggestion without selecting it or changing any encounter value.
Hidden suggestions remain recoverable through **Manage Catalogues**. The
copy action appears only while Treatment Plan has no documented rows and
snapshots the current ordered Treatment Options after an explicit click.
Copied rows receive independent identities, so later edits do not affect the
source rows. Neither field infers the next visit.

The checked-by-default **List each treatment option on a separate line in the
note** and **List each treatment plan item on a separate line in the note**
checkboxes are independent. Checked output numbers entries from `1.` in their
displayed order. Unchecking a checkbox places that section's entries after its
heading on one line, separated by semicolons.

Treatment Options and Treatment Plan remain separate controls. The source's
undeclared `NEXT VISIT` placeholder maps to unrestricted text. Dates generated
by the template, including Date Booked, use `YYYY-MM-DD`.

## Generated-Note Order

The note should preserve the source order, preceded by the user-requested
note-start timestamp and Patient ID extensions:

1. Form-start timestamp
2. Patient ID
3. Visit team
4. Consent
5. Medical history and premedication
6. Sterilization documentation
7. Radiographs and intraoral photos
8. Chief concern
9. Clinical exam
10. Appliances and relevant history
11. Patient improvement request and additional comments
12. Teeth findings, odontogram status, and caries risk
13. Treatment options
14. Treatment plan
15. Next visit and date booked

Unanswered fields are omitted, except that the Patient ID and all three Visit
Team labels remain visible in the standardized header. Section headings with
no output are also omitted. The generated note must not contain placeholder
labels such as `undefined`, `Not assessed`, or
`[UNRESOLVED PLACEHOLDER: ...]`.

The `a)` through `d)` examination markers render only when their corresponding
subsection has meaningful output. They may therefore be skipped when a
subsection is not assessed. Later sections such as Treatment Options,
Treatment Plan, Next Visit, and Date Booked do not receive letter markers.

The visible preview contains the complete generated note. A successful
**Copy note** action writes that preview to the clipboard unchanged and does
not add a separate copy-time timestamp.

### Illustrative Output Shape

The following uses tokens rather than real clinical or staff information:

```text
----- {Month D, YYYY h:mm:ss AM/PM when the page loaded or reset was confirmed} -----
PATIENT ID: {entered patient ID}
DENTIST: {entered dentist}
RDA: {entered RDA}
RDH: {entered RDH}

Informed verbal consent given by {selected sources} for treatment today.
Medical history reviewed: {selected or entered text}
Premedication required: {documented answer}

Radiographs: {ordered selected and entered values}
Intraoral photos: {No, Yes, or entered details}

a) Patient's chief concern: {ordered selected and entered values inline by default, or as indented bullets when list formatting is checked}

b) Extraoral: {WNL or findings}

c) TMJ: {WNL or findings}
Masseter palpation: {WNL or findings}
TMJ loading test: {WNL or findings}

d) Intraoral: {WNL or findings}
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
Partial/complete removable dentures: {documented answer and optional Yes comment}

Patient-requested smile or dental improvements: {entered text}
Additional comments: {entered text}

Teeth:
  - {observation}{supported tooth/area, surface, activity, Miller Index, and notes}.
  Additional observations: {entered text}.
ODONTOGRAM UP TO DATE
Caries risk: {level} caries risk due to {ordered factors}. {entered notes}

Treatment Options:
  1. {treatment type}{ — optional tooth/area}

Treatment Plan:
  1. {treatment type}{ — optional tooth/area}

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
- Provider, radiograph, occlusion, caries-risk-factor, and reusable
  treatment-type values are remembered only through the explicit local
  catalogue interaction approved under ADR 0001. Typing, selecting, loading
  demo data, copying, or resetting the form never saves a catalogue value.
- Selected radiographs and structured Treatment Options and Treatment Plan
  rows remain encounter-specific even when a treatment type originated in a
  catalogue. Repeated Radiographs values remain separate encounter entries and
  do not create duplicate catalogue suggestions. Tooth/area values are never
  catalogue candidates.
- Selected caries risk factors remain encounter-specific even when they
  originated in a catalogue. Caries risk level and notes are never catalogue
  candidates.
- Teeth status, fixed-option selections, repeated finding rows, Tooth/area,
  Surface(s), activity, Miller grades, comments, and Additional tooth findings
  remain encounter-specific. None is a reusable catalogue candidate.
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

- All 41 mapping IDs—34 source mappings plus the Patient ID, note-start,
  odontogram, Caries Risk, and Teeth extensions—are
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
- The UI and generated note use **Partial/complete removable dentures**. A
  patient-specific comment is available when Yes is selected and is appended
  to the affirmative generated line when non-empty.
- Odontogram status is not inferred and appears as `ODONTOGRAM UP TO DATE`
  only when explicitly checked.
- Teeth starts Not assessed, WNL requires explicit action, and an absent or
  unused Teeth assessment emits nothing.
- Teeth WNL emits exactly
  `Teeth intact, with no caries or mobility noted.`
- Caries, Initial/noncavitated caries lesion, Discoloration, Mobility, Enamel
  hypoplasia, and Fluorosis support repeatable rows with independent
  annotations.
- Required Tooth/area, Miller Index, activity, repeatability, and conflict
  behavior matches the approved Slice 3 contract.
- Initial-lesion stage or activity never infers management, treatment,
  monitoring, recommendations, or Caries Risk.
- Tooth findings, odontogram status, and Caries Risk remain independent.
- Caries Risk provides the same fixed levels and notes field as the Very Short
  template, plus ordered catalogue-backed factors with the seven existing
  factors as starters.
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
