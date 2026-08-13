# Periodontal Candidate-Classification Decision Table

**Implementation status:** Implemented for candidate suggestions.

**Clinical review status:** Pending clinician sign-off. Candidate results are
decision support only. A selected diagnosis is clinician-entered, not inferred.
Candidate contexts, stages, and grades are never charted until the clinician
applies a suggestion or explicitly selects them.

## Sources

- [AAP staging and grading overview](https://www.perio.org/wp-content/uploads/2019/08/Staging-and-Grading-Periodontitis.pdf)
- [Tonetti, Greenwell, and Kornman 2018 framework](https://aap.onlinelibrary.wiley.com/doi/10.1002/JPER.18-0006)
- [Papapanou and colleagues 2018 periodontitis case-definition consensus](https://doi.org/10.1111/jcpe.12946)
- [Chapple, Mealey, and colleagues 2018 health and gingivitis consensus](https://aap.onlinelibrary.wiley.com/doi/full/10.1002/JPER.17-0719)
- [Reviewed ClearDent periodontal redesign](../requests/ClearDent%20Custom%20Fields%20and%20Periodontal%20Redesign.md)

The checked-in implementation is in
`lib/templates/periodontalClassification.ts`. Criterion IDs and typed
measurements are encounter state. Display and note wording come from the
catalogue in that module.

## Safety Invariants

| Concern | Decision |
| --- | --- |
| Diagnosis and case definition | The application does not diagnose periodontitis, determine whether the formal periodontitis case definition is met, or attribute CAL to periodontitis rather than another cause. The clinician selects the diagnosis category before candidate calculation. |
| Candidate versus diagnosis | A candidate is never a diagnosis. Health/Gingivitis or treated-periodontitis context, stage, and grade are charted only after the clinician applies the suggestion or explicitly selects a value. |
| Reference versus finding | Reference thresholds are application data. Only entered measurements and explicitly selected findings are patient-specific evidence. |
| Generated output | Blank stage/grade selections and their basis are omitted. The basis for selected values is generated from criterion IDs and typed values. |
| Override | A selected context, stage, or grade may differ from its candidate only when a non-empty override reason is entered. Removing the reason suppresses the incompatible selection from output. |
| Missing stage data | No stage is suggested. The candidate reports that patient-specific stage evidence is missing. |
| Missing grade data | For a periodontitis diagnosis, Grade B is shown as a working assumption with a warning. It is not confirmed or charted automatically. |
| Unsupported exposure | Non-cigarette nicotine exposure is documented separately and never converted to cigarettes/day. |
| Unknown HbA1c | Diabetes with unknown current HbA1c does not modify the candidate grade. |
| Health/Gingivitis compatibility | Structured evidence is calculated and confirmed, while generated output retains the familiar ClearDent field heading and charts only entered measurements and declared findings. |
| Treated context and status | A selected stable treated-periodontitis context permits periodontal disease stability; a selected inflammation context permits remission/control. Incompatible current-status choices are not charted. |
| Status scope | Current periodontal disease status and its optional encounter comment are available and charted only with a periodontitis diagnosis. Changing to another diagnosis clears both; output also suppresses stale persisted values defensively. |

## Candidate Scope and Prerequisites

The diagnosis category is a clinician-entered prerequisite, not a candidate:

| Selected diagnosis | Candidate behavior |
| --- | --- |
| Not assessed or other periodontal condition | No Health/Gingivitis context, stage, or grade candidate |
| Periodontal health or gingivitis | Health/Gingivitis context candidate only |
| Periodontitis / history of periodontitis | Treated-periodontitis context candidate when treated support is selected; stage and grade candidates |

A successfully treated periodontitis patient remains in the `Periodontitis /
history of periodontitis` diagnosis/history category even when current findings
meet periodontal-health thresholds. In that situation, periodontal health is the
current treated-periodontitis context and `Periodontal disease stability` is the
compatible current status. The simple `Periodontal health` diagnosis category is
reserved for patients without a history of periodontitis.

Health/Gingivitis candidates require periodontal support, exact BOP percentage,
exact maximum PPD, probing attachment-loss assessment, and radiographic
bone-loss assessment. A treated-periodontitis context additionally requires
assessment of sites with PPD >=4 mm and BOP and evidence of progressive
destruction. `Unknown / not yet assessed` is valid documentation for periodontal
support, but it leaves the automatic context candidate unavailable.

The candidate panel presents missing prerequisites with user-facing field names.
Each missing-item link expands the structured-observation section, scrolls to
and focuses the corresponding control, and applies a temporary visual highlight.
Missing data is not styled as a permanent validation error.

The current implementation does not assume a default stage. Without supported
stage evidence it shows no stage candidate, while Grade B may still appear as an
explicit working assumption. Offering Stage II as a similarly labelled working
assumption remains a separate clinical decision and is not implemented.

## Health/Gingivitis and Treated-Periodontitis Context Table

Maximum PPD is a shared measurement used by both this table and periodontitis
staging. It is synchronized between Periodontal assessment findings and Stage
complexity evidence without creating duplicate data. The deeper-pocket BOP
state is shared in the same way. Unassessed negative findings never count as
confirmed absence.

| Diagnosis and periodontal support | Required evidence | Candidate |
| --- | --- | --- |
| Health; intact | BOP <10%; maximum PPD <=3 mm; attachment loss absent; RBL absent | Health - intact periodontium |
| Gingivitis; intact | BOP >=10%; maximum PPD <=3 mm; attachment loss absent; RBL absent | Gingivitis - intact periodontium |
| Health; reduced non-periodontitis | BOP <10%; maximum PPD <=3 mm; attachment loss present; RBL assessed | Health - reduced periodontium, non-periodontitis patient |
| Gingivitis; reduced non-periodontitis | BOP >=10%; maximum PPD <=3 mm; attachment loss present; RBL assessed | Gingivitis - reduced periodontium, non-periodontitis patient |
| Periodontitis; reduced treated | BOP <10%; maximum PPD <=4 mm; attachment and RBL present; no site with PPD >=4 mm and BOP; no progressive destruction | Health - successfully treated, stable periodontitis patient |
| Periodontitis; reduced treated | BOP >=10%; maximum PPD <4 mm; attachment and RBL present; no site with PPD >=4 mm and BOP; no progressive destruction | Gingival inflammation - patient with history of periodontitis |

A site with PPD >=4 mm and BOP or evidence of progressive destruction suppresses
the treated-periodontitis context candidate and prompts assessment for unstable
or recurrent periodontitis. A treated periodontitis patient is never relabelled
as a simple gingivitis patient.

Confirmed output uses the entered maximum PPD and BOP percentage plus declared
attachment-loss, radiographic-bone-loss, deeper-pocket BOP, and progression
states. Candidate thresholds remain reference logic and are not emitted as if
they were patient findings.

## Extent/Distribution

Extent/distribution is currently clinician-selected and is not calculated. The
encounter state does not contain the percentage of periodontitis-involved teeth
or the distribution evidence needed to distinguish localized, generalized, and
molar/incisor-pattern disease safely. A clinician-selected localized or
generalized extent is charted with a confirmed gingivitis or periodontitis
diagnosis; molar/incisor pattern is charted only with periodontitis.

Periodontitis extent must not be inferred from BOP percentage. Gingivitis extent
and periodontitis extent use different findings and denominators. Automated
extent would require additional patient-specific involvement and distribution
inputs plus separate clinical review.

## Stage Table

The candidate begins with the initial severity level. Periodontitis-related
tooth loss and complexity may raise it. When evidence points to several levels,
the highest applicable stage is suggested and a conflict warning is shown.

| Evidence | Candidate level |
| --- | --- |
| Interdental CAL >0 and <3 mm | I |
| Interdental CAL >=3 and <5 mm | II |
| Interdental CAL >=5 mm | III |
| RBL >0 and <15% | I |
| RBL 15%-33% | II |
| RBL >33%, or RBL to middle third or beyond | III |
| 1-4 teeth lost due to periodontitis | III |
| >=5 teeth lost due to periodontitis | IV |
| Maximum PPD >=1 and <5 mm | I |
| Maximum PPD >=5 and <6 mm | II |
| Maximum PPD >=6 mm | III |
| Mostly horizontal bone loss | I complexity evidence; cannot lower a higher severity level |
| Vertical bone loss >=3 mm | III |
| Class II/III furcation involvement | III |
| Moderate ridge defect | III |
| Masticatory dysfunction | IV |
| Secondary occlusal trauma or mobility degree >=2 | IV |
| Severe ridge defect | IV |
| Bite collapse, pathologic drifting, or pathologic flaring | IV |
| <20 remaining teeth or <10 opposing pairs | IV |

These intervals are continuous. Decimal values fall into the interval containing
the entered value; for example, CAL 4.9 mm suggests Stage II and maximum PPD
5.9 mm suggests Stage II. This avoids unsupported gaps when a decimal is entered
despite the nominal whole-millimetre clinical controls.

## Grade Table

Evidence source precedence is direct progression, then indirect progression,
then phenotype. Grade B is the working assumption only when all three are
missing for a periodontitis diagnosis. Within the selected source, conflicting
levels resolve upward with a warning.

| Evidence | Candidate level |
| --- | --- |
| No RBL/CAL progression over 5 years (0 mm) | A |
| RBL/CAL progression >0 and <2 mm over 5 years | B |
| RBL/CAL progression >=2 mm over 5 years | C |
| Bone-loss/age ratio <0.25 | A |
| Bone-loss/age ratio 0.25-1.0 | B |
| Bone-loss/age ratio >1.0 | C |
| Destruction low relative to biofilm | A |
| Destruction commensurate with biofilm | B |
| Destruction exceeds expectations given biofilm | C |

## Modifier Table

Modifiers can raise the evidence-based or assumed grade. They never lower it.

| Modifier | Candidate level |
| --- | --- |
| Non-smoker | A modifier; no downgrade |
| 1-9 cigarettes/day | B modifier |
| >=10 cigarettes/day | C modifier |
| No diabetes diagnosis / normoglycemic | A modifier; no downgrade |
| Diabetes with HbA1c <7% | B modifier |
| Diabetes with HbA1c >=7% | C modifier |
| Other tobacco/nicotine exposure | No automatic modification |
| Diabetes with current HbA1c unknown | No automatic modification |

Selecting cigarette exposure without a positive whole-number cigarettes/day
value produces no smoking modification and displays a warning. Selecting
diabetes with current HbA1c without a positive HbA1c value likewise produces no
diabetes modification and displays a warning.

## Input Validity and Boundary Semantics

- Candidate calculations use exact (`eq`), finite measurements with the expected
  unit. Other operators remain documentable encounter data but do not cross a
  candidate threshold.
- BOP and RBL percentages are supported from 0% through 100%. RBL must be
  greater than 0% to contribute a stage.
- CAL and vertical bone loss must be positive to contribute. Maximum PPD must
  be at least 1 mm. Five-year progression may be 0 mm because 0 is Grade A
  evidence.
- Tooth and opposing-pair counts must be non-negative whole numbers. Teeth lost
  due to periodontitis must be at least 1 to contribute a stage.
- Cigarettes/day must be a positive whole number when cigarette exposure is
  selected. Values 1 through 9 modify to Grade B; values >=10 modify to Grade C.
- A current HbA1c must be positive to modify grade. Values <7% modify to Grade B;
  values >=7% modify to Grade C.
- Unsupported or out-of-domain values do not contribute to the candidate. They
  are retained as entered data only when allowed by the surrounding form and
  require clinician correction or review.

## Confirmation and Output

1. The clinician selects the diagnosis category; the application does not infer
   the diagnosis or case definition.
2. The application calculates the candidates that are in scope and displays
   missing prerequisites, rationale, and warnings.
3. The clinician may accept a candidate or independently select a context,
   stage, and grade.
4. Changing a selection or its supporting evidence clears the affected prior
   confirmation.
5. The clinician explicitly confirms each selected candidate value.
6. A difference between candidate and selected value reveals an override-reason
   field. Confirmation remains disabled until the reason is non-empty, and
   removing the reason clears confirmation.
7. Output includes only confirmed context/stage/grade and entered
   patient-specific basis. Candidate-determining rationale may be a subset of
   the complete entered basis included in confirmed output.
8. Extent is selected manually and has no separate candidate confirmation.
9. Entered risk modifiers and compatible 2018-aligned periodontal status remain
   explicit patient findings. Status is charted only for periodontitis.

## Clinical Review Checklist

- [ ] Confirm CAL/RBL fallback and conflict behavior.
- [ ] Confirm that RBL >33% is sufficient to suggest Stage III in this workflow.
- [ ] Decide whether a stage candidate requires CAL, RBL, RBL-extent, or periodontitis-related tooth-loss severity evidence before complexity can establish or raise it.
- [ ] Decide whether Stage II should ever appear as a clearly labelled working assumption when stage evidence is absent; current behavior suggests no stage.
- [ ] Confirm continuous decimal boundaries for CAL and maximum PPD.
- [ ] Confirm Stage III/IV complexity escalation without separately entered severity evidence.
- [ ] Confirm direct-over-indirect-over-phenotype grade precedence.
- [ ] Confirm Grade B working-assumption behavior when progression data are absent.
- [ ] Confirm positive-value and whole-number requirements for smoking, HbA1c, and count inputs.
- [ ] Confirm maximum PPD <4 mm for remission/control context.
- [ ] Confirm manual-only extent/distribution until sufficient involvement and pattern data exists.
- [ ] Confirm generated wording and mandatory override documentation.
- [ ] Confirm periodontal status is cleared and suppressed outside a periodontitis diagnosis.
- [ ] Confirm all six Health/Gingivitis or treated-periodontitis context rows and ClearDent-compatible output blocks.
- [ ] Trace every table boundary and confirmation transition to an automated test.
- [ ] Record reviewer, review date, and approved implementation revision.
