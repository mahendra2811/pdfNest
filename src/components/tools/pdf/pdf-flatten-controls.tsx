"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, Loader2, Download, RefreshCw, FileText, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { PDFDocument } from "pdf-lib";

export function PdfFlattenControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; size: number } | null>(null);

  const handleFilesSelected = useCallback((files: File[]): void => {
    setFile(files[0] ?? null);
    setError(null);
    setOutput(null);
  }, []);

  const handleFlatten = useCallback(async (): Promise<void> => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { updateMetadata: false });
      try {
        const form = doc.getForm();
        form.flatten();
      } catch {
        // No form fields — still save the PDF
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setOutput({ blob, size: blob.size });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [file]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setError(null);
    setOutput(null);
  }, []);

  if (output && file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">PDF flattened successfully</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(output.size)}</p>
          <Button
            className="gap-2"
            onClick={() => downloadBlob(output.blob, file.name.replace(/\.pdf$/i, "-flat.pdf"))}
          >
            <Download className="h-4 w-4" /> Download Flattened PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Flatten Another
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
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Flattening merges form fields and annotations permanently into the page content. After
            flattening, interactive fields cannot be edited.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full h-11 gap-2"
            onClick={() => void handleFlatten()}
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
            {busy ? "Flattening..." : "Flatten PDF"}
          </Button>

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
            Upload Different File
          </Button>
        </motion.div>
      )}
    </div>
  );
}
