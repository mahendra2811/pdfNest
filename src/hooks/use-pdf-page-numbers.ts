import { useState, useCallback, useRef } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

export type NumberPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";
export type NumberFormat = "plain" | "page-of" | "dash" | "bracket";

interface PageNumberSettings {
  position: NumberPosition;
  format: NumberFormat;
  fontSize: number;
  startNumber: number;
  color: { r: number; g: number; b: number };
  margin: number;
}

interface PdfPageNumbersState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfPageNumbersReturn {
  state: PdfPageNumbersState;
  settings: PageNumberSettings;
  result: { blob: Blob; pageCount: number } | null;
  updateSettings: (patch: Partial<PageNumberSettings>) => void;
  addPageNumbers: (file: File) => Promise<void>;
  reset: () => void;
}

const DEFAULT_SETTINGS: PageNumberSettings = {
  position: "bottom-center",
  format: "plain",
  fontSize: 12,
  startNumber: 1,
  color: { r: 0, g: 0, b: 0 },
  margin: 30,
};

function formatPageNumber(format: NumberFormat, currentPage: number, totalPages: number): string {
  switch (format) {
    case "plain":
      return `${currentPage}`;
    case "page-of":
      return `Page ${currentPage} of ${totalPages}`;
    case "dash":
      return `- ${currentPage} -`;
    case "bracket":
      return `[ ${currentPage} ]`;
  }
}

export function usePdfPageNumbers(): PdfPageNumbersReturn {
  const [state, setState] = useState<PdfPageNumbersState>({ status: "idle", progress: 0 });
  const [settings, setSettings] = useState<PageNumberSettings>(DEFAULT_SETTINGS);
  const [result, setResult] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const processingRef = useRef(false);

  const updateSettings = useCallback((patch: Partial<PageNumberSettings>): void => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const addPageNumbers = useCallback(
    async (file: File): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 10 });
        const buffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        setState({ status: "processing", progress: 20 });

        for (let i = 0; i < totalPages; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const pageNum = settings.startNumber + i;
          const text = formatPageNumber(
            settings.format,
            pageNum,
            totalPages + settings.startNumber - 1
          );
          const textWidth = font.widthOfTextAtSize(text, settings.fontSize);

          let x: number;
          let y: number;

          if (settings.position.startsWith("top")) {
            y = height - settings.margin;
          } else {
            y = settings.margin;
          }

          if (settings.position.endsWith("left")) {
            x = settings.margin;
          } else if (settings.position.endsWith("right")) {
            x = width - textWidth - settings.margin;
          } else {
            x = (width - textWidth) / 2;
          }

          page.drawText(text, {
            x,
            y,
            size: settings.fontSize,
            font,
            color: rgb(settings.color.r, settings.color.g, settings.color.b),
          });

          setState((prev) => ({
            ...prev,
            progress: 20 + Math.round(((i + 1) / totalPages) * 70),
          }));
        }

        const savedBytes = await pdfDoc.save();
        const blob = new Blob([savedBytes as unknown as BlobPart], { type: "application/pdf" });

        setResult({ blob, pageCount: totalPages });
        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Failed to add page numbers",
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

  return { state, settings, result, updateSettings, addPageNumbers, reset };
}
