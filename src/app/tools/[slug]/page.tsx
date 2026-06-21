import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolLayout } from "@/components/layout/tool-layout";
import { LIVE_TOOLS, TOOL_MAP } from "@/lib/constants/tools";
import { ComingSoonShell } from "@/components/shared/coming-soon-shell";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return LIVE_TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug);
  if (!tool) return { title: "Tool Not Found | pdfNest" };

  return {
    title: `${tool.name} — Free Online PDF Tool | pdfNest`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} | pdfNest`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug);

  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ComingSoonShell toolName={tool.name} />
    </ToolLayout>
  );
}
