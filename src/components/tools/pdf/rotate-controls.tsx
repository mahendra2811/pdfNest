"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, Download, RefreshCw, FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { usePdfRotate } from "@/hooks/use-pdf-rotate";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

export function RotateControls(): React.ReactElement {
  const { state, rotate, reset, result } = usePdfRotate();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [mode, setMode] = useState<"all" | "selected">("all");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const handleFilesSelected = useCallback(async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    try {
      const buffer = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch {
      setPageCount(0);
    }
  }, []);

  const togglePage = useCallback((idx: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleRotate = useCallback((): void => {
    if (!file) return;
    rotate(file, rotation, mode === "all" ? "all" : Array.from(selectedPages));
  }, [file, rotation, mode, selectedPages, rotate]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
    reset();
  }, [reset]);

  if (state.status === "complete" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">Rotated — {result.pageCount} pages</p>
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, "rotated.pdf")}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Rotate Another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept={FILE_LIMITS.pdf.acceptString}
          acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
          maxSize={FILE_LIMITS.pdf.maxSize}
          maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
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
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label>Rotation</Label>
            <div className="flex gap-3">
              {([90, 180, 270] as const).map((deg) => (
                <Button
                  key={deg}
                  variant={rotation === deg ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setRotation(deg)}
                >
                  {deg === 90 ? "90° CW" : deg === 180 ? "180°" : "90° CCW"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Apply to</Label>
            <div className="flex gap-2">
              <Button
                variant={mode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("all")}
              >
                All Pages
              </Button>
              <Button
                variant={mode === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("selected")}
              >
                Select Pages
              </Button>
            </div>
          </div>

          {mode === "selected" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Click pages to select</Label>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePage(i)}
                    className={`text-xs rounded px-1 py-1.5 border transition-colors ${
                      selectedPages.has(i)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPages.size} of {pageCount} pages selected
              </p>
            </div>
          )}

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Rotating PDF... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
              Rotate {mode === "all" ? `all ${pageCount} pages` : `${selectedPages.size} pages`}
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
