import type { Metadata } from "next";
import { HistoryPageClient } from "./client";

export const metadata: Metadata = {
  title: "History — pdfNest",
  description:
    "Your recently used PDF tools on pdfNest. Quickly jump back to tools you used before.",
};

export default function HistoryPage(): React.ReactElement {
  return <HistoryPageClient />;
}
