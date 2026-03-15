# Very Short Template Changes

Implement the following changes in the `very short template`.

## Scope

Treat this as one implementation request with two sections:
1. Core template updates
2. Local anesthesia card

## 1. Core Template Updates

1. Rename `Asymptomatic click on opening/closing` to `TMJ clicking`.

2. Under `TMJ clicking`, add these conditional sub-fields:
- Symptomatic
- Asymptomatic
- On open
- On close
- Left
- Right
- Bilateral

If a `Left / Right / Bilateral` control already exists and can be reused, reuse it. Otherwise add a new one.

3. Rename `Asymptomatic Lymph Nodes` to `Palpable Lymph Nodes`.

4. Under `Palpable Lymph Nodes`, add these conditional sub-fields:
- Left
- Right
- Bilateral
- Submandibular
- Sublingual
- Slightly enlarged
- Very swollen

5. For all gingival description sections, change the `Location` field so it uses sextants only, not surfaces.

Use these sextants:
- Sexatant 1 (Upper right)
- Sexatant 2 (Upper anterior)
- Sexatant 3 (Upper left)
- Sexatant 4 (Lower left)
- Sexatant 5 (Lower anterior)
- Sexatant 6 (Lower right)

6. Remove these sections entirely:
- Gingival Position
- Bleeding
- Exudate

7. In `Contour / Shape`, remove these options:
- Papilla: Cratered
- Papilla: Clefted

8. Split `Contour / Shape` into two separate sections:
- Gingival margins
- Interdental papilla

Move each existing option into the correct new section.

9. Rename the moved options by removing the prefixes:
- Remove `Margins:`
- Remove `Papilla:`

10. In `Calculus and Biofilm Deposits`, remove `Localized` and `Generalized` from the `Location / Type` field because those already exist in `Extent`.

11. In both `Treatment done today` and `Next appointment`, add:
- OHE reinforced
- Reviewed homecare

12. In both `Treatment done today` and `Next appointment`, rename `Select All` to `Select Core`.

`Select Core` should select only:
- Med/dent history update
- EOE/IOE
- OHE reinforced
- Reviewed homecare

13. In both `Treatment done today` and `Next appointment`, merge:
- Hand Instruments
- Power Instruments

Replace them with:
- Hand and Power Instrumentation

Export rule:
If areas instrumented are selected, place the area text before `Hand and Power Instrumentation`.
Do not include a dash between them.

Example exports:
`Q1, Q2, Q3 Hand and Power Instrumentation`
`Sextant 5, Sextant 6 Hand and Power Instrumentation`
`Full mouth Hand and Power Instrumentation`

## 2. Local Anesthesia Card

Add a new card named `Local Anesthesia`.

### Global toggles

Allow these independent selections:
- No C/I to LA
- Benzocaine 20% applied to the injection site
- No adverse reactions noted
- Adequate anesthesia achieved

### Injection entries

Allow adding one or more injection entries.

Each injection entry must include:
- Injection type: I/O, M/I, PSA, IA/L, Buccal NB, GP, NP
- Quadrant: Q1, Q2, Q3, Q4
- Anesthetic product
- Amount in ml
- Time administered

### Totals

After listing individual injection entries in the export, group entries by anesthetic product and sum the total ml for each product.

Rules:
- Totals are per anesthetic product
- Benzocaine is topical only and must not be included in totals
- Output one `Total:` line per anesthetic product
- Preserve decimal formatting consistently

### Export order

Export the local anesthesia section in this order:
1. `Local anesthetic administered: No C/I to LA` if selected
2. `Benzocaine 20% applied to the injection site` if selected
3. Each injection entry on its own line
4. One `Total:` line per anesthetic product
5. `No adverse reactions noted` if selected
6. `Adequate anesthesia achieved` if selected

### Example export

Local anesthetic administered: No C/I to LA
Benzocaine 20% applied to the injection site
PSA Q2: Articaine 4% 1:200,000 epi 1.2 ml (at 8:38 AM)
Total: Articaine 4% 1:200,000 epi 1.2 ml
No adverse reactions noted
