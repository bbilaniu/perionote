# ClearDent Custom Fields and Periodontal Redesign  
  
**Review date:** July 29, 2026  
  
**Purpose:** A readable, public-safe review for editing on an iPad and preparing files for GitHub.  

**Publication status:** Cleared by the document owner for public repository
publication on July 30, 2026. This clearance applies to this reviewed document,
not to the identifiable raw ClearDent exports or original template packages
described below.

**Implementation status:** Implemented in the Adult Hygiene 2021 interactive
template. The
[Periodontal Candidate-Classification Decision Table](../specs/periodontal-classification-decision-table.md)
is the normative specification for current candidate logic, safety invariants,
confirmation, and generated-output behavior. Clinical sign-off remains pending
as recorded in that decision table.
⸻  
## Start Here  
  
The complete user-defined-field export contains much more content than the visible ClearDent note templates suggest.  
  
The periodontal section is not just a few short dropdown labels. Several selections insert long blocks of diagnostic criteria into the chart. That can be useful, but the present wording has four major problems:  
  
1. Some thresholds are incorrect.  
2. Important smoking and diabetes modifiers are missing.  
3. Generic reference criteria can look like confirmed patient findings.  
4. The modern AAP/EFP classification is missing extent/distribution.  
  
The preferred redesign is to keep the detailed criteria, but separate:  
  
- the final diagnosis;  
- reference criteria shown to the clinician;  
- patient-specific criteria explicitly confirmed for the chart.  

The implementation owner is **Adult Hygiene 2021**. This redesign will replace
or evolve its current primitive Health/Gingivitis, Periodontitis Stage, and
Periodontitis Grade controls. Recare Exam is not the owner of periodontal
classification.
⸻  
# Part 1 - Privacy and Identifier Audit  
  
## Summary  
  
The extracted custom-field catalog contained identifiable clinic information.  
  
### Staff entries found  
  
- 2 named dentists  
- 5 named hygienists  
- 6 named registered dental assistants  
- 13 direct staff-name entries in total  
  
### Other identifying content found  
  
- 2 named external clinicians or referral offices  
- 3 named organizations, businesses, or clinic-specific locations  
- 3 local telephone or fax numbers  
- 1 referral website address  
- worker-derived template titles and filenames  
- clinic-derived filenames  
  
### Items not found in the readable export  
  
- no obvious login username;  
- no email address;  
- no Windows or macOS home-directory path;  
- no Desktop or Downloads path;  
- no actual patient name or patient value.  
  
==Patient First Name==, ==Patient Last Name==, and similar expressions are system-field labels. They are not exported patient data. However, the original template packages do contain real staff lists and should not be published unchanged.  
  
## Public-safe replacements  
  
Use these neutral entries in files intended for GitHub:  
  
### Dentists  
  
- DENTIST A  
- DENTIST B  
  
### Hygienists  
  
- HYGIENIST A  
- HYGIENIST B  
- HYGIENIST C  
- HYGIENIST D  
- HYGIENIST E  
  
### Registered dental assistants  
  
- RDA A  
- RDA B  
- RDA C  
- RDA D  
- RDA E  
- RDA F  
  
### External providers and businesses  
  
Replace local identities with role-based placeholders:  
  
```
SPECIALIST REFERRAL - CONFIGURE LOCALLY
LOCAL SPECIALIST - CONFIGURE LOCALLY
LOCAL PHARMACY - CONFIGURE LOCALLY
LOCAL PHYSIOTHERAPY CLINIC - CONFIGURE LOCALLY
PHONE: [CONFIGURE LOCALLY]
FAX: [CONFIGURE LOCALLY]
REFERRAL WEBSITE: [CONFIGURE LOCALLY]

```
  
  
## Files and titles to rename  
  
Replace worker-derived titles with workflow names:  
  
```
WORKER-DERIVED PART 1 TITLE
-> ADULT HYGIENE - PART 1

WORKER-DERIVED PART 2 TITLE
-> ADULT HYGIENE - PART 2

Worker-Name-1-2.ProgressNoteTemplate
-> Adult-Hygiene-Part-1-2.ProgressNoteTemplate

```
  
  
Replace clinic names in public filenames with ==Clinic==, or remove the clinic segment entirely.  
  
