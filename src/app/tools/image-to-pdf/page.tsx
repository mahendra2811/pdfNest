import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { ImageToPdfControls } from "@/components/tools/pdf/image-to-pdf-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "Image to PDF — Create PDF from Images Free Online | pdfNest",
  description:
    "Convert JPG, PNG, WebP and other images to a PDF document free online. Reorder pages, set margins and orientation — 100% client-side, no upload.",
};

export default async function ImageToPdfPage() {
  const tool = TOOL_MAP.get("image-to-pdf")!;
  return (
    <ToolLayout tool={tool}>
      <ImageToPdfControls />
    </ToolLayout>
  );
}
