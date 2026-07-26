# Harmonize dropdown and combobox presentation in HygieneNote

## Goal

Inspect the HygieneNote form controls that allow users to select from a list and harmonize their visual presentation and interaction patterns.

Several controls currently appear to use different underlying implementations, which creates visible inconsistencies in:

- whether a dropdown chevron is present
- the appearance, position, and spacing of the chevron
- the closed-state field styling
- the appearance and width of the opened menu
- selected-option indicators
- focus and hover states
- native browser styling versus application styling

The objective is not to force every field to use the same underlying HTML control. The objective is to make controls with similar user-facing behaviour look and behave like members of the same design system.

## Scope and delivery boundary

This work is limited to the newer clinic interactive templates and the shared
form controls they use. The initial in-scope templates are:

- Recare Exam; and
- 2021 Adult Hygiene.

The standalone interactive templates, imported or legacy templates, catalogue
management page, and theme selector are out of scope unless the investigation
finds that a small change to a genuinely shared primitive is required. Do not
expand this work into a repository-wide form-system migration.

Implement this work in a separate branch and pull request created from the
updated main branch after the current clinical-template work is merged. Give
the visual-system changes their own screenshots, changeset, review, and
rollback boundary.

## Examples of the current inconsistency

Review the implementations corresponding to these examples:

### Dentist

The Dentist field appears to be a catalogue-backed editable control:

- the user may type a value
- saved or local suggestions may appear
- a suggestion may include metadata such as `Local`
- the control does not present the same dropdown affordance as other fields

### Premedication

The Premedication control containing:

- `Not documented`
- `Not required`
- `Required`

appears to use a fixed-choice select.

Its browser-rendered menu and indicator look different from the catalogue-backed fields.

### Patient chief concern

The Patient chief concern field displays a dropdown affordance, but its suggestion menu appears as a small light-coloured browser popup rather than matching the dark HygieneNote interface.

This may be caused by a native autocomplete or `<datalist>` implementation.

## Required investigation

Before changing code:

1. Identify the components and form-field implementations used by these controls.
2. Determine which controls are:
   - plain text inputs
   - fixed-choice selects
   - editable comboboxes
   - catalogue-backed suggestion fields
   - static editable suggestion fields
   - native datalist/autocomplete fields
3. Identify any existing shared form-control, select, combobox, catalogue, or menu components already available in the repository.
4. Prefer consolidating or extending existing components rather than creating duplicate implementations.
5. Check whether the inconsistent appearance is caused by:
   - browser-native rendering
   - duplicated field markup
   - inconsistent Tailwind classes
   - different icon or indicator implementations
   - insufficient space reserved for the dropdown affordance
   - separate desktop and mobile implementations

Before implementation, record the audit in a compact table with at least these
columns:

| Control | Current mechanism | Editable | Persistence | Target mechanism |
| --- | --- | --- | --- | --- |
| Recare and Adult Hygiene: Dentist, RDA, RDH | Catalogue-backed single-value combobox | Yes | Explicit browser-local catalogue | Shared editable-combobox interaction with catalogue adapter |
| Recare: Medical history reviewed, right and left molar occlusion, skeletal occlusion | Catalogue-backed single-value combobox | Yes | Explicit browser-local catalogue | Shared editable-combobox interaction with catalogue adapter |
| Adult Hygiene: Medical history reviewed, FMP done, Health/Gingivitis, Anesthetic, Desensitizer, Next visit | Catalogue-backed single-value combobox | Yes | Explicit browser-local catalogue | Shared editable-combobox interaction with catalogue adapter |
| Adult Hygiene: OH aids reviewed/recommended, Treatment completed today | Catalogue-backed multi-value combobox | Yes | Explicit browser-local catalogue only when Remember is used | Shared editable-combobox interaction with catalogue multi-value adapter |
| Adult Hygiene: Patient chief concern | Text input with native `<datalist>` static suggestions | Yes | None | Shared editable-combobox interaction with static-suggestion adapter |
| Recare: Premedication, Radiographs, Intraoral photos, exam statuses, CPAP, occlusal-splint statuses, orthodontic history, retainers, removable dentures | Native fixed-choice select | No | Encounter state only | Shared fixed-choice select presentation |
| Adult Hygiene: Premedication, Choice-with-Other selectors, night-guard statuses, orthodontic history, retainers | Native fixed-choice select | No | Encounter state only | Shared fixed-choice select presentation |
| Patient ID, Miele codes, details, Other fields, dates, and unrestricted text | Plain input or textarea | Yes where applicable | Encounter state only | Shared plain-control visual shell with no dropdown affordance |

