import Link from "next/link";
import { FileText, Shield } from "lucide-react";
import { CATEGORY_LABELS, CATEGORIES } from "@/lib/constants/tools";
import { LIVE_TOOLS } from "@/lib/constants/tools";
import { STRINGS } from "@/lib/strings";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg pdf-badge flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">pdf</span>Nest
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{STRINGS.tagline}</p>
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Shield className="h-3.5 w-3.5" />
              <span>100% browser-based — no server, no upload</span>
            </div>
          </div>

          {/* Tool categories */}
          {CATEGORIES.slice(0, 3).map((cat) => {
            const tools = LIVE_TOOLS.filter((t) => t.category === cat).slice(0, 5);
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {CATEGORY_LABELS[cat]}
                </p>
                <ul className="space-y-2">
                  {tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/tools" className="text-xs text-primary hover:underline">
                      View all tools →
                    </Link>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{STRINGS.footerCopyright}</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/tools"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              All Tools
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
