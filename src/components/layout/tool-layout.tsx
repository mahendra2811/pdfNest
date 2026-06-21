import Link from "next/link";
import { Shield, CheckCircle2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LIVE_TOOLS } from "@/lib/constants/tools";
import { CATEGORY_LABELS } from "@/lib/constants/tools";
import type { Tool } from "@/lib/types/tools";

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

// Category gradient — red/crimson primary for PDF identity
const CATEGORY_GRADIENTS: Record<string, string> = {
  manipulate: "from-red-500 to-red-600",
  security: "from-rose-500 to-rose-700",
  "forms-metadata": "from-orange-500 to-red-500",
  "pdf-to-other": "from-red-500 to-pink-600",
  "other-to-pdf": "from-pink-500 to-red-500",
};

export function ToolLayout({ tool, children }: ToolLayoutProps): React.ReactElement {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[tool.icon];

  const relatedTools = LIVE_TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 4);

  const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-red-500 to-rose-600";

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${tool.name} — pdfNest`,
    url: `https://pdfnest.app/tools/${tool.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: tool.description,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-4 py-3">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/tools" className="hover:text-foreground transition-colors">
              Tools
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium truncate">{tool.name}</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-3xl px-4 pb-24 md:pb-8 space-y-8">
        {/* Tool Header */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {Icon ? (
              <div
                className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                  gradient
                )}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br shrink-0", gradient)} />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{tool.name}</h1>
                {tool.isNew && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    New
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {CATEGORY_LABELS[tool.category] ?? tool.category} Tool
              </Badge>
            </div>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground">{tool.longDescription}</p>

          {/* Privacy badge */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Files processed locally — never uploaded to any server
            </span>
          </div>
        </div>

        {/* Tool Content */}
        {children}

        {/* Features */}
        {tool.features.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tool.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accepted formats */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Supported Formats</h2>
          <div className="flex flex-wrap gap-2">
            {tool.acceptedTypes.map((type) => {
              const ext = type.split("/")[1]?.toUpperCase() ?? type;
              return (
                <Badge key={type} variant="outline" className="text-xs">
                  {ext}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Related PDF Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTools.map((rt) => {
                const RtIcon = (
                  LucideIcons as unknown as Record<
                    string,
                    React.ComponentType<{ className?: string }>
                  >
                )[rt.icon];
                const rtGradient =
                  CATEGORY_GRADIENTS[rt.category] ?? "from-red-500 to-rose-600";
                return (
                  <Link key={rt.id} href={`/tools/${rt.slug}`}>
                    <Card className="group hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <CardContent className="flex items-start gap-3 p-4">
                        {RtIcon && (
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                              rtGradient
                            )}
                          >
                            <RtIcon className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{rt.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {rt.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
