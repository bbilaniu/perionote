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

function prettyLabel(key) {
  return SECTION_LABELS[key] ?? key;
}

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
    <div className="rounded-2xl border p-4 shadow-sm space-y-4">
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
            <Label htmlFor={`${sectionKey}-${option}`} className="text-base font-semibold cursor-pointer">
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

          <div className="md:col-span-2 space-y-2">
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

function buildInitialFindings() {
  return Object.fromEntries(
    Object.entries(FIELD_OPTIONS).map(([sectionKey, options]) => [
      sectionKey,
      Object.fromEntries(options.map((option) => [option, emptyAnnotation()])),
    ])
  );
}

export default function GingivalDescriptionFormTemplate() {
  const [form, setForm] = useState({
    date: "",
    dentalHygieneDiagnosis: "",
    findings: buildInitialFindings(),
  });

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

  const selectedFindings = useMemo(() => {
    const entries = [];

    Object.entries(form.findings).forEach(([sectionKey, sectionValues]) => {
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
  }, [form.findings]);

  const summaryText = useMemo(() => {
    const lines = [];

    if (form.date) {
      lines.push(`Date: ${form.date}`);
    }

    selectedFindings.forEach((item) => {
      const parts = [
        `${item.section} - ${item.finding}`,
        item.extent === "generalized" ? "GEN" : "LOC",
      ];

      if (item.toothNumbers.trim()) parts.push(`Teeth: ${item.toothNumbers.trim()}`);
      if (item.locations.length) parts.push(`Location: ${item.locations.join(", ")}`);
      if (item.distributions.length) parts.push(`Distribution: ${item.distributions.join(", ")}`);
      if (item.notes.trim()) parts.push(`Notes: ${item.notes.trim()}`);

      lines.push(parts.join(" | "));
    });

    if (form.dentalHygieneDiagnosis.trim()) {
      lines.push(`Dental Hygiene Diagnosis: ${form.dentalHygieneDiagnosis.trim()}`);
    }

    return lines.join("\n");
  }, [form.date, form.dentalHygieneDiagnosis, selectedFindings]);

  const resetForm = () => {
    setForm({
      date: "",
      dentalHygieneDiagnosis: "",
      findings: buildInitialFindings(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Gingival Description Webform Template</CardTitle>
            <p className="text-sm text-muted-foreground leading-6">
              Based on your paper form: select each gingival characteristic, then capture whether it is generalized or localized,
              plus tooth number, location, and distribution.
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

            <div className="grid gap-6 xl:grid-cols-2">
              {Object.entries(FIELD_OPTIONS).map(([sectionKey, options]) => (
                <Card key={sectionKey} className="rounded-3xl border-dashed">
                  <CardHeader>
                    <CardTitle className="text-xl">{prettyLabel(sectionKey)}</CardTitle>
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
              This preview makes it easier to copy the findings into a chart note or EHR later.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedFindings.length ? (
                selectedFindings.map((item, index) => (
                  <div key={`${item.section}-${item.finding}-${index}`} className="rounded-2xl border p-4 shadow-sm space-y-2 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="rounded-xl">
                        {item.section}
                      </Badge>
                      <Badge className="rounded-xl">{item.extent === "generalized" ? "GEN" : "LOC"}</Badge>
                    </div>
                    <div className="font-semibold">{item.finding}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Teeth: {item.toothNumbers || "—"}</p>
                      <p>Location: {item.locations.length ? item.locations.join(", ") : "—"}</p>
                      <p>Distribution: {item.distributions.length ? item.distributions.join(", ") : "—"}</p>
                      {item.notes ? <p>Notes: {item.notes}</p> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No findings selected yet.</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Plain-text output</Label>
              <Textarea readOnly className="min-h-[220px] rounded-2xl font-mono text-sm" value={summaryText} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
