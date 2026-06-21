import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { MarkdownToPdfControls } from "@/components/tools/pdf/markdown-to-pdf-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "Markdown to PDF — Convert Markdown to PDF Free Online | pdfNest",
  description:
    "Write or paste Markdown and convert it to a PDF document with live preview. Supports headings, lists, code blocks, and blockquotes. 100% browser-based, privacy-first.",
};

export default async function MarkdownToPdfPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("markdown-to-pdf")!;
  return (
    <ToolLayout tool={tool}>
      <MarkdownToPdfControls />
    </ToolLayout>
  );
}
