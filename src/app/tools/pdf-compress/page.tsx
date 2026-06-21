import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { CompressControls } from "@/components/tools/pdf/compress-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Compress — Reduce PDF File Size Free Online | pdfNest",
  description:
    "Reduce PDF file size without losing quality. Browser-based PDF compression — no upload, privacy-first, instant download.",
};

export default async function PdfCompressPage() {
  const tool = TOOL_MAP.get("pdf-compress")!;
  return (
    <ToolLayout tool={tool}>
      <CompressControls />
    </ToolLayout>
  );
}
