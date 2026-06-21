import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfAddBlankControls } from "@/components/tools/pdf/pdf-add-blank-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Add Blank Pages — Insert Blank Pages Free Online | pdfNest",
  description:
    "Insert blank pages into a PDF at any position free online. Add before, after, or at the end — 100% browser-based, privacy-first.",
};

export default async function PdfAddBlankPagesPage() {
  const tool = TOOL_MAP.get("pdf-add-blank-pages")!;
  return (
    <ToolLayout tool={tool}>
      <PdfAddBlankControls />
    </ToolLayout>
  );
}
