# ADR 0003: Define Interactive Template Conversion and Provenance

- Date: 2026-07-24

## Status

Proposed

The placement of clinical conversions in the general interactive library is
superseded by
[ADR 0004](0004-colocate-clinical-conversions-with-source-templates.md).
The provenance, lifecycle, mapping, privacy, output, testing, and review
decisions in this ADR remain governing.

## Context

Hygienenote now has two public template libraries:

- clinic EMR templates preserved as readable, copyable source references; and
- interactive templates that collect structured input and generate clinical
  documentation.

ADR 0002 established this separation. The next step is to convert selected
clinic templates into interactive forms without losing their source meaning,
duplicating a large webform for every workflow, or implying that unfinished
conversions are ready for clinical use.

The supplied clinic template text is approved for the public repository and
application build because it does not identify the clinic, a patient, or
private staff. This approval applies to the reviewed source-template text. It
does not make future patient data, local catalogue values, or identifying
clinic configuration suitable for publication.

The current interactive template demonstrates useful behavior: structured
sections, fixture-driven examples, generated summaries, and browser tests.
However, the registry does not yet describe which clinic template an
interactive form was derived from, the source revision used, or the
conversion's review state.

Interactive forms may contain patient- and appointment-specific information
while the user is completing a note. Hygienenote will not store completed forms
or use the browser-local catalogue storage described by ADR 0001 as form
storage.

## Decision

### Keep two public template libraries

Hygienenote will continue to use:

- `/templates/clinic` for approved, non-identifying source/reference templates;
  and
- `/templates/interactive` for interactive conversions intended for use.

A third public library for converted clinical templates will not be created.
Converted templates are interactive templates and belong in the existing
interactive library.

Draft work will use development branches and preview deployments. A route that
is merely unlinked or hidden is still public when included in a static build and
must not be treated as an access control.

### Preserve source and conversion provenance

An interactive template is a derived implementation, not a replacement for its
clinic source template. The reviewed source text remains available as a
reference so maintainers and clinical reviewers can compare the conversion
with the wording and workflow from which it was derived.

Each conversion will identify at least:

- its source clinic-template slug;
- the source revision, version marker, or content hash reviewed;
- its conversion status; and
- the date or revision of its most recent clinical review.

The exact registry fields belong in the implementation specification. Source
provenance must be machine-readable rather than present only in a component
comment.

Changing a clinic source template does not silently update an interactive
template. The interactive conversion remains associated with the source
revision it was reviewed against until its mapping, generated output, tests,
and review status are deliberately updated.

Clinic and interactive detail pages should eventually link to one another when
a conversion exists.

### Use an explicit conversion lifecycle

Interactive conversions will use a small lifecycle:

- `draft`: under implementation and not included in the production build;
- `pilot`: functionally complete and undergoing structured clinical review; and
- `ready`: reviewed and suitable for the public interactive-template library.

Pilot inclusion in a production build must be intentional and visibly labelled.
Draft exclusion must occur at build or registration time; removing a navigation
link is insufficient.

Lifecycle status communicates conversion maturity, not regulatory approval,
privacy compliance, or a clinical recommendation.

### Map every source field deliberately

Before implementation, each source template will receive a mapping
specification. For every source prompt or marker, the specification will record:

- its source wording and location;
- the intended interactive label and control;
- whether it is stable `appCore` vocabulary, catalogue-capable,
  unrestricted narrative, or patient-specific;
- whether it is optional, required, or conditionally displayed;
- any source-backed default;
- its generated-documentation wording and omission behavior; and
- any unresolved question requiring clinical review.

`[AUTO: ...]` markers will not be presented as automatic integrations when no
EMR integration exists. A conversion must explicitly choose whether such a
value is manually entered, omitted from the interactive workflow, or preserved
as a visible placeholder.

`[SELECT/INSERT: ...]` markers do not automatically imply a closed dropdown.
Their values will be classified under ADR 0001. Unresolved source placeholders
will not be silently guessed.

The mapping may improve labels, grouping, accessibility, and interaction
without changing clinical meaning. Material changes to generated-note wording
or workflow intent require explicit clinical review and must not be hidden
inside a UI refactor.

### Do not persist completed forms

Patient- and appointment-specific form state will exist only in the active
interactive page's in-memory component state.

Hygienenote will not intentionally write completed or partially completed form
state to:

- `localStorage`, IndexedDB, or `sessionStorage`;
- cookies, browser caches, or service-worker storage;
- URLs, query strings, or fragments;
- analytics, telemetry, or error-reporting payloads;
- an API, remote service, or cloud backup; or
- source files, fixtures, or static assets.

Reloading, closing, or navigating away from the page may discard the form. The
application will not offer automatic draft recovery under this decision.

Copying generated documentation to the clipboard remains an explicit user
action. Hygienenote does not control clipboard history, operating-system
features, browser autofill, or third-party software on the user's device; the
interface and future user guidance should not imply otherwise.

Catalogue persistence under ADR 0001 is separate from form-state persistence.
Only deliberately saved, reusable, non-patient catalogue values may cross
sessions. A catalogue must never become an indirect store for completed-form
content.

### Generate output from current text values

The generated note will use the labels and text currently present in the form.
It will not depend on a future lookup of mutable catalogue labels.

The summary builder will explicitly define:

- field ordering;
- headings and indentation;
- omission of unanswered optional fields;
- preservation of meaningful free text;
- handling of unknown or imported values; and
- punctuation and wording expected by the clinical workflow.

Fixture and test data must remain synthetic. Generated output is available for
review and explicit copying, but Hygienenote does not retain it after the active
page state is discarded.