## Publication warning  
  
Do not publish these unchanged:  
  
- the raw ==ExportUserDefinedFields.UserDefinedField== export;  
- original ==UserFieldContent*.txt== files;  
- original ==.ProgressNoteTemplate== packages that contain staff lists;  
- worker-derived filenames;  
- clinic-derived filenames;  
- the private identifier mapping or audit.  
  
An anonymized JSON or text extraction is safer than publishing the original proprietary package.  
⸻  
# Part 2 - Agreed ClearDent Text Convention  
  
ClearDent converts the normal greater-than-or-equal and less-than-or-equal
symbols into a plain equals sign in this workflow.
  
For ClearDent-facing text, use:  
  
```
>=  greater than or equal to
<=  less than or equal to

```
  
  
Examples:  
  
```
PPD <=3 MM
PPD <=4 MM
INTERDENTAL CAL >=5 MM
TOOTH LOSS DUE TO PERIODONTITIS: <=4 TEETH
SMOKING >=10 CIGARETTES/DAY
HbA1c >=7.0%

```
  
  
For HygieneNote data, store the meaning semantically, for example:  
  
```
{
  "operator": "lte",
  "value": 4,
  "unit": "mm"
}

```
  
  
HygieneNote will display the normal clinical symbols `≤` and `≥` in the
application. Generated ClearDent-compatible output must use the ASCII forms
`<=` and `>=`, for example `PPD <=4 MM`.
⸻  
# Part 3 - Best Interface Approach  
  
## Do not use one Stage I-IV slider by itself  
  
Stage is not simply a linear severity scale. It depends on severity, tooth loss, and complexity factors. A single slider could encourage the user to select a stage without documenting why.  
  
## Recommended hybrid design  
  
### Use exact numeric fields or steppers for  
  
- greatest interdental CAL in millimetres;  
- radiographic bone loss percentage;  
- radiographic bone-loss distribution;  
- maximum PPD in millimetres;  
- teeth lost due to periodontitis;  
- vertical bone loss in millimetres;  
- bone-loss/age ratio;  
- change in RBL or CAL over five years;  
- cigarettes per day;  
- HbA1c percentage when diabetes is present;  
- bleeding on probing percentage;  
- percentage of teeth involved.  
  
### Use checkboxes for  
  
- mostly horizontal bone loss;  
- vertical bone loss;  
- Class II furcation involvement;  
- Class III furcation involvement;  
- moderate ridge defects;  
- severe ridge defects;  
- masticatory dysfunction;  
- secondary occlusal trauma;  
- mobility degree >=2;  
- bite collapse;  
- pathologic drifting;  
- pathologic flaring;  
- fewer than 20 remaining teeth;  
- fewer than 10 opposing pairs;  
- direct evidence of progression;  
- phenotype evidence used for grading.  
  
### A slider can be useful for  
  
- BOP percentage;  
- percentage of teeth involved;  
- radiographic bone-loss percentage.  
  
The slider should always display an exact numeric value and allow direct entry. It should not be the only control at an important threshold.  
  
## Suggested classification workflow  
  
1. Enter the patient-specific measurements and findings.  
2. Show the applicable reference criteria beside the fields.  
3. Calculate a candidate extent, stage, and grade.  
4. Show why the candidate classification was suggested.  
5. Require the clinician to confirm or override it.  
6. Include only confirmed patient-specific criteria in the generated chart note.  
  
## Important distinction  
  
The application should distinguish between:  
  
### Reference criteria  
  
Information shown to help the clinician make a classification.  
  
### Confirmed findings  
  
Information explicitly selected as applying to this patient and included in the chart.  
  
A generic Stage III reference list should not automatically become a claim that the patient has every Stage III feature.  
⸻  
# Part 4 - Proposed Periodontal Data Model  
  
A useful structured record would look like this:  
  
```
{
  "diagnosis": "periodontitis",
  "extent": "generalized",
  "stage": "III",
  "grade": "B",
  "status": "currently unstable",
  "stageBasis": [
    "interdental CAL >=5 mm",
    "RBL extends to the middle third",
    "Class II furcation involvement"
  ],
  "gradeBasis": [
    "bone-loss/age ratio 0.72"
  ],
  "riskModifiers": {
    "smoking": "non-smoker",
    "diabetes": "no diagnosis of diabetes"
  }
}

```
  
  
## Recommended ClearDent custom fields  
  
