# Request: Recare Exam Local Catalogue Pilot Proposal

- Status: Implemented
- Date: 2026-07-25
- Approved: 2026-07-25
- Implemented: 2026-07-25
- Pilot template: `recare-exam`
- Governing decision:
  [ADR 0001: Support Local Customizable Documentation Catalogues](../adr/0001-support-local-customizable-documentation-catalogues.md)
- Related specification:
  [Recare Exam Interactive Template Mapping](../specs/recare-exam-interactive-template-mapping.md)

## Goal

Implement the first local catalogue pilot in the interactive Recare Exam
template. The pilot should make repetitive values faster to enter without
hard-coding private clinic information into the public build, restricting
users to a closed list, or storing completed and partial forms.

This proposal turns six currently editable Recare Exam fields into
catalogue-backed editable fields:

| Section | Field | Initial public seeds |
| --- | --- | --- |
| Visit Team | Dentist | None |
| Visit Team | RDA | None |
| Visit Team | RDH | None |
| Clinical Exam | Left molar occlusion | `Cl I`, `Cl II`, `Cl III` |
| Clinical Exam | Right molar occlusion | `Cl I`, `Cl II`, `Cl III` |
| Clinical Exam | Skeletal occlusion | `Cl I`, `Cl II`, `Cl III` |

The seed labels above preserve the requested `Cl I`, `Cl II`, and `Cl III`
wording. Changing them to `Class I`, `Class II`, and `Class III` would be a
separate content decision.

## Background

The Recare Exam pilot currently uses unrestricted text inputs for Dentist, RDA,
RDH, right molar occlusion, left molar occlusion, and skeletal occlusion. This
preserves flexibility, but requires users to repeatedly type values that are
often reused.

ADR 0001 permits selected fields to offer local reusable suggestions when:

- the field is explicitly allowlisted;
- users can still type values that are not in the catalogue;
- saving a new value is a deliberate action;
- patient- and appointment-specific values are excluded;
- generated documentation snapshots the selected text;
- private values remain in browser-local storage; and
- catalogue values are not transmitted or included in the public build.

The Recare Exam is a suitable pilot because it already identifies its three
provider fields as `catalogue-later`, and its occlusion fields are editable
without any application logic depending on their exact text.

## Proposed Scope

### In scope

- Catalogue-backed editable fields for the six listed Recare Exam controls.
- Generic public seeds for the three occlusion fields.
- Explicitly remembered browser-local provider and occlusion values.
- A versioned browser-local persistence model for catalogue data only.
- A catalogue management page.
- Adding, selecting, editing, hiding, reactivating, deleting, favoriting, and
  ordering locally remembered values.
- Hiding, reactivating, favoriting, and ordering public seeds.
- Accessible keyboard and screen-reader behavior.
- Graceful fallback when browser-local storage is unavailable or invalid.
- Intentional manual export and import for transferring catalogue values to
  another computer or browser profile.
- Focused unit and browser tests.

### Out of scope

- Saving completed or partial Recare Exam forms.
- Automatically learning values from typing, copied notes, demo data, or
  completed forms.
- Publishing real staff names or clinic-specific values in the repository.
- Patient-specific catalogue entries.
- Accounts, permissions, remote APIs, synchronization, cloud backup, or
  automatic cross-device sharing.
- EMR integration.
- Converting every compatible field in every interactive template.
- Turning catalogue suggestions into clinical recommendations or validation
  rules.

## Field Audit and Catalogue Grouping

The six form fields should be allowlisted explicitly. They should be backed by
five catalogue groups:

| Catalogue key | Recare Exam fields | Public seeds | Locally remembered values |
| --- | --- | --- | --- |
| `visit-team.dentist` | Dentist | None | Yes |
| `visit-team.rda` | RDA | None | Yes |
| `visit-team.rdh` | RDH | None | Yes |
| `clinical-exam.molar-occlusion` | Left molar occlusion; Right molar occlusion | `Cl I`, `Cl II`, `Cl III` | Yes |
| `clinical-exam.skeletal-occlusion` | Skeletal occlusion | `Cl I`, `Cl II`, `Cl III` | Yes |

