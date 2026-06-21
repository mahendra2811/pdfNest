import { useState, useCallback, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface PdfRotateState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfRotateReturn {
  state: PdfRotateState;
  rotate: (file: File, rotation: 90 | 180 | 270, selectedPages: number[] | "all") => Promise<void>;
  reset: () => void;
  result: { blob: Blob; pageCount: number } | null;
}

export function usePdfRotate(): PdfRotateReturn {
  const [state, setState] = useState<PdfRotateState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const processingRef = useRef(false);

  const rotate = useCallback(
    async (
      file: File,
      rotation: 90 | 180 | 270,
      selectedPages: number[] | "all"
    ): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 20 });
        const buffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();

        const targetIndices = selectedPages === "all" ? pages.map((_, i) => i) : selectedPages;

        for (const idx of targetIndices) {
          if (idx >= 0 && idx < pages.length) {
            const page = pages[idx];
            const current = page.getRotation().angle;
            page.setRotation(degrees(current + rotation));
          }
        }

        setState({ status: "processing", progress: 80 });
        const savedBytes = await pdfDoc.save();
        const blob = new Blob([savedBytes as unknown as BlobPart], { type: "application/pdf" });

        setResult({ blob, pageCount: pages.length });
        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Rotation failed",
        });
      } finally {
        processingRef.current = false;
      }
    },
    []
  );

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setResult(null);
  }, []);

  return { state, rotate, reset, result };
}
