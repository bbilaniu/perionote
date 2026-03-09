import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

const AMOUNT_OPTIONS = ["None", "Light", "Moderate", "Heavy"];
const EXTENT_OPTIONS = ["Generalized", "Localized"];
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
const RECALL_OPTIONS = ["3 months", "4 months", "6 months", "Other"];
const TREATMENT_OPTIONS = [
  "Radiographs",
  "Periodontal assessment",
  "Sealants",
  "Hand scaling",
  "Ultrasonic instrumentation",
  "Doctor exam",
  "Prophy",
  "Periodontal maintenance",
  "NSPT / SRP",
  "Gingivitis treatment",
  "Fluoride treatment",
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
    ])
  );
}

function prettyLabel(key) {
  return SECTION_LABELS[key] ?? key;
}

function buildInitialForm() {
  return {
    date: "",
    patientConcerns: "",
    medicalHistory: "Patient reports no changes",
    eoe: "",
    ioe: "",
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
    treatmentRendered: [],
    treatmentRenderedNotes: "",
    periodontalStatusStage: "",
    periodontalStatusGrade: "",
    recessionPresent: false,
    furcationPresent: false,
    dueTo: "",
    otherClinicalFindings: "",
    oralHealthInstruction: "",
    hygieneDentalExam: "",
    nextAppointmentNeeds: "",
    recallFrequency: "6 months",
    dentalHygieneDiagnosis: "",
  };
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

  const clean = (value) => String(value ?? "").trim().replace(/[\s\n]+/g, " ");
  const cleanSentence = (value) => clean(value).replace(/[.]+$/g, "");
  const addHeadingBlock = (heading, items) => {
    const cleanedItems = items.filter(Boolean);
    if (!cleanedItems.length) return;
    lines.push(`${heading}:`);
    cleanedItems.forEach((item) => lines.push(`  ${item}`));
  };

  addHeadingBlock("Visit Details", form.date ? [`Date: ${form.date}`] : []);

  addHeadingBlock("History and Exam", [
    form.patientConcerns.trim() ? `Patient concerns: ${cleanSentence(form.patientConcerns)}.` : "",
    form.medicalHistory.trim() ? `Medical history: ${cleanSentence(form.medicalHistory)}.` : "",
    form.eoe.trim() ? `EOE: ${cleanSentence(form.eoe)}.` : "",
    form.ioe.trim() ? `IOE: ${cleanSentence(form.ioe)}.` : "",
  ]);

  addHeadingBlock(
    "Gingival Description",
    selectedFindings.map((item) => {
      const detailParts = [item.extent === "generalized" ? "generalized" : "localized"];
      if (item.toothNumbers.trim()) detailParts.push(`teeth ${clean(item.toothNumbers)}`);
      if (item.locations.length) detailParts.push(`location ${item.locations.join(", ")}`);
      if (item.distributions.length) detailParts.push(`distribution ${item.distributions.join(", ")}`);
      if (item.notes.trim()) detailParts.push(cleanSentence(item.notes));
      return `${item.section}: ${item.finding} (${detailParts.join("; ")}).`;
    })
  );

  addHeadingBlock("Deposits and Inflammation", [
    `Plaque: ${form.plaque.amount.toLowerCase()} / ${form.plaque.extent.toLowerCase()}${
      form.plaque.locations.length ? ` / ${form.plaque.locations.join(", ")}` : ""
    }${form.plaque.details.trim() ? ` / ${cleanSentence(form.plaque.details)}` : ""}.`,
    `Calculus: ${form.calculus.amount.toLowerCase()} / ${form.calculus.extent.toLowerCase()}${
      form.calculus.locations.length ? ` / ${form.calculus.locations.join(", ")}` : ""
    }${form.calculus.details.trim() ? ` / ${cleanSentence(form.calculus.details)}` : ""}.`,
    `Extrinsic stain: ${form.extrinsicStain.amount.toLowerCase()} / ${form.extrinsicStain.extent.toLowerCase()}${
      form.extrinsicStain.details.trim() ? ` / ${cleanSentence(form.extrinsicStain.details)}` : ""
    }.`,
    `Bleeding and inflammation: ${form.bleedingInflammation.amount.toLowerCase()} / ${form.bleedingInflammation.extent.toLowerCase()}${
      form.bleedingInflammation.details.trim() ? ` / ${cleanSentence(form.bleedingInflammation.details)}` : ""
    }.`,
  ]);

  addHeadingBlock(
    "Treatment Rendered",
    form.treatmentRendered.length || form.treatmentRenderedNotes.trim()
      ? [
          `Completed: ${[
            form.treatmentRendered.join(", "),
            form.treatmentRenderedNotes.trim() ? cleanSentence(form.treatmentRenderedNotes) : "",
          ]
            .filter(Boolean)
            .join(". ")}.`,
        ]
      : []
  );

  const perioBits = [
    form.periodontalStatusStage ? `Stage ${form.periodontalStatusStage}` : "",
    form.periodontalStatusGrade ? `Grade ${form.periodontalStatusGrade}` : "",
    form.recessionPresent ? "Recession present" : "",
    form.furcationPresent ? "Furcation present" : "",
  ].filter(Boolean);

  addHeadingBlock("Periodontal Status", [
    perioBits.length ? `Status: ${perioBits.join(", ")}.` : "",
    form.dueTo.trim() ? `Due to: ${cleanSentence(form.dueTo)}.` : "",
  ]);

  addHeadingBlock("Additional Clinical Documentation", [
    form.otherClinicalFindings.trim()
      ? `Other clinical findings: ${cleanSentence(form.otherClinicalFindings)}.`
      : "",
    form.oralHealthInstruction.trim()
      ? `Oral health instruction and recommendations: ${cleanSentence(form.oralHealthInstruction)}.`
      : "",
    form.hygieneDentalExam.trim() ? `Hygiene dental exam: ${cleanSentence(form.hygieneDentalExam)}.` : "",
  ]);

  addHeadingBlock("Next Appointment", [
    form.nextAppointmentNeeds.trim() ? `Planned care: ${cleanSentence(form.nextAppointmentNeeds)}.` : "",
    form.recallFrequency ? `Recall frequency: ${form.recallFrequency}.` : "",
  ]);

  addHeadingBlock(
    "Dental Hygiene Diagnosis",
    form.dentalHygieneDiagnosis.trim()
      ? [`Diagnosis: ${cleanSentence(form.dentalHygieneDiagnosis)}.`]
      : []
  );

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
    name: "renders next appointment as segmented block instead of wall of text",
    input: (() => {
      const form = buildInitialForm();
      form.nextAppointmentNeeds = "4 bitewings and re-evaluation";
      form.recallFrequency = "4 months";
      return { form, selectedFindings: [] };
    })(),
    expectedIncludes: [
      "Next Appointment:\n  Planned care: 4 bitewings and re-evaluation.\n  Recall frequency: 4 months.",
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
    <div className="space-y-4 rounded-2xl border p-4 shadow-sm">
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
            <Label htmlFor={`${sectionKey}-${option}`} className="cursor-pointer text-base font-semibold">
              {option}
            </Label>
            <p className="text-sm text-muted-foreground">
              Mark this finding, then capture extent, tooth number, location, and distribution.
            </p>
          </div>
        </div>
        {checked ? <Badge className="rounded-xl">Selected</Badge> : null}
      </div>

      {checked ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Extent</Label>
            <Select value={value.extent} onValueChange={(next) => update({ extent: next })}>
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

function DepositsCard({ title, value, onChange, showTypeLocation = false, placeholder }) {
  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <Card className="rounded-3xl border-dashed">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Select value={value.amount} onValueChange={(amount) => update({ amount })}>
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

          <div className="space-y-2">
            <Label>Extent</Label>
            <Select value={value.extent} onValueChange={(extent) => update({ extent })}>
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
        </div>

        {showTypeLocation ? (
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

export default function GingivalDescriptionFormTemplate() {
  const [form, setForm] = useState(buildInitialForm());

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

  const selectedFindings = useMemo(() => collectSelectedFindings(form.findings), [form.findings]);
  const summaryText = useMemo(() => buildSummaryText(form, selectedFindings), [form, selectedFindings]);

  const resetForm = () => {
    setForm(buildInitialForm());
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Dental Hygiene Note Webform Template</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Expanded from the original gingival description form into a fuller hygiene-note template with chart-ready structured output.
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
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">History and Exam</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <SectionTextarea
                  id="patient-concerns"
                  label="Patient concerns"
                  placeholder="Document the chief complaint or concerns in the patient’s own words."
                  value={form.patientConcerns}
                  onChange={(patientConcerns) => setForm((current) => ({ ...current, patientConcerns }))}
                />
                <SectionTextarea
                  id="medical-history"
                  label="Medical history"
                  placeholder="Review and update medications, allergies, surgeries, conditions, or note no changes."
                  value={form.medicalHistory}
                  onChange={(medicalHistory) => setForm((current) => ({ ...current, medicalHistory }))}
                />
                <SectionTextarea
                  id="eoe"
                  label="EOE"
                  placeholder="Describe extraoral findings."
                  value={form.eoe}
                  onChange={(eoe) => setForm((current) => ({ ...current, eoe }))}
                />
                <SectionTextarea
                  id="ioe"
                  label="IOE"
                  placeholder="Describe intraoral findings."
                  value={form.ioe}
                  onChange={(ioe) => setForm((current) => ({ ...current, ioe }))}
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Gingival Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  {Object.entries(FIELD_OPTIONS).map(([sectionKey, options]) => (
                    <Card key={sectionKey} className="rounded-3xl border-dashed">
                      <CardHeader>
                        <CardTitle className="text-lg">{prettyLabel(sectionKey)}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {options.map((option) => (
                          <FindingRow
                            key={option}
                            sectionKey={sectionKey}
                            option={option}
                            value={form.findings[sectionKey][option]}
                            onChange={(nextValue) => setFinding(sectionKey, option, nextValue)}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Calculus and Biofilm Deposits</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-2">
                <DepositsCard
                  title="Plaque"
                  value={form.plaque}
                  onChange={(plaque) => setForm((current) => ({ ...current, plaque }))}
                  showTypeLocation
                  placeholder="Describe oral biofilm location, amount, and extent."
                />
                <DepositsCard
                  title="Calculus"
                  value={form.calculus}
                  onChange={(calculus) => setForm((current) => ({ ...current, calculus }))}
                  showTypeLocation
                  placeholder="Describe supragingival/subgingival calculus and affected sites."
                />
                <DepositsCard
                  title="Extrinsic Stain"
                  value={form.extrinsicStain}
                  onChange={(extrinsicStain) => setForm((current) => ({ ...current, extrinsicStain }))}
                  placeholder="Describe generalized or localized stain and specific teeth/surfaces."
                />
                <DepositsCard
                  title="Bleeding and Inflammation"
                  value={form.bleedingInflammation}
                  onChange={(bleedingInflammation) => setForm((current) => ({ ...current, bleedingInflammation }))}
                  placeholder="Note amount, generalized vs localized, and any distribution details."
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Treatment Rendered During Current Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiToggle
                  label="Treatment rendered"
                  options={TREATMENT_OPTIONS}
                  selected={form.treatmentRendered}
                  onChange={(treatmentRendered) => setForm((current) => ({ ...current, treatmentRendered }))}
                />
                <SectionTextarea
                  id="treatment-rendered-notes"
                  label="Treatment notes"
                  placeholder="Include radiographs, changes in probe depths or recession, restorative recommendations, and completed treatment."
                  value={form.treatmentRenderedNotes}
                  onChange={(treatmentRenderedNotes) => setForm((current) => ({ ...current, treatmentRenderedNotes }))}
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
                    <Label>Stage</Label>
                    <Input
                      className="rounded-xl"
                      placeholder="e.g. I, II, III, IV"
                      value={form.periodontalStatusStage}
                      onChange={(e) => setForm((current) => ({ ...current, periodontalStatusStage: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Input
                      className="rounded-xl"
                      placeholder="e.g. A, B, C"
                      value={form.periodontalStatusGrade}
                      onChange={(e) => setForm((current) => ({ ...current, periodontalStatusGrade: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="recession-present"
                      checked={form.recessionPresent}
                      onCheckedChange={(next) =>
                        setForm((current) => ({ ...current, recessionPresent: Boolean(next) }))
                      }
                    />
                    <Label htmlFor="recession-present">Recession present</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="furcation-present"
                      checked={form.furcationPresent}
                      onCheckedChange={(next) =>
                        setForm((current) => ({ ...current, furcationPresent: Boolean(next) }))
                      }
                    />
                    <Label htmlFor="furcation-present">Furcation involvement present</Label>
                  </div>
                </div>
                <SectionTextarea
                  id="due-to"
                  label="Due to"
                  placeholder="Document contributing factors or rationale."
                  value={form.dueTo}
                  onChange={(dueTo) => setForm((current) => ({ ...current, dueTo }))}
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Additional Clinical Documentation</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <SectionTextarea
                  id="other-clinical-findings"
                  label="Other clinical findings"
                  placeholder="Attrition, abfractions, chipped teeth, failing restorations, etc."
                  value={form.otherClinicalFindings}
                  onChange={(otherClinicalFindings) =>
                    setForm((current) => ({ ...current, otherClinicalFindings }))
                  }
                />
                <SectionTextarea
                  id="oral-health-instruction"
                  label="Oral health instruction and recommendations"
                  placeholder="OHI, home-care aids, technique changes, dental treatment recommendations, recall guidance, etc."
                  value={form.oralHealthInstruction}
                  onChange={(oralHealthInstruction) =>
                    setForm((current) => ({ ...current, oralHealthInstruction }))
                  }
                />
                <SectionTextarea
                  id="hygiene-dental-exam"
                  label="Hygiene dental exam"
                  placeholder="Diagnosed dental caries, restorative work recommended, referrals, etc."
                  value={form.hygieneDentalExam}
                  onChange={(hygieneDentalExam) =>
                    setForm((current) => ({ ...current, hygieneDentalExam }))
                  }
                />
                <div className="space-y-4">
                  <SectionTextarea
                    id="next-appointment"
                    label="Next appointment"
                    placeholder="Radiographs, sealants, re-evaluation, follow-up concerns, etc."
                    value={form.nextAppointmentNeeds}
                    onChange={(nextAppointmentNeeds) =>
                      setForm((current) => ({ ...current, nextAppointmentNeeds }))
                    }
                  />
                  <div className="space-y-2">
                    <Label>Recall frequency</Label>
                    <Select
                      value={form.recallFrequency}
                      onValueChange={(recallFrequency) =>
                        setForm((current) => ({ ...current, recallFrequency }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select recall frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECALL_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl">Dental Hygiene Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[120px] rounded-2xl"
                  placeholder="Enter the dental hygiene diagnosis"
                  value={form.dentalHygieneDiagnosis}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      dentalHygieneDiagnosis: e.target.value,
                    }))
                  }
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-2xl" onClick={resetForm} variant="outline">
                Reset form
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Structured Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              This preview helps copy the visit into a chart note or EHR later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedFindings.length ? (
                selectedFindings.map((item, index) => (
                  <div
                    key={`${item.section}-${item.finding}-${index}`}
                    className="space-y-2 rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="rounded-xl">
                        {item.section}
                      </Badge>
                      <Badge className="rounded-xl">{item.extent === "generalized" ? "GEN" : "LOC"}</Badge>
                    </div>
                    <div className="font-semibold">{item.finding}</div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Teeth: {item.toothNumbers || "—"}</p>
                      <p>Location: {item.locations.length ? item.locations.join(", ") : "—"}</p>
                      <p>Distribution: {item.distributions.length ? item.distributions.join(", ") : "—"}</p>
                      {item.notes ? <p>Notes: {item.notes}</p> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No gingival findings selected yet.</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plain-text output</Label>
              <Textarea readOnly className="min-h-[300px] rounded-2xl font-mono text-sm" value={summaryText} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
