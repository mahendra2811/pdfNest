import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfToWordControls } from "@/components/tools/pdf/pdf-to-word-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF to Word — Convert PDF to DOCX Free Online | pdfNest",
  description:
    "Convert PDF files to Word DOCX documents by extracting text content. Best for text-heavy PDFs. 100% browser-based, privacy-first — files never uploaded.",
};

export default async function PdfToWordPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-to-word")!;
  return (
    <ToolLayout tool={tool}>
      <PdfToWordControls />
    </ToolLayout>
  );
}
