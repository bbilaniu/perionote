"use client";
import React, { useMemo, useState } from "react";
import { getTodayDateString } from "@/lib/templates/date";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cx(
        "space-y-1.5 p-6 dark:border-b dark:border-slate-700",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cx(
        "font-semibold leading-none tracking-tight dark:text-white",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return <div className={cx("p-6 pt-0", className)} {...props} />;
}

function Button({ className, variant = "default", type = "button", ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
      : "border border-slate-900 dark:border-slate-600 bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600";

  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

function Checkbox({ className, checked, onCheckedChange, ...props }) {
  return (
    <input
      type="checkbox"
      className={cx(
        "h-4 w-4 rounded border border-slate-300 dark:border-slate-600 accent-slate-900 dark:accent-slate-400",
        className,
      )}
      checked={Boolean(checked)}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600",
        className,
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }) {
  return (
    <label
      className={cx(
        "text-sm font-medium leading-none text-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cx(
        "flex min-h-[80px] w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600",
        className,
      )}
      {...props}
    />
  );
}

function Badge({ className, variant = "default", ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300"
      : "border border-transparent bg-slate-900 dark:bg-slate-700 text-white";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

function Separator({ className, ...props }) {
  return (
    <div
      role="separator"
      className={cx("h-px w-full bg-slate-200 dark:bg-slate-700", className)}
      {...props}
    />
  );
}

function SelectTrigger() {
  return null;
}

function SelectValue() {
  return null;
}

function SelectContent() {
  return null;
}

function SelectItem() {
  return null;
}

function extractText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) return extractText(node.props.children);
  return "";
}

function collectSelectConfig(
  children,
  config = { items: [], placeholder: "", triggerClassName: "" },
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === SelectItem) {
      config.items.push({
        value: String(child.props.value ?? ""),
        label:
          extractText(child.props.children) || String(child.props.value ?? ""),
      });
      return;
    }

    if (child.type === SelectValue && child.props.placeholder) {
      config.placeholder = String(child.props.placeholder);
    }

    if (child.type === SelectTrigger && child.props.className) {
      config.triggerClassName = String(child.props.className);
    }

    if (child.props.children) {
      collectSelectConfig(child.props.children, config);
    }
  });

  return config;
}