Dentist, RDA, and RDH remain separate because their suggestions represent
different roles. The right and left molar fields share one catalogue because
the requested starter vocabulary is symmetrical and a user should not need to
save the same molar classification twice. Skeletal occlusion remains a
separate catalogue even though its first seeds are identical, because it has a
different clinical meaning and may need different values later.

The form fields continue to store plain text. Catalogue keys and item
identifiers do not become part of the generated note contract.

## Ownership and Seed Rules

### Public seed values

The following non-identifying values may ship in the public application:

- `Cl I`
- `Cl II`
- `Cl III`

They are documentation shortcuts, not findings, defaults, recommendations, or
claims that a classification applies. No seed is preselected.

Seed entries should have stable application-defined identifiers. Users may
hide, reactivate, favorite, and reorder seeds locally. Seed labels should not
be edited or deleted from the application definition. Hiding a seed only
removes it from that browser profile's future suggestions.

### Local user values

Values deliberately remembered by the user have `user` ownership and stay in
the current browser profile. This includes real provider names or initials and
additional occlusion wording.

User entries may be edited, hidden, reactivated, deleted, favorited, and
reordered. Editing or deleting an item affects only future suggestions. It
must not alter text already present in a form or previously copied into an
EMR.

The first implementation should not assign `clinic` ownership. Without
accounts, shared storage, or permissions, a `clinic` label could incorrectly
imply that a value is available to the whole clinic. Shared clinic ownership
can be added only after its storage and sharing behavior is defined.

## Field Interaction

### Editable combobox

Each allowlisted field should use an accessible editable combobox:

- the current value remains an ordinary editable string;
- focusing or opening the control shows applicable active suggestions;
- typing filters suggestions without changing the catalogue;
- selecting a suggestion copies its current label into the form field;
- typing a value absent from the catalogue remains valid;
- clearing the field does not delete or hide a catalogue entry; and
- catalogue loading or storage failure never prevents free-text entry.

Suggested ordering:

1. favorites in user-defined order;
2. other locally remembered entries in user-defined order;
3. remaining public seeds in their defined order.

The list may visually distinguish local values from starter suggestions, but
the distinction must not make public seeds look clinically preferred.

### Explicit remembering

Typing must never save a suggestion automatically. When a non-empty typed value
does not already exist in the applicable catalogue, the control should offer a
clear action such as:

`Remember this value`

Activating the action should:

1. trim leading and trailing whitespace;
2. show that the value will be stored only in this browser profile;
3. save it only to the field's allowlisted catalogue;
4. leave the current form value unchanged; and
5. confirm success without moving focus unexpectedly.

Demo values must never be remembered automatically. Loading the synthetic demo
must produce no catalogue writes.

Values should be compared after trimming, Unicode normalization, and
case-insensitive matching to prevent accidental duplicates. The first saved
label's capitalization should be preserved. If an equivalent hidden item
already exists, the UI should offer to reactivate it rather than create a
duplicate.

### Provider requirements

The current copy prerequisite remains unchanged:

- Patient ID is required; and
- at least one of Dentist, RDA, or RDH must be filled.

Selecting or typing a provider satisfies the same requirement as the current
text input. A saved catalogue entry does not satisfy the requirement unless it
is selected into the current form.

Provider fields ship with no public suggestions. Real staff names, initials,
or aliases appear only after a user deliberately remembers them locally.

### Occlusion and N/A

The existing independent N/A controls remain stable `appCore` behavior and
stay outside the catalogues.

- `N/A` is not a seed and cannot be added as a catalogue action by the
  application.
- Selecting N/A continues to clear and disable the associated text field.
- Clearing N/A restores the editable catalogue-backed field without selecting
  a suggestion.
- Selecting a catalogue suggestion clears N/A if necessary.
- No occlusion seed is selected when the page loads or the form is reset.

The generated note wording remains unchanged. For example, selecting `Cl II`
for the right molar field produces the same output as manually typing `Cl II`
today.

### Reset and navigation

Resetting the Recare Exam continues to clear only the encounter form and
refresh the Note started timestamp after confirmation. It must not clear,
change, or reorder catalogue data.

Reloading, leaving, or returning to the form continues to discard the
encounter form. Deliberately remembered catalogue values remain available
because they are separate reusable preferences, not completed-form storage.
The existing unload warning behavior for a started form remains unchanged.

