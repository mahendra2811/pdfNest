import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfToTextControls } from "@/components/tools/pdf/pdf-to-text-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF to Text — Extract Text from PDF Free Online | pdfNest",
  description:
    "Extract all text content from your PDF instantly. Copy or download as .txt. Works with text-based PDFs. 100% browser-based, privacy-first — files never uploaded.",
};

export default async function PdfToTextPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-to-text")!;
  return (
    <ToolLayout tool={tool}>
      <PdfToTextControls />
    </ToolLayout>
  );
}
