"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Download, FileText, RefreshCw, X } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize, readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadBlob, downloadZip } from "@/lib/utils/download-helpers";

interface PageImage {
  blob: Blob;
  url: string;
  pageNum: number;
}

export function PdfToJpgControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<number>(150);
  const [quality, setQuality] = useState<number>(0.85);
  const [images, setImages] = useState<PageImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const imagesRef = useRef<PageImage[]>([]);

  // Keep ref in sync for cleanup
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setImages([]);
    setError(null);
    setProgress(0);
  }, []);

  const handleConvert = useCallback(async (): Promise<void> => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setImages([]);
    setProgress(0);

    try {
      // Dynamic import — worker src set to local /pdf.worker.min.mjs (pdfNest convention)
      const pdfjsLib = await import("pdfjs-dist");
      if (typeof window !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const buffer = await readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const scale = dpi / 72;
      const results: PageImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round(((i - 1) / pdf.numPages) * 90));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<
          typeof page.render
        >[0]).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Canvas to blob failed"))),
            "image/jpeg",
            quality
          );
        });

        // Free canvas memory
        canvas.width = 0;
        canvas.height = 0;

        results.push({
          blob,
          url: URL.createObjectURL(blob),
          pageNum: i,
        });
      }

      setImages(results);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF");
    } finally {
      setProcessing(false);
    }
  }, [file, dpi, quality]);

  const handleDownloadAll = useCallback(async (): Promise<void> => {
    if (images.length === 0) return;
    const files = images.map((img) => ({
      name: `page-${img.pageNum}.jpg`,
      blob: img.blob,
    }));
    await downloadZip(files);
  }, [images]);

  const handleReset = useCallback((): void => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setFile(null);
    setImages([]);
    setError(null);
    setProgress(0);
  }, [images]);

  if (images.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {images.length} page{images.length !== 1 ? "s" : ""} converted
          </p>
          <Button className="gap-2" onClick={handleDownloadAll}>
            <Download className="h-4 w-4" /> Download All as ZIP
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <Card key={img.pageNum} className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-muted">
                <img
                  src={img.url}
                  alt={`Page ${img.pageNum}`}
                  className="w-full h-full object-contain"
                />
                <Badge className="absolute top-2 left-2 text-xs">Page {img.pageNum}</Badge>
              </div>
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(img.blob.size)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadBlob(img.blob, `page-${img.pageNum}.jpg`)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Convert Another PDF
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
            <div className="space-y-2">
              <Label>DPI (Resolution)</Label>
              <div className="flex gap-2">
                {[72, 150, 300].map((d) => (
                  <Button
                    key={d}
                    variant={dpi === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDpi(d)}
                  >
                    {d} DPI
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Higher DPI = larger, sharper images</p>
            </div>

            <div className="space-y-2">
              <Label>JPEG Quality: {Math.round(quality * 100)}%</Label>
              <Slider
                min={10}
                max={100}
                step={5}
                value={[Math.round(quality * 100)]}
                onValueChange={(v: number | readonly number[]) =>
                  setQuality((Array.isArray(v) ? (v as number[])[0] : (v as number)) / 100)
                }
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {processing ? (
            <ProcessingIndicator progress={progress} label={`Converting pages... ${progress}%`} />
          ) : (
            <Button className="w-full h-11 gap-2" onClick={handleConvert}>
              <ImageIcon className="h-4 w-4" /> Convert to JPG
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
