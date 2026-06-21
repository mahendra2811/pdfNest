"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Scissors, Download, RefreshCw, FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePdfSplit } from "@/hooks/use-pdf-split";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

export function SplitControls(): React.ReactElement {
  const { state, split, reset, result, downloadAllAsZip } = usePdfSplit();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "extract" | "every-page">("range");
  const [rangeStr, setRangeStr] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const rangeHighlight = useMemo((): Set<number> => {
    const set = new Set<number>();
    if (!rangeStr.trim()) return set;
    const parts = rangeStr.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
          set.add(i - 1);
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= pageCount) {
          set.add(num - 1);
        }
      }
    }
    return set;
  }, [rangeStr, pageCount]);

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

  const handleSplit = useCallback((): void => {
    if (!file) return;
    split(file, mode, rangeStr, Array.from(selectedPages));
  }, [file, mode, rangeStr, selectedPages, split]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPageCount(0);
    setRangeStr("");
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
        {result.blobs.length === 1 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
            <p className="text-sm font-medium">Extracted {result.totalPages} pages</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(result.blobs[0].blob.size)}
            </p>
            <Button
              className="gap-2"
              onClick={() => downloadBlob(result.blobs[0].blob, result.blobs[0].fileName)}
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">{result.blobs.length} PDFs created</p>
            <Button className="w-full h-11 gap-2" onClick={downloadAllAsZip}>
              <Download className="h-4 w-4" /> Download All as ZIP
            </Button>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {result.blobs.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-2"
                >
                  <span className="text-xs truncate">{b.fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadBlob(b.blob, b.fileName)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Split Another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
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
              <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
            </CardContent>
          </Card>

          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="range" className="flex-1">
                Page Range
              </TabsTrigger>
              <TabsTrigger value="extract" className="flex-1">
                Select Pages
              </TabsTrigger>
              <TabsTrigger value="every-page" className="flex-1">
                Split All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="range" className="pt-4 space-y-3">
              <Label>Enter page range</Label>
              <Input
                placeholder="e.g., 1-3, 5, 7-10"
                value={rangeStr}
                onChange={(e) => setRangeStr(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {rangeHighlight.size > 0
                  ? `${rangeHighlight.size} of ${pageCount} pages selected`
                  : `Valid pages: 1 to ${pageCount}`}
              </p>
            </TabsContent>

            <TabsContent value="extract" className="pt-4 space-y-3">
              <Label>Select pages to extract</Label>
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
            </TabsContent>

            <TabsContent value="every-page" className="pt-4">
              <p className="text-sm text-muted-foreground">
                Creates a separate PDF for each of the {pageCount} pages. Downloads as ZIP.
              </p>
            </TabsContent>
          </Tabs>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Splitting PDF... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleSplit}>
              <Scissors className="h-4 w-4" />
              {mode === "every-page" ? `Create ${pageCount} PDFs` : "Split PDF"}
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
