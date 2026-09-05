# hygienenote

## 0.15.0

### Minor Changes

- e7a4702: Add an ultrawide workspace rail that keeps the current form, generated note, and browser-local drafts visible together. Draft lists now use compact actions, consistent current-state styling, independent scrolling, and an always-available saved-drafts link. Desktop workspace panels share a stable scrollbar treatment, and copying the generated note is presented as the primary action.

  Replace native form and saved-draft warnings with accessible modal surfaces. Starting a new form can preserve the current local draft, while clearing a form explicitly discards its recovery copy.

## 0.14.0

### Minor Changes

- 83b7262: Add responsive, active section navigation to every interactive template.
- 3b3ee85: Give clinic interactive forms a shared responsive workspace with a compact
  local-recovery strip, vertical desktop section navigation, a mobile section
  sheet, an automatically docked generated-note column on wide screens, and a
  generated-note drawer at narrower widths. Warn before synthetic demo data
  replaces a form changed since page load or reset. Keep section navigation in a
  sticky right-hand utility rail with persistent access to review the note, and
  place the drawer close action directly in the Generated Note header. Present
  clearing a form as a destructive action and explain that its previous local
  draft remains recoverable for seven days. Keep Review Note pinned while only
  the section-link list scrolls within the right-hand rail.

## 0.13.1

### Patch Changes

- f72cfb4: Give the pediatric recare form a separate recare-exam action and keep the exam out of standard pediatric care.
- ca44863: Added extractions to dentist treatment options

## 0.13.0

### Minor Changes

- 9474d4d: Add the CAMBRA123 2021 ages 6–adult caries-risk assessment to the 2026 adult and adolescent hygiene forms. The structured assessment scores protective factors, biological and environmental risks, and disease indicators as responses change; provides transparent clinical guidance while preserving the clinician's final category; supports drafts and generated notes; and keeps the factor checklist collapsible with compact summaries that distinguish suggested from clinician-selected risk.
- 8fc7b5c: Mark the 2026 adult and adolescent hygiene templates as current, hide their previous versions by default, and add Current and All catalogue controls that reveal previous templates without changing existing template routes or draft identifiers.

### Patch Changes

- 1dfdd00: Align the template-library and standalone-form card hover styles with the clinical-template catalogue by emphasizing the border, shadow, and title colour.

## 0.12.0

### Minor Changes

- fb538f6: Add catalogue-backed product brands, structured treatment-completed-today choices, pediatric standard care, and local-anesthesia documentation to the 12–17 and pediatric hygiene forms, including one-click Dyclonine rinse and Benzocaine topical entries.

## 0.11.1

### Patch Changes

- e829a78: Promote the pediatric recare template to pilot, default its occlusion documentation to Terminal plane with primary-dentition choices, preserve an explicit molar-classification option for permanent first molars, and use the shared skeletal-occlusion catalogue for skeletal classification.

## 0.11.0

### Minor Changes

- ad4b991: Add a separate 2026 Adolescent Hygiene template that combines the dental exam and hygiene encounter while producing Combined, Dentist, or Hygienist notes. Preserve the original adolescent template and its draft identity unchanged.

### Patch Changes

- 4ce4a93: Repair the pediatric recare form layout, separate patient context from the visit team, restore correctly sized date and note-started controls, capture scaling units plus polishing and fluoride products, and align medical history, consent, and sterilization safeguards with the other 2026 templates.

## 0.10.0

### Minor Changes

- b437937: Add repeatable vitals readings to the 2026 Adult Hygiene consent, medical history, and sterilization card, including add/remove and time controls, copied-note readings, and averages across valid measurements. Start vitals empty so the first entry receives its timestamp when it is added. Standardize clinical time inputs, copied-note timestamps, draft metadata, and catalogue import timestamps on a zero-padded 24-hour `HH:mm` format without seconds.

## 0.9.0

### Minor Changes

