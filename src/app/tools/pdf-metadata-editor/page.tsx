import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfMetadataEditorControls } from "@/components/tools/pdf/pdf-metadata-editor-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Metadata Editor — Edit PDF Title, Author & Properties Free | pdfNest",
  description:
    "Edit PDF metadata fields: title, author, subject, keywords, creator, and producer. Browser-based, privacy-first — your files stay on your device.",
};

export default async function PdfMetadataEditorPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-metadata-editor")!;
  return (
    <ToolLayout tool={tool}>
      <PdfMetadataEditorControls />
    </ToolLayout>
  );
}
