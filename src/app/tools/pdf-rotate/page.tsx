import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { RotateControls } from "@/components/tools/pdf/rotate-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Rotate — Rotate PDF Pages Free Online | pdfNest",
  description:
    "Rotate PDF pages 90°, 180°, or 270° free online. Rotate all pages or select specific ones — 100% client-side, privacy-first.",
};

export default async function PdfRotatePage() {
  const tool = TOOL_MAP.get("pdf-rotate")!;
  return (
    <ToolLayout tool={tool}>
      <RotateControls />
    </ToolLayout>
  );
}
