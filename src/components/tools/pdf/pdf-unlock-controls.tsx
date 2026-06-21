"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Unlock, Download, FileText, ShieldAlert, RefreshCw, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function PdfUnlockControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setResultBlob(null);
    setPassword("");
  }, []);

  const handleUnlock = useCallback(async (): Promise<void> => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(buffer, {
        password,
      } as Parameters<typeof PDFDocument.load>[1]);
      const count = pdfDoc.getPageCount();
      setPageCount(count);

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unlock PDF";
      if (message.toLowerCase().includes("password") || message.toLowerCase().includes("encrypt")) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setProcessing(false);
    }
  }, [file, password]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPassword("");
    setResultBlob(null);
    setError(null);
    setPageCount(0);
  }, []);

  if (resultBlob) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">PDF unlocked successfully — {pageCount} pages</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
          <Button className="gap-2" onClick={() => downloadBlob(resultBlob, "unlocked.pdf")}>
            <Download className="h-4 w-4" /> Download Unlocked PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Unlock Another PDF
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
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">You must know the password</p>
                <p className="mt-1">
                  This tool removes password protection from PDFs when you provide the correct
                  password. It does not crack or bypass unknown passwords.
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

          <div className="space-y-1.5">
            <Label>Enter PDF password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the PDF password"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleUnlock();
              }}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Unlock className="h-4 w-4 animate-pulse" />
              <span>Attempting to unlock...</span>
            </div>
          ) : (
            <Button
              className="w-full h-11 gap-2"
              onClick={() => void handleUnlock()}
              disabled={!password}
            >
              <Unlock className="h-4 w-4" /> Unlock PDF
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