This audit found three underlying causes:

- Recare Exam and Adult Hygiene duplicate their fixed-select and input styling;
- catalogue single-value and multi-value controls duplicate listbox interaction
  code; and
- Patient chief concern delegates its popup and theme to the browser through a
  native `<datalist>`.

The target mechanisms above cover every in-scope list-opening control. They
preserve each field's clinical meaning, editability, and persistence while
sharing presentation and interaction behaviour.

## UX rules

Apply the following behavioural rules consistently:

### Controls that open a list

A control that can open a selectable list should consistently communicate that capability.

This includes:

- fixed-choice selects
- editable comboboxes
- catalogue-backed inputs with suggestions

The presence, placement, visual weight, alignment, and interactive behaviour of the dropdown affordance should be consistent across applicable fields.

Do not prescribe a particular technical method for rendering the chevron or dropdown indicator. Inspect the existing project conventions and choose the implementation that produces the most maintainable and accessible result.

Do not assume that the indicator must be:

- browser-native
- an SVG
- a Lucide icon
- a text character
- a CSS pseudo-element

The implementation decision should follow the existing architecture and browser-support requirements.

### Plain text fields

Plain text inputs that do not open a list should not display a dropdown affordance.

### Fixed-choice fields

Fields such as Premedication must remain restricted to their predefined options.

Do not accidentally allow arbitrary user-entered values in fixed-choice fields.

### Catalogue-backed editable fields

Fields such as Dentist may continue to support both:

- entering a value
- selecting an existing local or seeded catalogue value

Preserve the current catalogue behaviour, persistence behaviour, and distinction between local and seeded values.

### Static editable suggestion fields

Patient chief concern may continue to support both arbitrary text and
application-provided suggestions. It must remain a static suggestion field:

- do not make it catalogue-backed;
- do not add browser-local persistence;
- do not show Remember, Local, Starter, favorite, hide, or catalogue-management
  affordances; and
- do not write its values to catalogue storage.

Reuse a shared presentation and interaction layer where appropriate, while
keeping the static-suggestion and catalogue data sources separate.

### Browser-native controls

It is acceptable for an opened operating-system picker to retain some platform-specific appearance when a native select is intentionally preserved.

However, the closed-state control should still fit the shared HygieneNote design system as closely as reasonably possible.

If a native `<datalist>` or similar browser-provided popup prevents the Patient chief concern field from meeting the desired visual and interaction consistency, consider replacing that implementation with the same accessible editable-combobox interaction layer used by catalogue-backed controls. Reuse only the presentation and interaction behaviour, not catalogue persistence or management semantics.

Do not replace native controls unnecessarily when the same result can be achieved through a smaller, maintainable change.

Visual consistency applies primarily to the closed controls and to menus
rendered by the application. An intentionally native select may retain a
platform-specific opened menu.

## Shared visual treatment

Harmonize applicable controls around a shared form-field treatment, including:

- control height
- border radius
- border colour
- background colour
- text colour
- placeholder colour
- horizontal padding
- space reserved for the dropdown affordance
- focus-visible treatment
- disabled treatment
- error treatment
- hover treatment
- label spacing
- indicator alignment
- open and closed states
- placeholder text (for wording such as "Type or choose a dentist")

