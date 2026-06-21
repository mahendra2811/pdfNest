import { useState, useCallback, useRef } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  rotation: number;
  position: WatermarkPosition;
}

interface PdfWatermarkState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfWatermarkReturn {
  state: PdfWatermarkState;
  settings: WatermarkSettings;
  updateSettings: (patch: Partial<WatermarkSettings>) => void;
  applyWatermark: (file: File) => Promise<void>;
  reset: () => void;
  result: { blob: Blob; pageCount: number } | null;
}

const DEFAULT_SETTINGS: WatermarkSettings = {
  text: "CONFIDENTIAL",
  fontSize: 50,
  color: { r: 0.75, g: 0.75, b: 0.75 },
  opacity: 0.3,
  rotation: -45,
  position: "center",
};

export function usePdfWatermark(): PdfWatermarkReturn {
  const [state, setState] = useState<PdfWatermarkState>({ status: "idle", progress: 0 });
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const processingRef = useRef(false);

  const updateSettings = useCallback((patch: Partial<WatermarkSettings>): void => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyWatermark = useCallback(
    async (file: File): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 20 });
        const buffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);

          let x: number;
          let y: number;

          switch (settings.position) {
            case "top-left":
              x = 50;
              y = height - 50;
              break;
            case "top-right":
              x = width - textWidth - 50;
              y = height - 50;
              break;
            case "bottom-left":
              x = 50;
              y = 50;
              break;
            case "bottom-right":
              x = width - textWidth - 50;
              y = 50;
              break;
            default:
              x = (width - textWidth) / 2;
              y = height / 2;
          }

          page.drawText(settings.text, {
            x,
            y,
            size: settings.fontSize,
            font,
            color: rgb(settings.color.r, settings.color.g, settings.color.b),
            opacity: settings.opacity,
            rotate: degrees(settings.rotation),
          });

          setState((prev) => ({
            ...prev,
            progress: 20 + Math.round((i / pages.length) * 70),
          }));
        }

        const savedBytes = await pdfDoc.save();
        const blob = new Blob([savedBytes as unknown as BlobPart], { type: "application/pdf" });

        setResult({ blob, pageCount: pages.length });
        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Watermark failed",
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

  return { state, settings, updateSettings, applyWatermark, reset, result };
}
