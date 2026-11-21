"use client";

import { AdultHygiene2026Template } from "@/components/templates/native/AdultHygiene2026Template";
import type { AdultHygiene2026Form } from "@/lib/templates/adultHygiene2026";
import type { InteractiveTemplateProps } from "@/lib/templates/types";

/**
 * The adolescent and adult 2026 forms intentionally share one encounter
 * model. The variant supplies a separate draft identity, adolescent-specific
 * communication, and role-oriented output labels without forking the recare
 * exam or hygiene workflows.
 */
export function AdolescentHygiene2026Template(
  props: InteractiveTemplateProps<AdultHygiene2026Form>,
) {
  return <AdultHygiene2026Template {...props} variant="adolescent" />;
}