Because ClearDent fields are menu driven, separate the diagnosis from its supporting evidence:  
  
1. ==PERIODONTAL: DIAGNOSIS CATEGORY==  
2. ==PERIODONTITIS: EXTENT/DISTRIBUTION==  
3. ==PERIODONTITIS: STAGE==  
4. ==PERIODONTITIS: STAGE BASIS - SEVERITY==  
5. ==PERIODONTITIS: STAGE BASIS - COMPLEXITY==  
6. ==PERIODONTITIS: GRADE==  
7. ==PERIODONTITIS: GRADE BASIS - PROGRESSION==  
8. ==PERIODONTITIS: SMOKING MODIFIER==  
9. ==PERIODONTITIS: DIABETES MODIFIER==  
10. ==PERIODONTAL STATUS==  
  
If ClearDent does not allow multiple selections from one custom field, use separate fields for individual categories or repeat a basis field as needed.  
⸻  
# Part 5 - Corrected Health and Gingivitis Entries  
  
## Option 1 - Health on an intact periodontium  
  
### Menu label  
  
```
HEALTH - INTACT PERIODONTIUM

```
  
  
### Inserted text  
  
```
HEALTH - INTACT PERIODONTIUM
- NO PROBING ATTACHMENT LOSS
- PPD <=3 MM
- BOP <10%
- NO RADIOGRAPHIC BONE LOSS

```
  
  
## Option 2 - Gingivitis on an intact periodontium  
  
### Menu label  
  
```
GINGIVITIS - INTACT PERIODONTIUM

```
  
  
### Inserted text  
  
```
GINGIVITIS - INTACT PERIODONTIUM
- NO PROBING ATTACHMENT LOSS
- PPD <=3 MM
- BOP >=10%
- NO RADIOGRAPHIC BONE LOSS

```
  
  
Extent of gingivitis can be documented separately:  
  
```
LOCALIZED: 10%-30% BOP SITES
GENERALIZED: >30% BOP SITES

```
  
  
## Option 3 - Health on a reduced periodontium in a non-periodontitis patient  
  
### Menu label  
  
```
HEALTH - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT

```
  
  
### Inserted text  
  
```
HEALTH - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT
- PROBING ATTACHMENT LOSS PRESENT
- PPD <=3 MM
- BOP <10%
- RADIOGRAPHIC BONE LOSS MAY BE PRESENT

```
  
  
## Option 4 - Gingivitis on a reduced periodontium in a non-periodontitis patient  
  
### Menu label  
  
```
GINGIVITIS - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT

```
  
  
### Inserted text  
  
```
GINGIVITIS - REDUCED PERIODONTIUM, NON-PERIODONTITIS PATIENT
- PROBING ATTACHMENT LOSS PRESENT
- PPD <=3 MM
- BOP >=10%
- RADIOGRAPHIC BONE LOSS MAY BE PRESENT

```
  
  
## Option 5 - Stable, successfully treated periodontitis patient  
  
### Menu label  
  
```
HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT

```
  
  
### Inserted text  
  
```
HEALTH - SUCCESSFULLY TREATED, STABLE PERIODONTITIS PATIENT
- HISTORY OF PERIODONTITIS WITH REDUCED ATTACHMENT/BONE LEVELS
- PPD <=4 MM
- NO SITE WITH PPD >=4 MM AND BOP
- BOP <10%
- NO EVIDENCE OF PROGRESSIVE PERIODONTAL DESTRUCTION

```
  
  
## Option 6 - Gingival inflammation in a patient with a history of periodontitis  
  
### Menu label  
  
```
GINGIVAL INFLAMMATION - PATIENT WITH HISTORY OF PERIODONTITIS

```
  
  
### Inserted text  
  
```
GINGIVAL INFLAMMATION - PATIENT WITH HISTORY OF PERIODONTITIS
- PROBING ATTACHMENT LOSS AND RADIOGRAPHIC BONE LOSS PRESENT
- BLEEDING SITES USED FOR THIS CATEGORY HAVE PPD <=3 MM
- BOP >=10%
- ASSESS SITES WITH PPD >=4 MM AND BOP FOR RECURRENT OR UNSTABLE PERIODONTITIS

```
  
  
A patient with a history of periodontitis should not be relabelled as a simple gingivitis patient.  
⸻  
# Part 6 - Add Extent/Distribution to the AAP/EFP Classification  
  
