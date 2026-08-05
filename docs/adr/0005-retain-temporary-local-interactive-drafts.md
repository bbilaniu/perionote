# ADR 0005: Retain Temporary Local Interactive Drafts

- Date: 2026-08-05

## Status

Accepted

## Context

ADR 0003 kept patient- and appointment-specific interactive form state only in
memory. That boundary avoided creating a patient-record store, but it also
meant a browser, operating-system, or power failure could destroy substantial
unfinished documentation. More than one clinical note may be open in separate
tabs, so one shared "latest note" value would also risk one encounter
overwriting another.

The requested recovery window is seven days, with a save at least every ten
seconds and whenever the generated note is copied. The clinic EMR remains the
authoritative clinical record.

This ADR supersedes only the **Do not persist completed forms** section of ADR
0003 and the corresponding in-memory-only safeguard inherited by ADR 0004.
The remaining provenance, lifecycle, clinical-output, and review safeguards
remain in force.

## Decision

### Store short-lived recovery drafts in the browser profile

The Adult Hygiene and Recare Exam interactive conversions store partially or
fully completed form state in `localStorage`. Each tab receives a random draft
identifier held in `sessionStorage`; browser-restored tabs use that identifier
to reopen their own draft. A new tab does not silently adopt another tab's
draft. Instead, other recent drafts for the same template are listed with
an explicit **Restore** action and a link to the central draft manager.

A central **Saved drafts** page lists all current recovery drafts in the
browser profile with template name, start time, save time, and scheduled
deletion time. It does not render patient identifiers or form content. Opening
a draft assigns its random identifier to the current tab before navigating to
the matching interactive form; the identifier is not placed in the URL. The
page also provides an explicit **Delete** action for each draft.
Deletion controls are centralized on this page. A visually separate danger
section can delete every HygieneNote recovery draft in the browser profile,
but only after a warning that the action is permanent and that forms open in
other tabs may create drafts again.

Drafts are saved:

- every ten seconds while the page remains open;
- immediately when the user attempts to copy the note; and
- when the browser emits `pagehide`, as an additional best-effort safeguard.

Resetting a non-empty form first checkpoints its current recovery draft, then
assigns the tab a new random identifier and clears the live form. The saved
snapshot remains available until explicitly deleted or expired; the new empty
form is not retained. Drafts older than seven days from their most recent
successful save are deleted during startup, recovery listing, and the
ten-second save cycle.

### Use a versioned, validated format

Each stored value has a dedicated key and contains a format discriminator,
integer schema version, template ID, draft ID, save timestamp, note-start
timestamp, and structured form state. Restore validates the envelope and the
expected form shape before passing data to the UI. Malformed owned values are
ignored and deleted. A future incompatible schema requires an explicit
migration or rejection decision rather than silent reinterpretation.

This is an additive version-one format. There is no legacy completed-form
state to migrate because earlier versions did not persist it. Rolling back to
an earlier application version makes these drafts unavailable but does not
change generated notes already copied into the EMR.

### Preserve the local-only privacy boundary

The data categories are patient identifiers, provider names, encounter dates,
clinical selections and measurements, free-text findings, and timestamps. The
sole purpose is recovery of an unfinished interactive note after local failure.

- Storage location: the current browser profile on the current device.
- Encryption: no application-level encryption; protection depends on the
  browser, operating system, device controls, and profile isolation.
- Access: scripts and people with access to the same browser origin/profile may
  be able to read the drafts.
- Retention and deletion: rolling seven-day retention, explicit per-draft
  deletion, and a separately warned delete-all action on the central draft
  manager. Form reset preserves a checkpoint rather than deleting it. Clearing
  site data also removes all drafts.
- Export and backup: no draft export, cloud synchronization, or automatic
  backup is added.
- Recovery: matching restored tabs reopen automatically; unmatched drafts
  require an explicit restore action.
- Logs and processors: drafts are not written to logs, analytics, telemetry,
  APIs, third parties, source files, URLs, or service workers.
- Failure behavior: storage denial or quota failure leaves the live form
  usable and displays a warning to copy the note before leaving. Browser-local
  data may still be lost if site data is cleared, private browsing ends, the
  profile is damaged, or the failure occurs before the next save.

The UI states that a recovery draft is not the clinical record. This local
storage design does not by itself establish compliance with privacy law or
clinic policy.

### Threat model

The design addresses accidental process, device, or browser restart and
cross-tab overwrite. Random per-tab identifiers and separate storage keys
reduce accidental collisions; runtime validation limits damage from corrupted
values; and short retention reduces the period of exposure.

It does not protect against a person using the same unlocked browser profile,
malicious same-origin script, browser extensions with relevant access,
compromised devices, forensic recovery, or deliberate local-storage tampering.
Application-level encryption without an approved key-management and locking
design would not resolve those threats and is outside this change.

## Rationale

Browser-local persistence is the smallest implementation that makes crash
recovery possible in this static application without adding authentication,
remote infrastructure, third-party processing, or an EMR integration. Separate
per-tab drafts preserve concurrent work. Explicit recovery for unmatched tabs
avoids silently placing one patient's content into a fresh note.

## Consequences

### Benefits

- A crash normally loses at most the changes since the last ten-second save.
- Copying produces an immediate recovery checkpoint.
- Multiple open notes do not intentionally overwrite one another.
- Recovery remains local and works without network access or an account.
- A single page makes drafts from every supported template discoverable.
- Resetting a form does not also delete its most recent recovery snapshot.
- Retention and deletion behavior is visible and testable.

### Trade-offs

- Sensitive encounter data now persists unencrypted at the application layer
  in the browser profile for up to seven days after its last save.
- Other users of the same profile may see recoverable drafts.
- Browser storage is capacity-limited and is not a durable backup.
- A crash before the first save or within a save interval can still lose work.
- Schema changes to either interactive form now require draft compatibility
  review.

## Alternatives Considered

### Continue using memory-only state

Rejected because it does not meet the crash-recovery requirement.

### Store one latest draft per template

Rejected because concurrent tabs would overwrite one another and could expose
the wrong encounter when a tab is restored.

### Add a remote database or cloud backup

Rejected for this change. It would require authentication, authorization,
privacy and security review, operational ownership, and a separate ADR.

### Encrypt drafts in the browser

Deferred. Meaningful encryption requires an approved unlock, key storage,
rotation, and recovery design. Storing the key beside the ciphertext would not
protect against the principal same-profile and same-origin threats.

## Validation

- Unit tests cover format round trips, malformed data rejection, sorting, and
  seven-day pruning.
- Browser tests cover the ten-second save, reload restoration, save-on-copy,
  isolation of two concurrent tabs, reset-without-deletion, and listing,
  opening, deleting, and bulk deleting drafts from the central recovery page.
- Existing summary fixtures continue to verify that persistence does not alter
  generated clinical text.
