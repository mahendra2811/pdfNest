import { FileText, Wrench } from "lucide-react";

interface ComingSoonShellProps {
  toolName: string;
}

/**
 * Placeholder shell for Phase 1 — tool implementations come in Phase 2/3.
 * Shown on every live tool page until the real controls component is wired in.
 */
export function ComingSoonShell({ toolName }: ComingSoonShellProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Wrench className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold">{toolName} — Implementation Coming</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          The shell and registry are in place. Tool implementation arrives in Phase 2.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
        <FileText className="h-3.5 w-3.5 text-primary" />
        All PDF processing is 100% client-side — no upload required
      </div>
    </div>
  );
}
