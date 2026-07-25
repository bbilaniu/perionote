# ADR 0004: Colocate Clinical Conversions with Source Templates

- Status: Accepted
- Date: 2026-07-25
- Supersedes:
  - the user-facing placement of clinical conversions in
    [ADR 0002](0002-separate-clinic-and-interactive-template-libraries.md); and
  - the **Keep two public template libraries** placement decision in
    [ADR 0003](0003-define-interactive-template-conversion-and-provenance.md).

## Context

ADR 0002 separated clinic ClearDent source templates from HygieneNote's
interactive forms so approved EMR text would not be confused with runnable
webforms. ADR 0003 initially placed interactive conversions of those clinical
templates in the same public library as the original HygieneNote webforms.

The Recare Exam pilot makes a more useful distinction visible:

- a clinical conversion is a second way to use a specific clinic source
  template; while
- a standalone interactive form has no clinic-template source relationship.

Putting both kinds of interactive form in one list hides the provenance
relationship clinicians are most likely to care about. It also requires users
to leave the clinical workflow category to find the converted version of a
template they were just reviewing.

The source and conversion must still remain distinguishable. The ClearDent
source is approved reference text; the conversion is executable behavior with
its own mapping, lifecycle, tests, and clinical-review state.

## Decision

### Use one clinical catalogue for a source and its conversions

`/templates/clinic` becomes the **Clinical Templates** catalogue. It remains
grouped by clinical workflow and lists every approved clinic source template.

When an eligible interactive conversion exists, the same clinical-template
entry presents two explicit actions:

- **View original template**; and
- **Open interactive version**.

The original source remains available even when an interactive conversion is
ready. A conversion does not replace or silently rewrite its source.

### Nest converted forms under their source route

Clinical conversions use:

`/templates/clinic/[clinicTemplateSlug]/interactive`

For example:

`/templates/clinic/recare-exam/interactive`

The source remains at:

`/templates/clinic/recare-exam`

Source detail pages and converted-form pages link back to one another. Because
the Recare Exam conversion was still a draft when this decision was made, its
temporary development route `/templates/recare-exam` does not require a
compatibility redirect.

### Keep standalone interactive forms separate

`/templates/interactive` remains available for the original HygieneNote
webforms that are not derived from a clinic EMR template. Its user-facing name
is **Standalone Interactive Forms**.

Existing standalone detail URLs under `/templates/[templateSlug]` remain
unchanged so saved links continue to work.

This decision does not create a third top-level public library. It changes the
clinical catalogue from a source-only catalogue into a catalogue that exposes
both source and interactive modes for the same clinical workflow.

### Keep source, conversion, and standalone registries distinct

The implementation maintains separate registries:

- the clinic source registry for approved ClearDent text and clinical
  categories;
- the clinic conversion registry for derived interactive implementations,
  lifecycle, and provenance; and
- the standalone interactive registry for original HygieneNote forms.

The registries may share common types and rendering utilities, but they must
not infer source/conversion relationships from matching titles or route names.
A clinic conversion identifies its source using machine-readable provenance.

### Preserve lifecycle and build exclusion

The `draft`, `pilot`, and `ready` lifecycle defined by ADR 0003 remains in
force.

- Draft conversions are excluded from production registration and static route
  generation.
- Pilot inclusion in production remains explicit and visibly labelled.
- Ready conversions may appear beside their source in the production clinical
  catalogue.

Removing a link is not sufficient build exclusion. The eligible conversion
registry is the source for clinical-catalogue links and converted-route static
parameters.

### Preserve the remaining ADR 0003 safeguards

ADR 0003 continues to govern:

- source revision and review provenance;
- field-by-field mapping;
- in-memory-only completed-form state;
- generated-output contracts;
- avoidance of implicit clinical conclusions;
- synthetic fixtures and testing;
- accessibility review; and
- lifecycle advancement.

This ADR changes placement and registry ownership, not the clinical or privacy
requirements for a conversion.

## Rationale

Clinicians normally begin with a clinical workflow rather than with an
implementation type. Colocating the source and interactive modes makes their
relationship discoverable without presenting them as equivalent artifacts.

Explicit actions and lifecycle badges preserve the distinction that motivated
ADR 0002. Separate registries preserve the different data and rendering
requirements while allowing the user-facing catalogue to join related
artifacts through provenance.

Nested routes make source ownership visible in the URL and avoid using query
parameters or UI-only tabs as the sole distinction. They also work with the
application's static-export model.

## Consequences

### Benefits

- Clinical conversions are discoverable in the category of their source.
- Source and interactive modes link directly to one another.
- Standalone forms no longer compete with clinical conversions in one list.
- Provenance is reflected in navigation and routes as well as metadata.
- Existing standalone interactive URLs remain stable.
- Draft build exclusion continues to prevent accidental production exposure.

### Trade-offs

- The clinical catalogue must join source entries with eligible conversion
  metadata.
- A clinical template card may have more than one action.
- Route and registry tests must distinguish standalone forms from clinical
  conversions.
- Future source slug changes require deliberate route and provenance
  migration.

## Alternatives Considered

### Keep every runnable form in one interactive library

Rejected. It groups by implementation type and obscures the stronger
source/conversion relationship.

### Replace the source page with the interactive form

Rejected. This would remove the reviewed source reference and weaken
provenance and fidelity review.

### Render source and form as query-parameter tabs on one route

Rejected. Separate nested routes are clearer, linkable, testable, and a better
fit for static generation.

### Create a third converted-template library

Rejected. Converted forms belong to their source clinical workflow and do not
need another top-level catalogue.

## Follow-Up

1. Split the clinical conversion registry from the standalone interactive
   registry.
2. Move the Recare Exam conversion to
   `/templates/clinic/recare-exam/interactive`.
3. Add source and interactive actions to eligible clinical catalogue entries.
4. Add a reciprocal interactive link to the source detail page.
5. Rename the original interactive catalogue to **Standalone Interactive
   Forms**.
6. Prove that the draft Recare Exam conversion is still absent from the
   production static export.