Use the classification name:  
  
```
AAP/EFP 2017 WORLD WORKSHOP CLASSIFICATION, PUBLISHED IN 2018

```
  
  
The European organization is the European Federation of Periodontology, abbreviated EFP.  
  
## Proposed field name  
  
```
PERIODONTITIS: EXTENT/DISTRIBUTION

```
  
  
## Option 1 - Localized  
  
### Menu label  
  
```
LOCALIZED

```
  
  
### Inserted text  
  
```
LOCALIZED (<30% OF TEETH INVOLVED)

```
  
  
## Option 2 - Generalized  
  
### Menu label  
  
```
GENERALIZED

```
  
  
### Inserted text  
  
```
GENERALIZED (>=30% OF TEETH INVOLVED)

```
  
  
## Option 3 - Molar/incisor pattern  
  
### Menu label  
  
```
MOLAR/INCISOR PATTERN

```
  
  
### Inserted text  
  
```
MOLAR/INCISOR PATTERN

```
  
  
## Option 4 - Not assessed or not applicable  
  
### Menu label  
  
```
NOT ASSESSED / N/A

```
  
  
### Inserted text  
  
```
NOT ASSESSED / N/A

```
  
  
## Example complete diagnosis  
  
```
GENERALIZED PERIODONTITIS, STAGE III, GRADE B.

```
  
  
Extent should remain a separate field instead of multiplying all possible combinations such as ==Localized Stage III==, ==Generalized Stage III==, and so on.  
⸻  
# Part 7 - Corrected Periodontitis Staging Reference Criteria  
  
These are reference criteria. Do not insert every line into a patient chart unless the clinician confirms that it applies.  
  
## Stage I - P1  
  
### Menu label  
  
```
STAGE I = P1

```
  
  
### Reference criteria  
  
```
STAGE I = P1
REFERENCE CRITERIA:
- INTERDENTAL CAL: 1-2 MM
- RBL: CORONAL THIRD (<15%)
- NO TOOTH LOSS DUE TO PERIODONTITIS
- MAXIMUM PPD <=4 MM
- MOSTLY HORIZONTAL BONE LOSS

```
  
  
## Stage II - P2  
  
### Menu label  
  
```
STAGE II = P2

```
  
  
### Reference criteria  
  
```
STAGE II = P2
REFERENCE CRITERIA:
- INTERDENTAL CAL: 3-4 MM
- RBL: CORONAL THIRD (15%-33%)
- NO TOOTH LOSS DUE TO PERIODONTITIS
- MAXIMUM PPD <=5 MM
- MOSTLY HORIZONTAL BONE LOSS

```
  
  
## Stage III - P3  
  
### Menu label  
  
```
STAGE III = P3

```
  
  
### Reference criteria  
  
```
STAGE III = P3
REFERENCE CRITERIA:
- INTERDENTAL CAL >=5 MM
- RBL EXTENDS TO THE MIDDLE THIRD OF THE ROOT AND BEYOND
- TOOTH LOSS DUE TO PERIODONTITIS: <=4 TEETH
- ONE OR MORE COMPLEXITY FACTORS MAY APPLY:
  - PPD >=6 MM
  - VERTICAL BONE LOSS >=3 MM
  - CLASS II OR III FURCATION INVOLVEMENT
  - MODERATE RIDGE DEFECTS

```
  
  
## Stage IV - P4  
  
### Menu label  
  
```
STAGE IV = P4

```
  
  
### Reference criteria  
  
```
STAGE IV = P4
REFERENCE CRITERIA:
- INTERDENTAL CAL >=5 MM
- RBL EXTENDS TO THE MIDDLE THIRD OF THE ROOT AND BEYOND
- TOOTH LOSS DUE TO PERIODONTITIS: >=5 TEETH
- STAGE III COMPLEXITY PLUS NEED FOR COMPLEX REHABILITATION DUE TO ONE OR MORE:
  - MASTICATORY DYSFUNCTION
  - SECONDARY OCCLUSAL TRAUMA (TOOTH MOBILITY DEGREE >=2)
  - SEVERE RIDGE DEFECTS
  - BITE COLLAPSE, DRIFTING, OR FLARING
  - <20 REMAINING TEETH (10 OPPOSING PAIRS)

```
  
  
## Not applicable  
  
