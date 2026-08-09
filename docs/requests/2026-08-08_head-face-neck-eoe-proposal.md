# Head, Face, and Neck EOE Proposal

Status: Deferred for future discussion. This proposal is not implemented.

## Purpose

Extend the structured extraoral examination only if the clinic routinely
performs and documents a visual head, face, and neck inspection. The controls
should record objective observations without implying a dermatologic diagnosis
or that an examination was completed when it was not.

## Proposed EOE hierarchy

1. **Head, face, and neck**
2. **Lymph nodes**
3. **Temporomandibular assessment**

The current generic Extraoral status and findings control could become the
owner of the Head, face, and neck group. Lymph nodes and Temporomandibular
assessment would remain independently assessable.

## Possible Head, face, and neck controls

- Status: **Not assessed / WNL / Findings**
- Free-text findings using the same interaction as the current legacy-shaped
  exam controls
- Optional structured findings:
  - **Facial asymmetry**
  - **Swelling or mass**
  - **Skin finding**
- Conditional annotations where clinically useful:
  - Laterality
  - Location, such as scalp/head, face, ear, perioral region, or neck
  - Objective appearance, such as color change, crusting or fissuring,
    lesion or growth, ulceration, swelling, or other
  - Clinical notes

The interface label should be **Skin finding**, not **Dermatological finding**,
to avoid implying a specialist diagnosis. Generated wording should describe
what was observed rather than classify a disease.

## Possible future scope

Major salivary-gland or thyroid observations could be considered later, but
only if the clinicians confirm those examinations are routinely performed.
They should not be included in a normal preset merely because they are common
components of a more comprehensive head-and-neck examination.

## Interaction and compatibility requirements

- Selecting a structured abnormal finding should promote the owning status to
  Findings.
- Changing the owning status to WNL or Not assessed should confirm before
  clearing linked structured details or free text.
- Normal presets must document only examinations that were actually performed.
- Existing Extraoral fields and saved drafts must restore without silent data
  migration or changed note wording.
- Generated output should retain a free-text escape hatch for uncommon findings
  and should not make diagnostic or referral recommendations automatically.

## Questions before implementation

1. Is inspection of the skin of the head, face, ears, and neck performed at
   every recare examination or only when indicated?
2. Which location and appearance choices match the clinic's actual charting
   vocabulary?
3. Should findings appear inline under EOE or as indented structured bullets?
4. Should follow-up or referral remain in treatment recommendations rather than
   the examination finding itself?
5. Should any salivary-gland or thyroid control be included, and who performs
   those assessments?

## Background references

- [NIDCR: Detecting Oral Cancer—A Guide for Health Care Professionals](https://www.nidcr.nih.gov/sites/default/files/2020-10/Detecting-Oral-Cancer-Healthcare-Professionals.pdf)
- [ADA: Evaluation of Potentially Malignant Disorders in the Oral Cavity](https://www.ada.org/-/media/project/ada-organization/ada/ada-org/files/resources/research/10870a_chairside_guide_oralcancer_final.pdf)
- [ASHA: Orofacial myofunctional assessment scope](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/4371001c-e522-462d-978e-351456d3f315)
