# ADR 0001: Support Local Customizable Documentation Catalogues

- Date: 2026-07-24

## Status

Proposed

## Context

Hygienenote is a publicly deployable Next.js application and template library.
Its static-export configuration allows the application and its source
repository to be published. Clinic-specific documentation shortcuts therefore
cannot safely be treated as ordinary source code, fixtures, static assets, or
environment-independent seed data.

Current templates combine several kinds of fields:

- closed controls whose values have stable application meaning, including
  yes/no controls, periodontal activity and disease status, stage and grade,
  caries-risk level, local-anesthesia route, and other values that affect
  conditional behavior or generated-note structure;
- fields whose values vary with real-world documentation practice, including
  anesthetic products, instrumentation devices, materials, product or system
  names, aliases, abbreviations, and reusable documentation phrases;
- unrestricted narrative fields for findings, rationale, recommendations, and
  other encounter-specific details; and
- patient- or appointment-specific fields that must never become reusable
  suggestions.

Some variable fields would be faster to complete if a user could select a
previously saved value, type an unlisted value, and deliberately remember that
value for later use. Users may eventually need to edit, hide, delete, favorite,
and reorder these suggestions.

The repository currently uses `localStorage` only for the non-clinical theme
preference. It has no established browser-persistence abstraction for clinical
documentation, no IndexedDB usage, and no application-level analytics,
telemetry, or error-reporting integration. This ADR therefore establishes a
privacy and ownership boundary without selecting a browser storage API.

This decision adapts the ownership concepts from NodeDent ADR 0005 to
Hygienenote's static, public deployment model. It does not copy NodeDent's
implementation or presume that both applications need the same schema.

## Decision

### Local-first privacy boundary

User-created and clinic-created catalogue entries will initially remain in
browser-local storage on the user's device or browser profile. The later
implementation specification will choose between `localStorage`, IndexedDB, or
another browser-local API based on data volume, querying, migration, and
reliability requirements.

Catalogue data must not be:

- committed to the repository;
- bundled into the public application build;
- written into URLs or query strings;
- submitted to an API;
- included in analytics events, telemetry, or error-reporting payloads;
- synchronized to a cloud service; or
- remotely backed up automatically.

Any future remote synchronization, account-based storage, shared clinic
catalogue, or cloud backup requires a separate ADR and a dedicated privacy and
security review. Browser-local storage alone does not establish compliance with
any privacy law, professional requirement, or health-information standard.

### Vocabulary and ownership

Hygienenote will distinguish stable application-owned vocabulary from variable
documentation values.

Stable vocabulary includes field, template, and workflow identifiers; event or
action types; standardized status values; yes/no and other semantic controls;
and any value on which validation, application logic, querying, export, or
interoperability depends. These values remain application-owned and do not
automatically become editable catalogue entries.

Variable catalogue values may include product, brand, system, instrument, or
material names; reusable documentation phrases; aliases and abbreviations;
favorites; and clinic-specific documentation shortcuts. Candidate fields in
the current templates include anesthetic-product and instrumentation-device
labels. Whether any particular field is catalogue-capable must be decided
explicitly; similarity to a dropdown is not sufficient.

The current anesthetic-product control filters products by route and contains
product-linked amount defaults. Converting its labels to a catalogue would
require separate review of that existing coupling so catalogue selection does
not infer an amount. An instrumentation-device label is therefore likely a
lower-risk pilot, subject to the field audit.

The conceptual ownership layers are:

- `appCore`: stable, non-prescriptive application vocabulary;
- `seed`: generic starter suggestions safe to publish;
- `user`: browser-local user-created documentation shortcuts;
- `clinic`: clinic-owned documentation values;
- `template`: values associated with an imported or configured template.

The initial implementation need not support every ownership layer. It may begin
with generic `seed` suggestions and browser-local `user` values while preserving
the ability to represent other ownership later. A `clinic` owner is a
classification, not permission to send clinic data to a server.

### Public seeds

Hygienenote may publish a small set of generic starter suggestions when useful.
Published seeds must be non-identifying, safe for a public repository, and
presented as documentation shortcuts rather than recommendations. They must
not reproduce a clinic's private product list or internal phrases, contain
patient information, or identify private staff. Tests, examples, screenshots,
and fixtures must use synthetic values; clearly fictional staff data is
permitted only where a test requires it.

### Editable, additive catalogue-backed fields

A catalogue-capable control will use an accessible editable combobox,
autocomplete, datalist-style input, or equivalent pattern. A user must be able
to select a suggestion or enter a value absent from the catalogue. Imported,
saved, and previously used values remain valid even if they are not current
catalogue entries.

The catalogue is a suggestion layer, not a validation whitelist. Closed
vocabularies remain closed when stable meaning is required for validation,
application logic, querying, or interoperability. Existing templates need not
be rewritten immediately, and catalogue availability must never be a
prerequisite for importing or rendering an existing value.

### Explicit saving and field allowlist

Typing into a documentation field will not silently add a reusable catalogue
entry. A new value is remembered only through a clear action such as **Save to
catalogue** or **Remember this value**. Only deliberately allowlisted fields may
offer that action.

Hygienenote will not learn catalogue entries automatically from completed
notes, copied output, narrative fields, or general typing. This prevents
one-time text, typographical errors, and patient-specific content from being
suggested in later encounters.

### Patient information exclusion

Catalogues are reusable documentation vocabulary, not patient records. The
following must not intentionally be stored as catalogue entries:

- patient names or identifiers;
- dates of birth or chart numbers;
- contact details;
- individualized diagnoses or findings;
- patient-specific narrative;
- measurements tied to an identifiable encounter; or
- any value meaningful only for one patient or appointment.