Avoid field-specific one-off spacing values unless the field has a documented reason to differ.

The dropdown affordance must not:

- overlap entered text
- shift when the value changes
- appear at inconsistent distances from the right edge
- disappear solely because the field supports typing
- be duplicated by both a native indicator and an application-provided indicator

## Menu and suggestion-panel consistency

Where the application controls the opened menu or suggestion panel, harmonize:

- menu width with the associated field
- horizontal alignment
- vertical offset
- background and border treatment
- corner radius
- shadow
- maximum height
- scrolling behaviour
- option padding
- option height
- hover state
- keyboard-focused state
- selected state
- selected-option indicator
- empty-results state
- local or seeded metadata presentation
- z-index and clipping behaviour

Catalogue metadata such as `Local` should remain visually secondary to the option label.

Do not allow a custom suggestion panel to be clipped by a parent container or hidden behind adjacent fields.

## Accessibility and keyboard interaction

Preserve or improve accessibility.

For editable comboboxes and catalogue-backed suggestion fields, verify support for:

- keyboard focus
- opening the suggestion list
- Arrow Up and Arrow Down navigation
- Enter to select
- Escape to close
- appropriate focus retention
- an accessible name derived from the field label
- correct expanded and collapsed state
- correct association between the input and suggestion list
- visible keyboard focus
- screen-reader-compatible option and selected states

Do not add ARIA attributes that conflict with native semantics.

Where the repository already uses an accessible component primitive, prefer using that primitive instead of recreating combobox keyboard behaviour manually.

## Pointer, touch, and closing behaviour

For application-controlled list-opening fields, define and verify:

- clicking or tapping the dropdown affordance opens the list;
- clicking or tapping an option selects it without unexpected focus loss;
- clicking or tapping outside closes the list;
- Escape closes the list and returns focus predictably;
- the affordance remains a usable touch target;
- an empty filtered result has an explicit, accessible state; and
- opening one list does not leave an unrelated list open.

Do not weaken the existing keyboard behaviour while adding pointer or touch
behaviour.

## Responsive behaviour

Verify the harmonized controls at:

- narrow mobile width
- tablet width
- desktop width

Pay particular attention to Safari, Playwright WebKit, and touch-oriented
layouts because the current discrepancies may involve browser-native
rendering. Chromium remains the primary supported and blocking browser because
it reflects the browsers used in most workspaces. WebKit compatibility is an
advisory, non-breaking, lower-priority signal for this first harmonization:

- add a Playwright WebKit project and an explicit command for running it;
- keep the primary end-to-end script and required CI validation explicitly
  targeted at the Chromium project;
- add a separate advisory WebKit script or command rather than adding WebKit
  to the required default test path;
- do not weaken or skip Chromium coverage to make WebKit pass;
- report WebKit failures or missing browser support without making them block
  the initial pull request or release; and
- distinguish Playwright WebKit validation from any manual Safari inspection.

Ensure that:

- the dropdown affordance remains visible
- the value does not run underneath it
- menus remain within the viewport
- tap targets remain usable
- long catalogue values truncate or wrap predictably
- labels and metadata do not collide

## Constraints

- Do not change the clinical meaning of any field.
- Do not rename persisted field keys.
- Do not remove existing import or export compatibility.
- Do not change catalogue storage semantics.
- Do not remove user-created catalogue values.
- Do not introduce catalogue-storage writes for static suggestion fields.
- Do not turn fixed-choice fields into free-text fields.
- Do not add new dependencies unless the existing component system cannot support the required behaviour.
- Do not prescribe or document one mandatory technical method for drawing the chevron.
- Avoid a large form-system rewrite when shared styling or a small component extraction is sufficient.
- Preserve the current dark theme.
- Preserve generated clinical-note output byte-for-byte for existing fixtures.
- Preserve form reset, demo loading, copy validation, and navigation-warning
  behaviour.
