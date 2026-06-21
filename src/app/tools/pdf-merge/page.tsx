import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { MergeControls } from "@/components/tools/pdf/merge-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Merge — Combine PDF Files Free Online | pdfNest",
  description:
    "Merge multiple PDF files into one document free online. Drag to reorder, then download — 100% client-side, privacy-first, no upload required.",
};

export default async function PdfMergePage() {
  const tool = TOOL_MAP.get("pdf-merge")!;
  return (
    <ToolLayout tool={tool}>
      <MergeControls />
    </ToolLayout>
  );
}
