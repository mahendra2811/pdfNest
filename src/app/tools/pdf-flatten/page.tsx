import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfFlattenControls } from "@/components/tools/pdf/pdf-flatten-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Flatten — Flatten Form Fields & Annotations Free Online | pdfNest",
  description:
    "Flatten PDF form fields and annotations permanently free online. Makes the PDF non-editable for secure sharing — 100% browser-based, privacy-first.",
};

export default async function PdfFlattenPage() {
  const tool = TOOL_MAP.get("pdf-flatten")!;
  return (
    <ToolLayout tool={tool}>
      <PdfFlattenControls />
    </ToolLayout>
  );
}
