import type { Metadata } from "next";
import { LocalDraftManager } from "@/components/drafts/LocalDraftManager";

export const metadata: Metadata = {
  title: "Saved local drafts | HygieneNote",
};

export default function DraftsPage() {
  return <LocalDraftManager />;
}