- bf24a31: Add a unified 2026 Adult Hygiene encounter with the complete Recare assessment, combined preventive/restorative treatment planning, separate dental and hygiene follow-up, and Complete, Hygiene, and Recare note outputs. Complete notes include each populated dental and hygiene next visit exactly once. Keep dental and hygiene treatment options in separate catalogue-backed lists, output both discussed-option sections, and copy them into one ordered combined treatment plan as restorative and preventive care without duplicating existing recommendations. Split treatment planning from treatment completed today in the encounter UI. Update the 2021 and 2026 templates to use Recare terminology, add periodic examination/recare as a chief concern, improve structured-card collapsing, refine form and EOE/IOE output spacing, provide transparent periodontal and caries decision support, consolidate temporomandibular, lymph-node, OHE, night-guard/occlusal-splint, and per-finding occlusal-location controls with explicit legacy-conflict handling, add optional per-line occlusal-finding output and conditional removable-dentures comments, use native checkbox and radio semantics for persistent choices, and compose completed care from linked radiographs, an explicit recare exam, and structured scaling, polish, and OHE procedure cards. Add structured local-anesthesia documentation for injection, topical, and rinse routes, including catalogue-backed products, an explicit Dyclonine rinse action, totals, timing, and post-anesthetic assessment. Applying Standard Treatment now uses the current completed-care catalogue labels and structured defaults without automatically charting Dyclonine. Applying Standard OHE now prefills a non-destructive flossing and Bass-brushing hygiene goal. Coordinate PPE, Class 5 indicator, and sterilization-code documentation in the encounter header. Replace counted radiograph catalogue labels with reusable radiograph types and encounter-specific image counts, allow custom types with remembered defaults, organize completed-care catalogue entries into exams and diagnostics, instrumentation, product applications, preventive procedures, education, and other care, add a polishing-product catalogue with structured Enamel Pro® Prophy Paste flavour variants, split hygiene and dentist next-visit values into dedicated catalogue tabs, and group recare, hygiene, and next-visit scheduling catalogues under Continuity of care while preserving legacy catalogue imports and drafts.

### Patch Changes

- 0cbb255: Model fluoride varnish, SDF, and desensitizer applications as distinct structured completed-care procedures backed by one typed Desensitizing and remineralizing products catalogue. Remove the `NONE` product and migrate older completed-care preferences and standalone 2026 desensitizer values.

## 0.8.0

### Minor Changes

- 35af015: Let users mark Dentist, RDH, and RDA values as browser-local defaults from either the catalogue manager or contextual form actions, prefill new Adult Hygiene and Recare Exam notes, and preserve provider values in restored drafts.
- ddfa551: Autosave Adult Hygiene and Recare Exam drafts locally every ten seconds and on copy, preserve saved drafts when a form is reset, restore concurrent tabs independently, identify them by Patient ID and professional names on a Saved drafts page, manage or bulk-delete them there, and delete drafts after seven days.
- 2614e76: Add a development-only draft interactive conversion of the 12–17 Years Old Hygiene ClearDent template, including generated-note preview, copying, provider defaults, and browser-local draft recovery.

## 0.7.0

### Minor Changes

- a531398: Improve the Adult Hygiene 2021 clinical workflow and generated note:

  - Render structured periodontal findings as they are entered, including grouped assessment, stage, grade, smoking, and diabetes observations.
  - Reorganize the note into clearer gingival, periodontal assessment, stage, grade, diagnosis, caries-risk, OHE, and treatment blocks with consistent spacing and indentation.
  - Remove duplicated Health/Gingivitis evidence, stage basis, grade basis, and grade modifier summaries while retaining the underlying structured findings.
  - Make Health/Gingivitis, treated-periodontitis context, stage, and grade override reasons optional; manual selections now chart and copy immediately, with optional reasons documented when supplied.
  - Document cigarette smoking even when cigarettes per day has not been entered.
  - Keep structured periodontal disclosures under user control instead of opening them automatically when periodontitis is selected.
  - Move caries risk level, factors, notes, catalogue behavior, demo data, and note output from Recare Exam into a dedicated Adult Hygiene 2021 Caries Risk Assessment section.
  - Keep the Adult Hygiene and Recare Exam pilot headers within the left form column beside their note previews.

## 0.6.1

### Patch Changes

- Keep periodontal status fields available for every assessed diagnosis and prevent copying when a visible periodontal classification override reason is empty.

## 0.6.0

### Minor Changes

- 631a6bb: Add the approved structured Recare tooth-level findings assessment, including repeatable caries and mobility observations.
- 0e9624e: Add reviewed Adult Hygiene localized areas, gingivitis and OHE presets, and expanded completed-treatment documentation.

## 0.5.1

### Patch Changes

- c39b840: Clarify Adult Hygiene periodontal classification for previously treated patients, require reasons for candidate overrides, tighten candidate thresholds, and prevent stale periodontal status outside periodontitis.

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
