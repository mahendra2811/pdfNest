"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Download, FileText, RefreshCw, X, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

export function PdfDuplicateControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [copies, setCopies] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setResultBlob(null);
    setSelectedPages(new Set());

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
    }
  }, []);

  const togglePage = useCallback((pageIdx: number): void => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageIdx)) next.delete(pageIdx);
      else next.add(pageIdx);
      return next;
    });
  }, []);

  const handleDuplicate = useCallback(async (): Promise<void> => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const sortedPages = Array.from(selectedPages).sort((a, b) => b - a);

      for (const pageIdx of sortedPages) {
        const [copiedPage] = await pdfDoc.copyPages(pdfDoc, [pageIdx]);
        for (let c = 0; c < copies; c++) {
          pdfDoc.insertPage(pageIdx + 1 + c, copiedPage);
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate pages");
    } finally {
      setProcessing(false);
    }
  }, [file, selectedPages, copies]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
    setResultBlob(null);
    setError(null);
    setCopies(1);
  }, []);

  if (resultBlob) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">
            Duplicated {selectedPages.size} page(s) × {copies} {copies === 1 ? "copy" : "copies"}
          </p>
          <p className="text-xs text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
          <Button
            className="gap-2"
            onClick={() => downloadBlob(resultBlob, "duplicated-pages.pdf")}
          >
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Process Another PDF
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
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} — {pageCount} page(s)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Select pages to duplicate</Label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => togglePage(i)}
                  className={`w-10 h-10 rounded-lg border text-xs font-medium transition-colors ${
                    selectedPages.has(i)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{selectedPages.size} page(s) selected</p>
          </div>

          <div className="space-y-2">
            <Label>Number of copies (1 to 5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Math.min(5, Number(e.target.value))))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Duplicating pages...</span>
            </div>
          ) : (
            <Button
              className="w-full h-11 gap-2"
              onClick={() => void handleDuplicate()}
              disabled={selectedPages.size === 0}
            >
              <Copy className="h-4 w-4" /> Duplicate {selectedPages.size} Page(s)
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
