# Oral hygiene methods used at home

All six clinical forms and the full, short, and very-short webforms (including
the legacy alias) ask **Type of toothbrush used** and **Type of flossing used**.
The nine hygiene/recare source templates include the same questions. Emergency,
TMJ, and local-anesthesia source addenda are outside this change's scope.

The checkboxes allow multiple methods: Electric / Manual toothbrush and String
floss / Water flosser / Interdental picks. Choices start unselected. Empty means
not documented; it does not assert that the patient uses none. Unchecking every
choice removes the corresponding output line. Frequency remains a separate
field, and types appear directly above their corresponding frequency controls.

`OralHygieneMethodsControl` is shared by all interactive forms. Clinical schemas
extend `OralHygieneMethods` with `toothbrushTypes` and `flossingTypes` string arrays.
Clinical draft validators declare the array item shapes and restore absent fields
from the empty form, so older drafts remain compatible. Native save, reload,
clear, and mode-switch behavior is unchanged. The imported webforms retain their
existing in-memory state and reset behavior; they do not gain draft storage.

The shared `formatOralHygieneMethods` formatter adds patient-reported usage to
every note projection, including Recare/Dentist. These choices do not select OHI
reviewed, education topics, aids recommended, or treatment performed.

Before selection, neither line is included. Selecting all methods adds:

```text
Toothbrush type used: Electric; Manual.
Flossing type used: String floss; Water flosser; Interdental picks.
```

Coverage: `oralHygieneMethods.test.ts` checks all summary projections, empty
behavior, source questions, and draft shapes. `oral-hygiene-methods.spec.ts`
checks every interactive route, multiselection, clearing, clinical draft reload,
older drafts, Rapid/Detailed continuity, and a mobile keyboard workflow.

Verification: production build and TypeScript pass; all 288 unit tests and all
12 dedicated Chromium workflow tests pass. Desktop and 390px mobile screenshots
were reviewed. Lint has no errors and retains two existing warnings.
