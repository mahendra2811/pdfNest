"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  ArrowRight,
  Merge,
  Scissors,
  Archive,
  RotateCw,
  FilePlus,
  Copy,
  Layers,
  Droplets,
  EyeOff,
  Lock,
  Unlock,
  PenLine,
  FileEdit,
  FileSearch,
  Info,
  ImageDown,
  FileImage,
  Type,
  Globe,
  FileCode,
  Heart,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LIVE_TOOLS, CATEGORY_LABELS } from "@/lib/constants/tools";
import type { ToolCategory } from "@/lib/types/tools";

// Static icon map for pdfNest tool icons (avoids dynamic import of all lucide)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Merge,
  Scissors,
  Archive,
  RotateCw,
  ArrowUpDown: ({ className }) => (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </svg>
  ),
  FilePlus,
  Copy,
  Layers,
  Hash: ({ className }) => (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  ),
  Droplets,
  EyeOff,
  Lock,
  Unlock,
  PenLine,
  FileEdit,
  FileSearch,
  Info,
  ImageDown,
  FileImage,
  FileText,
  Type,
  Globe,
  FileCode,
  Images: ({ className }) => (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      <circle cx="12" cy="8" r="2" />
      <rect width="16" height="16" x="6" y="2" rx="2" />
    </svg>
  ),
};

function ToolIcon({ name, className }: { name: string; className?: string }): React.ReactElement | null {
  const Comp = ICON_MAP[name];
  return Comp ? <Comp className={className} /> : <FileText className={className} />;
}

const CATEGORY_ORDER: ToolCategory[] = [
  "manipulate",
  "security",
  "forms-metadata",
  "pdf-to-other",
  "other-to-pdf",
];

export function Header(): React.ReactElement {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<ToolCategory | null>(null);
  const pathname = usePathname();

  // Close menus on route change — use RAF to avoid synchronous setState in effect
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    const raf = requestAnimationFrame(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      setMobileOpen(false);
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const liveCount = LIVE_TOOLS.length;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg pdf-badge flex items-center justify-center shadow-sm">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">pdf</span>
            <span className="text-foreground">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                dropdownOpen
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileText className={cn("h-4 w-4", dropdownOpen ? "text-primary" : "")} />
              PDF Tools
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", dropdownOpen && "rotate-180")}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-1 w-[600px] bg-card/98 backdrop-blur-md border border-border rounded-xl shadow-2xl z-50 p-5"
              >
                <div className="grid grid-cols-3 gap-4">
                  {CATEGORY_ORDER.map((cat) => {
                    const tools = LIVE_TOOLS.filter((t) => t.category === cat).slice(0, 5);
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {CATEGORY_LABELS[cat]}
                          </p>
                        </div>
                        <ul className="space-y-0.5">
                          {tools.map((tool) => (
                            <li key={tool.slug}>
                              <Link
                                href={`/tools/${tool.slug}`}
                                role="menuitem"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
                              >
                                <ToolIcon name={tool.icon} className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{tool.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-center">
                  <Link
                    href="/tools"
                    onClick={() => setDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View all {liveCount} PDF tools
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          <Link
            href="/tools"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white pdf-badge hover:opacity-90 rounded-lg shadow-sm transition-all"
          >
            All Tools
            <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">
              {liveCount}
            </span>
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="hidden md:flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-4 space-y-2">
            {CATEGORY_ORDER.map((cat) => {
              const tools = LIVE_TOOLS.filter((t) => t.category === cat);
              const isExpanded = mobileExpanded === cat;
              return (
                <div key={cat} className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setMobileExpanded(isExpanded ? null : cat)}
                    aria-expanded={isExpanded}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium flex-1">{CATEGORY_LABELS[cat]}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {tools.length}
                    </Badge>
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-0.5">
                      {tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <ToolIcon name={tool.icon} className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/tools"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white pdf-badge rounded-xl"
              onClick={() => setMobileOpen(false)}
            >
              Browse All {liveCount} PDF Tools
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="flex gap-2">
              <Link
                href="/favorites"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-colors border border-border"
                onClick={() => setMobileOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Favorites
              </Link>
              <Link
                href="/history"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl transition-colors border border-border"
                onClick={() => setMobileOpen(false)}
              >
                <Clock className="h-4 w-4" />
                History
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
