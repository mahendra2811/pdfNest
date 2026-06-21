"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FilePlus, Download, FileText, RefreshCw, X, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

type Position = "before" | "after" | "end";
type BlankSize = "same" | "a4";

export function PdfAddBlankControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("end");
  const [targetPage, setTargetPage] = useState<number>(1);
  const [blankCount, setBlankCount] = useState<number>(1);
  const [blankSize, setBlankSize] = useState<BlankSize>("same");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setResultBlob(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setPageCount(count);
      setTargetPage(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
    }
  }, []);

  const handleAddBlank = useCallback(async (): Promise<void> => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      for (let i = 0; i < blankCount; i++) {
        let width = 595.28;
        let height = 841.89;

        if (blankSize === "same" && pdfDoc.getPageCount() > 0) {
          const refPageIdx = Math.min(targetPage - 1, pdfDoc.getPageCount() - 1);
          const refPage = pdfDoc.getPage(Math.max(0, refPageIdx));
          const { width: pw, height: ph } = refPage.getSize();
          width = pw;
          height = ph;
        }

        if (position === "end") {
          pdfDoc.addPage([width, height]);
        } else if (position === "before") {
          pdfDoc.insertPage(targetPage - 1 + i, [width, height]);
        } else {
          pdfDoc.insertPage(targetPage + i, [width, height]);
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add blank pages");
    } finally {
      setProcessing(false);
    }
  }, [file, position, targetPage, blankCount, blankSize]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPageCount(0);
    setResultBlob(null);
    setError(null);
    setPosition("end");
    setTargetPage(1);
    setBlankCount(1);
    setBlankSize("same");
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
            Added {blankCount} blank page(s) — now {pageCount + blankCount} pages total
          </p>
          <p className="text-xs text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
          <Button
            className="gap-2"
            onClick={() => downloadBlob(resultBlob, "with-blank-pages.pdf")}
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["before", "Before page"],
                    ["after", "After page"],
                    ["end", "At end"],
                  ] as [Position, string][]
                ).map(([val, label]) => (
                  <Button
                    key={val}
                    variant={position === val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPosition(val)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {position !== "end" && (
              <div className="space-y-2">
                <Label>Page number (1 to {pageCount})</Label>
                <Input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={targetPage}
                  onChange={(e) =>
                    setTargetPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Number of blank pages (1 to 10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={blankCount}
                onChange={(e) => setBlankCount(Math.max(1, Math.min(10, Number(e.target.value))))}
              />
            </div>

            <div className="space-y-2">
              <Label>Blank page size</Label>
              <div className="flex gap-2">
                <Button
                  variant={blankSize === "same" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBlankSize("same")}
                >
                  Same as existing
                </Button>
                <Button
                  variant={blankSize === "a4" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBlankSize("a4")}
                >
                  A4
                </Button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding blank pages...</span>
            </div>
          ) : (
            <Button className="w-full h-11 gap-2" onClick={() => void handleAddBlank()}>
              <FilePlus className="h-4 w-4" /> Add {blankCount} Blank Page(s)
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
