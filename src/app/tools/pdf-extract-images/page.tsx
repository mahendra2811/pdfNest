import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfExtractImagesControls } from "@/components/tools/pdf/pdf-extract-images-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Extract Images — Export PDF Pages as PNG ZIP Free Online | pdfNest",
  description:
    "Extract every PDF page as a high-resolution PNG image, then download them all as a ZIP file. 100% browser-based, privacy-first — files never leave your device.",
};

export default async function PdfExtractImagesPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-extract-images")!;
  return (
    <ToolLayout tool={tool}>
      <PdfExtractImagesControls />
    </ToolLayout>
  );
}
