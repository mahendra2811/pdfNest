"use client";

import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { STRINGS } from "@/lib/strings";

interface ComingSoonCardProps {
  name: string;
}

export function ComingSoonCard({ name }: ComingSoonCardProps): React.ReactElement {
  const handleClick = (): void => {
    toast.info(`${name}: ${STRINGS.comingSoonToast}`, { duration: 4000 });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left opacity-60 cursor-pointer"
      aria-label={`${name} — coming soon`}
    >
      <Card className="h-full border-dashed hover:border-primary/30 transition-colors">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight text-muted-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground/70">Coming soon</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
