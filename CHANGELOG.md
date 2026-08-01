# hygienenote

## 0.5.0

### Minor Changes

- 8e8faf6: Make the Adult Hygiene Plaque, Stain, Calculus, and Bleeding comments independent from their structured findings.
- a65d2bb: Add a reviewed normal structured-intraoral shortcut, Findings-only detail controls, and compact Recare output by structure.
- 3cc665a: Remove the clinically non-specific Slight malocclusion option from Recare additional occlusal findings while retaining its raw source transcription for audit.
- 9dd0d17: Add explicit structured-observation workflows with inspectable Gingival WNL presets, custom findings, compact per-dimension output, and a confirmed Recare intraoral clear action.
- 7e48176: Add an optional structured Gingival Description assessment to the 2021 Adult Hygiene conversion (part1).

## 0.4.1

### Patch Changes

- 141083e: Fixed appearence of the Date field, by making the native field invisible and overlaying it with the desired appearence. selecting the field opens the native picker.

## 0.4.0

### Minor Changes

- e4b78ff: Add optional grouped OHE topics and OHE notes to Adult Hygiene 2021 without
  changing existing OHE fields or output when the additions are empty.
- 94350c5: Make Adult Hygiene and Recare Exam patient chief concerns share an ordered
  multi-value catalogue with encounter-only custom entries and a mutually
  exclusive Nothing option.
- bcfdbb0: Let Adult Hygiene and Recare Exam notes render selected patient chief concerns
  inline or as an indented list using a per-note checkbox.
- 7cf181d: Add explicit odontogram status and a structured Caries Risk card to Recare
  Exam notes, including catalogue-backed ordered risk factors.
- bcfdbb0: Let Recare Exam Treatment Options and Treatment Plan render independently as
  numbered lists or semicolon-separated inline entries.
- 9772b2f: Add a multi-select Tooth/area control to each Adult Hygiene treatment completed
  entry, with fixed choices and encounter-only custom text, while preserving
  catalogue-backed treatment types.
- 87ec9b1: Organize Adult Hygiene plaque, stain, calculus, and bleeding findings into
  grouped, composable fixed-choice facets while retaining encounter-only Other
  values.
- b876458: Let Adult Hygiene 2021 users enter custom flossing and brushing frequencies
  directly in their suggestion boxes instead of separate Other fields.

### Patch Changes

- 871f2bf: Format generated note headers with a readable local date and time, followed by
  Patient ID and consistent Dentist, RDA, and RDH lines, while preserving the
  compact timestamp appearance in the form.

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
