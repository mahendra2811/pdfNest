"use client";

import Link from "next/link";
import { Clock, Trash2, FileText, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHistoryStore } from "@/lib/store/history";
import { TOOL_MAP } from "@/lib/constants/tools";

const GRADIENTS: Record<string, string> = {
  manipulate: "from-red-500 to-red-600",
  security: "from-rose-500 to-rose-700",
  "forms-metadata": "from-orange-500 to-red-500",
  "pdf-to-other": "from-red-500 to-pink-600",
  "other-to-pdf": "from-pink-500 to-red-500",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function HistoryPageClient(): React.ReactElement {
  const { entries, clearHistory } = useHistoryStore();
  const tools = entries
    .map((e) => ({ tool: TOOL_MAP.get(e.slug), usedAt: e.usedAt }))
    .filter((e): e is { tool: NonNullable<typeof e.tool>; usedAt: string } => e.tool !== undefined);

  if (tools.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <Clock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No history yet</h1>
        <p className="text-muted-foreground mb-6">
          Tools you use will appear here for quick access. Your history is stored locally — it never
          leaves your device.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Browse all tools <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Clear history"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(({ tool, usedAt }) => {
          const Icon = (
            LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
          )[tool.icon];
          const gradient = GRADIENTS[tool.category] ?? "from-red-500 to-rose-600";
          return (
            <Link key={`${tool.id}-${usedAt}`} href={`/tools/${tool.slug}`}>
              <Card className="group hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                      gradient
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4 text-white" />
                    ) : (
                      <FileText className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {formatRelativeTime(usedAt)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