## Catalogue Management Page

Add a dedicated `Catalogues` page linked from the application header. A route
such as `/catalogues` is recommended. It is a management surface, not a third
template library.

The page should:

- explain that values are stored only in the current browser profile;
- warn that clearing site data may remove them;
- group catalogues by **Visit Team** and **Clinical Exam**;
- show the field or fields to which each catalogue applies;
- distinguish starter suggestions from locally remembered values;
- add a local item to an allowlisted catalogue;
- edit local item labels;
- hide and reactivate local items and seeds;
- delete local items after confirmation;
- favorite and unfavorite items;
- change their suggestion order;
- provide a confirmed **Reset local catalogues** action;
- provide deliberate **Export catalogue** and **Import catalogue** actions;
  and
- state clearly that resetting catalogues does not clear an open form.

Deleting an entry should require confirmation when it is the only local copy
of that label. Resetting all local catalogues is destructive and should always
require confirmation. Reset should remove user-created items and local
preferences, restoring the visible public seeds.

Import and export should be implemented only after the catalogue controls,
storage, management, and privacy behavior are stable. They are the final phase
of this pilot rather than a prerequisite for the first catalogue-backed form.

## Manual Import and Export

Manual transfer allows a user to prepare a catalogue on one computer and
deliberately reuse it on another computer, including sharing it with another
authorized user such as a spouse or colleague. It does not introduce an
account, background synchronization, or an application server.

### Export

The management page should provide an **Export catalogue** action. Before
downloading, the UI must explain that the file may contain private staff names
and clinic-specific documentation shortcuts.

Export should:

- require an explicit user action;
- create a local JSON file using the browser's download mechanism;
- include the schema version, export format version, export timestamp, local
  user entries, and public-seed preferences;
- exclude public seed definitions that can be restored from the application;
- exclude completed and partial forms, Patient ID, Note started, findings,
  measurements, treatment choices, copied notes, and theme preferences;
- make no network request; and
- use a recognizable filename such as
  `hygienenote-catalogue-2026-07-25.json`.

The first version should use readable JSON rather than encryption. The warning
must therefore tell the user to treat the file as private clinic information,
store and transfer it securely, and delete extra copies when they are no
longer needed. Encryption or password-protected exports can be evaluated later
if the added recovery and usability complexity is justified.

### Import

The management page should accept only a file deliberately selected by the
user. Selecting a file must not modify catalogue data immediately.

Import should:

1. read the file locally with the browser File API;
2. reject files larger than 1 MiB before parsing;
3. parse and validate the entire document;
4. reject unknown future formats, unsupported schema versions, invalid
   catalogue keys, malformed identifiers, and invalid records;
5. show a preview containing item counts by catalogue and any conflicts;
6. let the user choose **Merge with this catalogue** or
   **Replace this catalogue**; and
7. require confirmation before applying either operation.

No imported value may become a form value automatically.

**Merge** should be the recommended default. It should add missing valid
entries and avoid duplicates using the same trimmed, Unicode-normalized,
case-insensitive comparison used by **Remember this value**. Existing local
labels and ordering should win when an equivalent item already exists.
Favorite status may be combined so an item favorited in either source remains
favorite. Existing local hidden/active status should win.

**Replace** is intended for reproducing the exported catalogue on a new
computer. It should remove the current browser profile's user entries and seed
preferences, then apply the validated import. Because this can discard local
catalogue work, it requires a stronger confirmation that states the number of
local items being replaced.

If parsing, validation, migration, confirmation, or storage writing fails, the
existing local catalogue must remain unchanged. Applying an import should be
an atomic repository operation from the UI's perspective.

### Transfer boundary

Hygienenote should never upload, email, synchronize, inspect remotely, or
automatically discover catalogue export files. The user controls how the file
is transferred. An export file must not be placed automatically in the
repository, application build, or a cloud location.

## Recommended Persistence Design

### Storage choice

Use `localStorage` for the first catalogue pilot.

Reasons:

- the pilot contains a small number of short strings and simple preferences;
- it does not need indexes, transactions, binary values, or large queries;
- localStorage is already used for the non-clinical theme preference;
- synchronous reads are sufficient when isolated behind a client-only
  catalogue repository; and
