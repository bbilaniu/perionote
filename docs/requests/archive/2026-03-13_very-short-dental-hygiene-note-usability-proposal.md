---
status: implemented
implemented_on: 2026-03-13
---

> Implemented on 2026-03-13.

# Request: Very Short Template Proposal

## Goal
Create a third template called `Very short template` for the fastest hygiene-note workflow, with substantially less scrolling, faster data entry, and clearer desktop use.

## Background
The current short template is not functionally short. It reuses the full imported hygiene-note template and only changes the title and description.

Instead of overloading the existing templates further, this request proposes introducing a third template:
- Full template
- Short Dental Hygien Note
- Very short template

As a result:
- Users still move through the full vertical stack of sections.
- The summary and copy actions remain near the bottom of the page.
- Desktop screen space is underused.
- The template feels long even when the user only needs a minimal hygiene-note workflow.

## Problem Statement
The main usability issue is excessive vertical travel, not lack of horizontal space inside individual fields.

Current friction points:
- Too many sections are always visible in one long flow.
- The summary preview and plain-text output appear after the entire form.
- The plain-text output is visually large and increases page height.
- The short template does not prioritize the most common hygiene-note tasks.

## Proposal

### 1) Add a third template: `Very short template`
Introduce a new template entry named `Very short template`.

Recommended behavior:
- Keep the full template unchanged.
- Keep the current short template available.
- Implement `Very short template` as the minimal workflow-oriented variant.

This should be the primary implementation goal for this request.

### 2) Make the new template a real variant
Refactor the imported template so it supports variant-based rendering instead of only renamed wrappers.

Recommended approach:
- Add a variant prop such as `variant="full" | "short" | "very-short"`.
- Keep the full template behavior unchanged.
- Keep the current short template behavior available.
- Define a reduced section set for `Very short template`.

`Very short template` should keep:
- Date
- History and exam essentials
- EOE / IOE essentials
- Gingival description
- Calculus and biofilm deposits
- Periodontal status
- Caries risk
- OHE / recommendations
- Treatment done today
- Next appointment
- Additional clinical documentation

`Very short template` should consider hiding by default or removing:
- Lower-frequency supporting fields that are not usually required for a routine hygiene note
- Large descriptive helper blocks when they do not add immediate charting value
- Any duplicated or low-yield review areas

### 3) Reduce scrolling with progressive disclosure
Convert major sections into collapsible cards or accordions.

Behavior:
- Open the highest-priority sections by default in `Very short template`.
- Keep lower-priority sections collapsed by default.
- Preserve entered values when sections are collapsed.
- Allow users to expand all sections when needed.

Recommended default open sections:
- History and Exam
- Gingival Description
- Calculus and Biofilm Deposits
- Periodontal Status
- Treatment Done Today

Recommended default collapsed sections:
- Additional Clinical Documentation
- Next Appointment
- Long-form summary preview details

### 4) Move summary and actions into a desktop side panel
On desktop, use a two-column page shell:
- Left: form content
- Right: sticky summary and primary actions

The right column should contain:
- Copy summary action
- Reset action
- Load demo action
- Structured summary preview
- Plain-text output

Benefits:
- Users can see the generated note while charting.
- Copy action remains available without scrolling to the bottom.
- The page feels shorter even when the form itself is long.

### 5) Use more columns on desktop, but only at the page-layout level
Yes, the template should use more columns on desktop, but the goal should be better layout, not denser field rows.

Recommended:
- Two-column desktop shell for form plus sticky summary
- Continue using two-column and three-column grids for compact field groups where labels remain readable
- Keep dense finding-entry rows readable and avoid forcing too many controls into one horizontal band

Not recommended:
- Aggressively increasing columns inside complex finding cards just to fit more content per row
- Compressing textareas or select controls to the point that charting becomes harder to scan

### 6) Shrink the visual weight of the summary output
The plain-text output should still be available, but it should not dominate the page height.

Recommended changes:
- Reduce the default minimum height of the plain-text output in `Very short template`
- Let the user expand the output area if needed
- Keep structured summary chips/cards visible above the text output

### 7) Preserve one-screen access to the most common actions
For `Very short template`, the interface should prioritize routine hygiene-note completion rather than exhaustive review.

Recommended quick-access controls:
- Copy summary
- Collapse/expand all sections
- Jump to Gingival Description
- Jump to Treatment Done Today
- Jump to Next Appointment

## Suggested Implementation Plan

### Phase 1: Structural variant support
- Add template variant support to the imported component
- Add `Very short template` to the template registry
- Define which sections render in `very-short` mode
- Keep current full-template behavior untouched

### Phase 2: Scroll reduction
- Add collapsible section behavior
- Set `very-short` default open and closed states
- Reduce default summary output height

### Phase 3: Desktop optimization
- Introduce a two-column layout on large screens
- Make the summary/action panel sticky
- Verify the layout remains usable on laptop-width screens

## Acceptance Criteria
- A third template named `Very short template` exists.
- `Very short template` is no longer only a renamed copy of the full template.
- `Very short template` displays fewer sections or fewer always-open sections than the full template and current short template.
- The user can complete the common minimal hygiene-note workflow with substantially less scrolling.
- On desktop, the summary and copy action remain visible while charting.
- Desktop layout uses additional columns at the page-shell level without harming readability of finding-entry controls.
- Full-template behavior remains available and unchanged.

## Risks and Tradeoffs
- If too many fields are removed, the short template may become incomplete for some users.
- If too many sections are only collapsed, the template may still feel heavy.
- A sticky side panel must be tested carefully on smaller laptops to avoid cramped layouts.

## Recommendation
Proceed by implementing `Very short template` as a new third template, backed by a real variant plus a sticky desktop summary panel.

This gives the best usability gain with the lowest conceptual risk:
- It directly addresses scrolling.
- It uses desktop width productively.
- It avoids over-compressing clinical entry controls.
- It keeps the existing templates available for longer workflows.
