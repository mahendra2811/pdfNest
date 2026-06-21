"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Merge, GripVertical, X, Plus, Download, FileText, RefreshCw } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePdfMerge } from "@/hooks/use-pdf-merge";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { loadPdfDocument, renderPdfPageToCanvas } from "@/lib/utils/pdf-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

interface PdfInfo {
  file: File;
  pageCount: number;
  error?: string;
  thumbUrl?: string;
}

export function MergeControls(): React.ReactElement {
  const { state, loadFiles, merge, reset, result } = usePdfMerge();
  const [pdfInfos, setPdfInfos] = useState<PdfInfo[]>([]);
  const dragIdx = useRef<number | null>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback(
    async (files: File[]): Promise<void> => {
      const infos = await loadFiles(files);

      // Generate first-page thumbnails for each file
      const withThumbs: PdfInfo[] = await Promise.all(
        infos.map(async (info) => {
          if (info.error) return info;
          try {
            const buffer = await readFileAsArrayBuffer(info.file);
            const doc = await loadPdfDocument(buffer);
            const canvas = await renderPdfPageToCanvas(doc, 1, 0.3);
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.6);
            });
            canvas.width = 0;
            canvas.height = 0;
            doc.destroy();
            return { ...info, thumbUrl: URL.createObjectURL(blob) };
          } catch {
            return info;
          }
        })
      );

      setPdfInfos((prev) => [...prev, ...withThumbs].slice(0, 20));
    },
    [loadFiles]
  );

  const removeFile = useCallback((idx: number): void => {
    setPdfInfos((prev) => {
      const removed = prev[idx];
      if (removed?.thumbUrl) URL.revokeObjectURL(removed.thumbUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const handleDragStart = useCallback((idx: number): void => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number): void => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setPdfInfos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  }, []);

  const handleMerge = useCallback((): void => {
    const validFiles = pdfInfos.filter((p) => !p.error).map((p) => p.file);
    merge(validFiles);
  }, [pdfInfos, merge]);

  const handleReset = useCallback((): void => {
    pdfInfos.forEach((info) => {
      if (info.thumbUrl) URL.revokeObjectURL(info.thumbUrl);
    });
    setPdfInfos([]);
    reset();
  }, [reset, pdfInfos]);

  // Cleanup on unmount
  const pdfInfosRef = useRef(pdfInfos);
  useEffect(() => {
    pdfInfosRef.current = pdfInfos;
  }, [pdfInfos]);
  useEffect(
    () => () => {
      pdfInfosRef.current.forEach((info) => {
        if (info.thumbUrl) URL.revokeObjectURL(info.thumbUrl);
      });
    },
    []
  );

  const totalPages = pdfInfos.reduce((sum, p) => sum + p.pageCount, 0);
  const validCount = pdfInfos.filter((p) => !p.error).length;

  if (state.status === "complete" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">
            Merged PDF — {result.pageCount} page{result.pageCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">{formatFileSize(result.size)}</p>
          {result.skippedFiles.length > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Skipped {result.skippedFiles.length} file(s): {result.skippedFiles.join(", ")}
            </p>
          )}
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, "merged.pdf")}>
            <Download className="h-4 w-4" /> Download Merged PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Merge More
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {pdfInfos.length === 0 ? (
        <FileDropzone
          accept={FILE_LIMITS.pdfMax.acceptString}
          acceptedTypes={FILE_LIMITS.pdfMax.acceptedTypes}
          maxSize={FILE_LIMITS.pdfMax.maxSize}
          maxSizeLabel={FILE_LIMITS.pdfMax.maxSizeLabel}
          multiple
          maxFiles={80}
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {pdfInfos.map((info, i) => (
              <div
                key={`${info.file.name}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                className="flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing hover:bg-muted/30 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                {info.thumbUrl ? (
                  <div className="w-8 h-10 rounded border border-border overflow-hidden shrink-0 bg-muted/30">
                    <img
                      src={info.thumbUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{info.file.name}</p>
                  {info.error && <p className="text-xs text-destructive">{info.error}</p>}
                </div>
                {!info.error && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {info.pageCount} pg
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs shrink-0">
                  {formatFileSize(info.file.size)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {validCount} files, {totalPages} total pages
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => extraInputRef.current?.click()}
            >
              <Plus className="h-3.5 w-3.5" /> Add More
            </Button>
            <input
              ref={extraInputRef}
              type="file"
              accept={FILE_LIMITS.pdfMax.acceptString}
              multiple
              className="hidden"
              onChange={async (e) => {
                if (e.target.files) await handleFilesSelected(Array.from(e.target.files));
              }}
            />
          </div>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Merging PDFs... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleMerge} disabled={validCount < 2}>
              <Merge className="h-4 w-4" /> Merge {validCount} PDF{validCount !== 1 ? "s" : ""}
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Start Over
          </Button>
        </motion.div>
      )}
    </div>
  );
}
