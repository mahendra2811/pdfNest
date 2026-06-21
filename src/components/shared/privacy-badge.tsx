import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivacyBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PrivacyBadge({ className, variant = "default" }: PrivacyBadgeProps): React.ReactElement {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground/70", className)}>
        <Shield className="h-3 w-3 text-green-500" />
        <span>Processed locally — files never leave your device</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/20",
        className
      )}
    >
      <Shield className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
      <span className="text-xs font-medium text-green-700 dark:text-green-400">
        100% Client-Side — Files never leave your device
      </span>
    </div>
  );
}
