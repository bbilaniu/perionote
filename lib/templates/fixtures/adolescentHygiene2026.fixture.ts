import { adultHygiene2026Fixture } from "@/lib/templates/fixtures/adultHygiene2026.fixture";
import type { AdolescentHygiene2026Form } from "@/lib/templates/adolescentHygiene2026";

export const adolescentHygiene2026Fixture: AdolescentHygiene2026Form = {
  ...adultHygiene2026Fixture,
  patientId: "TEST-ADOLESCENT-2026-1001",
  consentPatient: true,
  consentParent: true,
  guardianCommunicationStatus: "yes",
  guardianCommunicationDetails:
    "Synthetic findings, home-care recommendations, and follow-up were reviewed.",
};
