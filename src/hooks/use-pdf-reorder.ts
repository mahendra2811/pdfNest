import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface PdfReorderState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfReorderReturn {
  state: PdfReorderState;
  reorder: (file: File, newOrder: number[], deletedPages: number[]) => Promise<void>;
  reset: () => void;
  result: { blob: Blob; pageCount: number } | null;
}

export function usePdfReorder(): PdfReorderReturn {
  const [state, setState] = useState<PdfReorderState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const processingRef = useRef(false);

  const reorder = useCallback(
    async (file: File, newOrder: number[], deletedPages: number[]): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 20 });
        const buffer = await readFileAsArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

        const filteredOrder = newOrder.filter((idx) => !deletedPages.includes(idx));

        if (filteredOrder.length === 0) {
          setState({ status: "error", progress: 0, error: "Cannot create PDF with no pages" });
          return;
        }

        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, filteredOrder);
        pages.forEach((page) => newPdf.addPage(page));

        setState({ status: "processing", progress: 80 });
        const savedBytes = await newPdf.save();
        const blob = new Blob([savedBytes as unknown as BlobPart], { type: "application/pdf" });

        setResult({ blob, pageCount: filteredOrder.length });
        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Reorder failed",
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

  return { state, reorder, reset, result };
}
