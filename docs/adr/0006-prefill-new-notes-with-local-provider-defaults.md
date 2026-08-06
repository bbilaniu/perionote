# ADR 0006: Prefill New Notes with Local Provider Defaults

- Date: 2026-08-05

## Status

Accepted

## Context

Dentist, RDH, and RDA names are deliberately reusable, browser-local
catalogue values. Re-entering or reselecting the same visit-team members in
every new Adult Hygiene and Recare Exam note is unnecessary work. Users need a
way to select one default value for each provider role without placing private
staff names in the public application build.

Many other form controls represent encounter-specific history, examination
findings, diagnoses, treatment, consent, or recommendations. Automatically
selecting those controls would make a fresh, untouched form assert clinical
facts. This decision therefore does not create general-purpose form-state
defaults.

## Decision

The catalogue manager allows one visible, deliberately saved Dentist, RDH, and
RDA catalogue item to be marked as the default for new notes. A fresh Adult
Hygiene or Recare Exam form resolves the stored item identifier against the
current catalogue and snapshots its current label into the form.

Provider defaults apply only when a new note is initialized or the user
explicitly resets the current form. Restoring a recovery draft preserves the
provider values saved in that draft, including an intentionally blank role.
Changing, clearing, hiding, or deleting a default does not alter an open form,
a recovery draft, or previously copied documentation.

Defaults use a separate, validated local-storage value with format
`hygienenote-provider-defaults`, schema version `1`, and key
`hygienenote.provider-defaults.v1`. The value stores only catalogue item
identifiers keyed by the three allowlisted provider catalogue keys. Provider
labels remain owned by the existing catalogue. Invalid or unavailable
defaults do not prevent free-text form use.

Provider defaults are browser-local preferences. They are not included in the
catalogue export format in this version. Resetting local catalogues also resets
provider defaults. Import replacement or merging retains only defaults whose
item identifiers still resolve to visible provider entries.

No other input is eligible for automatic selection under this decision.
Additional defaults require an explicit field allowlist and review showing
that a fresh form remains clinically neutral, or a separate interaction that
requires the clinician to deliberately apply the selections to each note.

## Privacy and Safety

Provider names or initials may identify clinic staff. They remain in the
current browser profile and are not written to URLs, logs, analytics, source
files, APIs, or remote services. Browser and operating-system profile controls
provide the only storage protection. Clearing site data or resetting local
catalogues removes the preferences.

Other people or scripts with access to the same unlocked browser profile and
origin may read the catalogue and provider defaults. This local-only design
does not itself establish compliance with privacy law or clinic policy.

Ignoring provider-only prefills when deciding whether a recovery draft is
empty prevents simply opening a new form from creating a saved draft. Once
encounter-specific content is entered, the normal seven-day recovery behavior
from ADR 0005 applies.

## Consequences

- New notes can start with the user's usual visit team already populated.
- The required-provider validation continues to use the form's snapshotted
  text and does not depend on a live catalogue lookup.
- Recovery remains deterministic and never inserts a newer default into an
  older draft.
- Clinical controls remain unanswered until explicitly completed for the
  current encounter.
- Defaults do not automatically transfer with a catalogue export.

## Validation

- Unit tests cover storage round trips, malformed data, stable item lookup,
  and removal of hidden or missing defaults.
- Browser tests cover setting a default, prefilling both supported forms,
  applying defaults after reset, and preserving an intentionally blank
  provider in a restored draft.
- Existing summary fixtures continue to verify generated note wording.
