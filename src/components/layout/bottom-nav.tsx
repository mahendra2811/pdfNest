"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Home;
  isActive: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    Icon: Home,
    isActive: (p) => p === "/" || p === "/tools" || p.startsWith("/tools/"),
  },
  {
    href: "/favorites",
    label: "Favorites",
    Icon: Heart,
    isActive: (p) => p.startsWith("/favorites"),
  },
  {
    href: "/history",
    label: "History",
    Icon: Clock,
    isActive: (p) => p.startsWith("/history"),
  },
  {
    href: "/tools",
    label: "All Tools",
    Icon: FileText,
    isActive: (p) => p === "/tools",
  },
];

export function BottomNav(): React.ReactElement {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary mobile navigation"
      className={cn(
        "md:hidden",
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-border bg-card/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ href, label, Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5",
                  "py-2 text-[10px] font-medium",
                  "transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent"
                  )}
                />
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
