import type { ReactNode } from "react";
import { ReturnToTopLink } from "@/components/templates/shared/ReturnToTopLink";
import { TemplatePageLayout } from "@/components/templates/shared/TemplatePageLayout";

export default function StandaloneTemplateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TemplatePageLayout>
      {children}
      <ReturnToTopLink />
    </TemplatePageLayout>
  );
}
