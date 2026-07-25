# ADR 0002: Separate Clinic and Interactive Template Libraries

- Status: Accepted
- Date: 2026-07-24

## Context

HygieneNote originally exposed every runnable webform from a single
`/templates` browser. The clinic also has an established set of ClearDent
progress-note templates. Those notes are useful as clinical references and
copyable source material, but they are not interactive HygieneNote forms.

Putting both types in one undifferentiated list would blur the distinction
between current EMR content and webforms under active development.

The proposed clinical menu groups the ClearDent notes under:

- Hygiene
  - Adult Hygiene
  - Periodontal Maintenance/Re-evaluation
  - Child and Adolescent Hygiene
- Exams and adjuncts
  - Recare/Periodic Exam
  - Emergency/Limited Exam
  - TMJ/TMD Assessment
  - Local Anesthesia Addendum
  - Treatment/Referral Addendum

## Decision

`/templates` is the template-library landing page and offers two destinations:

- `/templates/clinic` for the clinic's existing ClearDent EMR templates
- `/templates/interactive` for runnable HygieneNote webforms

Clinic templates receive their own static detail pages under
`/templates/clinic/[clinicTemplateSlug]`. Existing interactive detail URLs
remain under `/templates/[templateSlug]` so saved links continue to work.

The clinic library preserves the supplied template text and displays ClearDent
field markers with a legend. Display titles may be made more readable, while
the original ClearDent title remains visible on the detail page.

Categories from the proposed menu remain visible even when no source template
has been supplied. An empty category must not be populated with invented
clinical text.

## Consequences

- Visitors can distinguish established clinic notes from interactive forms.
- The clinic menu can grow without changing the interactive template registry.
- Current interactive template bookmarks remain valid.
- A template's category is explicit data rather than inferred from its title.
- The clinic and interactive registries remain separate because they have
  different rendering and content requirements.
- The Treatment/Referral Addendum category initially appears as an empty,
  labelled destination because no corresponding template was provided.
