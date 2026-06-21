import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfDuplicateControls } from "@/components/tools/pdf/pdf-duplicate-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Duplicate Pages — Copy Pages Within PDF Free Online | pdfNest",
  description:
    "Duplicate specific pages within a PDF document free online. Select pages and set copy count — 100% browser-based, privacy-first, no upload.",
};

export default async function PdfDuplicatePagesPage() {
  const tool = TOOL_MAP.get("pdf-duplicate-pages")!;
  return (
    <ToolLayout tool={tool}>
      <PdfDuplicateControls />
    </ToolLayout>
  );
}