```
N/A

```
  
⸻  
# Part 8 - Corrected Periodontitis Grading Criteria and Modifiers  
  
Begin with Grade B as a working assumption and move to Grade A or C only when supported by evidence. This should be a clinical suggestion, not an automatic charted conclusion.  
  
## Grade A - Slow rate  
  
### Menu label  
  
```
GRADE A - SLOW RATE

```
  
  
### Reference criteria and modifiers  
  
```
GRADE A - SLOW RATE
REFERENCE CRITERIA:
- NO RADIOGRAPHIC BONE LOSS OR CAL PROGRESSION OVER 5 YEARS
- BONE LOSS/AGE RATIO <0.25
- HEAVY BIOFILM DEPOSITS WITH LOW LEVELS OF DESTRUCTION
GRADE MODIFIERS:
- NON-SMOKER
- NORMOGLYCEMIC / NO DIAGNOSIS OF DIABETES

```
  
  
## Grade B - Moderate rate  
  
### Menu label  
  
```
GRADE B - MODERATE RATE

```
  
  
### Reference criteria and modifiers  
  
```
GRADE B - MODERATE RATE
REFERENCE CRITERIA:
- RADIOGRAPHIC BONE LOSS OR CAL PROGRESSION <2 MM OVER 5 YEARS
- BONE LOSS/AGE RATIO 0.25-1.0
- DESTRUCTION COMMENSURATE WITH BIOFILM DEPOSITS
GRADE MODIFIERS:
- SMOKING <10 CIGARETTES/DAY
- HbA1c <7.0% IN A PATIENT WITH DIABETES

```
  
  
## Grade C - Rapid rate  
  
### Menu label  
  
```
GRADE C - RAPID RATE

```
  
  
### Reference criteria and modifiers  
  
```
GRADE C - RAPID RATE
REFERENCE CRITERIA:
- RADIOGRAPHIC BONE LOSS OR CAL PROGRESSION >=2 MM OVER 5 YEARS
- BONE LOSS/AGE RATIO >1.0
- DESTRUCTION EXCEEDS EXPECTATIONS GIVEN BIOFILM DEPOSITS
- RAPID PROGRESSION AND/OR AN EARLY-ONSET PATTERN MAY BE PRESENT
GRADE MODIFIERS:
- SMOKING >=10 CIGARETTES/DAY
- HbA1c >=7.0% IN A PATIENT WITH DIABETES

```
  
  
## Not applicable  
  
```
N/A

```
  
  
## Tobacco and nicotine note  
  
The formal grading thresholds are stated in cigarettes per day.  
  
HygieneNote can use a broader heading such as:  
  
```
SMOKING AND TOBACCO/NICOTINE EXPOSURE

```
  
  
However, other tobacco or nicotine exposures should be documented separately. Do not silently convert vaping, cigars, chewing tobacco, or other products into a cigarette-equivalent grade without clinician judgment.  
⸻  
# Part 9 - Recommended Patient-Specific Basis Fields  
  
## Stage basis - severity  
  
Possible selectable entries:  
  
```
INTERDENTAL CAL 1-2 MM
INTERDENTAL CAL 3-4 MM
INTERDENTAL CAL >=5 MM
RBL LIMITED TO CORONAL THIRD (<15%)
RBL LIMITED TO CORONAL THIRD (15%-33%)
RBL EXTENDS TO MIDDLE THIRD OR BEYOND
NO TOOTH LOSS DUE TO PERIODONTITIS
TOOTH LOSS DUE TO PERIODONTITIS: <=4 TEETH
TOOTH LOSS DUE TO PERIODONTITIS: >=5 TEETH

```
  
  
## Stage basis - complexity  
  
Possible selectable entries:  
  
