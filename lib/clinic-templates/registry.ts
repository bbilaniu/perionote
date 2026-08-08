export const clinicTemplateGroups = [
  {
    title: "Hygiene",
    description: "Routine, periodontal, and age-specific hygiene notes.",
    categories: [
      {
        slug: "adult-hygiene",
        title: "Adult Hygiene",
      },
      {
        slug: "periodontal-maintenance",
        title: "Periodontal Maintenance/Re-evaluation",
      },
      {
        slug: "child-adolescent-hygiene",
        title: "Child and Adolescent Hygiene",
      },
    ],
  },
  {
    title: "Exams and adjuncts",
    description: "Exam notes and focused additions used alongside a main note.",
    categories: [
      {
        slug: "recare-periodic-exam",
        title: "Recare/Periodic Exam",
      },
      {
        slug: "emergency-limited-exam",
        title: "Emergency/Limited Exam",
      },
      {
        slug: "tmj-tmd-assessment",
        title: "TMJ/TMD Assessment",
      },
      {
        slug: "local-anesthesia-addendum",
        title: "Local Anesthesia Addendum",
      },
      {
        slug: "treatment-referral-addendum",
        title: "Treatment/Referral Addendum",
      },
    ],
  },
] as const;

export type ClinicTemplateCategory =
  (typeof clinicTemplateGroups)[number]["categories"][number]["slug"];

type ClinicTemplateDefinition = {
  slug: string;
  title: string;
  sourceTitle: string;
  category: ClinicTemplateCategory;
  description: string;
  content: string;
};