function Select({ value, onValueChange, children }) {
  const { items, placeholder, triggerClassName } = useMemo(
    () => collectSelectConfig(children),
    [children],
  );
  const normalizedValue = value == null ? "" : String(value);
  const hasValue = normalizedValue !== "";

  return (
    <select
      className={cx(
        "flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600",
        triggerClassName,
      )}
      value={normalizedValue}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {!hasValue && placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {items.map((item) => (
        <option key={`${item.value}-${item.label}`} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

const FIELD_OPTIONS = {
  color: ["Pink", "Dark Pink", "Red", "Cyanotic", "Pigmented"],
  consistency: ["Firm", "Spongy", "Fibrotic"],
  contourShape: [
    "Margins: Knife-edged",
    "Margins: Rolled",
    "Papilla: Pointed",
    "Papilla: Bulbous",
    "Papilla: Blunted",
    "Papilla: Cratered",
    "Papilla: Clefted",
  ],
  surfaceTexture: ["Stippling", "Shiny", "Smooth"],
  gingivalPosition: ["Recession", "Pseudo pocket", "MAG"],
  bleedingExudate: ["BOP", "Exudate"],
};

const LOCATION_OPTIONS = [
  "Facial",
  "Lingual",
  "Buccal",
  "Mesial",
  "Distal",
  "Interproximal",
  "Labial",
  "Palatal",
];

const DISTRIBUTION_OPTIONS = ["Diffuse", "Marginal", "Papillary"];

const SECTION_LABELS = {
  color: "Color",
  consistency: "Consistency",
  contourShape: "Contour / Shape",
  surfaceTexture: "Surface Texture",
  gingivalPosition: "Gingival Position",
  bleedingExudate: "Bleeding & Exudate",
};

const SECTION_KEY_BY_LABEL = {
  Color: "color",
  Consistency: "consistency",
  "Contour / Shape": "contourShape",
  "Surface Texture": "surfaceTexture",
  "Gingival Position": "gingivalPosition",
  "Bleeding & Exudate": "bleedingExudate",
};

const AMOUNT_OPTIONS = ["None", "Light", "Moderate", "Heavy"];
const EXTENT_OPTIONS = ["Generalized", "Localized"];
const PERIODONTAL_ACTIVITY_OPTIONS = ["Active", "Stable"];
const PERIODONTAL_DISEASE_OPTIONS = ["Periodontitis", "Gingivitis"];
const PERIODONTAL_SEVERITY_STAGE_OPTIONS = [
  "Slight Periodontitis Stage I",
  "Moderate Periodontitis Stage II",
  "Severe Periodontitis Stage III",
  "Severe Periodontitis Stage IV",
];
const PERIODONTAL_GRADE_OPTIONS = [
  "Grade A slow rate of progression",
  "Grade B moderate rate of progression",
  "Grade C rapid rate of progression",
];
const DEPOSIT_LOCATION_OPTIONS = [
  "Supragingival",
  "Subgingival",
  "Interproximal",
  "Facial",
  "Lingual",
  "At gingival margin",
  "Generalized",
  "Localized",
];
const TREATMENT_OPTIONS = [
  "Hand and power instrumentation",
  "Ipana 5% NaF varnish application",
];
const INSTRUMENTATION_DEVICE_OPTIONS = ["Cavitron", "Piezo"];
const INSTRUMENTATION_AREA_OPTIONS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Maxilla",
  "Mandible",
  "Sextant 1",
  "Sextant 2",
  "Sextant 3",
  "Sextant 4",
  "Sextant 5",
  "Sextant 6",
];
const OHE_TOPIC_OPTIONS = [
  "Caries theory",
  "Caries risk factors",
  "Bass brushing",
  "C-shape flossing technique",
  "Sulcabrush and interdental brush technique",
  "Review benefits of Prevident or Opti-Rinse",
  "Periodontitis theory and risk factors",
  "Importance of maintaining a 4-month hygiene interval",
];
const RECOMMENDATION_OPTIONS = [
  "High fluoride toothpaste (Prevident 5000)",
  "Mouthwash (0.05% X-PUR Opti-Rinse)",
  "Salt water rinse for 2-3 days",
  "Water flosser",
  "Electric toothbrush",
  "Xylitol pastilles",
];
const VISIT_CARE_BASE_OPTIONS = [
  "Med/dent history update",
  "EOE/IOE",
  "Gingival assessments",
  "Calculus index",
  "Caries risk",
  "Nutrition score",
  "Periodontal risk assessment",
  "Spot probing",
  "Full mouth probing",
];
const VISIT_CARE_OPTIONS = [...VISIT_CARE_BASE_OPTIONS, ...TREATMENT_OPTIONS];
const DISPOSITION_OPTIONS = [
  "DH Re-eval at 4-6 weeks",
  "DH Re-care at 3-4 months interval",
];
const CARIES_RISK_LEVEL_OPTIONS = ["Low", "Moderate", "High"];
const CARIES_RISK_FACTOR_OPTIONS = [
  "High frequency of sugar intake",
  "Inadequate brushing oral hygiene",
  "Insufficient exposure to fluoride",
  "Heavily restored dentition",
  "Hyposalivation",
  "History of caries in the last 36 months",
  "Symptomatically driven dental visits",
];
const CLICK_LATERALITY_OPTIONS = ["Bilateral", "Left", "Right"];
const ASYMPTOMATIC_LYMPH_NODE_OPTIONS = ["Palpable", "Not palpable"];
const PALATINE_TORUS_OPTIONS = ["Slight", "Prominent"];
const IOE_FINDING_OPTIONS = [
  "Coated tongue",
  "Fissured tongue",
  "Scalloped tongue",
  "Bilateral linea alba",
];

function emptyAnnotation() {
  return {
    presence: false,
    extent: "generalized",
    toothNumbers: "",
    locations: [],
    distributions: [],
    notes: "",
  };
}

function buildInitialFindings() {
  return Object.fromEntries(
    Object.entries(FIELD_OPTIONS).map(([sectionKey, options]) => [
      sectionKey,
      Object.fromEntries(options.map((option) => [option, emptyAnnotation()])),
    ]),
  );
}

function prettyLabel(key) {
  return SECTION_LABELS[key] ?? key;
}

function buildInitialForm(fixture) {
  const form = {
    date: getTodayDateString(),
    patientConcerns: "",
    patientPresentsForHygieneNoOtherConcerns: false,
    medicalHistory: "Patient reports no changes",
    bloodPressure: "",
    heartRate: "",
    bloodPressureTakenTime: "",
    eoe: "",
    ioe: "",
    eoeWithinNormalLimits: false,
    ioeWithinNormalLimits: false,
    asymptomaticClickOnOpeningClosing: false,
    asymptomaticClickLaterality: "",
    asymptomaticLymphNodes: false,
    asymptomaticLymphNodesPalpability: "",
    ioeFindings: [],
    palatineTorusAtMidline: false,
    palatineTorusProminence: "",
    bilateralMandibularTori: false,
    bilateralMandibularToriProminence: "",
    findings: buildInitialFindings(),
    plaque: {
      amount: "None",
      extent: "Localized",
      locations: [],
      details: "",
    },
    calculus: {
      amount: "None",
      extent: "Localized",
      locations: [],
      details: "",
    },
    extrinsicStain: {
      amount: "None",
      extent: "Localized",
      details: "",
    },
    bleedingInflammation: {
      amount: "None",
      extent: "Localized",
      details: "",
    },
    treatmentDoneToday: [],
    treatmentDoneTodayInstrumentationDevices: [],
    treatmentDoneTodayInstrumentationAreas: [],
    treatmentDoneTodayNotes: "",
    nextAppointment: [],
    nextAppointmentInstrumentationDevices: [],
    nextAppointmentInstrumentationAreas: [],
    nextAppointmentNotes: "",
    oheTopics: [],
    oheNotes: "",
    recommendations: [],
    recommendationsNotes: "",
    cariesRiskLevel: "",
    cariesRiskFactors: [],
    cariesRiskNotes: "",
    periodontalStatusActivity: "",
    periodontalStatusDiseaseType: "",
    periodontalStatusSeverityStage: "",
    periodontalStatusGrade: "",
    periodontalStatusNotes: "",
    disposition: [],
    otherClinicalFindings: "",
  };

  if (fixture) {
    form.date = fixture.date || getTodayDateString();

    (fixture.findings || []).forEach((item) => {
      const sectionKey = SECTION_KEY_BY_LABEL[item.section];
      if (!sectionKey) return;
      if (!(item.finding in form.findings[sectionKey])) return;

      form.findings[sectionKey][item.finding] = {
        presence: true,
        extent: item.extent || "generalized",
        toothNumbers: item.toothNumbers || "",
        locations: item.locations || [],
        distributions: item.distributions || [],
        notes: item.notes || "",
      };
    });
  }

  return form;
}

function buildDemoForm(fixture) {
  const form = buildInitialForm(fixture);

  form.patientConcerns =
    "Sensitivity around lower anterior and occasional bleeding while flossing.";
  form.medicalHistory =
    "Med/dent history updated. No new contraindications reported.";
  form.bloodPressure = "118/76";
  form.heartRate = "72";
  form.bloodPressureTakenTime = "09:15";

  form.eoeWithinNormalLimits = true;
  form.ioeWithinNormalLimits = true;
  form.asymptomaticClickOnOpeningClosing = true;
  form.asymptomaticClickLaterality = "Bilateral";
  form.palatineTorusAtMidline = true;
  form.palatineTorusProminence = "Slight";
  form.bilateralMandibularTori = true;
  form.bilateralMandibularToriProminence = "Slight";
  form.ioeFindings = [
    "Coated tongue",
    "Scalloped tongue",
    "Bilateral linea alba",
  ];
  form.eoe =
    "Within normal limits overall; observations documented for baseline monitoring.";
  form.ioe = "Within normal limits overall; mild soft tissue variations noted.";

  form.periodontalStatusActivity = "Active";
  form.periodontalStatusDiseaseType = "Periodontitis";
  form.periodontalStatusSeverityStage = "Moderate Periodontitis Stage II";
  form.periodontalStatusGrade = "Grade B moderate rate of progression";
  form.periodontalStatusNotes =
    "Reinforced 4-month hygiene interval and home-care compliance.";

  form.cariesRiskLevel = "Moderate";
  form.cariesRiskFactors = [
    "High frequency of sugar intake",
    "Insufficient exposure to fluoride",
    "History of caries in the last 36 months",
  ];
  form.cariesRiskNotes = "Diet and home-care factors reviewed.";

  form.oheTopics = [
    "Caries theory",
    "Caries risk factors",
    "Bass brushing",
    "C-shape flossing technique",
    "Sulcabrush and interdental brush technique",
    "Review benefits of Prevident or Opti-Rinse",
    "Periodontitis theory and risk factors",
    "Importance of maintaining a 4-month hygiene interval",
  ];
  form.oheNotes =
    "Demonstrated technique adjustments and reviewed daily routine.";

  form.recommendations = [
    "High fluoride toothpaste (Prevident 5000)",
    "Mouthwash (0.05% X-PUR Opti-Rinse)",
    "Salt water rinse for 2-3 days",
  ];
  form.recommendationsNotes =
    "Start Prevident at night and Opti-Rinse once daily.";

  form.treatmentDoneToday = [
    "Med/dent history update",
    "EOE/IOE",
    "Gingival assessments",
    "Calculus index",
    "Caries risk",
    "Nutrition score",
    "Periodontal risk assessment",
    "Spot probing",
    "Full mouth probing",
    "Hand and power instrumentation",
    "Ipana 5% NaF varnish application",
  ];
  form.treatmentDoneTodayInstrumentationDevices = ["Piezo"];
  form.treatmentDoneTodayInstrumentationAreas = [
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "Maxilla",
    "Mandible",
  ];
  form.treatmentDoneTodayNotes =
    "Completed full periodontal hygiene workflow today.";

  form.nextAppointment = [
    "EOE/IOE",
    "Gingival assessments",
    "Caries risk",
    "Periodontal risk assessment",
    "Spot probing",
    "Full mouth probing",
    "Hand and power instrumentation",
    "Ipana 5% NaF varnish application",
  ];
  form.nextAppointmentInstrumentationDevices = ["Piezo"];
  form.nextAppointmentInstrumentationAreas = [
    "Sextant 1",
    "Sextant 2",
    "Sextant 3",
  ];
  form.nextAppointmentNotes =
    "Reassess inflammation response and home-care adherence.";

  form.disposition = [
    "DH Re-eval at 4-6 weeks",
    "DH Re-care at 3-4 months interval",
  ];
  form.otherClinicalFindings =
    "Continue monitoring tongue and linea alba findings.";

  return form;
}

function collectSelectedFindings(findings) {
  const entries = [];

  Object.entries(findings).forEach(([sectionKey, sectionValues]) => {
    Object.entries(sectionValues).forEach(([option, annotation]) => {
      if (!annotation.presence) return;
      entries.push({
        section: prettyLabel(sectionKey),
        finding: option,
        ...annotation,
      });
    });
  });

  return entries;
}

export function buildSummaryText(form, selectedFindings) {
  const lines = [];

  const clean = (value) =>
    String(value ?? "")
      .trim()
      .replace(/[\s\n]+/g, " ");
  const cleanSentence = (value) => clean(value).replace(/[.]+$/g, "");
  const formatDepositLine = (label, entry, includeLocations = false) => {
    const amount = entry.amount.toLowerCase();
    const base = [amount];

    if (entry.amount !== "None") {
      base.push(entry.extent.toLowerCase());
      if (includeLocations && entry.locations.length) {
        base.push(entry.locations.join(", "));
      }
    }

    if (entry.details.trim()) {
      base.push(cleanSentence(entry.details));
    }

    return `${label}: ${base.join(" / ")}.`;
  };
  const addHeadingBlock = (heading, items) => {
    const cleanedItems = items.filter(Boolean);
    if (!cleanedItems.length) return;
    lines.push(`${heading}:`);
    cleanedItems.forEach((item) => lines.push(`  ${item}`));
  };

  addHeadingBlock("Visit Details", form.date ? [`Date: ${form.date}`] : []);

  addHeadingBlock("History and Exam", [
    form.patientPresentsForHygieneNoOtherConcerns
      ? "Patient presents for hygiene, no other concerns."
      : "",
    form.patientConcerns.trim()
      ? `Patient concerns: ${cleanSentence(form.patientConcerns)}.`
      : "",
    form.medicalHistory.trim()
      ? `Medical history: ${cleanSentence(form.medicalHistory)}.`
      : "",
    form.bloodPressure || form.heartRate || form.bloodPressureTakenTime
      ? `Vitals: ${[
          form.bloodPressure ? `BP ${clean(form.bloodPressure)}` : "",
          form.heartRate ? `HR ${clean(form.heartRate)}` : "",
          form.bloodPressureTakenTime
            ? `BP taken at ${clean(form.bloodPressureTakenTime)}`
            : "",
        ]
          .filter(Boolean)
          .join(", ")}.`
      : "",
  ]);

  const eoeFindings = [];
  if (form.asymptomaticClickOnOpeningClosing) {
    eoeFindings.push(
      `Asymptomatic click on opening/closing${
        form.asymptomaticClickLaterality
          ? ` (${form.asymptomaticClickLaterality})`
          : ""
      }`,
    );
  }
  if (form.asymptomaticLymphNodes) {
    eoeFindings.push(
      `Asymptomatic lymph nodes${
        form.asymptomaticLymphNodesPalpability
          ? ` (${form.asymptomaticLymphNodesPalpability})`
          : ""
      }`,
    );
  }
  const ioeFindings = [...form.ioeFindings];
  if (form.palatineTorusAtMidline) {
    ioeFindings.push(
      `Palatine torus at midline${
        form.palatineTorusProminence ? ` (${form.palatineTorusProminence})` : ""
      }`,
    );
  }
  if (form.bilateralMandibularTori) {
    ioeFindings.push(
      `Bilateral mandibular tori${
        form.bilateralMandibularToriProminence
          ? ` (${form.bilateralMandibularToriProminence})`
          : ""
      }`,
    );
  }

  addHeadingBlock("EOE/IOE", [
    form.eoeWithinNormalLimits ? "EOE: Within Normal Limits." : "",
    eoeFindings.length ? `EOE findings: ${eoeFindings.join(", ")}.` : "",
    form.eoe.trim() ? `EOE observations: ${cleanSentence(form.eoe)}.` : "",
    form.ioeWithinNormalLimits ? "IOE: Within Normal Limits." : "",
    ioeFindings.length ? `IOE findings: ${ioeFindings.join(", ")}.` : "",
    form.ioe.trim() ? `IOE observations: ${cleanSentence(form.ioe)}.` : "",
  ]);

  addHeadingBlock(
    "Gingival Description",
    selectedFindings.map((item) => {
      const detailParts = [
        item.extent === "generalized" ? "generalized" : "localized",
      ];
      if (item.toothNumbers.trim())
        detailParts.push(`teeth ${clean(item.toothNumbers)}`);
      if (item.locations.length)
        detailParts.push(`location ${item.locations.join(", ")}`);
      if (item.distributions.length)
        detailParts.push(`distribution ${item.distributions.join(", ")}`);
      if (item.notes.trim()) detailParts.push(cleanSentence(item.notes));
      return `${item.section}: ${item.finding} (${detailParts.join("; ")}).`;
    }),
  );

  addHeadingBlock("Deposits and Inflammation", [
    formatDepositLine("Plaque", form.plaque, true),
    formatDepositLine("Calculus", form.calculus, true),
    formatDepositLine("Extrinsic stain", form.extrinsicStain),
    formatDepositLine("Bleeding and inflammation", form.bleedingInflammation),
  ]);

  const perioBits = [
    form.periodontalStatusActivity,
    form.periodontalStatusDiseaseType,
    form.periodontalStatusSeverityStage,
    form.periodontalStatusGrade,
  ].filter(Boolean);

  addHeadingBlock("Periodontal Status", [
    perioBits.length ? `Status: ${perioBits.join(", ")}.` : "",
    form.periodontalStatusNotes.trim()
      ? `Notes: ${cleanSentence(form.periodontalStatusNotes)}.`
      : "",
  ]);

  addHeadingBlock("Caries Risk", [
    form.cariesRiskLevel ? `Risk level: ${form.cariesRiskLevel}.` : "",
    form.cariesRiskFactors.length
      ? `Risk factors: ${form.cariesRiskFactors.join(", ")}.`
      : "",
    form.cariesRiskNotes.trim()
      ? `Notes: ${cleanSentence(form.cariesRiskNotes)}.`
      : "",
  ]);

  addHeadingBlock("Oral Health Education", [
    form.oheTopics.length
      ? `Topics reviewed: ${form.oheTopics.join(", ")}.`
      : "",
    form.oheNotes.trim() ? `OHE notes: ${cleanSentence(form.oheNotes)}.` : "",
  ]);

  addHeadingBlock("Recommendations", [
    form.recommendations.length
      ? `Recommendations: ${form.recommendations.join(", ")}.`
      : "",
    form.recommendationsNotes.trim()
      ? `Additional recommendation details: ${cleanSentence(form.recommendationsNotes)}.`
      : "",
  ]);

  addHeadingBlock("Clinical Documentation", [
    form.otherClinicalFindings.trim()
      ? `Other clinical findings: ${cleanSentence(form.otherClinicalFindings)}.`
      : "",
  ]);

  addHeadingBlock("Treatment Done Today", [
    form.treatmentDoneToday.length
      ? `Completed: ${form.treatmentDoneToday.join(", ")}.`
      : "",
    form.treatmentDoneToday.includes("Hand and power instrumentation") &&
    form.treatmentDoneTodayInstrumentationDevices.length
      ? `Hand and power instrumentation device: ${form.treatmentDoneTodayInstrumentationDevices.join(", ")}.`
      : "",
    form.treatmentDoneToday.includes("Hand and power instrumentation") &&
    form.treatmentDoneTodayInstrumentationAreas.length
      ? `Instrumentation area: ${form.treatmentDoneTodayInstrumentationAreas.join(", ")}.`
      : "",
    form.treatmentDoneTodayNotes.trim()
      ? `Treatment done today notes: ${cleanSentence(form.treatmentDoneTodayNotes)}.`
      : "",
  ]);

  addHeadingBlock("Next Appointment", [
    form.nextAppointment.length
      ? `Planned care: ${form.nextAppointment.join(", ")}.`
      : "",
    form.nextAppointment.includes("Hand and power instrumentation") &&
    form.nextAppointmentInstrumentationDevices.length
      ? `Hand and power instrumentation device: ${form.nextAppointmentInstrumentationDevices.join(", ")}.`
      : "",
    form.nextAppointment.includes("Hand and power instrumentation") &&
    form.nextAppointmentInstrumentationAreas.length
      ? `Instrumentation area: ${form.nextAppointmentInstrumentationAreas.join(", ")}.`
      : "",
    form.nextAppointmentNotes.trim()
      ? `Next appointment notes: ${cleanSentence(form.nextAppointmentNotes)}.`
      : "",
  ]);

  addHeadingBlock("Disposition", [
    form.disposition.length ? `Plan: ${form.disposition.join(", ")}.` : "",
  ]);

  return lines.join("\n");
}

export const SUMMARY_TEST_CASES = [
  {
    name: "joins summary lines with headings and indentation",
    input: (() => {
      const form = buildInitialForm();
      form.date = "2026-03-08";
      form.patientConcerns = "Bleeding gums";
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Visit Details:\n  Date: 2026-03-08",
      "History and Exam:\n  Patient concerns: Bleeding gums.",
    ],
  },
  {
    name: "groups EOE and IOE summary lines by exam scope",
    input: (() => {
      const form = buildInitialForm();
      form.eoeWithinNormalLimits = true;
      form.asymptomaticClickOnOpeningClosing = true;
      form.asymptomaticClickLaterality = "Left";
      form.eoe = "No swelling noted";
      form.ioeWithinNormalLimits = true;
      form.ioeFindings = ["Coated tongue"];
      form.palatineTorusAtMidline = true;
      form.palatineTorusProminence = "Slight";
      form.ioe = "Linea alba monitored";
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "EOE/IOE:\n  EOE: Within Normal Limits.\n  EOE findings: Asymptomatic click on opening/closing (Left).\n  EOE observations: No swelling noted.\n  IOE: Within Normal Limits.\n  IOE findings: Coated tongue, Palatine torus at midline (Slight).\n  IOE observations: Linea alba monitored.",
    ],
  },
  {
    name: "renders selected gingival finding as headed indented note text",
    input: (() => {
      const form = buildInitialForm();
      const findings = buildInitialFindings();
      findings.color.Pink = {
        presence: true,
        extent: "generalized",
        toothNumbers: "#5",
        locations: ["Facial"],
        distributions: ["Marginal"],
        notes: "Mild",
      };
      return { form, selectedFindings: collectSelectedFindings(findings) };
    })(),
    expectedIncludes: [
      "Gingival Description:",
      "  Color: Pink (generalized; teeth #5; location Facial; distribution Marginal; Mild).",
    ],
  },
  {
    name: "renders next appointment options in segmented block",
    input: (() => {
      const form = buildInitialForm();
      form.nextAppointment = ["Spot probing", "Full mouth probing"];
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Next Appointment:\n  Planned care: Spot probing, Full mouth probing.",
    ],
  },
  {
    name: "renders deposits block with indentation",
    input: (() => {
      const form = buildInitialForm();
      form.plaque.amount = "Light";
      form.plaque.extent = "Localized";
      form.plaque.locations = ["Facial"];
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Deposits and Inflammation:\n  Plaque: light / localized / Facial.",
    ],
  },
  {
    name: "omits extent/location when amount is none",
    input: (() => {
      const form = buildInitialForm();
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Deposits and Inflammation:\n  Plaque: none.",
      "  Calculus: none.",
      "  Extrinsic stain: none.",
      "  Bleeding and inflammation: none.",
    ],
  },
];

function MultiToggle({ label, options, selected, onChange }) {
  const selectedSet = new Set(selected);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selectedSet.has(option);
          return (
            <Button
              key={option}
              type="button"
              variant={isActive ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => {
                if (isActive) {
                  onChange(selected.filter((item) => item !== option));
                } else {
                  onChange([...selected, option]);
                }
              }}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function FindingRow({ sectionKey, option, value, onChange }) {
  const checked = value.presence;

  const update = (patch) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(next) => {
              const isChecked = Boolean(next);
              if (!isChecked) {
                onChange(emptyAnnotation());
              } else {
                update({ presence: true });
              }
            }}
            id={`${sectionKey}-${option}`}
          />
          <div>
            <Label
              htmlFor={`${sectionKey}-${option}`}
              className="cursor-pointer text-base font-semibold"
            >
              {option}
            </Label>
            <p className="text-sm text-muted-foreground">
              Mark this finding, then capture extent, tooth number, location,
              and distribution.
            </p>
          </div>
        </div>
        {checked ? <Badge className="rounded-xl">Selected</Badge> : null}
      </div>

      {checked ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Extent</Label>
            <Select
              value={value.extent}
              onValueChange={(next) => update({ extent: next })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select extent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generalized">Generalized</SelectItem>
                <SelectItem value="localized">Localized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tooth # / teeth</Label>
            <Input
              className="rounded-xl"
              placeholder="e.g. #5, #6-8 or 11, 12"
              value={value.toothNumbers}
              onChange={(e) => update({ toothNumbers: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <MultiToggle
              label="Location"
              options={LOCATION_OPTIONS}
              selected={value.locations}
              onChange={(locations) => update({ locations })}
            />
          </div>

          <div className="md:col-span-2">
            <MultiToggle
              label="Distribution"
              options={DISTRIBUTION_OPTIONS}
              selected={value.distributions}
              onChange={(distributions) => update({ distributions })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              className="min-h-[90px] rounded-xl"
              placeholder="Optional detail for this finding"
              value={value.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionTextarea({ id, label, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        className="min-h-[110px] rounded-2xl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function DepositsCard({
  title,
  value,
  onChange,
  showTypeLocation = false,
  placeholder,
}) {
  const update = (patch) => onChange({ ...value, ...patch });
  const showExtent = value.amount !== "None";

  return (
    <Card className="rounded-3xl border-dashed border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Select
              value={value.amount}
              onValueChange={(amount) => update({ amount })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                {AMOUNT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showExtent ? (
            <div className="space-y-2">
              <Label>Extent</Label>
              <Select
                value={value.extent}
                onValueChange={(extent) => update({ extent })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select extent" />
                </SelectTrigger>
                <SelectContent>
                  {EXTENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        {showTypeLocation && showExtent ? (
          <MultiToggle
            label="Location / Type"
            options={DEPOSIT_LOCATION_OPTIONS}
            selected={value.locations}
            onChange={(locations) => update({ locations })}
          />
        ) : null}

        <div className="space-y-2">
          <Label>Details</Label>
          <Textarea
            className="min-h-[100px] rounded-2xl"
            placeholder={placeholder}
            value={value.details}
            onChange={(e) => update({ details: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function GingivalDescriptionWebformImportedTemplate({ fixture }) {
  const [form, setForm] = useState(() => buildInitialForm());
  const [isCopied, setIsCopied] = useState(false);

  const setFinding = (sectionKey, option, nextValue) => {
    setForm((current) => ({
      ...current,
      findings: {
        ...current.findings,
        [sectionKey]: {
          ...current.findings[sectionKey],
          [option]: nextValue,
        },
      },
    }));
  };

  const selectedFindings = useMemo(
    () => collectSelectedFindings(form.findings),
    [form.findings],
  );
  const summaryText = useMemo(
    () => buildSummaryText(form, selectedFindings),
    [form, selectedFindings],
  );

  const resetForm = () => {
    setForm(buildInitialForm());
  };

  const loadDemo = () => {
    setForm(buildDemoForm(fixture));
  };

  const copySummary = async () => {
    let copied = false;

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(summaryText);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = summaryText;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (copied) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Dental Hygiene Note Webform Template
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Expanded from the original gingival description form into a fuller
              hygiene-note template with chart-ready structured output.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Date</Label>
                <Input
                  id="exam-date"
                  type="date"
                  className="rounded-xl"
                  value={form.date}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, date: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">History and Exam</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="patient-presents-for-hygiene-no-other-concerns"
                    checked={form.patientPresentsForHygieneNoOtherConcerns}
                    onCheckedChange={(next) =>
                      setForm((current) => ({
                        ...current,
                        patientPresentsForHygieneNoOtherConcerns: Boolean(next),
                      }))
                    }
                  />
                  <Label htmlFor="patient-presents-for-hygiene-no-other-concerns">
                    Patient presents for hygiene, no other concerns
                  </Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SectionTextarea
                    id="patient-concerns"
                    label="Patient concerns"
                    placeholder="Document the chief complaint or concerns in the patient’s own words."
                    value={form.patientConcerns}
                    onChange={(patientConcerns) =>
                      setForm((current) => ({ ...current, patientConcerns }))
                    }
                  />
                  <SectionTextarea
                    id="medical-history"
                    label="Medical history"
                    placeholder="Review and update medications, allergies, surgeries, conditions, or note no changes."
                    value={form.medicalHistory}
                    onChange={(medicalHistory) =>
                      setForm((current) => ({ ...current, medicalHistory }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="blood-pressure">BP</Label>
                    <Input
                      id="blood-pressure"
                      placeholder="e.g. 120/80"
                      value={form.bloodPressure}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          bloodPressure: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heart-rate">HR</Label>
                    <Input
                      id="heart-rate"
                      placeholder="e.g. 72"
                      value={form.heartRate}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          heartRate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood-pressure-time">BP taken time</Label>
                    <Input
                      id="blood-pressure-time"
                      type="time"
                      value={form.bloodPressureTakenTime}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          bloodPressureTakenTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">EOE / IOE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        EOE
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Extraoral exam findings and observations.
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={
                        form.eoeWithinNormalLimits ? "default" : "outline"
                      }
                      className="rounded-2xl"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          eoeWithinNormalLimits: !current.eoeWithinNormalLimits,
                        }))
                      }
                    >
                      EOE Within Normal Limits
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>EOE findings</Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={
                          form.asymptomaticClickOnOpeningClosing
                            ? "default"
                            : "outline"
                        }
                        className="w-full justify-start rounded-2xl"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            asymptomaticClickOnOpeningClosing:
                              !current.asymptomaticClickOnOpeningClosing,
                            asymptomaticClickLaterality:
                              current.asymptomaticClickOnOpeningClosing
                                ? ""
                                : current.asymptomaticClickLaterality,
                          }))
                        }
                      >
                        Asymptomatic click on opening/closing
                      </Button>
                      {form.asymptomaticClickOnOpeningClosing ? (
                        <div className="space-y-2">
                          <Label>Laterality</Label>
                          <Select
                            value={form.asymptomaticClickLaterality}
                            onValueChange={(asymptomaticClickLaterality) =>
                              setForm((current) => ({
                                ...current,
                                asymptomaticClickLaterality,
                              }))
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select laterality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None selected</SelectItem>
                              {CLICK_LATERALITY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={
                          form.asymptomaticLymphNodes ? "default" : "outline"
                        }
                        className="w-full justify-start rounded-2xl"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            asymptomaticLymphNodes:
                              !current.asymptomaticLymphNodes,
                            asymptomaticLymphNodesPalpability:
                              current.asymptomaticLymphNodes
                                ? ""
                                : current.asymptomaticLymphNodesPalpability,
                          }))
                        }
                      >
                        Asymptomatic lymph nodes
                      </Button>
                      {form.asymptomaticLymphNodes ? (
                        <div className="space-y-2">
                          <Label>Palpability</Label>
                          <Select
                            value={form.asymptomaticLymphNodesPalpability}
                            onValueChange={(
                              asymptomaticLymphNodesPalpability,
                            ) =>
                              setForm((current) => ({
                                ...current,
                                asymptomaticLymphNodesPalpability,
                              }))
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select palpability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None selected</SelectItem>
                              {ASYMPTOMATIC_LYMPH_NODE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <SectionTextarea
                    id="eoe"
                    label="EOE observations"
                    placeholder="Document extraoral observations."
                    value={form.eoe}
                    onChange={(eoe) =>
                      setForm((current) => ({ ...current, eoe }))
                    }
                  />
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        IOE
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Intraoral exam findings and observations.
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={
                        form.ioeWithinNormalLimits ? "default" : "outline"
                      }
                      className="rounded-2xl"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          ioeWithinNormalLimits: !current.ioeWithinNormalLimits,
                        }))
                      }
                    >
                      IOE Within Normal Limits
                    </Button>
                  </div>

                  <MultiToggle
                    label="IOE findings"
                    options={IOE_FINDING_OPTIONS}
                    selected={form.ioeFindings}
                    onChange={(ioeFindings) =>
                      setForm((current) => ({ ...current, ioeFindings }))
                    }
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={
                          form.palatineTorusAtMidline ? "default" : "outline"
                        }
                        className="w-full justify-start rounded-2xl"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            palatineTorusAtMidline:
                              !current.palatineTorusAtMidline,
                            palatineTorusProminence:
                              current.palatineTorusAtMidline
                                ? ""
                                : current.palatineTorusProminence,
                          }))
                        }
                      >
                        Palatine torus at midline
                      </Button>
                      {form.palatineTorusAtMidline ? (
                        <div className="space-y-2">
                          <Label>Prominence</Label>
                          <Select
                            value={form.palatineTorusProminence}
                            onValueChange={(palatineTorusProminence) =>
                              setForm((current) => ({
                                ...current,
                                palatineTorusProminence,
                              }))
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select prominence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None selected</SelectItem>
                              {PALATINE_TORUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={
                          form.bilateralMandibularTori ? "default" : "outline"
                        }
                        className="w-full justify-start rounded-2xl"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            bilateralMandibularTori:
                              !current.bilateralMandibularTori,
                            bilateralMandibularToriProminence:
                              current.bilateralMandibularTori
                                ? ""
                                : current.bilateralMandibularToriProminence,
                          }))
                        }
                      >
                        Bilateral mandibular tori
                      </Button>
                      {form.bilateralMandibularTori ? (
                        <div className="space-y-2">
                          <Label>Prominence</Label>
                          <Select
                            value={form.bilateralMandibularToriProminence}
                            onValueChange={(
                              bilateralMandibularToriProminence,
                            ) =>
                              setForm((current) => ({
                                ...current,
                                bilateralMandibularToriProminence,
                              }))
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select prominence" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None selected</SelectItem>
                              {PALATINE_TORUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <SectionTextarea
                    id="ioe"
                    label="IOE observations"
                    placeholder="Document intraoral observations."
                    value={form.ioe}
                    onChange={(ioe) =>
                      setForm((current) => ({ ...current, ioe }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Gingival Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  {Object.entries(FIELD_OPTIONS).map(
                    ([sectionKey, options]) => (
                      <Card
                        key={sectionKey}
                        className="rounded-3xl border-dashed"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {prettyLabel(sectionKey)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {options.map((option) => (
                            <FindingRow
                              key={option}
                              sectionKey={sectionKey}
                              option={option}
                              value={form.findings[sectionKey][option]}
                              onChange={(nextValue) =>
                                setFinding(sectionKey, option, nextValue)
                              }
                            />
                          ))}
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">
                  Calculus and Biofilm Deposits
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-2">
                <DepositsCard
                  title="Plaque"
                  value={form.plaque}
                  onChange={(plaque) =>
                    setForm((current) => ({ ...current, plaque }))
                  }
                  showTypeLocation
                  placeholder="Describe oral biofilm location, amount, and extent."
                />
                <DepositsCard
                  title="Calculus"
                  value={form.calculus}
                  onChange={(calculus) =>
                    setForm((current) => ({ ...current, calculus }))
                  }
                  showTypeLocation
                  placeholder="Describe supragingival/subgingival calculus and affected sites."
                />
                <DepositsCard
                  title="Extrinsic Stain"
                  value={form.extrinsicStain}
                  onChange={(extrinsicStain) =>
                    setForm((current) => ({ ...current, extrinsicStain }))
                  }
                  placeholder="Describe generalized or localized stain and specific teeth/surfaces."
                />
                <DepositsCard
                  title="Bleeding and Inflammation"
                  value={form.bleedingInflammation}
                  onChange={(bleedingInflammation) =>
                    setForm((current) => ({ ...current, bleedingInflammation }))
                  }
                  placeholder="Note amount, generalized vs localized, and any distribution details."
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Periodontal Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Activity status</Label>
                    <Select
                      value={form.periodontalStatusActivity}
                      onValueChange={(periodontalStatusActivity) =>
                        setForm((current) => ({
                          ...current,
                          periodontalStatusActivity,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select activity status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None selected</SelectItem>
                        {PERIODONTAL_ACTIVITY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Disease type</Label>
                    <Select
                      value={form.periodontalStatusDiseaseType}
                      onValueChange={(periodontalStatusDiseaseType) =>
                        setForm((current) => ({
                          ...current,
                          periodontalStatusDiseaseType,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select disease type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None selected</SelectItem>
                        {PERIODONTAL_DISEASE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity / stage</Label>
                    <Select
                      value={form.periodontalStatusSeverityStage}
                      onValueChange={(periodontalStatusSeverityStage) =>
                        setForm((current) => ({
                          ...current,
                          periodontalStatusSeverityStage,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select severity / stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None selected</SelectItem>
                        {PERIODONTAL_SEVERITY_STAGE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select
                      value={form.periodontalStatusGrade}
                      onValueChange={(periodontalStatusGrade) =>
                        setForm((current) => ({
                          ...current,
                          periodontalStatusGrade,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None selected</SelectItem>
                        {PERIODONTAL_GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SectionTextarea
                  id="periodontal-status-notes"
                  label="Periodontal status notes"
                  placeholder="Document contributing factors or rationale."
                  value={form.periodontalStatusNotes}
                  onChange={(periodontalStatusNotes) =>
                    setForm((current) => ({
                      ...current,
                      periodontalStatusNotes,
                    }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Caries Risk</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Caries risk level</Label>
                  <Select
                    value={form.cariesRiskLevel}
                    onValueChange={(cariesRiskLevel) =>
                      setForm((current) => ({ ...current, cariesRiskLevel }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select caries risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None selected</SelectItem>
                      {CARIES_RISK_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <MultiToggle
                    label="Caries risk factors"
                    options={CARIES_RISK_FACTOR_OPTIONS}
                    selected={form.cariesRiskFactors}
                    onChange={(cariesRiskFactors) =>
                      setForm((current) => ({ ...current, cariesRiskFactors }))
                    }
                  />
                </div>
                <SectionTextarea
                  id="caries-risk-notes"
                  label="Caries risk notes"
                  placeholder="Document rationale for caries risk selection."
                  value={form.cariesRiskNotes}
                  onChange={(cariesRiskNotes) =>
                    setForm((current) => ({ ...current, cariesRiskNotes }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">
                  Oral Health Education (OHE)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiToggle
                  label="OHE topics"
                  options={OHE_TOPIC_OPTIONS}
                  selected={form.oheTopics}
                  onChange={(oheTopics) =>
                    setForm((current) => ({ ...current, oheTopics }))
                  }
                />
                <SectionTextarea
                  id="ohe-notes"
                  label="OHE notes"
                  placeholder="Document OHE details discussed today."
                  value={form.oheNotes}
                  onChange={(oheNotes) =>
                    setForm((current) => ({ ...current, oheNotes }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiToggle
                  label="Recommendations"
                  options={RECOMMENDATION_OPTIONS}
                  selected={form.recommendations}
                  onChange={(recommendations) =>
                    setForm((current) => ({ ...current, recommendations }))
                  }
                />
                <SectionTextarea
                  id="recommendations-notes"
                  label="Recommendation notes"
                  placeholder="Add recommendation details when needed."
                  value={form.recommendationsNotes}
                  onChange={(recommendationsNotes) =>
                    setForm((current) => ({ ...current, recommendationsNotes }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Treatment Done Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiToggle
                  label="Completed today"
                  options={VISIT_CARE_OPTIONS}
                  selected={form.treatmentDoneToday}
                  onChange={(treatmentDoneToday) =>
                    setForm((current) => ({
                      ...current,
                      treatmentDoneToday,
                      treatmentDoneTodayInstrumentationDevices:
                        treatmentDoneToday.includes(
                          "Hand and power instrumentation",
                        )
                          ? current.treatmentDoneTodayInstrumentationDevices
                          : [],
                      treatmentDoneTodayInstrumentationAreas:
                        treatmentDoneToday.includes(
                          "Hand and power instrumentation",
                        )
                          ? current.treatmentDoneTodayInstrumentationAreas
                          : [],
                    }))
                  }
                />
                {form.treatmentDoneToday.includes(
                  "Hand and power instrumentation",
                ) ? (
                  <>
                    <MultiToggle
                      label="Hand and power instrumentation device (today)"
                      options={INSTRUMENTATION_DEVICE_OPTIONS}
                      selected={form.treatmentDoneTodayInstrumentationDevices}
                      onChange={(treatmentDoneTodayInstrumentationDevices) =>
                        setForm((current) => ({
                          ...current,
                          treatmentDoneTodayInstrumentationDevices,
                        }))
                      }
                    />
                    <MultiToggle
                      label="Instrumentation area (today)"
                      options={INSTRUMENTATION_AREA_OPTIONS}
                      selected={form.treatmentDoneTodayInstrumentationAreas}
                      onChange={(treatmentDoneTodayInstrumentationAreas) =>
                        setForm((current) => ({
                          ...current,
                          treatmentDoneTodayInstrumentationAreas,
                        }))
                      }
                    />
                  </>
                ) : null}
                <SectionTextarea
                  id="treatment-done-today-notes"
                  label="Treatment done today notes"
                  placeholder="Add details for treatment done today."
                  value={form.treatmentDoneTodayNotes}
                  onChange={(treatmentDoneTodayNotes) =>
                    setForm((current) => ({
                      ...current,
                      treatmentDoneTodayNotes,
                    }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Next Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        nextAppointment: current.treatmentDoneToday,
                        nextAppointmentInstrumentationDevices:
                          current.treatmentDoneTodayInstrumentationDevices,
                        nextAppointmentInstrumentationAreas:
                          current.treatmentDoneTodayInstrumentationAreas,
                      }))
                    }
                  >
                    Copy from Treatment Done Today
                  </Button>
                </div>
                <MultiToggle
                  label="Planned next appointment care"
                  options={VISIT_CARE_OPTIONS}
                  selected={form.nextAppointment}
                  onChange={(nextAppointment) =>
                    setForm((current) => ({
                      ...current,
                      nextAppointment,
                      nextAppointmentInstrumentationDevices:
                        nextAppointment.includes(
                          "Hand and power instrumentation",
                        )
                          ? current.nextAppointmentInstrumentationDevices
                          : [],
                      nextAppointmentInstrumentationAreas:
                        nextAppointment.includes(
                          "Hand and power instrumentation",
                        )
                          ? current.nextAppointmentInstrumentationAreas
                          : [],
                    }))
                  }
                />
                {form.nextAppointment.includes(
                  "Hand and power instrumentation",
                ) ? (
                  <>
                    <MultiToggle
                      label="Hand and power instrumentation device (next appointment)"
                      options={INSTRUMENTATION_DEVICE_OPTIONS}
                      selected={form.nextAppointmentInstrumentationDevices}
                      onChange={(nextAppointmentInstrumentationDevices) =>
                        setForm((current) => ({
                          ...current,
                          nextAppointmentInstrumentationDevices,
                        }))
                      }
                    />
                    <MultiToggle
                      label="Instrumentation area (next appointment)"
                      options={INSTRUMENTATION_AREA_OPTIONS}
                      selected={form.nextAppointmentInstrumentationAreas}
                      onChange={(nextAppointmentInstrumentationAreas) =>
                        setForm((current) => ({
                          ...current,
                          nextAppointmentInstrumentationAreas,
                        }))
                      }
                    />
                  </>
                ) : null}
                <SectionTextarea
                  id="next-appointment-notes"
                  label="Next appointment notes"
                  placeholder="Add details for next appointment."
                  value={form.nextAppointmentNotes}
                  onChange={(nextAppointmentNotes) =>
                    setForm((current) => ({ ...current, nextAppointmentNotes }))
                  }
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Disposition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Hygiene follow-up interval</Label>
                <div className="space-y-3">
                  {DISPOSITION_OPTIONS.map((option) => {
                    const checked = form.disposition.includes(option);
                    const optionId = `disposition-${option.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                    return (
                      <div key={option} className="flex items-center gap-3">
                        <Checkbox
                          id={optionId}
                          checked={checked}
                          onCheckedChange={(next) =>
                            setForm((current) => ({
                              ...current,
                              disposition: next
                                ? current.disposition.includes(option)
                                  ? current.disposition
                                  : [...current.disposition, option]
                                : current.disposition.filter(
                                    (item) => item !== option,
                                  ),
                            }))
                          }
                        />
                        <Label htmlFor={optionId}>{option}</Label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">
                  Additional Clinical Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SectionTextarea
                  id="other-clinical-findings"
                  label="Other clinical findings"
                  placeholder="Add any additional clinical findings."
                  value={form.otherClinicalFindings}
                  onChange={(otherClinicalFindings) =>
                    setForm((current) => ({
                      ...current,
                      otherClinicalFindings,
                    }))
                  }
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-2xl transition-all"
                onClick={copySummary}
                disabled={isCopied}
              >
                {isCopied ? "✓ Copied!" : "Copy summary"}
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={loadDemo}
                variant="outline"
              >
                Load demo
              </Button>
              <Button
                type="button"
                className="rounded-2xl"
                onClick={resetForm}
                variant="outline"
              >
                Reset form
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Structured Summary</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This preview helps copy the visit into a chart note or EHR later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedFindings.length ? (
                selectedFindings.map((item, index) => (
                  <div
                    key={`${item.section}-${item.finding}-${index}`}
                    className="space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="rounded-xl">
                        {item.section}
                      </Badge>
                      <Badge className="rounded-xl">
                        {item.extent === "generalized" ? "GEN" : "LOC"}
                      </Badge>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.finding}
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <p>Teeth: {item.toothNumbers || "—"}</p>
                      <p>
                        Location:{" "}
                        {item.locations.length
                          ? item.locations.join(", ")
                          : "—"}
                      </p>
                      <p>
                        Distribution:{" "}
                        {item.distributions.length
                          ? item.distributions.join(", ")
                          : "—"}
                      </p>
                      {item.notes ? <p>Notes: {item.notes}</p> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  No gingival findings selected yet.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plain-text output</Label>
              <Textarea
                readOnly
                className="min-h-[480px] rounded-2xl font-mono text-sm dark:bg-slate-900"
                value={summaryText}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
