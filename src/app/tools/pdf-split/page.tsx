import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { SplitControls } from "@/components/tools/pdf/split-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Split — Extract Pages from PDF Free Online | pdfNest",
  description:
    "Split a PDF into individual pages or custom ranges free online. Define page ranges, select pages, or split every page — 100% client-side, no upload required.",
};

export default async function PdfSplitPage() {
  const tool = TOOL_MAP.get("pdf-split")!;
  return (
    <ToolLayout tool={tool}>
      <SplitControls />
    </ToolLayout>
  );
}
