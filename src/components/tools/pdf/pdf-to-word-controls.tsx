"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw, AlertTriangle } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePdfToWord } from "@/hooks/use-pdf-to-word";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function PdfToWordControls(): React.ReactElement {
  const { state, result, pageCount, convert, reset } = usePdfToWord();
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
  }, []);

  const handleConvert = useCallback((): void => {
    if (file) void convert(file);
  }, [file, convert]);

  const handleReset = useCallback((): void => {
    setFile(null);
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
          <FileText className="h-10 w-10 mx-auto text-primary" />
          <p className="text-sm font-medium">
            Converted {pageCount} page{pageCount !== 1 ? "s" : ""} to Word
          </p>
          <Button
            className="gap-2"
            onClick={() =>
              downloadBlob(result, file?.name.replace(/\.pdf$/i, ".docx") ?? "output.docx")
            }
          >
            <Download className="h-4 w-4" /> Download .docx
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Convert Another PDF
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Limitations</p>
            <p>
              This tool extracts <strong>text content</strong> from your PDF and creates a Word
              document. Complex layouts, images, tables, and formatting may not be preserved. For
              best results, use text-heavy PDFs.
            </p>
          </div>
        </CardContent>
      </Card>

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
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Converting... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleConvert}>
              <FileText className="h-4 w-4" /> Convert to Word
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Upload Different File
          </Button>
        </motion.div>
      )}
    </div>
  );
}
