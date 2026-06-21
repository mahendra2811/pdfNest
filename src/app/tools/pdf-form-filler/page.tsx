import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfFormFillerControls } from "@/components/tools/pdf/pdf-form-filler-controls";
import { TOOL_MAP } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "PDF Form Filler — Fill PDF Forms Free Online | pdfNest",
  description:
    "Fill interactive PDF form fields (text, checkboxes, dropdowns) directly in your browser. Flatten and download filled forms. 100% client-side, privacy-first.",
};

export default async function PdfFormFillerPage(): Promise<React.ReactElement> {
  const tool = TOOL_MAP.get("pdf-form-filler")!;
  return (
    <ToolLayout tool={tool}>
      <PdfFormFillerControls />
    </ToolLayout>
  );
}