- a versioned abstraction can later migrate to IndexedDB without changing form
  controls or generated-note behavior.

The implementation must access localStorage only in the browser. Server
rendering and static export must not depend on stored catalogue values.

Recommended storage key:

`hygienenote.catalogues.v1`

Only catalogue data belongs under this key. Form state, Patient ID, Note
started, findings, measurements, treatment choices, and copied output must
never be written to it.

### Versioned envelope

A minimal first schema could follow this shape:

```ts
type CatalogueKey =
  | "visit-team.dentist"
  | "visit-team.rda"
  | "visit-team.rdh"
  | "clinical-exam.molar-occlusion"
  | "clinical-exam.skeletal-occlusion";

type UserCatalogueItem = {
  id: string;
  catalogueKey: CatalogueKey;
  label: string;
  hidden: boolean;
  favorite: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type SeedPreference = {
  seedId: string;
  hidden: boolean;
  favorite: boolean;
  sortOrder: number;
};

type StoredCatalogueStateV1 = {
  schemaVersion: 1;
  userItems: UserCatalogueItem[];
  seedPreferences: SeedPreference[];
};

type CatalogueExportV1 = {
  format: "hygienenote-catalogue";
  formatVersion: 1;
  exportedAt: string;
  catalogueState: StoredCatalogueStateV1;
};
```

Public seed definitions should remain in source code because they are generic
application data. Browser storage should contain only local user entries and
local preferences that override seed visibility or ordering.

The runtime should merge public seed definitions with valid stored data. It
must reject unknown catalogue keys and malformed records without rendering
unsafe values or breaking the form.

### Repository boundary

All storage access should pass through one catalogue repository module. Form
components should request catalogue data and actions through a small client
API rather than call `window.localStorage` directly.

The repository should provide operations such as:

- list active suggestions for a catalogue;
- add a user item;
- update a user item;
- hide or reactivate an item;
- delete a user item;
- toggle favorite;
- reorder items; and
- reset local catalogue state.

This boundary makes validation, migrations, failure handling, tests, and a
future storage change easier to control.

### Failure and migration behavior

- Missing storage starts with public seeds and no user values.
- Blocked or unavailable storage leaves the combobox usable as free text and
  continues to show in-memory public seeds.
- Malformed stored data must not crash a template.
- Unknown future schema versions must not be overwritten silently.
- Supported older versions should migrate through explicit, tested migration
  functions.
- A storage write failure should show a concise local error and leave the
  current form value intact.
- Export validation should reuse the stored-state validator rather than
  serialize arbitrary localStorage content.
- Import migrations and storage migrations should use the same validated
  catalogue-state boundary.
- Catalogue values must never be printed to console logs or included in error
  messages sent outside the browser.

Cross-tab live synchronization is optional for this pilot. A newly loaded page
must always read the latest valid browser-local catalogue.

## Privacy and Security Requirements

Provider names and clinic-specific shortcuts are private operational data even
when they are not patient information. They must:

- remain in the current browser profile;
- never be committed to source code, fixtures, snapshots, screenshots, or
  public seeds;
- never appear in URLs or route parameters;
- never be submitted to an API;
- never be included in analytics, telemetry, or remote error reports; and
- never be inferred from completed-form values.

Manual export is the sole exception to browser-profile confinement. It copies
catalogue data into a user-requested local file without transmitting it.
Import reads a user-selected local file without uploading it. The application
must not retain file paths, recently imported file contents, or additional
backup copies.

The UI must explain:

- other people using the same browser or operating-system profile may see the
  same catalogue;
- a different device, browser, or browser profile will not automatically have
  the same values;
- private or incognito mode may not preserve values; and
- clearing browser site data may delete the catalogue; and
- an exported file may contain private staff and clinic information and must
  be handled securely by the user.

The pilot does not claim compliance with privacy or health-information laws.
It maintains the narrower ADR 0001 boundary: reusable catalogue data is local,
while completed forms remain in memory only.

## Generated Documentation Contract

Catalogue support must not change the summary builder's output rules.

