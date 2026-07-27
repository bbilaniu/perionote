# hygienenote

## 0.3.5

### Patch Changes

- 6e9ad3b: Add recoverable inline hiding to every catalogue-backed suggestion menu,
  including ordered multi-value fields.
- 6e9ad3b: Improve pilot treatment, radiograph, and OH-aid row actions with roomier
  controls, red outlined removal, accessible action tooltips, and roomier
  treatment creation and remember actions, and replace the native catalogue
  import picker with a styled, accessible filename control.
- 6e9ad3b: Promote the 2021 Adult Hygiene interactive conversion and its dedicated local
  catalogues from draft to pilot.
- 6e9ad3b: Allow the same Radiographs value to be added more than once to a Recare Exam
  encounter while keeping reusable catalogue suggestions unique.
- 6e9ad3b: Group related provider-role and occlusion catalogues into accessible tabbed
  cards while preserving each catalogue's independent values and unfinished
  input.

## 0.3.4

### Patch Changes

- 2581b26: Allow duplicate, inline-editable Recare Exam treatment rows with a separately
  documented tooth or area that is never saved to the treatment catalogue, plus
  recoverable inline hiding for unused treatment suggestions.
- 2581b26: Improve Recare Exam radiographs, CPAP documentation, and treatment-list workflows.

## 0.3.3

### Patch Changes

- c459c0e: Improve interactive note cards and Adult Hygiene periodontal, compliance, and interval controls.

## 0.3.2

### Patch Changes

- 21e6be1: Harmonize custom fixed-choice listboxes, catalogue comboboxes, static suggestion fields, and the compact theme selector.

## 0.3.1

### Patch Changes

- 46a33c2: Harmonize sterilization, consent, medical-history, and premedication controls across the Recare Exam and 2021 Adult Hygiene forms.

## 0.3.0

### Minor Changes

- 3b8ad1e: Add browser-local provider and occlusion catalogues to the Recare Exam pilot, including catalogue management and manual JSON import and export.

## 0.2.2

### Patch Changes

- 21cc575: Update Next.js and development dependencies to patched maintenance releases.

## 0.2.1

### Patch Changes

- 09dd484: Include visibly labelled pilot templates in public builds while keeping draft
  templates excluded.
- 09dd484: Display the current application version in a site-wide footer.

## 0.2.0

### Minor Changes

- cdb161c: Add the pilot Recare Exam clinical-template conversion, colocate it with its
  ClearDent source, and preserve in-memory-only note generation with explicit
  production pilot inclusion.
