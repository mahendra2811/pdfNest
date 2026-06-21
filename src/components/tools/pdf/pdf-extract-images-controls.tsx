"use client";

import { useState } from "react";
import { Images, Loader2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { DownloadButton } from "@/components/shared/download-button";
import { Button } from "@/components/ui/button";
import { FILE_LIMITS } from "@/lib/constants/file-limits";

export function PdfExtractImagesControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState<{ blob: Blob; count: number } | null>(null);

  const handleExtract = async (): Promise<void> => {
    if (!file) return;
    setBusy(true);
    setOutput(null);
    setProgress(0);

    try {
      const buf = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const zip = new JSZip();
      let count = 0;

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<
          typeof page.render
        >[0]).promise;
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob((b) => res(b), "image/png")
        );
        if (blob) {
          zip.file(`page-${String(p).padStart(3, "0")}.png`, blob);
          count++;
        }
        setProgress(Math.round((p / pdf.numPages) * 100));
      }

      const out = await zip.generateAsync({ type: "blob" });
      setOutput({ blob: out, count });
      toast.success(`Extracted ${count} page${count === 1 ? "" : "s"} as PNG`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropzone
        accept={FILE_LIMITS.pdf.acceptString}
        acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
        maxSize={FILE_LIMITS.pdf.maxSize}
        maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
        onFilesSelected={(f) => setFile(f[0] ?? null)}
      />
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        This extracts each PDF page as a high-resolution PNG image. To pull out only embedded photos
        (not rendered text), you would need a desktop tool.
      </div>
      {file && !output && (
        <Button
          onClick={() => void handleExtract()}
          disabled={busy}
          className="w-full gap-2"
          size="lg"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
          {busy ? `Extracting... ${progress}%` : "Extract pages as PNG ZIP"}
        </Button>
      )}
      {output && (
        <DownloadButton
          blob={output.blob}
          fileName={file?.name.replace(/\.pdf$/i, "-pages.zip") ?? "pages.zip"}
          originalSize={file?.size ?? 0}
        />
      )}
    </div>
  );
}
