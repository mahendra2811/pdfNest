import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { ReorderControls } from "@/components/tools/pdf/reorder-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Reorder — Rearrange PDF Pages Free Online | pdfNest",
  description:
    "Drag and drop to reorder PDF pages free online. Remove unwanted pages and rearrange the order — 100% browser-based, privacy-first.",
};

export default async function PdfReorderPage() {
  const tool = TOOL_MAP.get("pdf-reorder")!;
  return (
    <ToolLayout tool={tool}>
      <ReorderControls />
    </ToolLayout>
  );
}
