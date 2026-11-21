import { describe, expect, it } from "vitest";
import { isAdultHygieneDraftForm } from "@/components/templates/native/AdultHygiene2026Template";
import { createEmptyAdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";
import {
  createEmptyVitalsReading,
  createNextVitalsReading,
  formatVitalsReading,
  type VitalsReading,
} from "@/lib/templates/vitalsReadings";

const legacyReading: VitalsReading = {
  systolic: "131", diastolic: "84", heartRate: "66", time: "15:35",
};
const baseOutput = "BP: 131/84 mmHg, HR: 66 bpm (at 15:35)";

describe("BP reading location", () => {
  it.each([
    ["right", "wrist", "on the right wrist (R)"],
    ["left", "wrist", "on the left wrist (L)"],
    ["right", "upper-arm", "on the right upper arm (R)"],
    ["left", "upper-arm", "on the left upper arm (L)"],
    ["right", "", "on the right arm (R)"],
    ["", "upper-arm", "at the upper arm"],
    ["", "wrist", "at the wrist"],
  ] as const)("formats %s / %s without artery names", (arm, site, location) => {
    expect(formatVitalsReading({ ...legacyReading, arm, site }))
      .toBe(`${baseOutput} - BP taken ${location}`);
  });

  it("preserves legacy output and supports readings without a time", () => {
    expect(formatVitalsReading(legacyReading)).toBe(baseOutput);
    expect(formatVitalsReading({ ...legacyReading, arm: "", site: "" })).toBe(baseOutput);
    expect(formatVitalsReading({ ...legacyReading, time: "", site: "wrist" }))
      .toBe("BP: 131/84 mmHg, HR: 66 bpm - BP taken at the wrist");
  });

  it("never emits a location for empty, HR-only, or incomplete BP readings", () => {
    const location = { arm: "right", site: "wrist" } as const;
    expect(formatVitalsReading({ ...createEmptyVitalsReading(), ...location })).toBe("");
    for (const systolic of ["", "invalid"]) {
      expect(formatVitalsReading({ ...legacyReading, systolic, ...location }))
        .toBe("HR: 66 bpm (at 15:35)");
    }
    expect(formatVitalsReading({ ...legacyReading, diastolic: "", ...location }))
      .toBe("HR: 66 bpm (at 15:35)");
  });

  it("inherits only location from the latest completed BP reading", () => {
    const first = { ...legacyReading, arm: "right", site: "wrist" } as const;
    const second = { ...legacyReading, arm: "left", site: "upper-arm" } as const;
    const readings = [first, second,
      { ...createEmptyVitalsReading(), heartRate: "70", arm: "right" as const },
      { ...createEmptyVitalsReading(), systolic: "120", site: "wrist" as const },
    ];
    const next = createNextVitalsReading(readings);
    expect(next).toMatchObject({
      systolic: "", diastolic: "", heartRate: "", arm: "left", site: "upper-arm",
    });
    expect(next.time).toMatch(/^\d{2}:\d{2}$/);
    next.arm = "right";
    expect(second.arm).toBe("left");
    expect(first.site).toBe("wrist");
  });

  it("starts blank for a new encounter and respects cleared or partial locations", () => {
    expect(createNextVitalsReading(createEmptyAdultHygiene2026Form().vitalsReadings))
      .toMatchObject({ arm: "", site: "" });
    const previous = { ...legacyReading, arm: "right", site: "wrist" } as const;
    expect(createNextVitalsReading([previous, { ...legacyReading, arm: "", site: "" }]))
      .toMatchObject({ arm: "", site: "" });
    expect(createNextVitalsReading([previous, { ...legacyReading, arm: "left", site: "" }]))
      .toMatchObject({ arm: "left", site: "" });
    expect(createNextVitalsReading([previous, legacyReading]))
      .toMatchObject({ arm: "", site: "" });
    expect(createNextVitalsReading([{ ...createEmptyVitalsReading(), arm: "right", site: "wrist" }]))
      .toMatchObject({ arm: "", site: "" });
  });

  it("includes individual locations without assigning one to the average", () => {
    const summary = buildAdultHygiene2026Summary({
      ...createEmptyAdultHygiene2026Form(),
      vitalsReadings: [
        { ...legacyReading, arm: "right", site: "wrist" },
        { ...legacyReading, arm: "left", site: "upper-arm" },
      ],
    });
    expect(summary).toContain(`Vitals reading 1: ${baseOutput} - BP taken on the right wrist (R)`);
    expect(summary).toContain(`Vitals reading 2: ${baseOutput} - BP taken on the left upper arm (L)`);
    expect(summary.split("\n").find((line) => line.includes("Average BP:"))?.trim())
      .toBe("Average BP: 131/84 mmHg, HR: 66 bpm");
  });

  it("accepts old and new drafts and rejects malformed location values", () => {
    const form = createEmptyAdultHygiene2026Form();
    for (const reading of [legacyReading, { ...legacyReading, arm: "left", site: "wrist" }]) {
      expect(isAdultHygieneDraftForm({ ...form, vitalsReadings: [reading] })).toBe(true);
    }
    for (const invalid of [{ arm: "both" }, { site: "forearm" }, { arm: null }, { site: {} }]) {
      expect(isAdultHygieneDraftForm({ ...form, vitalsReadings: [{ ...legacyReading, ...invalid }] }))
        .toBe(false);
    }
  });
});