```
MAXIMUM PPD <=4 MM
MAXIMUM PPD <=5 MM
PPD >=6 MM
MOSTLY HORIZONTAL BONE LOSS
VERTICAL BONE LOSS >=3 MM
CLASS II FURCATION INVOLVEMENT
CLASS III FURCATION INVOLVEMENT
MODERATE RIDGE DEFECTS
SEVERE RIDGE DEFECTS
MASTICATORY DYSFUNCTION
SECONDARY OCCLUSAL TRAUMA
TOOTH MOBILITY DEGREE >=2
BITE COLLAPSE
PATHOLOGIC DRIFTING
PATHOLOGIC FLARING
<20 REMAINING TEETH
<10 OPPOSING PAIRS

```
  
  
## Grade basis - progression  
  
Possible selectable entries:  
  
```
NO RBL OR CAL PROGRESSION OVER 5 YEARS
RBL OR CAL PROGRESSION <2 MM OVER 5 YEARS
RBL OR CAL PROGRESSION >=2 MM OVER 5 YEARS
BONE LOSS/AGE RATIO <0.25
BONE LOSS/AGE RATIO 0.25-1.0
BONE LOSS/AGE RATIO >1.0
DESTRUCTION LOW RELATIVE TO BIOFILM
DESTRUCTION COMMENSURATE WITH BIOFILM
DESTRUCTION EXCEEDS EXPECTATIONS GIVEN BIOFILM

```
  
  
## Smoking modifier  
  
Possible entries:  
  
```
NON-SMOKER
SMOKES <10 CIGARETTES/DAY
SMOKES >=10 CIGARETTES/DAY
OTHER TOBACCO/NICOTINE EXPOSURE - DOCUMENTED SEPARATELY
NOT ASSESSED

```
  
  
## Diabetes modifier  
  
Possible entries:  
  
```
NO DIAGNOSIS OF DIABETES / NORMOGLYCEMIC
DIABETES WITH HbA1c <7.0%
DIABETES WITH HbA1c >=7.0%
DIABETES PRESENT - CURRENT HbA1c UNKNOWN
NOT ASSESSED

```
  
⸻  
# Part 10 - Example Generated Notes  
  
## Concise output  
  
```
Periodontal diagnosis: Generalized periodontitis, Stage III, Grade B.
Stage basis: interdental CAL >=5 mm; RBL extending to the middle third;
Class II furcation involvement.
Grade basis: bone-loss/age ratio 0.72; destruction commensurate with biofilm.
Grade modifiers: non-smoker; no diagnosis of diabetes.

```
  
  
## Expanded output  
  
```
Periodontal diagnosis: Generalized periodontitis, Stage III, Grade C.

Extent:
- >=30% of teeth involved.

Stage criteria confirmed:
- Interdental CAL >=5 mm.
- RBL extends to the middle third of the root.
- PPD >=6 mm.
- Class II furcation involvement.

Grade criteria confirmed:
- Bone-loss/age ratio >1.0.
- Destruction exceeds expectations given the level of biofilm.

Grade modifiers:
- Smokes 12 cigarettes/day.
- Diabetes present; HbA1c 7.4%.

```
  
  
## Why this is preferable  
  
This format keeps the detailed classification logic while documenting only findings that were explicitly selected for the patient.  
  
It avoids turning a generic reference list into a false claim that every criterion applied.  
⸻  
# Part 11 - Suggested HygieneNote Form Layout  
  
## Section A - Periodontal diagnosis category  
  
- Periodontal health  
- Gingivitis  
- Periodontitis / history of periodontitis
- Other periodontal condition  
- Not assessed  
  
## Section B - Periodontal support (if known)

- Unknown / not yet assessed
- Intact periodontal support
- Reduced support (not due to periodontitis)
- Reduced support (with a history of treated periodontitis)
  
## Section C - Extent/distribution  
  
- Localized  
- Generalized  
- Molar/incisor pattern  
- Not assessed  
  
## Section D - Stage  
  
- Stage I  
- Stage II  
- Stage III  
- Stage IV  
- Not applicable  
  
Show reference criteria beside each stage, then require the user to check the findings that apply.  
  
## Section E - Grade  
  
- Grade A  
- Grade B  
- Grade C  
- Not applicable  
  
Show the direct progression, indirect progression, phenotype, smoking, and diabetes evidence separately.  
  
## Section F - Current periodontal status

