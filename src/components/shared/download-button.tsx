"use client";

import { useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadOrShare } from "@/lib/utils/download-helpers";
import { formatFileSize } from "@/lib/utils/file-helpers";

interface DownloadButtonProps {
  blob: Blob;
  fileName: string;
  originalSize?: number;
  label?: string;
  className?: string;
}

export function DownloadButton({
  blob,
  fileName,
  originalSize,
  label,
  className,
}: DownloadButtonProps): React.ReactElement {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (): Promise<void> => {
    setLoading(true);
    try {
      await downloadOrShare(blob, fileName);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {originalSize !== undefined && (
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-muted-foreground">Original size</span>
          <span className="font-medium">{formatFileSize(originalSize)}</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="text-muted-foreground">Output size</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatFileSize(blob.size)}
          </span>
        </div>
      )}

      <Button
        onClick={handleDownload}
        disabled={loading || done}
        className={cn(
          "w-full gap-2 h-11",
          done && "bg-green-600 hover:bg-green-600"
        )}
        size="lg"
      >
        {done ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            {label ?? `Download ${fileName}`}
          </>
        )}
      </Button>
    </div>
  );
}
