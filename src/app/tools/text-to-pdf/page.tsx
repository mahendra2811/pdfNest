import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { TextToPdfControls } from "@/components/tools/pdf/text-to-pdf-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "Text to PDF — Convert Plain Text to PDF Free Online | pdfNest",
  description:
    "Convert plain text to a PDF document with adjustable font size, page size, and margins. No upload needed — 100% browser-based, privacy-first.",
};

export default async function TextToPdfPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("text-to-pdf")!;
  return (
    <ToolLayout tool={tool}>
      <TextToPdfControls />
    </ToolLayout>
  );
}
