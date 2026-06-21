import { useState, useCallback, useRef } from "react";
import { loadImageFromFile } from "@/lib/utils/image-helpers";

type PageSize = "a4" | "letter" | "legal" | "fit";
type Orientation = "portrait" | "landscape" | "auto";
type ImageFit = "contain" | "cover" | "stretch";

interface ImageToPdfSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margin: number;
  imageFit: ImageFit;
  quality: number;
}

interface ImageToPdfState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface ImageToPdfReturn {
  state: ImageToPdfState;
  settings: ImageToPdfSettings;
  updateSettings: (patch: Partial<ImageToPdfSettings>) => void;
  processFiles: (files: File[]) => Promise<void>;
  reset: () => void;
  result: { blob: Blob; fileName: string; pageCount: number; size: number } | null;
}

const PAGE_SIZES: Record<string, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
  legal: { w: 215.9, h: 355.6 },
};

const DEFAULT_SETTINGS: ImageToPdfSettings = {
  pageSize: "a4",
  orientation: "auto",
  margin: 10,
  imageFit: "contain",
  quality: 0.85,
};

export function useImageToPdf(): ImageToPdfReturn {
  const [state, setState] = useState<ImageToPdfState>({ status: "idle", progress: 0 });
  const [settings, setSettings] = useState<ImageToPdfSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<{
    blob: Blob;
    fileName: string;
    pageCount: number;
    size: number;
  } | null>(null);
  const processingRef = useRef(false);

  const updateSettings = useCallback((patch: Partial<ImageToPdfSettings>): void => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const processFiles = useCallback(
    async (files: File[]): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 0 });

        // Dynamic import — never at module load
        const { default: jsPDF } = await import("jspdf");

        let doc: InstanceType<typeof jsPDF> | null = null;

        for (let i = 0; i < files.length; i++) {
          setState((prev) => ({ ...prev, progress: Math.round((i / files.length) * 90) }));
          const img = await loadImageFromFile(files[i]);

          const imgWmm = (img.width * 25.4) / 96;
          const imgHmm = (img.height * 25.4) / 96;

          let orient: "portrait" | "landscape" = "portrait";
          if (settings.orientation === "auto") {
            orient = img.width > img.height ? "landscape" : "portrait";
          } else if (settings.orientation === "landscape") {
            orient = "landscape";
          }

          let pageW: number;
          let pageH: number;

          if (settings.pageSize === "fit") {
            pageW = imgWmm + settings.margin * 2;
            pageH = imgHmm + settings.margin * 2;
          } else {
            const ps = PAGE_SIZES[settings.pageSize];
            pageW = orient === "portrait" ? ps.w : ps.h;
            pageH = orient === "portrait" ? ps.h : ps.w;
          }

          if (i === 0) {
            doc = new jsPDF({
              orientation: orient,
              unit: "mm",
              format: settings.pageSize === "fit" ? [pageW, pageH] : (settings.pageSize as string),
            });
          } else {
            doc!.addPage(
              settings.pageSize === "fit" ? [pageW, pageH] : (settings.pageSize as string),
              orient
            );
          }

          const availW = pageW - settings.margin * 2;
          const availH = pageH - settings.margin * 2;

          let drawW: number;
          let drawH: number;
          let drawX: number;
          let drawY: number;

          if (settings.imageFit === "contain") {
            const scale = Math.min(availW / imgWmm, availH / imgHmm);
            drawW = imgWmm * scale;
            drawH = imgHmm * scale;
            drawX = settings.margin + (availW - drawW) / 2;
            drawY = settings.margin + (availH - drawH) / 2;
          } else if (settings.imageFit === "cover") {
            const scale = Math.max(availW / imgWmm, availH / imgHmm);
            drawW = imgWmm * scale;
            drawH = imgHmm * scale;
            drawX = settings.margin + (availW - drawW) / 2;
            drawY = settings.margin + (availH - drawH) / 2;
          } else {
            drawW = availW;
            drawH = availH;
            drawX = settings.margin;
            drawY = settings.margin;
          }

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", settings.quality);

          // Free GPU memory
          canvas.width = 0;
          canvas.height = 0;

          doc!.addImage(dataUrl, "JPEG", drawX, drawY, drawW, drawH);
        }

        if (!doc) throw new Error("No images to process");

        const blob = doc.output("blob");
        setResult({
          blob,
          fileName: "images.pdf",
          pageCount: files.length,
          size: blob.size,
        });
        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "PDF creation failed",
        });
      } finally {
        processingRef.current = false;
      }
    },
    [settings]
  );

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setResult(null);
  }, []);

  return { state, settings, updateSettings, processFiles, reset, result };
}
