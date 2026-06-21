import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfRedactControls } from "@/components/tools/pdf/pdf-redact-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Redact — Black Out Sensitive PDF Content Free Online | pdfNest",
  description:
    "Permanently redact sensitive content in PDF pages free online. Draw black boxes over areas to redact — rasterizes pages for true text removal. 100% client-side.",
};

export default async function PdfRedactPage() {
  const tool = TOOL_MAP.get("pdf-redact")!;
  return (
    <ToolLayout tool={tool}>
      <PdfRedactControls />
    </ToolLayout>
  );
}
