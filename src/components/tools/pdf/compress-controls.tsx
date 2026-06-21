"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Archive, Info, Download, RefreshCw, FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePdfCompress } from "@/hooks/use-pdf-compress";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function CompressControls(): React.ReactElement {
  const { state, compress, reset, result } = usePdfCompress();
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
  }, []);

  const handleCompress = useCallback((): void => {
    if (file) compress(file);
  }, [file, compress]);

  const handleReset = useCallback((): void => {
    setFile(null);
    reset();
  }, [reset]);

  if (state.status === "complete" && result) {
    const reduced = result.compressedSize < result.originalSize;
    const pct = reduced
      ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Original
              </p>
              <p className="text-lg font-bold">{formatFileSize(result.originalSize)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Compressed
              </p>
              <p className="text-lg font-bold text-primary">
                {formatFileSize(result.compressedSize)}
              </p>
            </div>
          </div>
          {reduced ? (
            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm text-center">
              Reduced by {pct}%
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm text-center">
              This PDF is already well-optimized — basic compression couldn&apos;t reduce it
              further.
            </div>
          )}
        </div>

        <Button
          className="w-full h-11 gap-2"
          onClick={() => downloadBlob(result.blob, "compressed.pdf")}
        >
          <Download className="h-4 w-4" /> Download Compressed PDF
        </Button>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Compress Another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <p>
          Basic compression removes unused data and re-optimizes the PDF structure. Typical
          reduction: 5–30%.
        </p>
      </div>

      {!file ? (
        <FileDropzone
          accept={FILE_LIMITS.pdfMax.acceptString}
          acceptedTypes={FILE_LIMITS.pdfMax.acceptedTypes}
          maxSize={FILE_LIMITS.pdfMax.maxSize}
          maxSizeLabel={FILE_LIMITS.pdfMax.maxSizeLabel}
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3 relative">
              <button
                type="button"
                onClick={handleReset}
                aria-label="Remove file"
                className="absolute -top-4 -right-2 z-[1000] w-6 h-6 rounded-full bg-destructive/90 text-white flex items-center justify-center transition-opacity shadow-sm hover:bg-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </CardContent>
          </Card>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Compressing PDF... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleCompress}>
              <Archive className="h-4 w-4" /> Compress PDF
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
            Upload Different File
          </Button>
        </motion.div>
      )}
    </div>
  );
}
