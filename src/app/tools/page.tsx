import Link from "next/link";
import { FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LIVE_TOOLS, SOON_TOOLS, CATEGORIES, CATEGORY_LABELS } from "@/lib/constants/tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All PDF Tools — Free Online PDF Utilities | pdfNest",
  description:
    "Browse all free PDF tools on pdfNest — merge, split, compress, rotate, convert, sign, watermark and more. 100% browser-based, no upload.",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  manipulate: "from-red-500 to-red-600",
  security: "from-rose-500 to-rose-700",
  "forms-metadata": "from-orange-500 to-red-500",
  "pdf-to-other": "from-red-500 to-pink-600",
  "other-to-pdf": "from-pink-500 to-red-500",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">All PDF Tools</h1>
        <p className="text-muted-foreground">
          {LIVE_TOOLS.length} free tools — all 100% client-side, no upload, no sign-up.
        </p>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((cat) => {
          const tools = LIVE_TOOLS.filter((t) => t.category === cat);
          const soonTools = SOON_TOOLS.filter((t) => t.category === cat);
          if (tools.length === 0 && soonTools.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="text-xl font-semibold">{CATEGORY_LABELS[cat]}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {tools.length} tools
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool) => {
                  const Icon = (
                    LucideIcons as unknown as Record<
                      string,
                      React.ComponentType<{ className?: string }>
                    >
                  )[tool.icon];
                  const gradient =
                    CATEGORY_GRADIENTS[tool.category] ?? "from-red-500 to-rose-600";
                  return (
                    <Link key={tool.id} href={`/tools/${tool.slug}`}>
                      <Card className="group h-full hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                              gradient
                            )}
                          >
                            {Icon ? (
                              <Icon className="h-4.5 w-4.5 text-white" />
                            ) : (
                              <FileText className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{tool.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
                {soonTools.map((tool) => (
                  <div key={tool.id} className="opacity-50 cursor-not-allowed">
                    <Card className="h-full border-dashed">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">{tool.name}</p>
                          <Badge variant="outline" className="text-[10px] mt-1">
                            Coming Soon
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
