"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentTimeString, getTodayDateString } from "@/lib/templates/date";

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
        "space-y-1.5 p-6",
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

function SectionCard({
  id,
  title,
  open = true,
  onToggle,
  children,
  className,
  contentClassName,
}) {
  return (
    <Card id={id} className={cx("rounded-3xl", className)}>
      <CardHeader className="space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl">{title}</CardTitle>
          {onToggle ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl px-3 py-1.5 text-xs"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={`${id}-content`}
            >
              {open ? "Collapse" : "Expand"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent
        id={`${id}-content`}
        className={cx(contentClassName, !open && "hidden")}
        aria-hidden={!open}
      >
        {children}
      </CardContent>
    </Card>
  );
}

function isInteractiveTarget(target) {
  return Boolean(
    target instanceof HTMLElement &&
      target.closest("button, input, select, textarea, label, a"),
  );
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
  gingivalMargins: ["Knife-edged", "Rolled"],
  interdentalPapilla: ["Pointed", "Bulbous", "Blunted"],
  surfaceTexture: ["Stippling", "Shiny", "Smooth"],
};

const LOCATION_OPTIONS = [
  "Sextant 1 (Upper right)",
  "Sextant 2 (Upper anterior)",
  "Sextant 3 (Upper left)",
  "Sextant 4 (Lower left)",
  "Sextant 5 (Lower anterior)",
  "Sextant 6 (Lower right)",
];

const DISTRIBUTION_OPTIONS = ["Diffuse", "Marginal", "Papillary"];

const SECTION_LABELS = {
  color: "Color",
  consistency: "Consistency",
  gingivalMargins: "Gingival margins",
  interdentalPapilla: "Interdental papilla",
  surfaceTexture: "Surface Texture",
};

const SECTION_KEY_BY_LABEL = {
  Color: "color",
  Consistency: "consistency",
  "Gingival margins": "gingivalMargins",
  "Interdental papilla": "interdentalPapilla",
  "Surface Texture": "surfaceTexture",
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
const DEPOSIT_TYPE_OPTIONS = ["Supragingival", "Subgingival"];
const DEPOSIT_DISTRIBUTION_OPTIONS = [
  "Interproximal",
  "Facial",
  "Lingual",
  "At gingival margin",
];
const HAND_POWER_INSTRUMENTATION_OPTION = "Hand and Power Instrumentation";
const FLUORIDE_VARNISH_OPTION = "Ipana 5% NaF varnish application";
const OHE_REINFORCED_OPTION = "OHE reinforced";
const REVIEWED_HOMECARE_OPTION = "Reviewed homecare";
const TREATMENT_OPTIONS = [
  HAND_POWER_INSTRUMENTATION_OPTION,
  FLUORIDE_VARNISH_OPTION,
];
const INSTRUMENTATION_DEVICE_OPTIONS = ["Cavitron", "Piezo"];
const INSTRUMENTATION_AREA_OPTIONS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Full mouth",
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
  "Periodontitis theory",
  "Periodontitis risk factors",
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
  OHE_REINFORCED_OPTION,
  REVIEWED_HOMECARE_OPTION,
  "Gingival assessments",
  "Calculus index",
  "Caries risk",
  "Nutrition score",
  "Periodontal risk assessment",
  "Spot probing",
  "Full mouth probing",
];
const VISIT_CARE_OPTIONS = [...VISIT_CARE_BASE_OPTIONS, ...TREATMENT_OPTIONS];
const VISIT_CARE_SELECT_CORE_OPTIONS = [
  "Med/dent history update",
  "EOE/IOE",
  OHE_REINFORCED_OPTION,
  REVIEWED_HOMECARE_OPTION,
];
const TMJ_CLICKING_STATUS_OPTIONS = ["Symptomatic", "Asymptomatic"];
const TMJ_CLICKING_OPEN_CLOSE_OPTIONS = ["On open", "On close"];
const LYMPH_NODE_LOCATION_OPTIONS = ["Submandibular", "Sublingual"];
const LYMPH_NODE_SWELLING_OPTIONS = ["Slightly enlarged", "Very swollen"];
const LOCAL_ANESTHESIA_TYPE_OPTIONS = [
  "I/O",
  "M/I",
  "PSA",
  "IA/L",
  "Buccal NB",
  "GP",
  "NP",
];
const LOCAL_ANESTHETIC_PRODUCT_OPTIONS = [
  "Articaine 4% with 1:200K epinephrine",
  "Lidocaine 2% with 1:100K epinephrine",
  "Mepivacaine 3% without epinephrine",
];
const QUADRANT_OPTIONS = ["Q1", "Q2", "Q3", "Q4"];
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

function emptyDepositEntry() {
  return {
    enabled: false,
    amount: "None",
    extent: "Localized",
    locations: [],
    types: [],
    distributions: [],
    details: "",
  };
}

function emptyLocalAnesthesiaEntry() {
  return {
    injectionType: "",
    quadrant: "",
    anestheticProduct: "",
    amountMl: "1.8",
    timeAdministered: getCurrentTimeString(),
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

export function buildInitialForm(fixture) {
  const form = {
    date: getTodayDateString(),
    patientConcerns: "",
    patientPresentsForHygieneNoOtherConcerns: false,
    medicalHistory: "Patient reports no changes",
    bloodPressure: "",
    heartRate: "",
    bloodPressureTakenTime: getCurrentTimeString(),
    eoe: "",
    ioe: "",
    eoeWithinNormalLimits: false,
    ioeWithinNormalLimits: false,
    asymptomaticClickOnOpeningClosing: false,
    tmjClickingStatus: [],
    tmjClickingPhase: [],
    asymptomaticClickLaterality: "",
    asymptomaticLymphNodes: false,
    palpableLymphNodeLaterality: "",
    palpableLymphNodeLocation: [],
    palpableLymphNodeSwelling: [],
    ioeFindings: [],
    palatineTorusAtMidline: false,
    palatineTorusProminence: "",
    bilateralMandibularTori: false,
    bilateralMandibularToriProminence: "",
    findings: buildInitialFindings(),
    plaque: emptyDepositEntry(),
    calculus: emptyDepositEntry(),
    extrinsicStain: emptyDepositEntry(),
    treatmentDoneToday: [],
    treatmentDoneTodayInstrumentationDevices: [],
    treatmentDoneTodayInstrumentationAreas: [],
    treatmentDoneTodayNotes: "",
    nextAppointment: [],
    nextAppointmentInstrumentationDevices: [],
    nextAppointmentInstrumentationAreas: [],
    nextAppointmentNotes: "",
    localAnesthesiaNoContraindication: false,
    localAnesthesiaBenzocaineApplied: false,
    localAnesthesiaNoAdverseReactions: false,
    localAnesthesiaAdequateAchieved: false,
    localAnesthesiaEntries: [],
    localAnesthesiaNotes: "",
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

export function buildDemoForm(fixture) {
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
  form.eoe = "Baseline monitoring only.";
  form.ioe = "Mild soft tissue variations noted.";

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
    "Periodontitis theory",
    "Periodontitis risk factors",
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
    OHE_REINFORCED_OPTION,
    REVIEWED_HOMECARE_OPTION,
    "Gingival assessments",
    "Calculus index",
    "Caries risk",
    "Nutrition score",
    "Periodontal risk assessment",
    "Spot probing",
    "Full mouth probing",
    HAND_POWER_INSTRUMENTATION_OPTION,
    FLUORIDE_VARNISH_OPTION,
  ];
  form.treatmentDoneTodayInstrumentationDevices = ["Piezo"];
  form.treatmentDoneTodayInstrumentationAreas = [
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "Full mouth",
    "Maxilla",
    "Mandible",
  ];
  form.treatmentDoneTodayNotes =
    "Completed full periodontal hygiene workflow today.";

  form.nextAppointment = [
    "EOE/IOE",
    OHE_REINFORCED_OPTION,
    REVIEWED_HOMECARE_OPTION,
    "Gingival assessments",
    "Caries risk",
    "Periodontal risk assessment",
    "Spot probing",
    "Full mouth probing",
    HAND_POWER_INSTRUMENTATION_OPTION,
    FLUORIDE_VARNISH_OPTION,
  ];
  form.nextAppointmentInstrumentationDevices = ["Piezo"];
  form.nextAppointmentInstrumentationAreas = [
    "Full mouth",
    "Sextant 1",
    "Sextant 2",
    "Sextant 3",
  ];
  form.nextAppointmentNotes =
    "Reassess inflammation response and home-care adherence.";
  form.localAnesthesiaNoContraindication = true;
  form.localAnesthesiaBenzocaineApplied = true;
  form.localAnesthesiaEntries = [
    {
      injectionType: "IA/L",
      quadrant: "Q3",
      anestheticProduct: "Mepivacaine 3% without epinephrine",
      amountMl: "1.8",
      timeAdministered: "09:25",
    },
    {
      injectionType: "M/I",
      quadrant: "Q3",
      anestheticProduct: "Mepivacaine 3% without epinephrine",
      amountMl: "1.8",
      timeAdministered: "09:27",
    },
  ];
  form.localAnesthesiaNotes =
    "Patient tolerated injections well and post-op instructions reviewed.";

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
  const clean = (value) =>
    String(value ?? "")
      .trim()
      .replace(/[\s\n]+/g, " ");
  const indentLine = (value) => `   ${value}`;
  const cleanSentence = (value) => clean(value).replace(/[.]+$/g, "");
  const capitalizeSentence = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
  const lowerFirst = (value) =>
    value ? value.charAt(0).toLowerCase() + value.slice(1) : "";
  const ensurePeriod = (value) => {
    const normalized = cleanSentence(value);
    return normalized ? `${capitalizeSentence(normalized)}.` : "";
  };
  const joinComma = (items) => items.filter(Boolean).join(", ");
  const formatClockTime = (value) => {
    const normalized = clean(value);
    const match = normalized.match(/^(\d{1,2}):(\d{2})$/);

    if (!match) return normalized;

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  };
  const formatLabelList = (items, mapper = (item) => item) =>
    joinComma(items.map((item) => mapper(item)).filter(Boolean));
  const normalizeObservation = (value, withinNormalLimits) => {
    let normalized = cleanSentence(value);

    if (!normalized) return "";

    if (withinNormalLimits) {
      normalized = normalized.replace(
        /^within normal limits overall[;,]?\s*/i,
        "",
      );
      normalized = normalized.replace(/^within normal limits[;,]?\s*/i, "");
    }

    normalized = normalized.replace(/^observations documented for\s+/i, "");
    return lowerFirst(cleanSentence(normalized));
  };
  const formatPatientConcerns = () => {
    const parts = [];

    if (form.patientPresentsForHygieneNoOtherConcerns) {
      parts.push("Patient presents for hygiene, no other concerns");
    }

    if (cleanSentence(form.patientConcerns)) {
      parts.push(cleanSentence(form.patientConcerns));
    }

    if (!parts.length) return "";
    return `Patient concerns: ${capitalizeSentence(parts.join(". "))}.`;
  };
  const formatMedicalHistoryBlock = () => {
    const lines = [];
    const medicalHistory = cleanSentence(form.medicalHistory);
    const shouldHideDefaultMedicalHistory =
      medicalHistory.toLowerCase() === "patient reports no changes";
    const vitalSegments = [];

    if (
      !medicalHistory &&
      !form.bloodPressure &&
      !form.heartRate &&
      !form.bloodPressureTakenTime
    ) {
      return "";
    }

    lines.push("Medical history update:");
    if (medicalHistory && !shouldHideDefaultMedicalHistory) {
      lines.push(indentLine(ensurePeriod(medicalHistory)));
    }
    if (form.bloodPressure) {
      vitalSegments.push(`BP: ${clean(form.bloodPressure)} mmHg`);
    }
    if (form.heartRate) {
      vitalSegments.push(`HR: ${clean(form.heartRate)} bpm`);
    }
    if (form.bloodPressureTakenTime) {
      vitalSegments.push(`Taken at ${formatClockTime(form.bloodPressureTakenTime)}`);
    }
    if (vitalSegments.length) {
      let vitalsLine = "";

      vitalSegments.forEach((segment) => {
        if (segment.startsWith("Taken at ")) {
          vitalsLine = vitalsLine ? `${vitalsLine} ${segment}` : segment;
          return;
        }

        vitalsLine = vitalsLine ? `${vitalsLine}, ${segment}` : segment;
      });

      lines.push(indentLine(vitalsLine));
    }

    return lines.join("\n");
  };
  const formatEoeLine = () => {
    const findings = [];

    if (form.asymptomaticClickOnOpeningClosing) {
      const laterality = clean(form.asymptomaticClickLaterality).toLowerCase();
      const status = form.tmjClickingStatus.length
        ? form.tmjClickingStatus.map((item) => clean(item).toLowerCase()).join("/")
        : "asymptomatic";
      const phase = form.tmjClickingPhase.length
        ? form.tmjClickingPhase.map((item) => clean(item).toLowerCase()).join("/")
        : "on open";
      findings.push(
        `${laterality ? `${laterality} ` : ""}tmj clicking (${status}, ${phase})`,
      );
    }

    if (form.asymptomaticLymphNodes) {
      const segments = [];
      if (form.palpableLymphNodeLaterality) {
        segments.push(clean(form.palpableLymphNodeLaterality).toLowerCase());
      }
      if (form.palpableLymphNodeLocation.length) {
        segments.push(form.palpableLymphNodeLocation.map((item) => clean(item).toLowerCase()).join("/"));
      }
      if (form.palpableLymphNodeSwelling.length) {
        segments.push(form.palpableLymphNodeSwelling.map((item) => clean(item).toLowerCase()).join("/"));
      }
      findings.push(`palpable lymph nodes${segments.length ? ` (${segments.join(", ")})` : ""}`);
    }

    const observation = normalizeObservation(form.eoe, form.eoeWithinNormalLimits);
    if (observation) findings.push(observation);
    if (form.eoeWithinNormalLimits && !findings.length) {
      findings.push("within normal limits");
    }
    if (!findings.length) return "";

    return `EOE: ${joinComma(findings)}`;
  };
  const formatIoeFinding = (value) => {
    const normalizedValue = clean(value).toLowerCase();
    return normalizedValue;
  };
  const formatIoeLine = () => {
    const findings = form.ioeFindings.map((item) => formatIoeFinding(item));

    if (form.palatineTorusAtMidline) {
      const prominence = clean(form.palatineTorusProminence).toLowerCase();
      findings.push(
        `${prominence ? `${prominence} ` : ""}palatine torus at midline`,
      );
    }

    if (form.bilateralMandibularTori) {
      const prominence = clean(form.bilateralMandibularToriProminence).toLowerCase();
      findings.push(
        `${prominence ? `${prominence} ` : ""}bilateral mandibular tori`,
      );
    }

    const observation = normalizeObservation(form.ioe, form.ioeWithinNormalLimits);
    if (observation) findings.push(observation);
    if (form.ioeWithinNormalLimits && !findings.length) {
      findings.push("within normal limits");
    }
    if (!findings.length) return "";

    return `IOE: ${joinComma(findings)}`;
  };
  const formatAreaSuffix = (item) => {
    if (item.toothNumbers && clean(item.toothNumbers)) {
      return ` on ${clean(item.toothNumbers)}`;
    }

    if (item.locations.length) {
      return ` on ${item.locations.map((location) => location.toLowerCase()).join(", ")}`;
    }

    return "";
  };
  const formatFindingDescriptor = (item) => {
    let descriptor = clean(item.finding).toLowerCase();

    if (item.section === "Color" && descriptor === "red") {
      descriptor = "redness";
    }
    if (item.section === "Surface Texture" && descriptor === "stippling") {
      descriptor = "stippled";
    }

    if (item.distributions.length) {
      descriptor = `${item.distributions
        .map((distribution) => distribution.toLowerCase())
        .join(" ")} ${descriptor}`;
    }

    let phrase = `${item.extent} ${descriptor}${formatAreaSuffix(item)}`;

    if (item.notes && cleanSentence(item.notes)) {
      phrase += ` (${cleanSentence(item.notes)})`;
    }

    return phrase;
  };
  const combineFindingsBySection = (items) => {
    if (!items.length) return [];

    const generalized = items.filter((item) => item.extent === "generalized");
    const localized = items.filter((item) => item.extent === "localized");
    const phrases = [];

    if (
      generalized.length === 1 &&
      localized.length === 1 &&
      ["Color", "Consistency", "Surface Texture"].includes(items[0].section)
    ) {
      phrases.push(
        `${formatFindingDescriptor(generalized[0])} with ${formatFindingDescriptor(localized[0])}`,
      );
      return phrases;
    }

    generalized.forEach((item) => {
      phrases.push(formatFindingDescriptor(item));
    });
    localized.forEach((item) => {
      phrases.push(formatFindingDescriptor(item));
    });

    return phrases;
  };
  const formatGingivalDescription = () => {
    if (!selectedFindings.length) return "";

    const sectionOrder = [
      "Color",
      "Gingival margins",
      "Interdental papilla",
      "Consistency",
      "Surface Texture",
    ];
    const phrases = [];

    sectionOrder.forEach((section) => {
      const sectionItems = selectedFindings.filter((item) => item.section === section);
      phrases.push(...combineFindingsBySection(sectionItems));
    });

    if (!phrases.length) return "";
    return `Gingival Description: ${joinComma(phrases)}.`;
  };
  const formatDepositLine = (label, entry) => {
    if (!entry.enabled) return "";

    if (entry.amount === "None") {
      return `${label}: none`;
    }

    const details = cleanSentence(entry.details);

    if (details) {
      return `${label}: ${entry.extent.toLowerCase()} ${lowerFirst(details)}`;
    }

    const parts = [entry.extent.toLowerCase()];

    if (entry.amount) {
      parts.push(entry.amount.toLowerCase());
    }

    parts.push(label.toLowerCase());

    if ((entry.locations || []).length) {
      parts.push(
        entry.locations.map((location) => location.toLowerCase()).join(", "),
      );
    }
    if ((entry.types || []).length) {
      parts.push(entry.types.map((type) => type.toLowerCase()).join(", "));
    }
    if ((entry.distributions || []).length) {
      parts.push(
        entry.distributions
          .map((distribution) => distribution.toLowerCase())
          .join(", "),
      );
    }

    return `${label}: ${parts.join(" ")}`;
  };
  const formatPeriodontalDiagnosis = () => {
    const isPeriodontitis = form.periodontalStatusDiseaseType === "Periodontitis";
    const parts = [
      form.periodontalStatusActivity,
      isPeriodontitis
        ? form.periodontalStatusSeverityStage
        : form.periodontalStatusDiseaseType,
      isPeriodontitis ? form.periodontalStatusGrade : "",
    ].filter(Boolean);
    const notes = cleanSentence(form.periodontalStatusNotes);

    if (!parts.length && !notes) {
      return "";
    }

    if (!parts.length) {
      return `Periodontal diagnosis: ${ensurePeriod(notes)}`;
    }

    const diagnosisLine = `Periodontal diagnosis: ${parts.join(" ")}`;
    if (!notes) {
      return diagnosisLine;
    }

    return `${diagnosisLine}. ${ensurePeriod(notes)}`;
  };
  const formatCariesRiskFactor = (factor) => {
    const normalizedFactor = clean(factor);

    switch (normalizedFactor) {
      case "Inadequate brushing oral hygiene":
        return "inadequate oral hygiene";
      case "History of caries in the last 36 months":
        return "history of active decay in the last 36 months";
      default:
        return lowerFirst(normalizedFactor);
    }
  };
  const formatCariesRisk = () => {
    const notes = cleanSentence(form.cariesRiskNotes);

    if (!form.cariesRiskLevel && !form.cariesRiskFactors.length && !notes) {
      return "";
    }

    let line = "";

    if (form.cariesRiskLevel) {
      line = `${form.cariesRiskLevel} caries risk`;
    } else if (form.cariesRiskFactors.length) {
      line = "Caries risk";
    }

    if (form.cariesRiskFactors.length) {
      line += ` due to ${formatLabelList(
        form.cariesRiskFactors,
        formatCariesRiskFactor,
      )}`;
    }

    if (!line) {
      return `Caries risk: ${ensurePeriod(notes)}`;
    }

    if (!notes) {
      return `Caries risk: ${line}`;
    }

    return `Caries risk: ${line}. ${ensurePeriod(notes)}`;
  };
  const formatOheTopics = () => {
    const selected = [...form.oheTopics];
    const seen = new Set();
    const result = [];

    selected.forEach((topic) => {
      if (seen.has(topic)) return;

      if (
        topic === "Caries theory" &&
        selected.includes("Caries risk factors")
      ) {
        result.push("caries theory and risk factors");
        seen.add("Caries theory");
        seen.add("Caries risk factors");
        return;
      }

      if (
        topic === "Periodontitis theory" &&
        selected.includes("Periodontitis risk factors")
      ) {
        result.push("periodontitis theory and risk factors");
        seen.add("Periodontitis theory");
        seen.add("Periodontitis risk factors");
        return;
      }

      const mappedTopic = {
        "Bass brushing": "bass brushing",
        "C-shape flossing technique": "c-shaped flossing",
        "Sulcabrush and interdental brush technique":
          "sulcabrush and interdental brush technique",
        "Review benefits of Prevident or Opti-Rinse":
          "review benefits of Prevident or Opti-Rinse",
        "Importance of maintaining a 4-month hygiene interval":
          "importance of maintaining a 4-month hygiene interval",
      }[topic] ?? lowerFirst(topic);

      result.push(mappedTopic);
      seen.add(topic);
    });

    return result;
  };
  const formatOhe = () => {
    const topics = formatOheTopics();
    const notes = cleanSentence(form.oheNotes);

    if (!topics.length && !notes) return "";

    if (!topics.length) {
      return `OHE: ${ensurePeriod(notes)}`;
    }

    const line = `OHE: ${capitalizeSentence(joinComma(topics))}`;
    if (!notes) return line;
    return `${line}. ${ensurePeriod(notes)}`;
  };
  const formatRecommendations = () => {
    const notes = cleanSentence(form.recommendationsNotes);

    if (!form.recommendations.length && !notes) return "";

    if (!form.recommendations.length) {
      return `Recommendations: ${ensurePeriod(notes)}`;
    }

    const line = formatLabelList(form.recommendations, lowerFirst);
    if (!notes) return `Recommendations: ${line}`;
    return `Recommendations: ${line}. ${ensurePeriod(notes)}`;
  };
  const formatInstrumentationSelections = (items, devices, areas) =>
    items.map((item) => {
      let label = item;

      if (item === HAND_POWER_INSTRUMENTATION_OPTION && devices.length) {
        label = `${item} (${joinComma(devices)})`;
      }

      if (item === HAND_POWER_INSTRUMENTATION_OPTION && areas.length) {
        return `${joinComma(areas)} ${label}`;
      }

      return label;
    });
  const formatLocalAnesthesia = () => {
    const detailLines = [];
    let heading = "";

    if (form.localAnesthesiaNoContraindication) {
      heading = "Local anesthetic administered: No C/I to LA";
    }
    if (form.localAnesthesiaBenzocaineApplied) {
      detailLines.push("Benzocaine 20% applied to the injection site");
    }

    const totals = new Map();
    form.localAnesthesiaEntries.forEach((entry) => {
      const injectionType = clean(entry.injectionType);
      const quadrant = clean(entry.quadrant);
      const product = clean(entry.anestheticProduct);
      const amountMlRaw = clean(entry.amountMl);
      if (!injectionType || !quadrant || !product || !amountMlRaw) return;

      const amount = Number(amountMlRaw);
      const time = clean(entry.timeAdministered);
      detailLines.push(
        `${injectionType} ${quadrant}: ${product} ${amountMlRaw} ml${time ? ` (at ${formatClockTime(time)})` : ""}`,
      );

      if (Number.isFinite(amount)) {
        totals.set(product, (totals.get(product) ?? 0) + amount);
      }
    });

    totals.forEach((amount, product) => {
      detailLines.push(`Total: ${product} ${amount.toFixed(1)} ml`);
    });

    if (form.localAnesthesiaNoAdverseReactions) {
      detailLines.push("No adverse reactions noted");
    }
    if (form.localAnesthesiaAdequateAchieved) {
      detailLines.push("Adequate anesthesia achieved");
    }
    if (clean(form.localAnesthesiaNotes)) {
      detailLines.push(cleanSentence(form.localAnesthesiaNotes));
    }

    if (!heading && !detailLines.length) return "";
    if (!heading) heading = "Local anesthetic administered:";

    return [heading, ...detailLines.map(indentLine)].join("\n");
  };
  const formatCompletedTreatments = () => {
    const hasFollowUpContext = form.nextAppointment.length || form.disposition.length;
    const notes = cleanSentence(form.treatmentDoneTodayNotes);

    if (!form.treatmentDoneToday.length && !hasFollowUpContext && !notes) {
      return "";
    }

    if (!form.treatmentDoneToday.length) {
      return notes
        ? `Treatments completed today: ${ensurePeriod(notes)}`
        : "Treatments completed today:";
    }

    const line = `Treatments completed today: ${joinComma(
      formatInstrumentationSelections(
        form.treatmentDoneToday,
        form.treatmentDoneTodayInstrumentationDevices,
        form.treatmentDoneTodayInstrumentationAreas,
      ),
    )}`;

    if (!notes) return line;
    return `${line}. ${ensurePeriod(notes)}`;
  };
  const formatNextAppointment = () => {
    const notes = cleanSentence(form.nextAppointmentNotes);

    if (!form.nextAppointment.length && !notes) return "";

    if (!form.nextAppointment.length) {
      return `Next Appointment: ${ensurePeriod(notes)}`;
    }

    const line = `Next Appointment: ${joinComma(
      formatInstrumentationSelections(
        form.nextAppointment,
        form.nextAppointmentInstrumentationDevices,
        form.nextAppointmentInstrumentationAreas,
      ),
    )}`;

    if (!notes) return line;
    return `${line}. ${ensurePeriod(notes)}`;
  };
  const formatOtherClinicalFindings = () => {
    const notes = cleanSentence(form.otherClinicalFindings);

    if (!notes) return "";
    return `Other clinical findings: ${ensurePeriod(notes)}`;
  };
  const formatContinuityOfCare = () => {
    if (!form.disposition.length) return "";

    return ["Continuity of Care", ...form.disposition.map(indentLine)].join("\n");
  };

  const blocks = [
    formatPatientConcerns(),
    formatMedicalHistoryBlock(),
    formatEoeLine(),
    formatIoeLine(),
    formatGingivalDescription(),
    formatDepositLine("Calculus", form.calculus),
    formatDepositLine("Plaque", form.plaque),
    formatDepositLine("Extrinsic Stain", form.extrinsicStain),
    formatPeriodontalDiagnosis(),
    formatCariesRisk(),
    formatOhe(),
    formatRecommendations(),
  ].filter(Boolean);

  const treatmentLine = formatCompletedTreatments();
  if (treatmentLine) blocks.push(treatmentLine);

  const nextAppointmentLine = formatNextAppointment();
  if (nextAppointmentLine) blocks.push(nextAppointmentLine);

  const localAnesthesiaLine = formatLocalAnesthesia();
  if (localAnesthesiaLine) blocks.push(localAnesthesiaLine);

  const otherClinicalFindingsLine = formatOtherClinicalFindings();
  if (otherClinicalFindingsLine) blocks.push(otherClinicalFindingsLine);

  const continuityOfCareLine = formatContinuityOfCare();
  if (continuityOfCareLine) blocks.push(continuityOfCareLine);

  return blocks.join("\n\n");
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
      "Visit Details:\n  Date: 2026-03-08\n\nHistory and Exam:\n  Patient concerns:\n    Bleeding gums.",
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
      "EOE/IOE:\n  EOE: WNL\n    Findings:\n      - TMJ clicking (Left)\n    Observations:\n      - No swelling noted\n\n  IOE: WNL\n    Findings:\n      - Coated tongue\n      - Palatine torus at midline (Slight)\n    Observations:\n      - Linea alba monitored",
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
      "Gingival Description:\n  Color: Pink\n    Extent: generalized\n    Teeth: #5\n    Location: Facial\n    Distribution: Marginal\n    Notes: Mild.",
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
      "Next Appointment:\n  Planned care:\n    - Spot probing\n    - Full mouth probing",
    ],
  },
  {
    name: "renders deposits block with indentation",
    input: (() => {
      const form = buildInitialForm();
      form.plaque.enabled = true;
      form.plaque.amount = "Light";
      form.plaque.extent = "Localized";
      form.plaque.locations = ["Sextant 1 (Upper right)"];
      form.plaque.distributions = ["Facial"];
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Deposits and Inflammation:\n  Plaque: light / localized / Facial.",
    ],
  },
  {
    name: "omits deposits block when no deposit cards are selected",
    input: (() => {
      const form = buildInitialForm();
      return { form, selectedFindings: [] };
    })(),
    expectedExcludes: ["Deposits and Inflammation:"],
  },
  {
    name: "renders active deposit card with none amount",
    input: (() => {
      const form = buildInitialForm();
      form.plaque.enabled = true;
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: ["Deposits and Inflammation:\n  Plaque: none."],
  },
];

function MultiToggle({
  label,
  options,
  selected,
  onChange,
  showSelectAll = false,
  selectAllLabel = "Select Core",
  onSelectAll,
}) {
  const selectedSet = new Set(selected);
  const allSelected = options.length > 0 && selected.length === options.length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {showSelectAll ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl px-3 py-1.5 text-xs"
            disabled={allSelected}
            onClick={() => {
              if (onSelectAll) {
                onSelectAll();
                return;
              }
              onChange([...options]);
            }}
          >
            {selectAllLabel}
          </Button>
        ) : null}
      </div>
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

  const setChecked = (nextChecked) => {
    if (!nextChecked) {
      onChange(emptyAnnotation());
      return;
    }

    update({ presence: true });
  };

  return (
    <div
      className={cx(
        "space-y-4 rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-slate-300 dark:bg-slate-800 dark:hover:border-slate-600",
        checked
          ? "border-slate-300 bg-slate-50 ring-2 ring-slate-200 dark:border-sky-400 dark:bg-sky-950/25 dark:ring-sky-900/70"
          : "border-slate-200 dark:border-slate-700",
      )}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={(event) => {
        if (isInteractiveTarget(event.target)) return;
        setChecked(!checked);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (isInteractiveTarget(event.target)) return;
        event.preventDefault();
        setChecked(!checked);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
          <Checkbox
            className="mt-1 h-5 w-5"
            checked={checked}
            onCheckedChange={(next) => setChecked(Boolean(next))}
            id={`${sectionKey}-${option}`}
          />
          <div className="space-y-1">
            <Label
              htmlFor={`${sectionKey}-${option}`}
              className="cursor-pointer text-lg font-semibold leading-tight"
            >
              {option}
            </Label>
            {!checked ? (
              <p className="text-xs text-muted-foreground">Select to expand</p>
            ) : null}
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

const VERY_SHORT_DEFAULT_OPEN_SECTIONS = {
  historyAndExam: true,
  eoeIoe: false,
  gingivalDescription: true,
  deposits: true,
  periodontalStatus: true,
  cariesRisk: false,
  ohe: false,
  recommendations: false,
  treatmentDoneToday: true,
  nextAppointment: false,
  localAnesthesia: false,
  disposition: false,
  additionalClinicalDocumentation: false,
};

const VERY_SHORT_JUMP_SECTIONS = [
  ["historyAndExam", "History and Exam"],
  ["gingivalDescription", "Gingival Description"],
  ["treatmentDoneToday", "Treatment Done Today"],
  ["localAnesthesia", "Local Anesthesia"],
  ["nextAppointment", "Next Appointment"],
];

function getSectionId(sectionKey) {
  return `template-section-${sectionKey}`;
}

function DepositsCard({
  title,
  value,
  onChange,
  showTypeLocation = false,
  placeholder,
}) {
  const update = (patch) => onChange({ ...value, ...patch });
  const showDetails = value.enabled;
  const showExtent = showDetails && value.amount !== "None";
  const setEnabled = (nextEnabled) => {
    if (!nextEnabled) {
      onChange(emptyDepositEntry());
      return;
    }

    update({ enabled: true });
  };

  return (
    <div
      className={cx(
        "space-y-4 rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-slate-300 dark:bg-slate-800 dark:hover:border-slate-600",
        value.enabled
          ? "border-slate-300 bg-slate-50 ring-2 ring-slate-200 dark:border-sky-400 dark:bg-sky-950/25 dark:ring-sky-900/70"
          : "border-slate-200 dark:border-slate-700",
      )}
      role="checkbox"
      aria-checked={value.enabled}
      tabIndex={0}
      onClick={(event) => {
        if (isInteractiveTarget(event.target)) return;
        setEnabled(!value.enabled);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (isInteractiveTarget(event.target)) return;
        event.preventDefault();
        setEnabled(!value.enabled);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
          <Checkbox
            className="mt-1 h-5 w-5"
            checked={value.enabled}
            onCheckedChange={(next) => setEnabled(Boolean(next))}
            id={`deposit-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          />
          <div className="space-y-1">
            <Label
              htmlFor={`deposit-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="cursor-pointer text-lg font-semibold leading-tight"
            >
              {title}
            </Label>
            {!value.enabled ? (
              <p className="text-xs text-muted-foreground">Select to expand</p>
            ) : null}
          </div>
        </div>
        {value.enabled ? <Badge className="rounded-xl">Selected</Badge> : null}
      </div>

      {showDetails ? (
        <div className="space-y-4">
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
            <div className="space-y-4">
              <MultiToggle
                label="Location"
                options={LOCATION_OPTIONS}
                selected={value.locations || []}
                onChange={(locations) => update({ locations })}
              />
              <MultiToggle
                label="Type"
                options={DEPOSIT_TYPE_OPTIONS}
                selected={value.types || []}
                onChange={(types) => update({ types })}
              />
              <MultiToggle
                label="Distribution"
                options={DEPOSIT_DISTRIBUTION_OPTIONS}
                selected={value.distributions || []}
                onChange={(distributions) => update({ distributions })}
              />
            </div>
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
        </div>
      ) : null}
    </div>
  );
}

export function GingivalDescriptionWebformImportedTemplate({
  fixture,
  summary,
  title = "Dental Hygiene Note Webform Template",
  description = "Expanded from the original gingival description form into a fuller hygiene-note template with chart-ready structured output.",
  variant = "full",
}) {
  const isVeryShort = variant === "very-short";
  const [form, setForm] = useState(() => buildInitialForm(fixture));
  const [isCopied, setIsCopied] = useState(false);
  const [structuredSummaryOpen, setStructuredSummaryOpen] = useState(
    !isVeryShort,
  );
  const [openSections, setOpenSections] = useState(
    VERY_SHORT_DEFAULT_OPEN_SECTIONS,
  );
  void summary;

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
  const warningMessage =
    "WARNING: This will replace the current form and DELETE ALL ENTERED DATA. Do you want to continue?";

  const confirmReplaceForm = () => {
    if (typeof window === "undefined") return true;

    return window.confirm(warningMessage);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const resetForm = () => {
    if (!confirmReplaceForm()) return;
    setForm(buildInitialForm(fixture));
  };

  const loadDemo = () => {
    if (!confirmReplaceForm()) return;
    setForm(buildDemoForm(fixture));
  };

  const setBloodPressureTimeToCurrent = () => {
    setForm((current) => ({
      ...current,
      bloodPressureTakenTime: getCurrentTimeString(),
    }));
  };

  const setLocalAnesthesiaEntryTimeToCurrent = (entryIndex) => {
    setForm((current) => ({
      ...current,
      localAnesthesiaEntries: current.localAnesthesiaEntries.map((row, rowIndex) =>
        rowIndex === entryIndex
          ? { ...row, timeAdministered: getCurrentTimeString() }
          : row,
      ),
    }));
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

  const toggleSection = (sectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  const setAllSectionsOpen = (nextOpen) => {
    setOpenSections(
      Object.fromEntries(
        Object.keys(VERY_SHORT_DEFAULT_OPEN_SECTIONS).map((sectionKey) => [
          sectionKey,
          nextOpen,
        ]),
      ),
    );
  };

  const jumpToSection = (sectionKey) => {
    const target = document.getElementById(getSectionId(sectionKey));
    if (!target) return;

    setOpenSections((current) => ({
      ...current,
      [sectionKey]: true,
    }));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const treatmentHasHandInstrumentation = form.treatmentDoneToday.includes(
    HAND_POWER_INSTRUMENTATION_OPTION,
  );
  const treatmentHasAnyInstrumentation = treatmentHasHandInstrumentation;
  const nextAppointmentHasHandInstrumentation = form.nextAppointment.includes(
    HAND_POWER_INSTRUMENTATION_OPTION,
  );
  const nextAppointmentHasAnyInstrumentation = nextAppointmentHasHandInstrumentation;

  const actionButtons = (
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
  );

  const structuredSummaryPanel = (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Structured Summary</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This preview helps copy the visit into a chart note or EHR later.
            </p>
          </div>
          {isVeryShort ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl px-3 py-1.5 text-xs"
              onClick={() => setStructuredSummaryOpen((current) => !current)}
              aria-expanded={structuredSummaryOpen}
            >
              {structuredSummaryOpen ? "Collapse tags" : "Expand tags"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVeryShort ? actionButtons : null}
        {(!isVeryShort || structuredSummaryOpen) ? (
          <div
            className={cx(
              "grid gap-3",
              isVeryShort ? "grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
            )}
          >
            {selectedFindings.length ? (
              selectedFindings.map((item, index) => (
                <div
                  key={`${item.section}-${item.finding}-${index}`}
                  className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
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
                      {item.locations.length ? item.locations.join(", ") : "—"}
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
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Structured summary tags hidden.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const plainTextSummaryPanel = (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Plain-text Output</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Ready-to-copy chart note output.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          readOnly
          className={cx(
            "rounded-2xl font-mono text-sm dark:bg-slate-900",
            isVeryShort ? "min-h-[320px] xl:min-h-[420px]" : "min-h-[960px]",
          )}
          value={summaryText}
        />
      </CardContent>
    </Card>
  );

  const summaryPanel = isVeryShort ? (
    <div className="space-y-6">
      {structuredSummaryPanel}
      {plainTextSummaryPanel}
    </div>
  ) : (
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
                className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
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
                    {item.locations.length ? item.locations.join(", ") : "—"}
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
            className="min-h-[960px] rounded-2xl font-mono text-sm dark:bg-slate-900"
            value={summaryText}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div
        className={cx(
          "mx-auto space-y-6",
          isVeryShort ? "max-w-[112rem]" : "max-w-7xl",
          isVeryShort &&
            "2xl:grid 2xl:grid-cols-[minmax(0,1fr)_40rem] 2xl:items-start 2xl:gap-8 2xl:space-y-0",
        )}
      >
        <div className="min-w-0 space-y-6">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              {title}
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVeryShort ? (
              <div className="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl px-3 py-1.5 text-xs"
                    onClick={() => setAllSectionsOpen(true)}
                  >
                    Expand all sections
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl px-3 py-1.5 text-xs"
                    onClick={() => setAllSectionsOpen(false)}
                  >
                    Collapse all sections
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Quick jump</Label>
                  <div className="flex flex-wrap gap-2">
                    {VERY_SHORT_JUMP_SECTIONS.map(([sectionKey, label]) => (
                      <Button
                        key={sectionKey}
                        type="button"
                        variant="outline"
                        className="rounded-2xl px-3 py-1.5 text-xs"
                        onClick={() => jumpToSection(sectionKey)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
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

            <SectionCard
              id={getSectionId("historyAndExam")}
              title="History and Exam"
              open={!isVeryShort || openSections.historyAndExam}
              onToggle={isVeryShort ? () => toggleSection("historyAndExam") : undefined}
              contentClassName="space-y-4"
            >
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
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-xl px-3 py-2 text-xs"
                        onClick={setBloodPressureTimeToCurrent}
                      >
                        Set to now
                      </Button>
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
                </div>
            </SectionCard>

            <SectionCard
              id={getSectionId("eoeIoe")}
              title="EOE / IOE"
              open={!isVeryShort || openSections.eoeIoe}
              onToggle={isVeryShort ? () => toggleSection("eoeIoe") : undefined}
              contentClassName="space-y-6"
            >
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
                        TMJ clicking
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
                          <MultiToggle
                            label="Status"
                            options={TMJ_CLICKING_STATUS_OPTIONS}
                            selected={form.tmjClickingStatus}
                            onChange={(tmjClickingStatus) =>
                              setForm((current) => ({
                                ...current,
                                tmjClickingStatus,
                              }))
                            }
                          />
                          <MultiToggle
                            label="On open / close"
                            options={TMJ_CLICKING_OPEN_CLOSE_OPTIONS}
                            selected={form.tmjClickingPhase}
                            onChange={(tmjClickingPhase) =>
                              setForm((current) => ({
                                ...current,
                                tmjClickingPhase,
                              }))
                            }
                          />
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
                            palpableLymphNodeLaterality:
                              current.asymptomaticLymphNodes
                                ? ""
                                : current.palpableLymphNodeLaterality,
                            palpableLymphNodeLocation:
                              current.asymptomaticLymphNodes
                                ? []
                                : current.palpableLymphNodeLocation,
                            palpableLymphNodeSwelling:
                              current.asymptomaticLymphNodes
                                ? []
                                : current.palpableLymphNodeSwelling,
                          }))
                        }
                      >
                        Palpable Lymph Nodes
                      </Button>
                      {form.asymptomaticLymphNodes ? (
                        <div className="space-y-2">
                          <Label>Laterality</Label>
                          <Select
                            value={form.palpableLymphNodeLaterality}
                            onValueChange={(
                              palpableLymphNodeLaterality,
                            ) =>
                              setForm((current) => ({
                                ...current,
                                palpableLymphNodeLaterality,
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
                          <MultiToggle
                            label="Location"
                            options={LYMPH_NODE_LOCATION_OPTIONS}
                            selected={form.palpableLymphNodeLocation}
                            onChange={(palpableLymphNodeLocation) =>
                              setForm((current) => ({
                                ...current,
                                palpableLymphNodeLocation,
                              }))
                            }
                          />
                          <MultiToggle
                            label="Swelling"
                            options={LYMPH_NODE_SWELLING_OPTIONS}
                            selected={form.palpableLymphNodeSwelling}
                            onChange={(palpableLymphNodeSwelling) =>
                              setForm((current) => ({
                                ...current,
                                palpableLymphNodeSwelling,
                              }))
                            }
                          />
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
            </SectionCard>

            <SectionCard
              id={getSectionId("gingivalDescription")}
              title="Gingival Description"
              open={!isVeryShort || openSections.gingivalDescription}
              onToggle={
                isVeryShort ? () => toggleSection("gingivalDescription") : undefined
              }
              contentClassName="space-y-6"
            >
                <div className={isVeryShort ? "space-y-6" : "grid gap-6 xl:grid-cols-2"}>
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
                        <CardContent
                          className={
                            isVeryShort
                              ? "grid gap-4 lg:grid-cols-2 2xl:grid-cols-3"
                              : "space-y-4"
                          }
                        >
                          {options.map((option) => (
                            <div
                              key={option}
                              className={cx(
                                isVeryShort &&
                                  form.findings[sectionKey][option].presence &&
                                  "lg:col-span-2 2xl:col-span-3",
                              )}
                            >
                              <FindingRow
                                sectionKey={sectionKey}
                                option={option}
                                value={form.findings[sectionKey][option]}
                                onChange={(nextValue) =>
                                  setFinding(sectionKey, option, nextValue)
                                }
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
            </SectionCard>

            <SectionCard
              id={getSectionId("deposits")}
              title="Calculus and Biofilm Deposits"
              open={!isVeryShort || openSections.deposits}
              onToggle={isVeryShort ? () => toggleSection("deposits") : undefined}
              contentClassName="grid gap-4 lg:grid-cols-3"
            >
                <div className={cx(form.plaque.enabled && "lg:col-span-3")}>
                  <DepositsCard
                    title="Plaque"
                    value={form.plaque}
                    onChange={(plaque) =>
                      setForm((current) => ({ ...current, plaque }))
                    }
                    showTypeLocation
                    placeholder="Describe oral biofilm location, amount, and extent."
                  />
                </div>
                <div className={cx(form.calculus.enabled && "lg:col-span-3")}>
                  <DepositsCard
                    title="Calculus"
                    value={form.calculus}
                    onChange={(calculus) =>
                      setForm((current) => ({ ...current, calculus }))
                    }
                    showTypeLocation
                    placeholder="Describe supragingival/subgingival calculus and affected sites."
                  />
                </div>
                <div className={cx(form.extrinsicStain.enabled && "lg:col-span-3")}>
                  <DepositsCard
                    title="Extrinsic Stain"
                    value={form.extrinsicStain}
                    onChange={(extrinsicStain) =>
                      setForm((current) => ({ ...current, extrinsicStain }))
                    }
                    placeholder="Describe generalized or localized stain and specific teeth/surfaces."
                  />
                </div>
            </SectionCard>

            <SectionCard
              id={getSectionId("periodontalStatus")}
              title="Periodontal Status"
              open={!isVeryShort || openSections.periodontalStatus}
              onToggle={
                isVeryShort ? () => toggleSection("periodontalStatus") : undefined
              }
              contentClassName="space-y-4"
            >
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
                          periodontalStatusSeverityStage:
                            periodontalStatusDiseaseType === "Periodontitis"
                              ? current.periodontalStatusSeverityStage
                              : "",
                          periodontalStatusGrade:
                            periodontalStatusDiseaseType === "Periodontitis"
                              ? current.periodontalStatusGrade
                              : "",
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
                  {form.periodontalStatusDiseaseType === "Periodontitis" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Stage</Label>
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
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None selected</SelectItem>
                            {PERIODONTAL_SEVERITY_STAGE_OPTIONS.map(
                              (option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ),
                            )}
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
                    </>
                  ) : null}
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
            </SectionCard>

            <SectionCard
              id={getSectionId("cariesRisk")}
              title="Caries Risk"
              open={!isVeryShort || openSections.cariesRisk}
              onToggle={isVeryShort ? () => toggleSection("cariesRisk") : undefined}
              contentClassName="grid gap-4 md:grid-cols-2"
            >
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
            </SectionCard>

            <SectionCard
              id={getSectionId("ohe")}
              title="Oral Health Education (OHE)"
              open={!isVeryShort || openSections.ohe}
              onToggle={isVeryShort ? () => toggleSection("ohe") : undefined}
              contentClassName="space-y-4"
            >
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
            </SectionCard>

            <SectionCard
              id={getSectionId("recommendations")}
              title="Recommendations"
              open={!isVeryShort || openSections.recommendations}
              onToggle={
                isVeryShort ? () => toggleSection("recommendations") : undefined
              }
              contentClassName="space-y-4"
            >
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
            </SectionCard>

            <SectionCard
              id={getSectionId("treatmentDoneToday")}
              title="Treatment Done Today"
              open={!isVeryShort || openSections.treatmentDoneToday}
              onToggle={
                isVeryShort ? () => toggleSection("treatmentDoneToday") : undefined
              }
              contentClassName="space-y-4"
            >
                <MultiToggle
                  label="Completed today"
                  options={VISIT_CARE_OPTIONS}
                  selected={form.treatmentDoneToday}
                  showSelectAll
                  onSelectAll={() =>
                    setForm((current) => ({
                      ...current,
                      treatmentDoneToday: VISIT_CARE_SELECT_CORE_OPTIONS,
                    }))
                  }
                  onChange={(treatmentDoneToday) =>
                    setForm((current) => ({
                      ...current,
                      treatmentDoneToday,
                      treatmentDoneTodayInstrumentationDevices:
                        treatmentDoneToday.includes(
                          HAND_POWER_INSTRUMENTATION_OPTION,
                        )
                          ? current.treatmentDoneTodayInstrumentationDevices
                          : [],
                      treatmentDoneTodayInstrumentationAreas:
                        treatmentDoneToday.includes(HAND_POWER_INSTRUMENTATION_OPTION)
                          ? current.treatmentDoneTodayInstrumentationAreas
                          : [],
                    }))
                  }
                />
                {treatmentHasAnyInstrumentation ? (
                  <>
                    <MultiToggle
                      label="Power instrumentation device (today)"
                      options={INSTRUMENTATION_DEVICE_OPTIONS}
                      selected={form.treatmentDoneTodayInstrumentationDevices}
                      onChange={(treatmentDoneTodayInstrumentationDevices) =>
                        setForm((current) => ({
                          ...current,
                          treatmentDoneTodayInstrumentationDevices,
                        }))
                      }
                    />
                  </>
                ) : null}
                {treatmentHasAnyInstrumentation ? (
                  <>
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
            </SectionCard>

            <SectionCard
              id={getSectionId("nextAppointment")}
              title="Next Appointment"
              open={!isVeryShort || openSections.nextAppointment}
              onToggle={isVeryShort ? () => toggleSection("nextAppointment") : undefined}
              contentClassName="space-y-4"
            >
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
                  showSelectAll
                  onSelectAll={() =>
                    setForm((current) => ({
                      ...current,
                      nextAppointment: VISIT_CARE_SELECT_CORE_OPTIONS,
                    }))
                  }
                  onChange={(nextAppointment) =>
                    setForm((current) => ({
                      ...current,
                      nextAppointment,
                      nextAppointmentInstrumentationDevices:
                        nextAppointment.includes(
                          HAND_POWER_INSTRUMENTATION_OPTION,
                        )
                          ? current.nextAppointmentInstrumentationDevices
                          : [],
                      nextAppointmentInstrumentationAreas:
                        nextAppointment.includes(HAND_POWER_INSTRUMENTATION_OPTION)
                          ? current.nextAppointmentInstrumentationAreas
                          : [],
                    }))
                  }
                />
                {nextAppointmentHasAnyInstrumentation ? (
                  <>
                    <MultiToggle
                      label="Power instrumentation device (next appointment)"
                      options={INSTRUMENTATION_DEVICE_OPTIONS}
                      selected={form.nextAppointmentInstrumentationDevices}
                      onChange={(nextAppointmentInstrumentationDevices) =>
                        setForm((current) => ({
                          ...current,
                          nextAppointmentInstrumentationDevices,
                        }))
                      }
                    />
                  </>
                ) : null}
                {nextAppointmentHasAnyInstrumentation ? (
                  <>
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
            </SectionCard>

            <SectionCard
              id={getSectionId("localAnesthesia")}
              title="Local Anesthesia"
              open={!isVeryShort || openSections.localAnesthesia}
              onToggle={isVeryShort ? () => toggleSection("localAnesthesia") : undefined}
              contentClassName="space-y-4"
            >
                <MultiToggle
                  label="Local anesthesia toggles"
                  options={
                    form.localAnesthesiaNoContraindication
                      ? [
                          "No C/I to LA",
                          "Benzocaine 20% applied to the injection site",
                        ]
                      : ["No C/I to LA"]
                  }
                  selected={[
                    form.localAnesthesiaNoContraindication ? "No C/I to LA" : "",
                    form.localAnesthesiaBenzocaineApplied
                      ? "Benzocaine 20% applied to the injection site"
                      : "",
                  ].filter(Boolean)}
                  onChange={(selected) => {
                    const hasNoContraindication = selected.includes("No C/I to LA");

                    setForm((current) => ({
                      ...current,
                      localAnesthesiaNoContraindication: hasNoContraindication,
                      localAnesthesiaBenzocaineApplied: hasNoContraindication
                        ? selected.includes(
                            "Benzocaine 20% applied to the injection site",
                          )
                        : false,
                      localAnesthesiaNoAdverseReactions: hasNoContraindication
                        ? current.localAnesthesiaNoAdverseReactions
                        : false,
                      localAnesthesiaAdequateAchieved: hasNoContraindication
                        ? current.localAnesthesiaAdequateAchieved
                        : false,
                      localAnesthesiaEntries: hasNoContraindication
                        ? current.localAnesthesiaEntries
                        : [],
                      localAnesthesiaNotes: hasNoContraindication
                        ? current.localAnesthesiaNotes
                        : "",
                    }));
                  }}
                />

                {form.localAnesthesiaNoContraindication ? (
                  <div className="space-y-3">
                    <Label className="block">Injection entries</Label>
                    {form.localAnesthesiaEntries.map((entry, index) => (
                      <Card key={`la-${index}`} className="rounded-2xl border-dashed p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <Label>Injection entry #{index + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl px-3 py-1.5 text-xs"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                localAnesthesiaEntries: current.localAnesthesiaEntries.filter(
                                  (_, entryIndex) => entryIndex !== index,
                                ),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Injection type</Label>
                            <Select
                              value={entry.injectionType}
                              onValueChange={(injectionType) =>
                                setForm((current) => ({
                                  ...current,
                                  localAnesthesiaEntries: current.localAnesthesiaEntries.map(
                                    (row, rowIndex) =>
                                      rowIndex === index ? { ...row, injectionType } : row,
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select injection type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None selected</SelectItem>
                                {LOCAL_ANESTHESIA_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Quadrant</Label>
                            <Select
                              value={entry.quadrant}
                              onValueChange={(quadrant) =>
                                setForm((current) => ({
                                  ...current,
                                  localAnesthesiaEntries: current.localAnesthesiaEntries.map(
                                    (row, rowIndex) =>
                                      rowIndex === index ? { ...row, quadrant } : row,
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select quadrant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None selected</SelectItem>
                                {QUADRANT_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Anesthetic product</Label>
                            <Select
                              value={entry.anestheticProduct}
                              onValueChange={(anestheticProduct) =>
                                setForm((current) => ({
                                  ...current,
                                  localAnesthesiaEntries: current.localAnesthesiaEntries.map(
                                    (row, rowIndex) =>
                                      rowIndex === index
                                        ? { ...row, anestheticProduct }
                                        : row,
                                  ),
                                }))
                              }
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select anesthetic product" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None selected</SelectItem>
                                {LOCAL_ANESTHETIC_PRODUCT_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Amount (ml)</Label>
                            <Input
                              value={entry.amountMl}
                              onChange={(e) =>
                                setForm((current) => ({
                                  ...current,
                                  localAnesthesiaEntries: current.localAnesthesiaEntries.map(
                                    (row, rowIndex) =>
                                      rowIndex === index ? { ...row, amountMl: e.target.value } : row,
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time administered</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="shrink-0 rounded-xl px-3 py-2 text-xs"
                                onClick={() => setLocalAnesthesiaEntryTimeToCurrent(index)}
                              >
                                Set to now
                              </Button>
                              <Input
                                type="time"
                                value={entry.timeAdministered}
                                onChange={(e) =>
                                  setForm((current) => ({
                                    ...current,
                                    localAnesthesiaEntries: current.localAnesthesiaEntries.map(
                                      (row, rowIndex) =>
                                        rowIndex === index
                                          ? { ...row, timeAdministered: e.target.value }
                                          : row,
                                    ),
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          localAnesthesiaEntries: [
                            ...current.localAnesthesiaEntries,
                            emptyLocalAnesthesiaEntry(),
                          ],
                        }))
                      }
                    >
                      Add injection entry
                    </Button>

                    <div className="space-y-4">
                      <MultiToggle
                        label="Anesthesia assessment"
                        options={[
                          "No adverse reactions noted",
                          "Adequate anesthesia achieved",
                        ]}
                        selected={[
                          form.localAnesthesiaNoAdverseReactions
                            ? "No adverse reactions noted"
                            : "",
                          form.localAnesthesiaAdequateAchieved
                            ? "Adequate anesthesia achieved"
                            : "",
                        ].filter(Boolean)}
                        onChange={(selected) =>
                          setForm((current) => ({
                            ...current,
                            localAnesthesiaNoAdverseReactions: selected.includes(
                              "No adverse reactions noted",
                            ),
                            localAnesthesiaAdequateAchieved: selected.includes(
                              "Adequate anesthesia achieved",
                            ),
                          }))
                        }
                      />
                      <SectionTextarea
                        id="local-anesthesia-notes"
                        label="Anesthesia notes"
                        placeholder="Add anesthesia assessment notes."
                        value={form.localAnesthesiaNotes}
                        onChange={(localAnesthesiaNotes) =>
                          setForm((current) => ({
                            ...current,
                            localAnesthesiaNotes,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : null}
            </SectionCard>

            <SectionCard
              id={getSectionId("disposition")}
              title="Disposition"
              open={!isVeryShort || openSections.disposition}
              onToggle={isVeryShort ? () => toggleSection("disposition") : undefined}
              contentClassName="space-y-2"
            >
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
            </SectionCard>

            <SectionCard
              id={getSectionId("additionalClinicalDocumentation")}
              title="Additional Clinical Documentation"
              open={!isVeryShort || openSections.additionalClinicalDocumentation}
              onToggle={
                isVeryShort
                  ? () => toggleSection("additionalClinicalDocumentation")
                  : undefined
              }
            >
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
            </SectionCard>

            {!isVeryShort ? actionButtons : null}
          </CardContent>
        </Card>
        </div>
        {isVeryShort ? (
          <div className="space-y-6 2xl:sticky 2xl:top-6">{summaryPanel}</div>
        ) : (
          summaryPanel
        )}
      </div>
    </div>
  );
}
