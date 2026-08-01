# HygieneNote todo

## Adult Hygiene 2021 periodontal classification redesign

Source:
[ClearDent Custom Fields and Periodontal Redesign](requests/ClearDent%20Custom%20Fields%20and%20Periodontal%20Redesign.md)

- [x] Replace prose-based `stageBasis` and `gradeBasis` state with stable
  criterion IDs, typed measurements, semantic operators, and explicit units.
  Generate clinical wording from a checked-in catalogue rather than storing
  generated prose in encounter state.
- [x] Define the candidate-classification decision table, including
  missing-data behavior, stage escalation, tooth-loss and complexity
  precedence, direct versus indirect grading evidence, risk modifiers,
  conflicting criteria, confirmation, overrides, and the confirmed basis
  included in output.
- [x] Replace the legacy encounter-level Health/Gingivitis free-text field
  with structured findings, a calculated and confirmed six-context
  classification, and ClearDent-compatible generated blocks.
- [ ] Obtain and record clinical review of the candidate-classification
  [decision table](specs/periodontal-classification-decision-table.md),
  including missing-data behavior, stage escalation, tooth-loss and complexity
  precedence, direct versus indirect grading evidence, risk modifiers,
  conflicting criteria, confirmation, overrides, and the confirmed basis
  included in output.

### Deferred decisions

- Defer the proposed periodontal output-detail selector (concise diagnosis,
  diagnosis plus confirmed basis, or expanded chart note). The current fixed
  output intentionally follows the preferred diagnosis-plus-confirmed-basis
  approach and is sufficiently close to the target ClearDent-compatible
  workflow. Reconsider multiple output modes only through a separately scoped
  request after clinical review identifies a concrete need.
