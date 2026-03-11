---
status: implemented
completed_on: 2026-03-11
---

> Completed on 2026-03-11.

# Imported Template Summary Preview

Created on: 2026-03-11
Status: implemented and archived

## Problems Observed

1. Sections run together with no blank line separation.
2. Long comma-joined lines wrap poorly in EMR text boxes, so indentation stops helping.
3. `EOE` and `IOE` repeat as prefixes on multiple lines, and some observation text repeats the same meaning as `Within Normal Limits`.

## Recommended Fixes

### 1. Add section spacing

Recommendation:

- Insert one blank line after each section block.
- Keep headings flush-left and body lines indented.

Implementation idea:

- Update the summary builder so each completed heading block appends an empty line after its items.
- Trim the trailing blank line at the end of the final export.

### 2. Prevent hard-to-read wrapped lines

Recommendation:

- Convert dense, comma-joined sentences into nested short lines.
- For structured sections, prefer one concept per line: finding, extent, teeth, location, distribution, notes.
- For long multi-select sections such as OHE, Recommendations, Treatment Done Today, and Next Appointment, emit one item per line instead of one giant sentence.

Implementation idea:

- Replace `join(", ")` output in large sections with multi-line blocks.
- Use hanging-indent style formatting for details.

### 3. Reduce EOE/IOE redundancy

Recommendation:

- Make `EOE` and `IOE` subheadings, not repeated prefixes on every line.
- Keep `WNL`, `Findings`, and `Observations` as children under each subheading.
- Suppress observation text if it only restates WNL with no added information.

Implementation idea:

- Change the current flat `EOE/IOE` block into nested sections.
- Optionally omit `Observations` lines when the cleaned text is effectively `Within normal limits overall`.

## Preview A: Recommended Format

```text
Visit Details:
  Date: 2026-03-09

History and Exam:
  Patient concerns:
    Sensitivity around lower anterior and occasional bleeding while flossing.
  Medical history:
    Med/dent history updated. No new contraindications reported.
  Vitals:
    BP 118/76
    HR 72
    BP taken at 09:15

EOE/IOE:
  EOE:
    WNL
    Findings:
      - Asymptomatic click on opening/closing (Bilateral)
    Observations:
      - Baseline monitoring only.

  IOE:
    WNL
    Findings:
      - Coated tongue
      - Scalloped tongue
      - Bilateral linea alba
      - Palatine torus at midline (Slight)
      - Bilateral mandibular tori (Slight)
    Observations:
      - Mild soft tissue variations noted.

Gingival Description:
  Color: Red
    Extent: localized
    Teeth: #5, #6-8
    Location: Facial, Interproximal
    Distribution: Marginal, Papillary
    Notes: More pronounced in maxillary anterior region.
  Gingival Position: Recession
    Extent: localized
    Teeth: #24, #25
    Location: Facial
    Distribution: Diffuse
    Notes: Consistent with traumatic brushing history.
  Bleeding & Exudate: BOP
    Extent: generalized
    Location: Facial, Lingual
    Distribution: Marginal
    Notes: No exudate present.

Deposits and Inflammation:
  Plaque: none.
  Calculus: none.
  Extrinsic stain: none.
  Bleeding and inflammation: none.

Periodontal Status:
  Status:
    Active
    Periodontitis
    Moderate Periodontitis Stage II
    Grade B moderate rate of progression
  Notes:
    Reinforced 4-month hygiene interval and home-care compliance.

Caries Risk:
  Risk level: Moderate.
  Risk factors:
    - High frequency of sugar intake
    - Insufficient exposure to fluoride
    - History of caries in the last 36 months
  Notes:
    Diet and home-care factors reviewed.

Oral Health Education:
  Topics reviewed:
    - Caries theory
    - Caries risk factors
    - Bass brushing
    - C-shape flossing technique
    - Sulcabrush and interdental brush technique
    - Review benefits of Prevident or Opti-Rinse
    - Periodontitis theory
    - Periodontitis risk factors
    - Importance of maintaining a 4-month hygiene interval
  OHE notes:
    Demonstrated technique adjustments and reviewed daily routine.

Recommendations:
  Items:
    - High fluoride toothpaste (Prevident 5000)
    - Mouthwash (0.05% X-PUR Opti-Rinse)
    - Salt water rinse for 2-3 days
  Additional details:
    Start Prevident at night and Opti-Rinse once daily.

Clinical Documentation:
  Other clinical findings:
    Continue monitoring tongue and linea alba findings.
```

## Preview B: More Compact Format

```text
Visit Details:
  Date: 2026-03-09

History and Exam:
  Patient concerns: Sensitivity around lower anterior and occasional bleeding while flossing.
  Medical history: Med/dent history updated. No new contraindications reported.
  Vitals: BP 118/76; HR 72; BP taken at 09:15.

EOE/IOE:
  EOE:
    WNL
    Findings: Asymptomatic click on opening/closing (Bilateral).
    Notes: Baseline monitoring only.
  IOE:
    WNL
    Findings: Coated tongue; Scalloped tongue; Bilateral linea alba; Palatine torus at midline (Slight); Bilateral mandibular tori (Slight).
    Notes: Mild soft tissue variations noted.

Gingival Description:
  Color: Red.
    localized; teeth #5, #6-8; location Facial, Interproximal; distribution Marginal, Papillary; More pronounced in maxillary anterior region.
  Gingival Position: Recession.
    localized; teeth #24, #25; location Facial; distribution Diffuse; Consistent with traumatic brushing history.
  Bleeding & Exudate: BOP.
    generalized; location Facial, Lingual; distribution Marginal; No exudate present.
```

## Recommendation

Use **Preview A**.

Reason:

- It fixes all three EMR readability problems directly.
- It survives narrow text areas better because wrapped lines still remain visually grouped.
- It removes the repeated `EOE` / `IOE` prefixes without hiding clinically relevant structure.
