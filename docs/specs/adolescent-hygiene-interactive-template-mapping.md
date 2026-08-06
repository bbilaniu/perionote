# Adolescent Hygiene Interactive Template Mapping

- Status: Draft implementation; workflow decisions confirmed
- Date: 2026-08-06
- Clinical review status: Workflow decisions answered 2026-08-06; final acceptance pending
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
Treatments done today fields from the August 6 request. The hygiene findings,
gingival assessment, OHI, and treatment-completed controls reuse the reviewed
2021 Adult Hygiene vocabularies and workflows where the concepts match.

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
| A08 | `Gingival Health`                          | Same full periodontal/gingival assessment used by 2021 Adult Hygiene: structured observations, diagnosis, distribution, current-condition suggestion, stage, grade, status, evidence, and override reasons | appCore + patient-specific | Same assessment, evidence, Health/Gingivitis, diagnosis, stage/grade, and status blocks as Adult Hygiene; unanswered groups omitted |
| A09 | `Plaque Index`                             | Same faceted Plaque control as 2021 Adult Hygiene: extent, intensity, location, clinical areas, and comment | appCore + patient-specific | Adult Hygiene Plaque wording and ordering; omitted when empty |
| A10 | `Calculus- NO/YES (If yes where-)`         | Same Calculus control as 2021 Adult Hygiene: **None**, or grouped Extent, Intensity, Location, clinical Areas, and comment | appCore + patient-specific | `Calculus: None.` or Adult Hygiene Calculus wording; omitted when unanswered |
| A11 | `Intraoral Images- YES/NO`                 | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A12 | `OHI Reviewed`                             | Derived heading over the Adult Hygiene home-care technique and frequency controls | appCore | Shown when any OHI technique, note, or frequency is documented |
| A13 | `Flossing Technique`                       | Adult Hygiene reviewed OHI technique choices plus editable flossing-frequency suggestions | appCore + patient-specific | Techniques are listed in Adult Hygiene order; entered frequency appears in `Patient is currently`; omitted when empty |
| A14 | `Brushing Technique`                       | Adult Hygiene reviewed OHI technique choices plus editable brushing-frequency suggestions | appCore + patient-specific | Techniques are listed in Adult Hygiene order; entered frequency appears in `Patient is currently`; omitted when empty |
| A15 | `Do they have a NightGuard?`               | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A16 | `Have they had orthodontics?`              | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A17 | Retainer question                          | Not documented / None / Fixed / Removable / Fixed and removable; conditional details | appCore + patient-specific | Labelled retainer line; omitted when not documented             |
| A18 | `Scaling? Yes or No #__ units`             | Three-state control and units                                                        | appCore + patient-specific | Yes/No line; units included only with Yes                       |
| A19 | `Polish? Yes or No`                        | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| E04 | Not in source; present in August 6 request | Same ordered structured Treatment completed rows, catalogue-backed treatment types, Tooth/area controls, and explicit standard-treatment action as 2021 Adult Hygiene | catalogue + patient-specific extension | Adult Hygiene `Treatment completed today` wording and ordering; omitted when no meaningful rows exist |
| A20 | `Fluoride: Yes or No`                      | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A21 | Relayed info to parent/legal guardian      | Three-state control and optional details                                             | appCore + patient-specific | Yes/No labelled line; omitted when not documented               |
| A22 | `Goal for next visit`                      | Multiline text                                                                       | patient-specific           | Labelled line; omitted when empty                               |
| A23 | `RDH/RDA Comments`                         | Multiline text                                                                       | patient-specific           | Labelled line; omitted when empty                               |
| A24 | PPE statement                              | Unchecked checkbox                                                                   | appCore                    | Exact source statement only when checked                        |
| A25 | Recall interval marker                     | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A26 | Hygiene interval marker                    | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A27 | Next visit marker                          | Catalogue-backed editable text                                                       | catalogue                  | Labelled line; omitted when empty                               |
| A28 | `Date Booked`                              | ISO date input                                                                       | patient-specific           | Labelled ISO date; omitted when empty                           |

## Confirmed draft decisions

1. Dentist and Treatments done today belong in the adolescent interactive
   template.
2. Use `Cl 5`; the clinic no longer uses `Cl 4`.
3. Reuse the matching 2021 Adult Hygiene controls and controlled choices for
   gingival health, plaque, calculus, OHI techniques, and treatment products.
   Gingival health uses the complete Adult Hygiene periodontal/gingival
   assessment rather than a reduced choice list.
4. Omit unanswered source prompts for now.
