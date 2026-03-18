# Request: Output / Header Alignment Follow-Up

## Goal
Correct four remaining inconsistencies in the hygiene-note template:
- the visit date is captured in the form but not included in the plain-text output,
- there is no `Provider Name` field next to `Date`,
- the UI section title `Disposition` does not match the exported heading `Continuity of Care`.
- the vitals area only supports one BP / HR / time entry and does not support repeated readings or average values cleanly.

## Current Issues

### 1) Date is not passed into the plain-text output
The form currently captures `Date`, but the generated chart note does not include it.

Why this matters:
- The date is part of the visit context and should travel with the copied note.
- A visible date in the output reduces ambiguity when the note is pasted into another system.
- The current behavior creates a mismatch between what the user enters and what the exported note preserves.

### 2) There is no `Provider Name` field beside `Date`
The header area currently includes `Date` only.

Why this matters:
- Provider identification is a common header-level charting field.
- It belongs in the same visit-metadata area as the date, not buried in free text.
- If the output is intended to be copied into another charting system, provider attribution should be explicitly available.

### 3) UI label `Disposition` does not match output label `Continuity of Care`
The form section is currently titled `Disposition`, but the plain-text output uses `Continuity of Care`.

Why this matters:
- The mismatch can confuse users when they compare the form with the generated note.
- Using different labels for the same content weakens the mental model of the form.
- The output wording is more patient-/workflow-facing and appears to be the preferred final terminology.

### 4) Vitals only support one reading and time cannot be removed cleanly
The current vitals area behaves like a single-entry field group:
- one BP value,
- one HR value,
- one time value.

Once time is entered, the workflow does not naturally support clearing it or managing repeated vitals readings taken during the same visit.

Why this matters:
- Repeated measurements are common when an initial blood pressure is high, borderline, or rechecked after rest.
- A single-entry design cannot represent multiple readings clearly.
- Average BP / HR cannot be calculated reliably from one free-text BP field and one HR field.
- The interaction pattern is inconsistent with the more flexible repeated-entry design already used in Local Anesthesia.

## Proposal

### 1) Include `Date` in the plain-text output
Add the visit date to the plain-text summary output near the top of the note.

Recommended behavior:
- If a date exists, render it as the first top-level line:
  `Date: YYYY-MM-DD`
- Keep the existing section order otherwise unchanged.
- If the date is blank, omit the line.

### 2) Add `Provider Name` beside `Date`
Add a new `Provider Name` field in the top header row beside the existing `Date` field.

Recommended behavior:
- Place `Provider Name` adjacent to `Date` in the first metadata row.
- Use a standard text input.
- Preserve existing layout behavior for smaller screens by stacking naturally if needed.

Recommended output behavior:
- If present, include a line near the top of the summary:
  `Provider: <name>`
- Render it after `Date` and before the clinical note content.
- If blank, omit the line.

### 3) Rename the UI section from `Disposition` to `Continuity of Care`
Align the form section title with the output terminology.

Recommended behavior:
- Change the section card title from `Disposition` to `Continuity of Care`.
- Keep the internal data structure name as-is if renaming it would add unnecessary code churn.
- Keep the exported heading `Continuity of Care`.

### 4) Redesign vitals as repeatable readings
Refactor the vitals area so it behaves more like a repeatable-entry card instead of a one-time field group.

Recommended UI structure:
- Replace the single BP / HR / time controls with a `Vitals Readings` area.
- Load one vitals reading entry by default when the page loads.
- Pre-fill the default reading time with the current time on page load.
- Allow users to add additional readings.
- Allow users to remove any reading entry.
- Allow users to clear time from any reading.
- Keep a `Set to now` action for each reading.

Recommended fields for each reading:
- `Systolic`
- `Diastolic`
- `Heart Rate`
- `Time`

Recommended behavior:
- Keep one empty/default reading visible by default so the section is ready for use immediately.
- Do not require time in order to save a reading.
- If time is blank, the reading remains valid and should still be included in averages if the numeric values are present.
- Use numeric inputs or clearly numeric-only parsing rules for systolic, diastolic, and heart rate.

### 5) Add average vitals logic
If more than one valid reading exists, compute an average BP and average HR.

Recommended averaging rules:
- Average systolic separately.
- Average diastolic separately.
- Average heart rate separately.
- Include only readings with valid numeric values in the corresponding average.
- If only one valid reading exists, do not output an `Average BP` line.

### 6) Update plain-text output for vitals
The summary should list each reading first, then show an average when more than one reading exists.

Recommended output behavior:
- Keep `Medical history update:` as the section heading.
- Keep the narrative note line if present.
- Output one indented line per vitals reading.
- If a reading includes time, format it as:
  `BP: 118/76 mmHg, HR: 72 bpm (at 9:15 AM)`
- If a reading has no time, format it as:
  `BP: 118/76 mmHg, HR: 72 bpm`
- If more than one valid reading exists, append an indented average line after the individual readings:
  `Average BP: 116/74 mmHg, HR: 70 bpm`

Recommended output order within the medical history block:
1. `Medical history update:`
2. Optional narrative line
3. One line per individual vitals reading
4. Optional average line when more than one valid reading exists

## Recommended Output Order

If implemented, the top of the output should become:

```text
Date: 2026-03-18
Provider: Dr. Example

Patient concerns: ...
```

If only date is present:

```text
Date: 2026-03-18

Patient concerns: ...
```

If only provider is present:

```text
Provider: Dr. Example

Patient concerns: ...
```

If multiple vitals readings are present, the medical history block should resemble:

```text
Medical history update:
   Med/dent history updated. No new contraindications reported.
   BP: 142/88 mmHg, HR: 78 bpm (at 9:05 AM)
   BP: 136/84 mmHg, HR: 74 bpm (at 9:15 AM)
   Average BP: 139/86 mmHg, HR: 76 bpm
```

If a reading has no time, it should resemble:

```text
Medical history update:
   BP: 118/76 mmHg, HR: 72 bpm
```

## Acceptance Criteria
- The plain-text output includes `Date` when a date is present.
- A `Provider Name` field exists beside `Date` in the form header area.
- The plain-text output includes `Provider: ...` when provider name is present.
- The form section title `Disposition` is renamed to `Continuity of Care`.
- The output heading `Continuity of Care` remains unchanged.
- Blank date/provider values do not produce empty lines or empty labels in the output.
- The vitals section loads with one reading entry by default.
- The default vitals reading has time pre-filled on page load.
- Users can add and remove vitals readings.
- Users can clear time from a vitals reading after it has been set.
- The plain-text output lists each vitals reading individually.
- The plain-text output includes `Average BP` only when more than one valid reading exists.
- The average line is calculated from valid numeric readings only.

## Recommendation
Proceed with all four changes together, because they all affect top-level note consistency and visit metadata quality:
- visit metadata should be complete,
- header fields should map into exported output,
- UI/output terminology should match,
- and vitals should support repeated real-world measurement workflow rather than a single fragile entry.
