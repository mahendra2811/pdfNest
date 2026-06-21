import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfPasswordControls } from "@/components/tools/pdf/pdf-password-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Password Protect — Encrypt PDF Files Free Online | pdfNest",
  description:
    "Password protect your PDF files to restrict access. Browser-based, privacy-first — your files never leave your device. Free online PDF encryption tool.",
};

export default async function PdfPasswordProtectPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-password-protect")!;
  return (
    <ToolLayout tool={tool}>
      <PdfPasswordControls />
    </ToolLayout>
  );
}