export const clinicTemplateRegistry: readonly ClinicTemplateDefinition[] = [
  {
    slug: "child-recare-exam-hygiene-notes",
    title: "Child Recare Exam & Hygiene Notes",
    sourceTitle: "Child Recare Exam & Hygiene Notes",
    category: "child-adolescent-hygiene",
    description: "Combined pediatric recall exam and hygiene note.",
    content: `Dentist: [SELECT/INSERT: Dentists]
Assistant: [SELECT/INSERT: RDA]
Hygienist: [SELECT/INSERT: Hygienist]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] for treatment today.
Class 5 indicator strip checked: [SELECT/INSERT: Cl5 Indicator Strip Checked]
Miele Sterilization codes scanned:

Patient presents for a pedo recall exam and cleaning

Patients chief concern: [SELECT/INSERT: Chief concern]

Medical history: [SELECT/INSERT: MedHx/DentalHx]
Premedication required: [SELECT/INSERT: PREMED]

Radiographs: [SELECT/INSERT: Radiographs]
Intraoral photos: [SELECT/INSERT: Intraoral]

Exam:
Extraoral- WNL
Intraoral- WNL
Oral habits- N/A

TMJ- WNL

Molar occlusion/Molar Classification:
Skeletal Classification:

Overjet-  mm
Overbite-   %

Doctor Comments-

Caries Detected : YES/NO

• Disclosed - YES/NO

• Plaque Index-

• Calculus- NO/YES  (If yes where- )

• Intraoral Images- YES/NO

• OHI Reviewed
Flossing Technique:
Brushing Technique:

Scaling? Yes or No   #__ units

Polish? Yes or No

Fluoride :  Yes or No

• Relayed info to parent or legal guardian: YES/NO

• Goal for next visit:

RDH/RDA Comments:

Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]
Hygiene Interval : [SELECT/INSERT: REC HYGIENE INTERVAL]

NEXT VISIT: [SELECT/INSERT: NEXT VISIT]
BOOKED: [AUTO: Next Appointment Date]`,
  },
  {
    slug: "adolescent-hygiene",
    title: "12–17 Years Old Hygiene Template",
    sourceTitle: "12-17YRS Old Hygiene Template",
    category: "child-adolescent-hygiene",
    description: "Hygiene note for adolescent patients aged 12–17.",
    content: `RDH: [SELECT/INSERT: Hygienist]
RDA: [SELECT/INSERT: RDA]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]
Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

• Gingival Health-

• Plaque Index-

• Calculus- NO/YES  (If yes where- )

• Intraoral Images- YES/NO

• OHI Reviewed
Flossing Technique:
Brushing Technique:

Do they have a NightGuard?
Have they had orthodontics?
Do they wear Retainers? Fixed or removable?

Scaling? Yes or No   #__ units

Polish? Yes or No

Fluoride :  Yes or No

• Relayed info to parent or legal guardian: YES/NO

• Goal for next visit:

RDH/RDA Comments:
-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES
Recall Interval: [SELECT/INSERT: REC RECALL INTERVAL]
Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]

Next Visit: [SELECT/INSERT: NEXT VISIT]
Date Booked: `,
  },
  {
    slug: "adult-hygiene-2021",
    title: "2021 Adult Hygiene",
    sourceTitle: "2021 Adult Hygiene NEW",
    category: "adult-hygiene",
    description: "Comprehensive adult hygiene assessment and treatment note.",
    content: `Last Recare Date: [AUTO: Last Recall Date]

DENTIST: [SELECT/INSERT: Dentists]
RDH: [SELECT/INSERT: Hygienist]
RDA: [SELECT/INSERT: RDA]

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]


Patient Chief Concern: [SELECT/INSERT: PATIENT CC]

Hygiene Area of Concern:

Plaque:  [SELECT/INSERT: PLAQUE]
Stain:  [SELECT/INSERT: STAIN]
Calculus: [SELECT/INSERT: CALCULUS]
Bleeding: [SELECT/INSERT: BLEEDING]

PSR/Pocketing:  _ _ _ / _ _ _
Recession:
FMP Done: [SELECT/INSERT: FMP DONE]

Health/Gingivitis: [SELECT/INSERT: HEALTH]

Periodontitis Stage:            [SELECT/INSERT: PERIODONTITIS: STAGING]
Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]

Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]
Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]

REVIEWED DISEASE PROCESS WITH PATIENT TODAY

Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]


Hygiene goal:


Treatment recommended:
1) HYGIENE MAINTENANCE


Treatment completed today: [SELECT/INSERT: RDH: Treatment]

Anesthetic:  [SELECT/INSERT: HYGIENE ANESTHETIC]

Desensitizer: [SELECT/INSERT: DESENSITIZER]

Does patient have a NightGuard?
Do they use NightGuard?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?
Additional Notes:
-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES
Recommended Recare Interval:[SELECT/INSERT: REC RECALL INTERVAL]
Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]

Next visit: [SELECT/INSERT: NEXT VISIT]
Date Booked: `,
  },
  {
    slug: "adult-hygiene-2026",
    title: "2026 Adult Hygiene",
    sourceTitle: "2026 Adult Hygiene",
    category: "adult-hygiene",
    description:
      "Unified adult encounter for Complete, Hygiene, and Recare documentation.",
    content: `Last Recare Date: [AUTO: Last Recall Date]

DENTIST: [SELECT/INSERT: Dentists]
RDH: [SELECT/INSERT: Hygienist]
RDA: [SELECT/INSERT: RDA]

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]


Patient Chief Concern: [SELECT/INSERT: PATIENT CC]

Radiographs:
Intraoral Photos:

Hygiene Area of Concern:

EOE:
Extraoral: [SELECT/INSERT: EOE]
TMJ:
Masseter palpation:
TMJ loading test:

IOE:
Intraoral: [SELECT/INSERT: IOE]

Teeth / Odontogram:
Occlusion and Oral Habits:

Plaque:  [SELECT/INSERT: PLAQUE]
Stain:  [SELECT/INSERT: STAIN]
Calculus: [SELECT/INSERT: CALCULUS]
Bleeding: [SELECT/INSERT: BLEEDING]

PSR/Pocketing:  _ _ _ / _ _ _
Recession:
FMP Done: [SELECT/INSERT: FMP DONE]

Health/Gingivitis: [SELECT/INSERT: HEALTH]

Periodontitis Stage:            [SELECT/INSERT: PERIODONTITIS: STAGING]
Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]

Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]
Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]

REVIEWED DISEASE PROCESS WITH PATIENT TODAY

Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]


Hygiene goal:


Treatment options discussed:

Coordinated treatment recommendations:
1) PREVENTIVE — HYGIENE MAINTENANCE
2) RESTORATIVE —


Treatment completed today: [SELECT/INSERT: RDH: Treatment]

Anesthetic:  [SELECT/INSERT: HYGIENE ANESTHETIC]

Desensitizer: [SELECT/INSERT: DESENSITIZER]

Does patient have a NightGuard?
Do they use NightGuard?
Does patient have a CPAP? Do they use it?
Does patient have an occlusal splint? Do they use it?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?
Partial/complete removable dentures:
Patient-requested smile or dental improvements:
Additional Notes:
-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND CRDHA GUIDELINES
Recommended Recare Interval:[SELECT/INSERT: REC RECALL INTERVAL]
Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]

Next Dental Visit:
Dental Date Booked:
Next Hygiene Visit: [SELECT/INSERT: NEXT VISIT]
Hygiene Date Booked: `,
  },
  {
    slug: "local-anesthetic",
    title: "Local Anesthetic",
    sourceTitle: "Local Anesthetic",
    category: "local-anesthesia-addendum",
    description: "Short local anesthetic treatment addendum.",
    content: `Topical gel placed prior to injection
Anaesthetic used: [SELECT/INSERT: Anaesthetic]
Number of carpules: [SELECT/INSERT: # of carps]
Freezing Method: [SELECT/INSERT: Freezing Method]
Patient tolerated well. No adverse reactions`,
  },
  {
    slug: "split-adult-hygiene-part-1",
    title: "Split Adult Hygiene — Part 1",
    sourceTitle: "Split Adult Hygiene Part 1",
    category: "adult-hygiene",
    description: "First part of the split adult hygiene workflow.",
    content: `Last Recall Date: [AUTO: Last Recall Date]

DENTIST: [SELECT/INSERT: Dentists]
RDH: [SELECT/INSERT: Hygienist]
RDA: [SELECT/INSERT: RDA]

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl4 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.
REVIEWED COVID SCREENING CONSENT FORM: YES
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]


Patient Chief Concern: [SELECT/INSERT: PATIENT CC]

Does patient have a NightGuard?
Do they use NightGuard?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?


EOE/IOE:

Gingival Assessment:`,
  },
  {
    slug: "split-adult-hygiene-part-2",
    title: "Split Adult Hygiene — Part 2",
    sourceTitle: "Split Adult Hygiene Part 2",
    category: "adult-hygiene",
    description: "Second part of the split adult hygiene workflow.",
    content: `Hygiene Area of Concern:

Plaque:  [SELECT/INSERT: PLAQUE]
Stain:  [SELECT/INSERT: STAIN]
Calculus: [SELECT/INSERT: CALCULUS]
Bleeding: [SELECT/INSERT: BLEEDING]


Recession:
FMP Done: [SELECT/INSERT: FMP DONE]

Health/Gingivitis: [SELECT/INSERT: HEALTH]

Periodontitis Stage:            [SELECT/INSERT: PERIODONTITIS: STAGING]
Periodontitis Grade: [SELECT/INSERT: PERIODONTITIS: GRADING]

Oral hygiene compliance: [SELECT/INSERT: OHI COMPLIANCE]
Home care instruction: STRESSED THE IMPORTANCE OF HOMECARE- IDEALLY FLOSSING AT LEAST 1XDAY AND BRUSHING MINIMUM 2XDAY
OH Aids Reviewed/Recommended: [SELECT/INSERT: OHI AIDS REVIEWED/RECOMMENDED]

REVIEWED DISEASE PROCESS WITH PATIENT TODAY

Patient is currently: [SELECT/INSERT: FLOSSING x/day] [SELECT/INSERT: BRUSHING x/day]


Hygiene goal:


Treatment recommended:
1) HYGIENE MAINTENANCE


Treatment completed today: [SELECT/INSERT: RDH: Treatment]

Anesthetic:  [SELECT/INSERT: HYGIENE ANESTHETIC]

Desensitizer: [SELECT/INSERT: DESENSITIZER]

Additional Notes:
-ALL PROPER PPE WAS WORN DURING APPT AS PER AHS AND ACDH GUIDELINES
-PRE-PROCEDURAL RINSE OF OPTIRINSE 0.05% FL WITH CITROX PROVIDED TO PT. NO ADVERSE REACTIONS.
-HVE WAS USED AT ALL TIMES DURING AEROSOL GENERATING PROCEDURES.
Does patient have a NightGuard?
Do they use NightGuard?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?


Recommended Recall Interval:[SELECT/INSERT: REC RECALL INTERVAL]
Recommended Hygiene Interval: [SELECT/INSERT: REC HYGIENE INTERVAL]

Next visit: [SELECT/INSERT: NEXT VISIT]
Date Booked: `,
  },
  {
    slug: "recare-exam",
    title: "Recare Exam",
    sourceTitle: "Recare Exam",
    category: "recare-periodic-exam",
    description: "Periodic exam note covering clinical findings and planning.",
    content: `DENTIST: [SELECT/INSERT: Dentists]
RDA: [SELECT/INSERT: RDA]
RDH: [SELECT/INSERT: Hygienist]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.

MEDICAL history reviewed & INCLUDES: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization codes scanned:

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] for treatment today.
Radiographs: [SELECT/INSERT: Radiographs]
Intraoral photos: [SELECT/INSERT: Intraoral]

a) Patients chief concern:

b) Extraoral- WNL

c) TMJ- WNL
Palpation of the Masseter Test: WNL
Load TMJ joint Test: WNL

d) Intraoral- WNL
Oral Habits-
Molar Occlusion-
Skeletal Occlusion- N/A

Overjet-     mm
Overbite-    %

Do they use a CPAP?

Does patient have a Splint?
Do they use Splint?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?
Do they have Partial Dentures

is there anything they would like to improve with their smile/teeth?

Additional Comments-


Treatment Options:
1) HYGIENE MAINTENANCE

Treatment Plan:
1) HYGIENE MAINTENANCE

Next Visit: [UNRESOLVED PLACEHOLDER: NEXT VISIT]
Date Booked: `,
  },
  {
    slug: "periodontal-recare",
    title: "Periodontal Recare",
    sourceTitle: "Periodontal Recare",
    category: "periodontal-maintenance",
    description: "Periodontal maintenance assessment and recall note.",
    content: `DENTIST: [SELECT/INSERT: Dentists]
RDA: [SELECT/INSERT: RDA]
Hygienist: [SELECT/INSERT: Hygienist]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

E/O - WNL
I/O - WNL
TMJ - WNL
Occlusion- WNL

Periodontal diagnosis
Gingivitis - (local)(general)/ (early)(advanced)(severe)
Periodontitis-(local)(general)/(early)(advanced)(severe)

PSR Max/Man:

Plaque (none)(light)(moderate)(heavy) in 03, 04, 05, 06, 07, 08
Stain (none)(light)(moderate)(heavy) in 03, 04, 05, 06, 07, 08
Calculus (none)(light)(moderate)(heavy) in 03, 04, 05, 06, 07, 08

Oral Hygiene (Excellent)(V.Good)(Good)(fair)(poor)
Compliance (Excellent)(V.Good)(Good)(fair)(poor)

Maint.Interval - Month____units____
Hyg. Instructions/ Recommended care-

Decay-


Midmark- ; Tutt-
Next Appointment: (6month)(3month) Hygiene
                                Recall Exam`,
  },
  {
    slug: "emergency-exam",
    title: "Emergency Exam",
    sourceTitle: "Emergency Exam",
    category: "emergency-limited-exam",
    description: "Limited emergency exam, diagnosis, and treatment plan note.",
    content: `DENTIST: [SELECT/INSERT: Dentists]
RDA/RDH: [SELECT/INSERT: RDA] [SELECT/INSERT: Hygienist]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] [SELECT/INSERT: CONSENT FOR TX] for treatment today.

MEDICAL history reviewed & INCLUDES: [SELECT/INSERT: MedHx/DentalHx]
Premedication Required: [SELECT/INSERT: PREMED]

Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

Treatment completed today:

Do they have and use a CPAP?

Does patient have a Splint?
Do they use Splint?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?

Do they have Partial Dentures

is there anything they would like to improve with their smile/teeth?

Additional Comment:


Doctor's Diagnosis:

Treatment Options:



Treatment Plan:



Requested Preauthorization to be sent by administration team.

Next Visit: [UNRESOLVED PLACEHOLDER: NEXT VISIT]
Date Booked:`,
  },
  {
    slug: "tmj-exam-consult-referral",
    title: "TMJ Exam / Consult or Referral",
    sourceTitle: "TMJ Exam / Consult or Referral",
    category: "tmj-tmd-assessment",
    description: "TMJ/TMD clinical assessment, diagnosis, and management note.",
    content: `DENTIST: [SELECT/INSERT: Dentists]
RDA: [SELECT/INSERT: RDA]

Informed verbal consent given by [AUTO: Patient First Name] [AUTO: Patient Last Name] for treatment today.
Medical history reviewed: [SELECT/INSERT: MedHx/DentalHx]
Checked Cl 5 Indicators on all cassettes used for procedure as well as indicators on bagged instruments: [SELECT/INSERT: Cl5 Indicator Strip Checked]

Miele Sterilization Codes Scanned:

TREATMENT COMPLETED: Insert [AUTO: Th][AUTO: Description]

Section B Benefits Attending report:
Adjuster's contact:
Claim Number:

Imaging - Pan and Specific TMJ 2D imaging

Clinical exam:
TMJ:
Masseter:
Dental trauma (chipped teeth):

Comments:

Do they use a CPAP?

Does patient have a NightGuard?
Do they use NightGuard?

Have they had orthodontics?
Do they wear Retainers? Fixed or removable?

Doctor's Diagnosis:


Post-op management:
[SELECT/INSERT: TMJ Management Strategies]

Next Appointment`,
  },
] as const;

export type ClinicTemplate = (typeof clinicTemplateRegistry)[number];

export function getClinicTemplateBySlug(
  slug: string,
): ClinicTemplate | undefined {
  return clinicTemplateRegistry.find((template) => template.slug === slug);
}

export function getClinicTemplatesByCategory(
  category: ClinicTemplateCategory,
): readonly ClinicTemplate[] {
  return clinicTemplateRegistry.filter(
    (template) => template.category === category,
  );
}

export function getClinicCategoryTitle(
  categorySlug: ClinicTemplateCategory,
): string {
  for (const group of clinicTemplateGroups) {
    const category = group.categories.find(
      (candidate) => candidate.slug === categorySlug,
    );
    if (category) {
      return category.title;
    }
  }

  return categorySlug;
}