Use only terminology traceable to the 2018 classification framework:

- Periodontal disease stability
- Periodontal disease remission/control
- Unstable/recurrent periodontitis

`Not assessed / insufficient information` may be available as a workflow state,
but it is not a periodontal diagnosis or classification. Any legacy
periodontal-status term that cannot be traced to the 2018 framework is
deprecated and must not be introduced as a new selectable clinical status.
Status does not replace the stage and grade diagnosis.
  
## Section G - Output detail  
  
Allow the user to choose:  
  
- concise diagnosis only;  
- diagnosis plus confirmed basis (**preferred/default**);  
- expanded chart note.  
⸻  
# Part 12 - Overnight GitHub Editing Checklist  
  
- [ ] Upload only public-safe anonymized files.  
- [ ] Do not upload the raw ==ExportUserDefinedFields.UserDefinedField== file.  
- [ ] Do not upload the private identifier audit or mapping.  
- [ ] Do not upload original ==.ProgressNoteTemplate== packages until their embedded values are anonymized.  
- [ ] Rename filenames and template titles containing a clinic or worker name.  
- [ ] Use `>=` and `<=` in all generated ClearDent-facing strings.  
- [ ] Add ==PERIODONTITIS: EXTENT/DISTRIBUTION==.  
- [ ] Correct Stage I through Stage IV boundaries.  
- [ ] Correct the health and gingivitis boundaries.  
- [ ] Add smoking modifiers to Grades A, B, and C.  
- [ ] Add diabetes modifiers to Grades A, B, and C.  
- [ ] Keep reference criteria separate from patient-specific confirmed findings.  
- [ ] Review all spelling, spacing, punctuation, and capitalization.  
- [ ] Review medication and prescription snippets separately before publication or reuse.  
- [ ] Search the staged commit against the private identifier audit.  
- [ ] Search for ==Dr.==, ==phone==, ==fax==, ==http==, ==www.==, ==@==, ==Users==, ==Desktop==, and ==Downloads==.  
- [ ] Review the final Git diff before committing.  
⸻  
# Part 13 - Recommended Repository Structure  
  
```
data/
  public/
    cleardent-user-defined-fields.anonymized.json
    cleardent-user-defined-fields.anonymized-readable.txt

docs/
  ClearDent_Periodontal_Audit_and_Redesign_iPad.md
  periodontal-classification-decisions.md
  publication-safety.md

private/
  KEEP OUTSIDE PUBLIC GIT

```
  
  
A private folder inside a public repository is still public. Keep the original mapping and identifiable source material outside the repository or in a separately secured private repository.  
⸻  
# Part 14 - Primary Clinical References  
  
- American Academy of Periodontology, *Staging and Grading Periodontitis*  
  
- [https://www.perio.org/wp-content/uploads/2019/08/Staging-and-Grading-Periodontitis.pdf](https://www.perio.org/wp-content/uploads/2019/08/Staging-and-Grading-Periodontitis.pdf)  
  
- Chapple ILC, Mealey BL, and colleagues, *Periodontal health and gingival diseases and conditions on an intact and a reduced periodontium: Consensus report of Workgroup 1 of the 2017 World Workshop*. Journal of Clinical Periodontology. 2018;45(Suppl 20):S68-S77. DOI: 10.1111/jcpe.12940.  
⸻  
# Final Working Decision  
  
For the first HygieneNote periodontal implementation:  
  
1. Keep the detailed AAP/EFP criteria available on screen.  
2. Use exact numeric inputs and checkboxes as the primary controls.  
3. Use sliders only as optional secondary controls for percentages.  
4. Suggest a stage and grade but require the clinician to apply the suggestion or explicitly select a value.
5. Add extent/distribution as a separate field.  
6. Include smoking and diabetes mellitus modifiers.  
7. Default to diagnosis plus confirmed basis; concise-only and expanded output may remain explicit alternatives.  
8. Insert only confirmed patient-specific criteria into the note.  
9. Display `≥` and `≤` in the application and render `>=` and `<=` in ClearDent-compatible output.  
10. Use only 2018-aligned periodontal-status terminology and deprecate non-aligned legacy terms.  
11. Keep all public GitHub content anonymized; this reviewed document itself is cleared for publication.  