When a suggestion is selected, the selected label is copied into the existing
plain-text form field. The generated note uses that text snapshot. It does not
look up the catalogue item again.

Therefore:

- renaming a catalogue item does not change a value already selected into an
  open form;
- hiding or deleting an item does not clear an open form;
- copied output never depends on a live catalogue item identifier; and
- an unknown imported or manually typed value remains valid.

No catalogue selection may infer N/A, a diagnosis, treatment, measurement,
recommendation, or another field value.

## Accessibility Requirements

The editable combobox should follow the WAI-ARIA combobox interaction pattern
or use an equivalently accessible native approach.

At minimum:

- every field retains a visible label;
- the input exposes whether its suggestion popup is expanded;
- Arrow Up and Arrow Down move through suggestions;
- Enter selects the active suggestion;
- Escape closes the popup without clearing typed text;
- Tab preserves normal form navigation;
- screen readers receive the active option and result count;
- **Remember this value** is keyboard accessible and has an unambiguous name;
- favorites, seed status, and hidden status are not communicated by color
  alone; and
- validation for the required provider group continues to focus and describe
  the first unresolved error correctly.

The management page must support all operations without drag-and-drop. If
drag-and-drop ordering is offered, equivalent **Move up** and **Move down**
buttons are required.

## Testing Proposal

### Unit tests

- Public seeds merge with an empty stored catalogue.
- Left and right molar fields resolve the same shared catalogue.
- Skeletal occlusion resolves a distinct catalogue.
- Provider catalogues contain no public seeds.
- Adding requires an allowlisted catalogue key and a non-empty normalized
  label.
- Case and whitespace variants do not create duplicates.
- A hidden matching item is reactivated rather than duplicated.
- Editing, hiding, reactivating, deleting, favoriting, and ordering behave
  deterministically.
- Seed preferences do not mutate public seed definitions.
- Invalid records and unsupported schema versions fail safely.
- Storage failures do not alter current form values.
- Reset removes user entries and restores default seed visibility and order.
- Export contains only the validated catalogue envelope.
- Import rejects malformed, oversized, or unsupported files without changing
  local data.
- Merge adds missing entries, deduplicates normalized labels, and preserves
  defined local conflict winners.
- Replace reproduces the validated exported catalogue state.
- A failed import write leaves the previous catalogue unchanged.

### Recare Exam summary tests

- Selecting a provider suggestion produces the same output as typing its
  label.
- Selecting each occlusion seed produces the existing expected note wording.
- Renaming or deleting a catalogue entry does not change text already selected
  into the form.
- Unknown custom values continue to render unchanged.
- N/A remains explicit and independent from catalogue entries.

### Playwright tests

- The six fields expose the intended editable suggestion behavior.
- Provider fields start with no public suggestions.
- Occlusion fields show the requested seeds and no preselection.
- A custom value is not saved by typing alone.
- **Remember this value** persists a value across a reload.
- Encounter form values still do not persist across a reload.
- Demo loading creates no catalogue entries.
- Resetting the form preserves catalogue entries.
- Resetting local catalogues requires confirmation and restores public seeds.
- Hidden seeds disappear from suggestions and can be reactivated.
- Keyboard selection and management controls work without a pointer.
- The application remains usable when localStorage access throws.
- Export downloads catalogue data without form or theme data.
- Import preview does not change catalogue data.
- Merge and confirmed replace produce the documented results.
- Cancelling import or replace leaves the catalogue unchanged.
- No catalogue operation causes a network request.

Tests and demo fixtures must use clearly synthetic providers. Real clinic
values must never enter the repository or Playwright artifacts.

## Rollout Plan

### Phase 1: Approve the implementation boundary

- Review and accept this proposal.
- Confirm the exact `Cl I`, `Cl II`, and `Cl III` seed spelling.
- Advance ADR 0001 from `Proposed` to `Accepted` when the catalogue direction
  is approved.
- Update the Recare Exam mapping so the six fields are classified as
  catalogue-backed rather than `catalogue-later` or unrestricted text.

### Phase 2: Build the catalogue foundation

- Add catalogue definitions and the five-key allowlist.
- Add the versioned browser-local repository and validation.
- Add seed merging, user-item operations, and failure handling.
- Add unit tests before connecting form fields.

