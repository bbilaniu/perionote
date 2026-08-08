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
