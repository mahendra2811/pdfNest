"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Save, RefreshCw, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

const FIELDS: [keyof PdfMetadata, string][] = [
  ["title", "Title"],
  ["author", "Author"],
  ["subject", "Subject"],
  ["keywords", "Keywords (comma-separated)"],
  ["creator", "Creator"],
  ["producer", "Producer"],
];

export function PdfMetadataEditorControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });
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
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setMetadata({
        title: pdfDoc.getTitle() ?? "",
        author: pdfDoc.getAuthor() ?? "",
        subject: pdfDoc.getSubject() ?? "",
        keywords: pdfDoc.getKeywords() ?? "",
        creator: pdfDoc.getCreator() ?? "",
        producer: pdfDoc.getProducer() ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
    }
  }, []);

  const updateField = useCallback((field: keyof PdfMetadata, value: string): void => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(",").map((k) => k.trim()));
      pdfDoc.setCreator(metadata.creator);
      pdfDoc.setProducer(metadata.producer);

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      setResultBlob(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metadata");
    } finally {
      setProcessing(false);
    }
  }, [file, metadata]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setMetadata({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
    setResultBlob(null);
    setError(null);
  }, []);

  if (resultBlob) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <p className="text-sm font-medium">Metadata updated successfully</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
          <Button
            className="gap-2"
            onClick={() => downloadBlob(resultBlob, "updated-metadata.pdf")}
          >
            <Download className="h-4 w-4" /> Download Updated PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Edit Another PDF
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
          onFilesSelected={(files) => void handleFilesSelected(files)}
        />
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

          <div className="space-y-4">
            {FIELDS.map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={metadata[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Save className="h-4 w-4 animate-pulse" />
              <span>Saving metadata...</span>
            </div>
          ) : (
            <Button className="w-full h-11 gap-2" onClick={() => void handleSave()}>
              <Save className="h-4 w-4" /> Save Changes
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
