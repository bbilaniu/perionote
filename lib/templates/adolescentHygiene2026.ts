import {
  createEmptyAdultHygiene2026Form,
  type AdultHygiene2026Form,
  type AdultHygiene2026Output,
} from "@/lib/templates/adultHygiene2026";
import { buildAdultHygiene2026Summary } from "@/lib/templates/summary/buildAdultHygiene2026Summary";

export type AdolescentHygiene2026Form = AdultHygiene2026Form;
export type AdolescentHygiene2026Output = AdultHygiene2026Output;

export function createEmptyAdolescentHygiene2026Form(): AdolescentHygiene2026Form {
  return {
    ...createEmptyAdultHygiene2026Form(),
    guardianCommunicationStatus: "not-documented",
    guardianCommunicationDetails: "",
  };
}

export function buildAdolescentHygiene2026Summary(
  form: AdolescentHygiene2026Form,
  options: {
    startedAt?: Date;
    output?: AdolescentHygiene2026Output;
  } = {},
): string {
  return buildAdultHygiene2026Summary(form, options);
}
