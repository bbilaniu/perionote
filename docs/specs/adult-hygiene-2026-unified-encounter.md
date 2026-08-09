# 2026 Adult Hygiene Unified Encounter

- Date: 2026-08-08
- Status: Implemented; clinical acceptance pending

## Purpose

The 2026 Adult Hygiene workspace owns one encounter state and can generate
three notes without duplicating shared clinical facts:

1. **Complete** — Recare assessment, hygiene assessment and completed hygiene
   treatment.
2. **Hygiene** — Hygiene assessment and treatment only. EOE and IOE are
   intentionally omitted.
3. **Recare** — Recare assessment only. EOE and IOE are included.

## Shared and output-specific content

| Content | Complete | Hygiene | Recare |
| --- | --- | --- | --- |
| Patient/team, consent and history | Yes | Yes | Yes |
| Records, EOE/IOE, teeth, odontogram and occlusion | Yes | No | Yes |
| Hygiene and periodontal assessment | Yes | Yes | No |
| Caries risk | Yes | Yes | Yes |
| Oral hygiene education and treatment completed | Yes | Yes | No |
| Treatment options and coordinated recommendations | Yes | Yes | Yes |
| Recare interval and dental follow-up | Yes | No | Yes |
| Hygiene interval and hygiene follow-up | Yes | Yes | No |

## Ordering

The complete note follows encounter context, records and concern, Recare
clinical examination, appliances/history, hygiene and periodontal assessment,
risk, education, coordinated recommendations, treatment completed, then
separate Recare/dental and hygiene follow-up.

## Terminology and compatibility

Visible 2021 and 2026 wording uses **Last Recare Date** and **Recommended
Recare Interval**. Existing internal `noteLastRecallDate`, `recallInterval` and
catalogue identifiers remain unchanged so older local drafts and remembered
catalogue data continue to restore.

Older 2026 drafts are merged with the current empty encounter shape. Legacy
hygiene recommendation fields continue to format when no coordinated plan has
been entered.

## Consolidated EOE/TMJ and OHE controls

The structured EOE card owns one **TMJ assessment** group. TMJ status and free
text remain the accepted legacy fields, while **TMJ clicking** remains the
accepted structured finding. Selecting clicking promotes TMJ to Findings.
Changing TMJ to WNL or Not assessed confirms before clearing TMJ text and the
linked clicking finding. A restored draft that contains clicking with another
TMJ status is not silently rewritten: the form identifies the conflict and
offers explicit keep-clicking or remove-clicking actions. Masseter palpation,
TMJ loading, and lymph-node findings remain independent.

The 2021 and 2026 Oral Hygiene and Education sections share one coordinated
education card. Standard OHE identifies the concepts it covers; while applied,
those concepts are omitted from new additional-topic choices. Brushing and
flossing frequency coaching, other education, aids/products, notes, and the
hygiene goal remain separately documentable. Existing drafts with both
Standard OHE and separately selected covered education keep every stored value
and the existing note wording until the clinician explicitly removes the
covered duplicate selections.

This consolidation changes presentation and conflict handling only. It does
not add a draft migration, rename persisted properties, or change the summary
renderers.

## Decision support

Decision support is derived from the current encounter without changing a
clinical selection automatically.

- With the periodontal diagnosis unassessed, the form shows every supported
  diagnosis category that remains compatible with the documented evidence,
  the evidence supporting each possibility, and missing information that may
  narrow the list. The clinician still selects the diagnosis.
- Caries risk is not inferred as Low from an empty factor list. Documented
  frequent sugar exposure or hyposalivation can produce a High suggestion;
  other recognized contributing conditions produce a Moderate working
  suggestion. A general history of caries in the last 36 months remains
  Moderate until lesion/restoration count distinguishes the adult ADA 1–2 and
  3-or-more thresholds. Custom factors are disclosed as unmapped.
- Applying a caries suggestion requires an explicit action. Suggestion
  calculation and preview do not mutate the encounter.

The caries rules follow the ADA Caries Risk Assessment Form for patients over
age 6. Periodontal health and gingivitis candidates use the 2018 World Workshop
BOP and probing-depth case thresholds already used by the periodontal
classification engine.
