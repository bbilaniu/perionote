export type LocalAnesthesiaRoute = "injection" | "topical" | "rinse";

export interface LocalAnesthesiaEntry {
  id: string;
  route: LocalAnesthesiaRoute;
  administrationType: string;
  toothAreas: string[];
  product: string;
  catalogueItemId?: string;
  amountMl: string;
  durationSeconds: string;
  timeAdministered: string;
}

export interface LocalAnesthesiaValue {
  localAnesthesiaNoContraindication: boolean;
  localAnesthesiaEntries: LocalAnesthesiaEntry[];
  localAnesthesiaNoAdverseReactions: boolean;
  localAnesthesiaAdequateAchieved: boolean;
  localAnesthesiaNotes: string;
}

export const localAnesthesiaInjectionTypes = [
  "I/O",
  "M/I",
  "PSA",
  "IA/L",
  "Buccal NB",
  "GP",
  "NP",
] as const;

export const localAnesthesiaTopicalApplicationTypes = [
  "Mucosal application",
  "Sulcular application",
] as const;

export const localAnesthesiaLocationChoices = {
  injection: [
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "S6",
  ],
  topical: [
    "full mouth",
    "maxilla",
    "mandible",
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "S6",
  ],
  rinse: ["full mouth"],
} as const satisfies Record<LocalAnesthesiaRoute, readonly string[]>;

export function createEmptyLocalAnesthesiaValue(): LocalAnesthesiaValue {
  return {
    localAnesthesiaNoContraindication: false,
    localAnesthesiaEntries: [],
    localAnesthesiaNoAdverseReactions: false,
    localAnesthesiaAdequateAchieved: false,
    localAnesthesiaNotes: "",
  };
}

function trimmed(value: string): string {
  return value.trim();
}

function formatClockTime(value: string): string {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  if (hour > 23) return value;
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

export function formatLocalAnesthesiaSummary(
  value: LocalAnesthesiaValue,
): string {
  const detailLines: string[] = [];
  const totals = new Map<string, number>();

  for (const entry of value.localAnesthesiaEntries) {
    const product = trimmed(entry.product);
    const amount = trimmed(entry.amountMl);
    const toothAreas = entry.toothAreas.map(trimmed).filter(Boolean);
    const area = toothAreas.join(", ");
    if (!product || !amount) continue;
    const time = trimmed(entry.timeAdministered);
    const administeredAt = time ? ` (at ${formatClockTime(time)})` : "";
    if (entry.route === "rinse") {
      const duration = trimmed(entry.durationSeconds);
      detailLines.push(
        `Rinse${area ? ` — ${area}` : ""}: ${product} ${amount} ml${
          duration ? `; duration: ${duration} seconds` : ""
        }${administeredAt}`,
      );
    } else {
      const administrationType = trimmed(entry.administrationType);
      if (!administrationType || !area) continue;
      detailLines.push(
        `${administrationType} — ${area}: ${product} ${amount} ml${administeredAt}`,
      );
    }
    const numericAmount = Number(amount);
    if (Number.isFinite(numericAmount)) {
      totals.set(product, (totals.get(product) ?? 0) + numericAmount);
    }
  }

  totals.forEach((amount, product) => {
    detailLines.push(`Total: ${product} ${amount.toFixed(1)} ml`);
  });
  if (value.localAnesthesiaNoAdverseReactions) {
    detailLines.push("No adverse reactions noted");
  }
  if (value.localAnesthesiaAdequateAchieved) {
    detailLines.push("Adequate anesthesia achieved");
  }
  if (trimmed(value.localAnesthesiaNotes)) {
    detailLines.push(trimmed(value.localAnesthesiaNotes));
  }

  if (!value.localAnesthesiaNoContraindication && !detailLines.length) {
    return "";
  }
  const heading = value.localAnesthesiaNoContraindication
    ? "Local anesthetic administered: No C/I to LA"
    : "Local anesthetic administered:";
  return [heading, ...detailLines.map((line) => `  ${line}`)].join("\n");
}
