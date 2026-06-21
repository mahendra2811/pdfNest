"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface PdfInfo {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  pageCount: number;
  fileSize: number;
}

export function PdfMetadataViewerControls(): React.ReactElement {
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]): Promise<void> => {
    const f = files[0];
    if (!f) return;
    setError(null);
    setInfo(null);

    try {
      const buffer = await readFileAsArrayBuffer(f);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setInfo({
        title: pdfDoc.getTitle() ?? "N/A",
        author: pdfDoc.getAuthor() ?? "N/A",
        subject: pdfDoc.getSubject() ?? "N/A",
        keywords: pdfDoc.getKeywords() ?? "N/A",
        creator: pdfDoc.getCreator() ?? "N/A",
        producer: pdfDoc.getProducer() ?? "N/A",
        pageCount: pdfDoc.getPageCount(),
        fileSize: f.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
    }
  }, []);

  const handleReset = useCallback((): void => {
    setInfo(null);
    setError(null);
  }, []);

  if (info) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">PDF Information</p>
            </div>
            {(
              [
                ["Title", info.title],
                ["Author", info.author],
                ["Subject", info.subject],
                ["Keywords", info.keywords],
                ["Creator", info.creator],
                ["Producer", info.producer],
                ["Page Count", String(info.pageCount)],
                ["File Size", formatFileSize(info.fileSize)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <Label className="text-muted-foreground shrink-0 min-w-[100px]">{label}</Label>
                <p className="text-sm text-right break-all">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          View Another PDF
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        accept={FILE_LIMITS.pdf.acceptString}
        acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
        maxSize={FILE_LIMITS.pdf.maxSize}
        maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
        onFilesSelected={(files) => void handleFilesSelected(files)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
