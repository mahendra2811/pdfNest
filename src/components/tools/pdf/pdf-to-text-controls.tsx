"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Copy, Download, AlertTriangle, RefreshCw, X, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function PdfToTextControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setText("");
    setError(null);
  }, []);

  const handleExtract = useCallback(async (): Promise<void> => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setText("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const buffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items
          .filter((item) => "str" in item)
          .map((item) => (item as { str: string }).str);
        pages.push(`--- Page ${i} ---\n${strings.join(" ")}`);
      }

      const result = pages.join("\n\n");
      setText(result || "No text content found. This may be a scanned PDF.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text");
    } finally {
      setProcessing(false);
    }
  }, [file]);

  const handleCopy = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleDownloadTxt = useCallback((): void => {
    const blob = new Blob([text], { type: "text/plain" });
    const name = file ? file.name.replace(/\.pdf$/i, ".txt") : "extracted-text.txt";
    downloadBlob(blob, name);
  }, [text, file]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setText("");
    setError(null);
  }, []);

  if (text) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Extracted Text</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void handleCopy()}
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy All"}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleDownloadTxt}>
              <Download className="h-3.5 w-3.5" /> Download .txt
            </Button>
          </div>
        </div>
        <textarea
          readOnly
          value={text}
          className="w-full h-80 rounded-xl border border-border bg-muted/30 p-4 text-sm font-mono resize-y focus:outline-none"
        />
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Extract Another PDF
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <>
          <FileDropzone
            accept={FILE_LIMITS.pdf.acceptString}
            acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
            maxSize={FILE_LIMITS.pdf.maxSize}
            maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
            onFilesSelected={handleFilesSelected}
          />
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Note about scanned PDFs</p>
                <p className="mt-1">
                  This tool extracts embedded text from PDFs. Scanned documents (image-based PDFs)
                  may return little or no text. OCR is not supported in this version.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card className="group">
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Extracting text...</span>
            </div>
          ) : (
            <Button className="w-full h-11 gap-2" onClick={() => void handleExtract()}>
              <FileText className="h-4 w-4" /> Extract Text
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
