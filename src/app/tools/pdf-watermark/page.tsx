import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { WatermarkControls } from "@/components/tools/pdf/watermark-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Watermark — Add Watermark to PDF Free Online | pdfNest",
  description:
    "Add text watermark to PDF pages free online. Customize text, opacity, angle, and position — 100% browser-based, privacy-first, no upload.",
};

export default async function PdfWatermarkPage() {
  const tool = TOOL_MAP.get("pdf-watermark")!;
  return (
    <ToolLayout tool={tool}>
      <WatermarkControls />
    </ToolLayout>
  );
}
