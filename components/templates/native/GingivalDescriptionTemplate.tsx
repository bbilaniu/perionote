"use client";

import { useMemo, useState } from "react";
import type { GingivalDescriptionFixture } from "@/lib/templates/fixtures/gingivalDescription.fixture";
import { buildGingivalDescriptionSummary } from "@/lib/templates/summary/buildGingivalDescriptionSummary";
import { getTodayDateString } from "@/lib/templates/date";

interface GingivalDescriptionFormState {
  visitDate: string;
  patientConcerns: string;
  color: string;
  distribution: string;
  severity: string;
  location: string;
  teethText: string;
  plannedCare: string;
  recallFrequency: string;
}

function buildInitialForm(fixture?: GingivalDescriptionFixture): GingivalDescriptionFormState {
  if (!fixture) {
    return {
      visitDate: getTodayDateString(),
      patientConcerns: "",
      color: "",
      distribution: "",
      severity: "",
      location: "",
      teethText: "",
      plannedCare: "",
      recallFrequency: ""
    };
  }

  return {
    visitDate: fixture.visitDate || getTodayDateString(),
    patientConcerns: fixture.patientConcerns,
    color: fixture.color,
    distribution: fixture.distribution,
    severity: fixture.severity,
    location: fixture.location,
    teethText: fixture.teeth.join(", "),
    plannedCare: fixture.plannedCare,
    recallFrequency: fixture.recallFrequency
  };
}

function formToFixture(form: GingivalDescriptionFormState): GingivalDescriptionFixture {
  const teeth = form.teethText
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    visitDate: form.visitDate,
    patientConcerns: form.patientConcerns,
    color: form.color,
    distribution: form.distribution,
    severity: form.severity,
    location: form.location,
    teeth,
    plannedCare: form.plannedCare,
    recallFrequency: form.recallFrequency
  };
}

export function GingivalDescriptionTemplate({
  fixture,
  summary
}: {
  fixture: GingivalDescriptionFixture;
  summary: string;
}) {
  const [form, setForm] = useState<GingivalDescriptionFormState>(() => buildInitialForm());

  const loadDemo = () => {
    setForm(buildInitialForm(fixture));
  };

  const resetForm = () => {
    setForm(buildInitialForm());
  };

  const hasAnyInput = useMemo(() => {
    return [
      form.visitDate,
      form.patientConcerns,
      form.color,
      form.distribution,
      form.severity,
      form.location,
      form.teethText,
      form.plannedCare,
      form.recallFrequency
    ].some((value) => value.trim().length > 0);
  }, [form]);

  const summaryText = useMemo(() => {
    if (!hasAnyInput) {
      return "No summary yet. Fill in the template or click Load demo.";
    }

    return buildGingivalDescriptionSummary(formToFixture(form));
  }, [form, hasAnyInput]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Gingival Description</h1>
            <p className="mt-2 text-sm text-slate-600">
              Native interactive form for documenting gingival findings and generating a segmented clinical summary.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="visit-date" className="text-sm font-medium text-slate-800">
                Visit Date
              </label>
              <input
                id="visit-date"
                type="date"
                value={form.visitDate}
                onChange={(event) => setForm((current) => ({ ...current, visitDate: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="recall-frequency" className="text-sm font-medium text-slate-800">
                Recall Frequency
              </label>
              <input
                id="recall-frequency"
                value={form.recallFrequency}
                onChange={(event) => setForm((current) => ({ ...current, recallFrequency: event.target.value }))}
                placeholder="e.g. 4 months"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="patient-concerns" className="text-sm font-medium text-slate-800">
                Patient Concerns
              </label>
              <textarea
                id="patient-concerns"
                value={form.patientConcerns}
                onChange={(event) => setForm((current) => ({ ...current, patientConcerns: event.target.value }))}
                placeholder="Document the patient concerns."
                className="min-h-[100px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="color" className="text-sm font-medium text-slate-800">
                Color
              </label>
              <input
                id="color"
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                placeholder="e.g. Pink"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="distribution" className="text-sm font-medium text-slate-800">
                Distribution
              </label>
              <input
                id="distribution"
                value={form.distribution}
                onChange={(event) => setForm((current) => ({ ...current, distribution: event.target.value }))}
                placeholder="e.g. Generalized"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="severity" className="text-sm font-medium text-slate-800">
                Severity
              </label>
              <input
                id="severity"
                value={form.severity}
                onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}
                placeholder="e.g. Mild"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium text-slate-800">
                Location
              </label>
              <input
                id="location"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="e.g. Facial marginal"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="teeth" className="text-sm font-medium text-slate-800">
                Teeth
              </label>
              <input
                id="teeth"
                value={form.teethText}
                onChange={(event) => setForm((current) => ({ ...current, teethText: event.target.value }))}
                placeholder="e.g. #5, #8, #11, #30"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="planned-care" className="text-sm font-medium text-slate-800">
                Planned Care
              </label>
              <textarea
                id="planned-care"
                value={form.plannedCare}
                onChange={(event) => setForm((current) => ({ ...current, plannedCare: event.target.value }))}
                placeholder="Document next planned care."
                className="min-h-[90px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDemo}
              className="rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Load demo
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Reset form
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-semibold tracking-tight">Structured Summary</h2>
          <p className="mt-2 text-sm text-slate-600">Live generated from the form data.</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900">
            {summaryText || summary}
          </pre>
        </section>
      </div>
    </div>
  );
}
