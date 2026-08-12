import {
  formatLocalTime24,
  formatTime24Value,
} from "@/lib/templates/date";

export interface VitalsReading {
  systolic: string;
  diastolic: string;
  heartRate: string;
  time: string;
}

export function getCurrentVitalsTime(date = new Date()): string {
  return formatLocalTime24(date);
}

export function createEmptyVitalsReading(
  prefillTime = false,
): VitalsReading {
  return {
    systolic: "",
    diastolic: "",
    heartRate: "",
    time: prefillTime ? getCurrentVitalsTime() : "",
  };
}

function parseNumeric(value: string): number | null {
  const normalized = value.trim();
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function hasVitalsMeasurement(reading: VitalsReading): boolean {
  return Boolean(
    reading.systolic.trim() ||
      reading.diastolic.trim() ||
      reading.heartRate.trim(),
  );
}

export function hasValidVitalsMeasurement(reading: VitalsReading): boolean {
  return (
    parseNumeric(reading.systolic) != null ||
    parseNumeric(reading.diastolic) != null ||
    parseNumeric(reading.heartRate) != null
  );
}

export function formatVitalsReading(reading: VitalsReading): string {
  const systolic = parseNumeric(reading.systolic);
  const diastolic = parseNumeric(reading.diastolic);
  const heartRate = parseNumeric(reading.heartRate);
  const segments: string[] = [];

  if (systolic != null && diastolic != null) {
    segments.push(
      `BP: ${formatNumber(systolic)}/${formatNumber(diastolic)} mmHg`,
    );
  }
  if (heartRate != null) {
    segments.push(`HR: ${formatNumber(heartRate)} bpm`);
  }
  if (!segments.length) return "";

  const vitals = segments.join(", ");
  const time = formatTime24Value(reading.time);
  return time ? `${vitals} (at ${time})` : vitals;
}

export function formatAverageVitalsReading(
  readings: VitalsReading[],
): string {
  const systolicValues: number[] = [];
  const diastolicValues: number[] = [];
  const heartRateValues: number[] = [];

  readings.forEach((reading) => {
    const systolic = parseNumeric(reading.systolic);
    const diastolic = parseNumeric(reading.diastolic);
    const heartRate = parseNumeric(reading.heartRate);
    if (systolic != null) systolicValues.push(systolic);
    if (diastolic != null) diastolicValues.push(diastolic);
    if (heartRate != null) heartRateValues.push(heartRate);
  });

  const average = (values: number[]) =>
    values.length
      ? Math.round(
          values.reduce((total, value) => total + value, 0) / values.length,
        )
      : null;
  const averageSystolic = average(systolicValues);
  const averageDiastolic = average(diastolicValues);
  const averageHeartRate = average(heartRateValues);
  const segments: string[] = [];

  if (averageSystolic != null && averageDiastolic != null) {
    segments.push(
      `Average BP: ${formatNumber(averageSystolic)}/${formatNumber(
        averageDiastolic,
      )} mmHg`,
    );
  }
  if (averageHeartRate != null) {
    segments.push(
      `${segments.length ? "HR" : "Average HR"}: ${formatNumber(
        averageHeartRate,
      )} bpm`,
    );
  }

  return segments.join(", ");
}