### Phase 3: Integrate the Recare Exam

- Add the reusable accessible editable-combobox control.
- Convert Dentist, RDA, RDH, and the three occlusion fields.
- Preserve the current form data type and summary output contract.
- Preserve N/A, reset, unload warning, copy validation, and in-memory form
  behavior.

### Phase 4: Add management and pilot review

- Add the dedicated Catalogues management page.
- Add privacy and browser-profile limitations to the UI.
- Complete keyboard, screen-reader, failure, and browser testing.
- Review the pilot using synthetic values.

### Phase 5: Add manual portability

- Add the versioned JSON export envelope and local download.
- Add local file validation and import preview.
- Add confirmed merge and replace workflows.
- Verify that transfer creates no network requests and includes no form data.
- Test moving a synthetic catalogue to a clean browser profile.
- Keep the Recare Exam lifecycle at `pilot` until catalogue behavior receives
  functional and clinical approval.

## Acceptance Criteria

- Exactly the six approved Recare Exam fields are catalogue-backed.
- The implementation uses five catalogue groups, with one shared molar
  catalogue for the left and right fields.
- Dentist, RDA, and RDH ship with no real or synthetic public suggestions.
- Molar and skeletal occlusion offer `Cl I`, `Cl II`, and `Cl III` as
  non-preselected public seeds.
- All six fields remain editable and accept unlisted values.
- New values are stored only after an explicit **Remember this value** action.
- Only valid allowlisted fields can save catalogue entries.
- Provider-group copy validation behaves exactly as before.
- N/A remains an explicit separate action and is never inferred.
- Form reset and navigation do not modify catalogue data.
- Catalogue management does not modify an open form or historical output.
- Completed and partial form data remain in memory only.
- The application persists catalogue data only in browser-local storage and
  transfers it only through an explicit local import or export.
- Public source, fixtures, tests, screenshots, and build output contain no real
  staff or clinic-specific values.
- Generated-note wording is unchanged.
- Unknown custom values remain valid.
- The catalogue page clearly explains local-only storage and loss/sharing
  limitations.
- A user can deliberately export the catalogue to a versioned local JSON file
  and import it on another computer or browser profile.
- Export includes catalogue data only and clearly warns that the file may
  contain private clinic information.
- Import validates and previews the complete file before making changes.
- Import supports a deduplicating merge and a separately confirmed replace.
- Cancelled, invalid, unsupported, or failed imports leave local data
  unchanged.
- Import and export make no network requests.
- Catalogue behavior is usable with keyboard and assistive technology.
- Storage unavailability does not prevent completion or copying of a Recare
  Exam note.

## Risks and Trade-offs

- Staff lists will not automatically appear on another device or browser
  profile.
- Users sharing one browser profile may see the same locally remembered staff
  values.
- Clearing site data can remove the catalogue.
- Export improves portability but creates a plaintext file that the user must
  store and transfer securely.
- Merge and replace add validation and conflict-resolution complexity at the
  end of the pilot.
- A management page and accessible combobox add more code than a closed select,
  but preserve the flexibility required by ADR 0001.
- `localStorage` is intentionally simple for the pilot and may require a later
  migration if catalogue volume or querying grows.
- Shared molar suggestions reduce duplication but intentionally couple the
  left and right suggestion lists.
- Keeping skeletal occlusion separate duplicates three seed definitions but
  prevents two clinically distinct catalogues from becoming inseparable.

## Recommendation

Proceed with the Recare Exam as the first ADR 0001 catalogue pilot using:

- three private, unseeded provider catalogues;
- one shared molar-occlusion catalogue;
- one separate skeletal-occlusion catalogue;
- the exact public seeds `Cl I`, `Cl II`, and `Cl III`;
- accessible editable comboboxes with explicit remembering;
- a dedicated Catalogue management page;
- versioned localStorage persistence behind a repository abstraction;
- final-phase manual JSON import/export with validated merge and replace; and
- no change to completed-form storage or generated-note wording.

This is narrow enough to validate the catalogue architecture while exercising
both important cases: private clinic-specific values and safe public starter
suggestions. The final portability phase lets another authorized user reuse
the catalogue on a new computer without introducing accounts or remote
storage.
