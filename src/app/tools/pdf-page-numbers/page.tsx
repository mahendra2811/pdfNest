import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfPageNumbersControls } from "@/components/tools/pdf/pdf-page-numbers-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Page Numbers — Add Page Numbers to PDF Free Online | pdfNest",
  description:
    "Add page numbers to a PDF document free online. Choose position, format, font size, and start number — 100% browser-based, privacy-first.",
};

export default async function PdfPageNumbersPage() {
  const tool = TOOL_MAP.get("pdf-page-numbers")!;
  return (
    <ToolLayout tool={tool}>
      <PdfPageNumbersControls />
    </ToolLayout>
  );
}