Catalogue metadata must not contain patient identifiers. Catalogue-capable
fields will be allowlisted rather than inferred from all dropdowns or text
inputs.

### No clinical decision support

Catalogue entries and public seeds are documentation conveniences only.
Selecting one must not automatically infer or calculate a diagnosis, treatment
recommendation, appropriateness, product safety, dose or amount, timing, recall
interval, expiry, risk status, treatment outcome, or any other clinical
conclusion.

Any future rule-based or recommendation-producing behavior requires a separate,
source-backed ADR or specification. Existing logic-bearing fields and defaults
must not be recast as catalogue behavior merely because a nearby label becomes
customizable.

### Stable historical and exported documentation

When a suggestion is selected or custom text is entered, the displayed label or
typed text used at that moment will be copied into generated documentation and
saved form state. A live catalogue-item identifier alone is insufficient.

Renaming, hiding, deleting, reordering, or changing ownership of a catalogue
item must not alter previously generated note text, copied or exported
documentation, or saved historical form data. An identifier may be retained for
convenience, but the documentation text is snapshotted.

### Expected metadata

A future catalogue model will likely require:

- a stable internal identifier and label;
- owner and category;
- applicable template or templates;
- applicable field or fields;
- aliases;
- active or hidden status;
- favorite status and sort order;
- creation and modification timestamps; and
- optional source or version information.

This ADR does not define a TypeScript schema. Exact fields, indexes, migrations,
and versioning belong in the implementation specification. Metadata must not
contain patient identifiers.

### Management and lifecycle

The intended management experience will eventually allow users to add entries,
edit labels, hide or reactivate entries, delete entries, mark favorites, control
ordering, and see the applicable field or category. Deleting an entry removes
it from future suggestions without modifying past documentation.

Browser-local storage has material limitations:

- other people using the same browser or operating-system profile may be able to
  access catalogue data;
- clearing browser or site data may remove it;
- private or incognito browsing may not preserve it;
- data is specific to a device and browser profile; and
- browser-local storage is not automatically a durable backup.

Manual import and export may be considered later for portability and backup. An
export may contain private clinic information. It must require an intentional
user action, be clearly described as potentially sensitive, never be
automatically committed to source control, and never be uploaded by Hygienenote
without a separate approved design.

### Backwards compatibility and adoption

Catalogue support is additive. It must not require immediate rewriting of
existing templates, reject existing free-text values, change generated-note
wording without a separate decision, or make a catalogue entry a prerequisite
for importing or rendering a value.

Adoption will proceed incrementally on selected low-risk fields rather than
through repository-wide conversion.

## Rationale

This approach speeds repetitive documentation without hard-coding private
clinic data into a public application. It retains the flexibility required for
real-world terminology, keeps documentation shortcuts separate from clinical
recommendations, and prevents mutable catalogue changes from rewriting
historical output.

Explicit saving and a field allowlist reduce the risk that patient-specific or
one-time text is remembered accidentally. Ownership layers leave room for
future user-, clinic-, and template-associated catalogues without implying
remote storage or requiring every layer in the first implementation.

## Consequences

### Benefits

- Users can reuse local documentation values without publishing a private
  clinic catalogue.
- Catalogue-backed fields retain free-text flexibility.
- Historical and exported text remains stable when catalogue entries change.
- Generic, non-prescriptive seeds can remain safe for a public repository.
- Incremental adoption limits migration risk and preserves current templates.
- The ownership model can grow without weakening the initial local-only privacy
  boundary.

### Trade-offs

- Browser-local data can be lost and is specific to a device and browser
  profile.
- Shared clinic catalogues and automatic backup are not initially available.
- Duplicate, misspelled, or inconsistent labels will require management.
- Accessible catalogue management adds UI, migration, and testing complexity.
- A later migration may be required if remote synchronization is approved.
- Users sharing a browser profile may see the same local catalogue.

## Alternatives Considered

### Hard-code the clinic's actual values in the public repository

Rejected. It would publish internal clinic data, make local variation difficult,
and couple private operational vocabulary to public releases.

### Store all catalogue values in a central Hygienenote backend immediately

Deferred. It would introduce authentication, authorization, privacy, security,
retention, backup, audit, and breach-management obligations before the local
workflow is validated.

### Use closed select controls for every catalogue-backed field

Rejected. Real documentation terminology varies, and unknown imported or
historical values must remain valid.

### Automatically remember every entered value

Rejected. It could retain patient-specific text, one-time values, and
typographical errors without informed intent.

### Store only catalogue-item identifiers in documentation

Rejected. Later catalogue edits could change historical meaning or output.
Generated and saved documentation must snapshot the text used.

### Avoid catalogues entirely

Rejected. Repetitive entry remains unnecessarily slow and creates pressure to
hard-code clinic-specific lists into the public application.

## Follow-Up

Before implementation:

1. Audit existing fields and classify each as stable `appCore` vocabulary,
   catalogue-capable, unrestricted narrative, or patient-specific and never
   catalogue-capable.
2. Select one low-risk field as the first pilot.
3. Design the versioned catalogue schema and migration strategy.
4. Choose the browser-local persistence mechanism.
5. Design and accessibility-test an editable-combobox pattern.
6. Design the explicit **Save to catalogue** interaction.
7. Design management UI for editing, hiding, reactivating, deleting, favoriting,
   sorting, and showing field or category applicability.
8. Add tests proving that unknown custom values remain valid.
9. Add tests proving that renamed or deleted catalogue entries do not alter
   saved or generated documentation.
10. Review analytics, telemetry, and error-reporting code before release to
    ensure catalogue values cannot be transmitted.
11. Consider manual import and export in a separate specification.
12. Record any remote synchronization, shared storage, account-based storage,
    or cloud backup in a separate ADR with privacy and security review.
