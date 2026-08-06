# Adolescent Hygiene Interactive Template Mapping

- Status: Draft for implementation and clinical review
- Date: 2026-08-06
- Clinical review status: Pending
- Source template: `adolescent-hygiene`
- Interactive slug: `adolescent-hygiene`
- Interactive route: `/templates/clinic/adolescent-hygiene/interactive`
- Source baseline commit: `7d3d21c`
- Lifecycle status: `draft`
- Additive request: [`2026-08-06_hygiene_only_appointment`](../requests/2026-08-06_hygiene_only_appointment)
- Governing decisions:
  - [ADR 0001](../adr/0001-support-local-customizable-documentation-catalogues.md)
  - [ADR 0003](../adr/0003-define-interactive-template-conversion-and-provenance.md)
  - [ADR 0004](../adr/0004-colocate-clinical-conversions-with-source-templates.md)

## Scope

This draft maps every prompt in the ClearDent `12-17YRS Old Hygiene
Template`. It adds Patient ID and note-start time for consistency with the
existing interactive conversions. It also adds optional Dentist and
Treatments done today fields from the August 6 request. Those four extensions
are identified in the interface and require clinical review before the
conversion advances from `draft`.

All patient-specific values are unrestricted current-note values. Reusable
provider, medical-history, and scheduling text uses the existing browser-local
catalogues. No unanswered clinical status is inferred: three-state controls
start at **Not documented** and the PPE statement starts unchecked.

## Field mapping

| ID  | ClearDent source                           | Interactive control                                                                  | Classification             | Generated output / omission behavior                            |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------- |
| E01 | Not in source                              | Patient ID, required before copy                                                     | patient-specific extension | `PATIENT ID: {value}`; header is shown when note context exists |
| E02 | Not in source                              | Read-only note-start timestamp                                                       | appCore extension          | Local date/time header; initialized for a new note              |
| A01 | `RDH: [SELECT/INSERT: Hygienist]`          | Catalogue-backed RDH                                                                 | catalogue                  | `RDH: {value}`; blank provider line retained with header        |
| A02 | `RDA: [SELECT/INSERT: RDA]`                | Catalogue-backed RDA                                                                 | catalogue                  | `RDA: {value}`; blank provider line retained with header        |
| E03 | Not in source; present in August 6 request | Catalogue-backed Dentist                                                             | catalogue extension        | `DENTIST: {value}`; blank provider line retained with header    |
| A03 | Informed verbal consent sentence           | Patient, Parent, and Legal guardian checkboxes plus optional details                 | patient-specific           | Sentence lists selected sources; omitted when none selected     |
| A04 | `Medical history reviewed`                 | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A05 | `Premedication Required`                   | Not documented / Not required / Required; conditional details                        | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A06 | Class 5 indicator sentence                 | Unchecked checkbox                                                                   | appCore                    | Full source sentence only when checked                          |
| A07 | `Miele Sterilization Codes Scanned`        | Text                                                                                 | patient-specific           | Labelled line; omitted when empty                               |
| A08 | `Gingival Health`                          | Text                                                                                 | patient-specific           | Labelled line; omitted when empty                               |
| A09 | `Plaque Index`                             | Text                                                                                 | patient-specific           | Labelled line; omitted when empty                               |
| A10 | `Calculus- NO/YES (If yes where-)`         | Three-state control and optional location/details                                    | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A11 | `Intraoral Images- YES/NO`                 | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A12 | `OHI Reviewed`                             | Derived section heading                                                              | appCore                    | Shown when either technique is documented                       |
| A13 | `Flossing Technique`                       | Text                                                                                 | patient-specific           | Labelled line; omitted when empty                               |
| A14 | `Brushing Technique`                       | Text                                                                                 | patient-specific           | Labelled line; omitted when empty                               |
| A15 | `Do they have a NightGuard?`               | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A16 | `Have they had orthodontics?`              | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A17 | Retainer question                          | Not documented / None / Fixed / Removable / Fixed and removable; conditional details | appCore + patient-specific | Labelled retainer line; omitted when not documented             |
| A18 | `Scaling? Yes or No #__ units`             | Three-state control and units                                                        | appCore + patient-specific | Yes/No line; units included only with Yes                       |
| A19 | `Polish? Yes or No`                        | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| E04 | Not in source; present in August 6 request | Multiline Treatments done today                                                      | patient-specific extension | Labelled line; omitted when empty                               |
| A20 | `Fluoride: Yes or No`                      | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A21 | Relayed info to parent/legal guardian      | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A22 | `Goal for next visit`                      | Multiline text                                                                       | patient-specific           | Labelled line; omitted when empty                               |
| A23 | `RDH/RDA Comments`                         | Multiline text                                                                       | patient-specific           | Labelled line; omitted when empty                               |
| A24 | PPE statement                              | Unchecked checkbox                                                                   | appCore                    | Exact source statement only when checked                        |
| A25 | Recall interval marker                     | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A26 | Hygiene interval marker                    | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A27 | Next visit marker                          | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A28 | `Date Booked`                              | ISO date input                                                                       | patient-specific           | Labelled ISO date; omitted when empty                           |

## Draft review questions

1. Confirm whether Dentist and Treatments done today belong in the permanent
   adolescent template or only in the hygiene-only variant. YES
2. Confirm whether the August 6 request's `Cl 4` wording should replace the
   source template's `Cl 5` wording. This draft preserves the ClearDent source
   (`Cl 5`) until reviewed. USE Cl 5, as we don't use Cl 4 anymore
3. Confirm desired controlled choices or catalogue behavior for gingival
   health, plaque, calculus, OHI techniques, and treatment products. Can we use the same as the 2021 adult exam?
4. Confirm generated-note capitalization and whether blank source prompts
   should be retained instead of omitted. Omitted for now.
