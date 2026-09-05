import type { ReactNode } from "react";

export function TemplatePageLayout({ children }: { children: ReactNode }) {
  return (
    <div id="template-top" tabIndex={-1} className="outline-none">
      {children}
    </div>
  );
}
