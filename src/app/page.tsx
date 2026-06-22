import Link from "next/link";
import { FileText, Shield, Zap, Lock, ArrowRight, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LIVE_TOOLS,
  SOON_TOOLS,
  FEATURED_TOOLS,
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/lib/constants/tools";
import { ComingSoonCard } from "@/components/home/coming-soon-card";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pdfNest — Free Online PDF Tools | No Upload, 100% Private",
  description:
    "Free online PDF tools — merge, split, compress, convert, sign and more. 100% browser-based, no upload, no sign-up. Your PDFs never leave your device.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "pdfNest — Free Online PDF Tools | No Upload, 100% Private",
    description:
      "Free online PDF tools — merge, split, compress, convert, sign and more. 100% browser-based, no upload.",
    url: siteConfig.url,
    type: "website",
  },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  manipulate: "from-red-500 to-red-600",
  security: "from-rose-500 to-rose-700",
  "forms-metadata": "from-orange-500 to-red-500",
  "pdf-to-other": "from-red-500 to-pink-600",
  "other-to-pdf": "from-pink-500 to-red-500",
};

export default function HomePage(): React.ReactElement {
  const liveCount = LIVE_TOOLS.length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-red-50/40 to-background dark:from-red-950/10">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
            <Shield className="h-3.5 w-3.5" />
            {liveCount} free PDF tools — no upload, no sign-up
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Your PDF toolkit, <span className="text-primary">100% private.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {siteConfig.tagline} Every PDF operation runs entirely in your browser — merge, split,
            compress, convert, sign and more.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold pdf-badge rounded-xl shadow-md hover:opacity-90 transition-opacity"
            >
              Browse all {liveCount} tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tools/pdf-merge"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-border rounded-xl hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-4 w-4 text-primary" />
              Merge PDFs
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Files never leave your device
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Instant processing
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              No sign-up required
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Completely free
            </div>
          </div>
        </div>
      </section>

      {/* Featured tools */}
      <section className="mx-auto max-w-5xl px-4 py-14 w-full" aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="featured-heading" className="text-2xl font-bold">
            Popular PDF Tools
          </h2>
          <Link
            href="/tools"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURED_TOOLS.map((tool) => {
            const Icon = (
              LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
            )[tool.icon];
            const gradient = CATEGORY_GRADIENTS[tool.category] ?? "from-red-500 to-rose-600";
            return (
              <Link key={tool.id} href={`/tools/${tool.slug}`}>
                <Card className="group h-full hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                        gradient
                      )}
                    >
                      {Icon ? (
                        <Icon className="h-5 w-5 text-white" />
                      ) : (
                        <FileText className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{tool.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* All tools by category */}
      <section className="mx-auto max-w-5xl px-4 pb-14 w-full" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold mb-8">
          All PDF Tools
        </h2>
        <div className="space-y-10">
          {CATEGORIES.map((cat) => {
            const tools = LIVE_TOOLS.filter((t) => t.category === cat);
            const soonTools = SOON_TOOLS.filter((t) => t.category === cat);
            if (tools.length === 0 && soonTools.length === 0) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-lg font-semibold">{CATEGORY_LABELS[cat]}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {tools.length} tools
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                        <Card className="group h-full hover:border-primary/40 hover:shadow-sm transition-all duration-200">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                                gradient
                              )}
                            >
                              {Icon ? (
                                <Icon className="h-4 w-4 text-white" />
                              ) : (
                                <FileText className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <p className="text-sm font-medium leading-tight">{tool.name}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                  {soonTools.map((tool) => (
                    <ComingSoonCard key={tool.id} name={tool.name} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy CTA */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Your PDFs never leave your device.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Every tool on pdfNest runs 100% in your browser. We have no servers to receive your
            files — they stay on your device at all times. No tracking, no storage, no account
            needed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/how-it-works"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              How it works <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Privacy policy <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
