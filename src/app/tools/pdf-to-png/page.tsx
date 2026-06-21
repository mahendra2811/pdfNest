import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfToPngControls } from "@/components/tools/pdf/pdf-to-png-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF to PNG — Convert PDF Pages to PNG Images Free Online | pdfNest",
  description:
    "Convert each PDF page into a high-resolution PNG image. Choose 72, 150, or 300 DPI. Download individually or as ZIP. 100% browser-based, privacy-first.",
};

export default async function PdfToPngPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-to-png")!;
  return (
    <ToolLayout tool={tool}>
      <PdfToPngControls />
    </ToolLayout>
  );
}
