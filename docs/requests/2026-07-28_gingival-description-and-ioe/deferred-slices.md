# Gingival Description and IOE: Deferred and Subsequent Slices

- Status: Deferred
- Date: 2026-07-28
- Parent decision:
  [Gingival Description and IOE: Approved Routing and Delivery Plan](../2026-07-28_gingival-description-and-ioe.md)

This file records reviewed ideas that are intentionally outside:

- [Slice 1: Adult Hygiene Gingival Description](slice-1-adult-hygiene-gingival-description.md)
- [Slice 2: Recare Intraoral and Occlusal Findings](slice-2-recare-intraoral-and-occlusal-findings.md)

Items here must not be implemented incidentally while completing either
approved slice. Promote an item into a new dated request with its own mapping,
clinical review, generated-output contract, tests, changeset, and rollback
boundary.

## Promoted Slice 3: Recare Tooth-Level Findings

Promoted to an approved independent request:
[Slice 3: Recare Tooth-Level Findings](../2026-08-01_recare-tooth-level-findings.md).
Implementation belongs to that request's separate mapping, tests, changeset,
pull request, and rollback boundary.

### Catalogue concepts

- Teeth intact
- No caries
- No mobility
- Caries
- Initial/noncavitated caries lesion
- Fracture
- Discoloration
- Mobility
- Enamel hypoplasia
- Fluorosis

### Approved owner

Recare Exam, within the existing Odontogram and Caries Risk area.

Do not add these fields to Adult Hygiene merely because they appear in the IOE
source table.

### Why it was deferred

The current Recare control records only whether the odontogram is up to date.
Its Caries Risk controls document risk, not tooth-level clinical findings.
Neither is equivalent state that can safely absorb all Teeth options without a
reviewed extension.

The deferred design had to resolve:

- whether Teeth receives its own Not assessed / WNL / Findings status;
- whether `Teeth intact, with no caries or mobility noted` is an approved WNL
  statement;
- tooth-numbering interaction without hard-coding a numbering system;
- one or more teeth per observation;
- surface selection for caries;
- activity representation for initial/noncavitated caries lesions without
  inferring management;
- mobility grade representation;
- location for discoloration and fluorosis;
- repeated instances of the same finding on different teeth;
- relationship to the odontogram-up-to-date checkbox;
- relationship to Caries Risk without treating risk as a present carious
  lesion;
- exact output order and formatting; and
- handling of unknown or retired fixed option IDs.

### Compatibility requirement

The existing `ODONTOGRAM UP TO DATE` checkbox and Caries Risk controls must
remain independent. A tooth finding must not automatically change odontogram
status or caries-risk level.

## Candidate Later Slice: Explicit Saliva-to-Caries-Risk Suggestion

### Idea

When the clinician explicitly selects Reduced flow in the Recare structured
Saliva observations, offer a separate action:

`Add Hyposalivation to caries risk factors`

### Approved direction

Any connection must be confirmable and visible. Do not silently add, remove, or
synchronize clinical state.

The later design must resolve:

- where and when to display the suggestion;
- whether the suggestion is shown once per transition or remains available;
- how to indicate that Hyposalivation is already selected;
- whether user dismissal lasts only for the current page state;
- how to distinguish a suggestion-created selection from an independently
  documented caries-risk factor;
- what happens when Reduced flow is later cleared;
- confirmation that removing Reduced flow never silently removes an
  independently documented risk factor;
- accessible announcement and focus behavior; and
- unit and browser tests proving there is no automatic clinical assertion.

The inverse suggestion—from Hyposalivation risk to a Reduced flow observation—
is not approved and would require separate clinical review.

## Candidate Later Slice: Richer User-Defined Occlusal Metadata

Slice 2 allows users to remember additional reusable occlusal finding wording,
while location remains encounter-specific and generically available to every
selection.

A later slice may consider user-defined reusable metadata such as:

- preferred location quick choices;
- structured measurement support;
- aliases or synonyms;
- grouping;
- clinic-managed ownership after shared storage and permissions exist; and
- additional reviewed public starters.

Do not store patient-specific locations, measurements, comments, or completed
findings in the reusable catalogue.

Any option whose metadata changes application behavior requires a reviewed
schema and migration design. A locally remembered text label alone must not
silently acquire diagnostic or automation semantics.

## Candidate Later Slice: Shared Structured IOE Primitive

After the Recare implementation is clinically accepted, evaluate whether its
structured Intraoral interaction and summary formatting are genuinely reusable
by another conversion.

This is component reuse only. It must not:

- share live form state between conversions;
- copy Recare wording into a different source template without mapping review;
- introduce completed-form persistence;
- automatically add structured IOE to Adult Hygiene; or
- replace a template's accepted source-specific fields.

## Explicitly Not Deferred

The following decisions are already part of the approved slices and should not
be reopened as implementation guesses:

- Adult Hygiene owns structured Gingival Description.
- Recare owns structured Buccal mucosa, Tongue, Floor of mouth, Palate,
  Oropharynx, Saliva, and occlusal additions.
- Existing Adult Hygiene Bleeding, Recession, and Health/Gingivitis remain.
- Existing Recare Intraoral and occlusion controls remain.
- Coated and fissured tongue are normal variations.
- Every Additional occlusal finding supports optional encounter-specific
  location.
- Additional occlusal findings supports deliberately remembered browser-local
  wording.
- Overbite supports percent, millimetres, or both.
- Slice 2 does not automatically connect reduced salivary flow to caries risk.
