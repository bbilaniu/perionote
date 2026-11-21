# Issue 68: Picklynia Adult Hygiene Extensions

- Status: Implemented and archived
- Date: 2026-08-03
- Source: GitHub issue 68 and the requester's follow-up clarification
- Target: `adult-hygiene-2021` interactive conversion

## Approved Contract

1. Plaque, stain, calculus, and bleeding expose Areas only when Localized is
   selected. Areas support arches, quadrants, sextants, and encounter-only
   custom tooth/area text. Generalized output omits any retained localized area.
2. Color includes Marginal redness. **Apply gingivitis observations** applies
   generalized marginal redness, generalized rolled margins, generalized
   spongy consistency, and generalized smooth attached gingiva. It replaces
   conflicting options only after confirmation and preserves unrelated
   observations.
3. OH aids includes the public starter **BASS-BRUSHING TECHNIQUE**. An explicit,
   reversible standard-OHE action adds the exact reviewed statement from issue
   68. Additional fixed OHE topics cover bruxism-guard counselling and the
   importance of maintaining a 4-month recall.
4. Treatment completed includes the reviewed 3U instrumentation, selective
   polish, FluoriMax, Advantage Arrest, Dyclonine, DDS Recall Exam, sealant, and
   OHE starters. **Apply standard treatment** appends missing standard rows
   without duplicating them. Dyclonine provides an encounter-only free-text
   **Time of application/use** field.

## Safety and Compatibility

- Every new clinical statement or treatment remains empty until explicitly
  selected or applied by the clinician.
- Existing form output is unchanged when the extension is unused.
- Completed form state and treatment timing remain page-memory only.
- Catalogue starter additions use the existing browser-local catalogue schema;
  no schema migration, remote storage, analytics, or dependency is introduced.
- Generated note wording is deterministic and remains visible for clinician
  review before copying to the authoritative record.
