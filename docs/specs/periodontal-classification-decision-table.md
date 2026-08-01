# Periodontal Candidate-Classification Decision Table

**Implementation status:** Implemented for candidate suggestions.

**Clinical review status:** Pending clinician sign-off. Candidate results are
decision support only. They are never charted until the clinician separately
selects and confirms the stage and grade.

## Sources

- [AAP staging and grading overview](https://www.perio.org/wp-content/uploads/2019/08/Staging-and-Grading-Periodontitis.pdf)
- [Tonetti, Greenwell, and Kornman 2018 framework](https://aap.onlinelibrary.wiley.com/doi/10.1002/JPER.18-0006)
- [Chapple, Mealey, and colleagues 2018 health and gingivitis consensus](https://aap.onlinelibrary.wiley.com/doi/full/10.1002/JPER.17-0719)
- [Reviewed ClearDent periodontal redesign](../requests/ClearDent%20Custom%20Fields%20and%20Periodontal%20Redesign.md)

The checked-in implementation is in
`lib/templates/periodontalClassification.ts`. Criterion IDs and typed
measurements are encounter state. Display and note wording come from the
catalogue in that module.

## Safety Invariants

| Concern | Decision |
| --- | --- |
| Candidate versus diagnosis | A candidate is never a confirmed diagnosis. Stage and grade require separate clinician confirmation. |
| Reference versus finding | Reference thresholds are application data. Only entered measurements and explicitly selected findings are patient-specific evidence. |
| Generated output | Unconfirmed stage/grade and their basis are omitted. Confirmed basis is generated from criterion IDs and typed values. |
| Override | A selected stage/grade may differ from the candidate. The UI requests an override reason and includes an entered reason in output. |
| Missing stage data | No stage is suggested. The candidate reports that patient-specific stage evidence is missing. |
| Missing grade data | For a periodontitis diagnosis, Grade B is shown as a working assumption with a warning. It is not confirmed or charted automatically. |
| Unsupported exposure | Non-cigarette nicotine exposure is documented separately and never converted to cigarettes/day. |
| Unknown HbA1c | Diabetes with unknown current HbA1c does not modify the candidate grade. |
| Health/Gingivitis compatibility | Structured evidence is calculated and confirmed, while generated output retains the familiar ClearDent field heading and charts only entered measurements and declared findings. |
| Treated context and status | A confirmed stable treated-periodontitis context permits periodontal disease stability; a confirmed inflammation context permits remission/control. Incompatible current-status choices are not charted. |

## Health/Gingivitis and Treated-Periodontitis Context Table

Maximum PPD is a shared measurement used by both this table and periodontitis
staging. It is synchronized between Periodontal assessment findings and Stage
complexity evidence without creating duplicate data. The deeper-pocket BOP
state is shared in the same way. Unassessed negative findings never count as
confirmed absence.

| Diagnosis and periodontium | Required evidence | Candidate |
| --- | --- | --- |
| Health; intact | BOP <10%; maximum PPD <=3 mm; attachment loss absent; RBL absent | Health - intact periodontium |
| Gingivitis; intact | BOP >=10%; maximum PPD <=3 mm; attachment loss absent; RBL absent | Gingivitis - intact periodontium |
| Health; reduced non-periodontitis | BOP <10%; maximum PPD <=3 mm; attachment loss present; RBL assessed | Health - reduced periodontium, non-periodontitis patient |
| Gingivitis; reduced non-periodontitis | BOP >=10%; maximum PPD <=3 mm; attachment loss present; RBL assessed | Gingivitis - reduced periodontium, non-periodontitis patient |
| Periodontitis; reduced treated | BOP <10%; maximum PPD <=4 mm; attachment and RBL present; no site with PPD >=4 mm and BOP; no progressive destruction | Health - successfully treated, stable periodontitis patient |
| Periodontitis; reduced treated | BOP >=10%; attachment and RBL present; no site with PPD >=4 mm and BOP; no progressive destruction | Gingival inflammation - patient with history of periodontitis |

A site with PPD >=4 mm and BOP or evidence of progressive destruction suppresses
the treated-periodontitis context candidate and prompts assessment for unstable
or recurrent periodontitis. A treated periodontitis patient is never relabelled
as a simple gingivitis patient.

Confirmed output uses the entered maximum PPD and BOP percentage plus declared
attachment-loss, radiographic-bone-loss, deeper-pocket BOP, and progression
states. Candidate thresholds remain reference logic and are not emitted as if
they were patient findings.

## Stage Table

The candidate begins with the initial severity level. Periodontitis-related
tooth loss and complexity may raise it. When evidence points to several levels,
the highest applicable stage is suggested and a conflict warning is shown.

| Evidence | Candidate level |
| --- | --- |
| Interdental CAL >0 and <=2 mm | I |
| Interdental CAL 3-4 mm | II |
| Interdental CAL >=5 mm | III |
| RBL >0 and <15% | I |
| RBL 15%-33% | II |
| RBL >33%, or RBL to middle third or beyond | III |
| 1-4 teeth lost due to periodontitis | III |
| >=5 teeth lost due to periodontitis | IV |
| Maximum PPD <=4 mm | I |
| Maximum PPD >4 and <=5 mm | II |
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

Exact values in threshold gaps, such as CAL between 4 and 5 mm or PPD between
5 and 6 mm, do not produce a level from that evidence. The UI retains the
measurement and reports that no supported threshold was crossed.

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

## Confirmation and Output

1. The application calculates a candidate and displays warnings.
2. The clinician independently selects stage and grade.
3. Changing either selection clears its prior confirmation.
4. The clinician explicitly confirms each selected value.
5. A difference between candidate and selected value reveals an override-reason field.
6. Output includes only confirmed stage/grade and its patient-specific basis.
7. Entered risk modifiers and 2018-aligned periodontal status remain explicit patient findings.

## Clinical Review Checklist

- [ ] Confirm CAL/RBL fallback and conflict behavior.
- [ ] Confirm that RBL >33% is sufficient to suggest Stage III in this workflow.
- [ ] Confirm handling of decimal values in nominal whole-millimetre threshold gaps.
- [ ] Confirm Stage IV complexity escalation without a separately entered Stage III severity criterion.
- [ ] Confirm direct-over-indirect-over-phenotype grade precedence.
- [ ] Confirm Grade B working-assumption behavior when progression data are absent.
- [ ] Confirm smoking and HbA1c modifier behavior.
- [ ] Confirm generated wording and override documentation.
- [ ] Confirm all six Health/Gingivitis or treated-periodontitis context rows and ClearDent-compatible output blocks.
- [ ] Record reviewer, review date, and approved implementation revision.
