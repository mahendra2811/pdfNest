import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { HtmlToPdfControls } from "@/components/tools/pdf/html-to-pdf-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "HTML to PDF — Convert HTML to PDF Free Online | pdfNest",
  description:
    "Paste HTML code and convert it to a PDF document instantly. Live preview, inline styles preserved. 100% browser-based, privacy-first — files never uploaded.",
};

export default async function HtmlToPdfPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("html-to-pdf")!;
  return (
    <ToolLayout tool={tool}>
      <HtmlToPdfControls />
    </ToolLayout>
  );
}
