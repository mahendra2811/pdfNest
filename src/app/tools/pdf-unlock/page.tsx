import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfUnlockControls } from "@/components/tools/pdf/pdf-unlock-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Unlock — Remove PDF Password Protection Free Online | pdfNest",
  description:
    "Remove password protection from your PDF files instantly. Enter the password and download an unlocked PDF. Browser-based, privacy-first — files never uploaded.",
};

export default async function PdfUnlockPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-unlock")!;
  return (
    <ToolLayout tool={tool}>
      <PdfUnlockControls />
    </ToolLayout>
  );
}