- Avoid unrelated formatting or refactoring changes.

## Suggested implementation approach

Use the repository structure to determine the final implementation, but consider the following sequence:

1. Complete and record the control audit table.
2. Create or identify a shared visual shell for form controls.
3. Apply that shell to:
   - plain text inputs
   - fixed-choice selects
   - editable catalogue comboboxes
   - editable static-suggestion comboboxes
4. Establish a shared presentation and interaction contract for editable
   comboboxes, with separate adapters for catalogue-backed and static
   suggestions.
5. Establish a shared contract for controls that open lists.
6. Standardize the space and alignment allocated to their dropdown affordance.
7. Reuse the same menu presentation for application-controlled suggestion
   fields where practical.
8. Replace browser-provided suggestion UI only where it is preventing meaningful consistency or accessibility.
9. Keep behavioural differences explicit:
   - text input
   - fixed select
   - editable catalogue combobox
   - editable static-suggestion combobox
10. Remove duplicated or contradictory styling after the shared implementation is working.

## Acceptance criteria

The work is complete when:

1. All in-scope controls that open a selectable list consistently display a dropdown affordance in their closed state.
2. Plain text-only inputs do not display that affordance.
3. The affordance is consistently aligned and does not overlap field text.
4. There are no controls showing both a native and application-provided dropdown indicator.
5. Dentist and other catalogue-backed fields remain editable and continue to show reusable suggestions.
6. Fixed-choice fields remain limited to their configured values.
7. Patient chief concern no longer presents a visually isolated browser popup,
   remains editable, and does not gain catalogue persistence or catalogue
   management controls.
8. Application-controlled menus match the HygieneNote dark theme and align with the associated field.
9. Keyboard navigation continues to work.
10. Focus, error, disabled, hover, open, and selected states remain visually clear.
11. Existing saved data, local catalogue entries, imports, exports, and field names remain compatible.
12. The controls remain usable on mobile, tablet, and desktop layouts.
13. Relevant automated tests pass.
14. New or updated tests cover the shared behaviour rather than only snapshotting incidental markup.
15. Existing synthetic fixtures generate byte-for-byte identical clinical-note
    output.
16. Form reset, demo loading, copy validation, and navigation warnings retain
    their existing behaviour.
17. Chromium remains the required compatibility gate. A Playwright WebKit
    project and explicit command exist, with WebKit results treated as
    advisory and non-blocking for the initial pull request.

## Validation

Run the relevant non-destructive validation available in the repository, including as applicable:

- formatting
- linting
- TypeScript checking
- unit tests
- component tests
- integration tests
- production build

Add or update tests for:

- indicator presence on list-opening controls
- indicator absence on plain text fields
- fixed-choice selection
- editable catalogue selection
- arbitrary text entry where permitted
- keyboard opening, navigation, selection, and closing
- pointer and touch opening, selection, outside-click closing, and empty results
- preservation of local catalogue metadata
- absence of catalogue-storage writes for static suggestions
- absence of duplicate dropdown indicators
- unchanged generated output for the existing synthetic fixtures
- unchanged reset, demo, copy-validation, and navigation-warning behaviour

Run the Chromium Playwright project as required validation. Add and run the
WebKit project separately as an advisory compatibility check; a WebKit failure
must be reported but does not block the initial work. Manually inspect the
affected screens at representative narrow and wide viewport sizes. Perform a
manual Safari check when that environment is available, without treating
Playwright WebKit as proof of complete Safari compatibility.

## Deliverable

Implement the harmonization and provide a concise summary containing:

1. the underlying causes of the inconsistent controls
2. the components changed or introduced
3. which behaviours remain intentionally different
4. any remaining browser-native limitations
5. tests and validation performed
6. Chromium results and any advisory WebKit findings
7. screenshots or a description of the resulting states, when the development environment supports them
