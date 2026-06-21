"use client";

import { Loader2 } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";

interface ProcessingIndicatorProps {
  progress: number; // 0-100
  label?: string;
  className?: string;
}

export function ProcessingIndicator({
  progress,
  label = "Processing...",
  className,
}: ProcessingIndicatorProps): React.ReactElement {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-10", className)}>
      <ProgressRing progress={progress} size={72} strokeWidth={6} />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Processed locally in your browser — no upload
        </p>
      </div>
    </div>
  );
}

export function LoadingIndicator({ label = "Loading..." }: { label?: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