### Do not add implicit clinical conclusions

Conversion is a documentation transformation, not an opportunity to introduce
clinical decision support.

Interactive controls may reveal relevant dependent fields—for example, showing
stage and grade only when periodontitis is selected—but a selection must not
silently infer diagnosis, treatment, product safety, dose, amount, recall
interval, outcome, or another clinical conclusion unless a separate
source-backed decision explicitly authorizes that behavior.

Defaults and conditional behavior already present in an existing interactive
form must be reviewed when reused. Existing behavior is not automatically
approved for every new conversion.

### Reuse behavior without cloning the existing webform

The existing interactive form is a behavioral reference, not a template to copy
in full for every conversion.

Conversions should reuse or extract shared sections when the same clinical
concept and output contract genuinely recur. Likely shared areas include
provider and visit details, consent and history, EOE/IOE, hygiene findings,
instrumentation, local anesthesia, next visit, and the summary/copy shell.

Shared components must not force unrelated templates into one workflow.
Template-specific fields and wording remain local to their conversion.
Extraction may proceed incrementally; the first pilot does not require a
repository-wide refactor.

Each interactive conversion will continue to have an explicit component,
summary builder or equivalent output contract, synthetic fixture, registry
entry, and focused tests.

### Require technical and clinical acceptance

A conversion may become `ready` only after:

- every source field has a documented mapping or intentional omission;
- generated output has been compared with approved synthetic examples;
- unknown free-text and imported values remain valid where applicable;
- closed vocabularies still enforce only stable application semantics;
- reload or navigation does not restore completed form data;
- browser tests cover the primary workflow and output;
- accessibility has been reviewed for interactive controls; and
- a designated clinical reviewer has accepted the workflow and generated text.

Review is against a specific source revision. A later material source or output
change returns the affected conversion to review.

### Start with the Recare Exam pilot

The first conversion pilot should be the Recare Exam template. It exercises
structured findings, stable controls, free text, treatment planning, and output
generation without beginning with product-dose coupling.

The pilot will establish the mapping format, provenance metadata, lifecycle
handling, non-persistence test, and clinical review checklist before additional
clinic templates are converted.

## Rationale

Two libraries communicate the important distinction clearly: clinic templates
are approved source references, while interactive templates are derived,
reviewed tools. A third public page would describe implementation status rather
than a genuinely different kind of template.

Explicit provenance prevents a conversion from drifting away from its source
without detection. Lifecycle states prevent incomplete forms from appearing
equivalent to reviewed ones. A field-by-field mapping creates a reviewable
bridge between narrative EMR text and structured UI.

Ephemeral form state matches Hygienenote's current use as a documentation
generator and avoids creating a patient-record storage system. Separating
completed-form state from reusable catalogues prevents patient-specific text
from being retained as a convenience feature.

Incremental shared-component extraction balances reuse with source fidelity and
avoids multiplying copies of the existing large webform.

## Consequences

### Benefits

- The existing two-page information architecture remains understandable.
- Every interactive conversion can be traced to a reviewed source revision.
- Public source text remains available for comparison and clinician review.
- Draft, pilot, and ready conversions are not presented as equivalent.
- Patient-specific form data is not retained by Hygienenote.
- Shared behavior can grow incrementally without forcing identical workflows.
- Generated output and omissions are testable before clinical release.

### Trade-offs

- Reloading or navigating away loses work, and there is no automatic recovery.
- Every conversion requires a mapping specification and clinical review.
- Source changes require deliberate conversion review rather than automatic
  propagation.
- Registry provenance and lifecycle handling add implementation complexity.
- Shared-component extraction requires judgment and may initially leave some
  duplication.
- Public source approval must be reconsidered for every future template or
  material revision.

## Alternatives Considered

### Create a third public page for converted clinical templates

Rejected. Converted templates are interactive templates. A third library would
duplicate navigation concepts and expose development status as a content type.

### Copy the current interactive webform for every clinic template

Rejected. Full copies would drift, multiply defects, and make shared
accessibility or output improvements expensive.

### Generate interactive forms automatically from raw template text

Deferred. The current source text does not encode enough reliable information
about control type, stable vocabulary, requiredness, conditional behavior, or
output rules. Field mapping and clinical review remain necessary.

### Replace the source template with its interactive conversion

Rejected. Removing the reviewed source would make provenance and fidelity
reviews harder and would conflate reference content with executable behavior.

### Store completed forms locally for convenience

Rejected. Hygienenote is not adopting completed-form or patient-record storage.
Automatic recovery would create retention, lifecycle, shared-device, and
privacy obligations beyond the current application.

### Publish every draft behind an unlinked route

Rejected. Unlinked static routes remain public and can be discovered. Branch
and preview deployments are the appropriate place for draft conversion work.

## Follow-Up

1. Implement the accepted
   [Recare Exam field-mapping and output specification](../specs/recare-exam-interactive-template-mapping.md).
2. Define the minimal provenance and lifecycle additions to the interactive
   template registry.
3. Choose a source revision or content-hash convention.
4. Define how draft templates are excluded from production static generation.
5. Add reciprocal source and interactive links when a conversion exists.
6. Identify the first shared sections needed by the Recare Exam pilot.
7. Create synthetic summary examples and a clinical review checklist.
8. Add a test proving that reload does not restore completed or partial form
   data.
9. Record the reviewer and reviewed source revision when the pilot advances to
   `ready`.
10. Reconfirm that each future clinic source remains non-identifying and
    approved for public distribution.
