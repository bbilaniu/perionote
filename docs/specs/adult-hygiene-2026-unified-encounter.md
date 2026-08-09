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

The shared **Partial/complete removable dentures** control exposes an optional
patient-specific comment only when Yes is selected. The comment is appended to
the affirmative note line when non-empty, remains hidden from output for No or
Not documented, and restores if the clinician returns the status to Yes. Drafts
saved before the comment field existed restore with an empty comment.

## Consolidated EOE/TMJ/lymph-node and OHE controls

The structured EOE card owns coordinated **Temporomandibular assessment** and
**Lymph nodes** groups without an additional intermediate section title. The
Temporomandibular assessment contains TMJ status and free text, structured
**TMJ clicking**, Masseter palpation, and TMJ loading. Selecting clicking
promotes TMJ to Findings.
Changing TMJ to WNL or Not assessed confirms before clearing TMJ text and the
linked clicking finding. A restored draft that contains clicking with another
TMJ status is not silently rewritten: the form identifies the conflict and
offers explicit keep-clicking or remove-clicking actions.

The Lymph nodes group follows the same interaction. Its status and findings
control owns the structured **Palpable** action, which continues to generate
the established “palpable lymph nodes” note fragment with optional laterality,
location, and swelling. Selecting Palpable promotes Lymph nodes to Findings;
changing the status away from Findings confirms before clearing linked data.
Drafts saved before the status fields existed retain the structured finding and
offer explicit keep-or-remove resolution. Masseter palpation and TMJ loading
retain independent statuses and generated lines within the shared
Temporomandibular assessment fieldset.

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

## Completed-care composition

The 2026 Records section treats its radiograph values as radiographs taken
today. Bitewings, periapicals, and panoramic images use compact quantity
controls with defaults of 4 BW, 3 PA, and 1 PAN. Other radiograph text remains
available. Changing these values maintains source-linked entries at the start
of Treatment completed today; linked entries can only be removed by changing
the Records source.

An explicit **Apply recare exam** action adds one idempotent **Dentist Recare
Exam** entry after linked radiographs. It records the completed service but does
not infer normal EOE/IOE findings. The Recare-only output continues to omit the
Treatment completed today block; Complete and Hygiene outputs include it.

Common adult hygiene procedures use structured cards in both the 2021 and 2026
forms:

- Scaling has an editable quantity in 0.5U steps, default 3U, independent Hand
  and Power instrumentation toggles, and a conditional editable power device
  with Cavitron as the standard default.
- Selective polish has an editable quantity, default 1U, and defaults to
  EnamelPro Strawberry with Fluoride.
- OHE previews a concise recap derived from documented education. The recap
  stays synchronized until the clinician customizes it; **Reset from
  education** restores derived behavior.

**Apply standard treatment** retains Dyclonine 1% rinse and FMP, then adds the
structured scaling, polish, OHE, and FluoriMax varnish procedures in clinical
sequence. Common procedures can also be added individually. The free-text
catalogue remains available for other treatment, but quantity-specific scaling
and polish starters are removed because their quantities now belong to the
procedure cards.

Structured properties are optional additions to the accepted treatment row.
Legacy rows and drafts without them retain their exact existing output and are
not silently converted.

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
