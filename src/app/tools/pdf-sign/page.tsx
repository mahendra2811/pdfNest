import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfSignControls } from "@/components/tools/pdf/pdf-sign-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Sign — Add Signature to PDF Free Online | pdfNest",
  description:
    "Draw and place your signature on PDF pages instantly. 100% browser-based, privacy-first — files never leave your device. Free online PDF signing tool.",
};

export default async function PdfSignPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-sign")!;
  return (
    <ToolLayout tool={tool}>
      <PdfSignControls />
    </ToolLayout>
  );
}
