import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfToJpgControls } from "@/components/tools/pdf/pdf-to-jpg-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF to JPG — Convert PDF Pages to Images Free Online | pdfNest",
  description:
    "Convert PDF pages to high-quality JPEG images free online. Choose DPI and quality settings. 100% client-side — your files never leave your device.",
};

export default async function PdfToJpgPage() {
  const tool = TOOL_MAP.get("pdf-to-jpg")!;
  return (
    <ToolLayout tool={tool}>
      <PdfToJpgControls />
    </ToolLayout>
  );
}
