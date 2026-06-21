import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfMetadataViewerControls } from "@/components/tools/pdf/pdf-metadata-viewer-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Metadata Viewer — View PDF Properties Free Online | pdfNest",
  description:
    "Instantly inspect PDF metadata: title, author, subject, keywords, creator, producer, and page count. 100% browser-based, privacy-first — files never uploaded.",
};

export default async function PdfMetadataViewerPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-metadata-viewer")!;
  return (
    <ToolLayout tool={tool}>
      <PdfMetadataViewerControls />
    </ToolLayout>
  );
}
