"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowDownUp, Download, RefreshCw, FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePdfReorder } from "@/hooks/use-pdf-reorder";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

export function ReorderControls(): React.ReactElement {
  const { state, reorder, reset, result } = usePdfReorder();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const dragIdx = useRef<number | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    try {
      const buffer = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setOrder(Array.from({ length: count }, (_, i) => i));
      setDeleted(new Set());
    } catch {
      setPageCount(0);
    }
  }, []);

  const handleDragStart = useCallback((idx: number): void => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number): void => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  }, []);

  const deletePage = useCallback((pageIdx: number): void => {
    setDeleted((prev) => new Set(prev).add(pageIdx));
  }, []);

  const undoDelete = useCallback((pageIdx: number): void => {
    setDeleted((prev) => {
      const next = new Set(prev);
      next.delete(pageIdx);
      return next;
    });
  }, []);

  const reverseOrder = useCallback((): void => {
    setOrder((prev) => [...prev].reverse());
  }, []);

  const resetOrder = useCallback((): void => {
    setOrder(Array.from({ length: pageCount }, (_, i) => i));
    setDeleted(new Set());
  }, [pageCount]);

  const handleSave = useCallback((): void => {
    if (!file) return;
    reorder(file, order, Array.from(deleted));
  }, [file, order, deleted, reorder]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPageCount(0);
    setOrder([]);
    setDeleted(new Set());
    reset();
  }, [reset]);

  const activeCount = order.filter((p) => !deleted.has(p)).length;

  if (state.status === "complete" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">Reordered — {result.pageCount} pages</p>
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, "reordered.pdf")}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Reorder Another
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
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {pageCount} pages
                </span>
                {deleted.size > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {activeCount} active · {deleted.size} removed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Drag pages to reorder. Click ✕ to remove.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {order.map((pageIdx, i) => (
                <div
                  key={`${pageIdx}-${i}`}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                    deleted.has(pageIdx)
                      ? "opacity-40 bg-destructive/5 border-destructive/30"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="w-full aspect-[3/4] rounded bg-muted/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-medium">{pageIdx + 1}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">pg {pageIdx + 1}</span>
                  {deleted.has(pageIdx) ? (
                    <button
                      type="button"
                      onClick={() => undoDelete(pageIdx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]"
                      aria-label="Restore page"
                    >
                      ↩
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deletePage(pageIdx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-[10px] opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Remove page"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={reverseOrder}>
              <ArrowDownUp className="h-3.5 w-3.5" /> Reverse
            </Button>
            <Button variant="outline" size="sm" onClick={resetOrder}>
              Reset Order
            </Button>
          </div>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Reordering PDF... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleSave} disabled={activeCount === 0}>
              <ArrowUpDown className="h-4 w-4" /> Save PDF ({activeCount} pages)
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
