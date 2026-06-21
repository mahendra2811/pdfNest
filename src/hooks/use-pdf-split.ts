import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";
import { downloadZip } from "@/lib/utils/download-helpers";

type SplitMode = "range" | "extract" | "every-page";

interface PdfSplitState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface SplitResult {
  blobs: { blob: Blob; fileName: string }[];
  totalPages: number;
}

function parseRange(rangeStr: string, maxPage: number): number[] {
  const indices: Set<number> = new Set();
  const parts = rangeStr.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPage, end); i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const num = Number(part);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        indices.add(num - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

interface PdfSplitReturn {
  state: PdfSplitState;
  split: (file: File, mode: SplitMode, rangeStr: string, selectedPages: number[]) => Promise<void>;
  reset: () => void;
  result: SplitResult | null;
  downloadAllAsZip: () => Promise<void>;
}

export function usePdfSplit(): PdfSplitReturn {
  const [state, setState] = useState<PdfSplitState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<SplitResult | null>(null);
  const processingRef = useRef(false);

  const split = useCallback(
    async (
      file: File,
      mode: SplitMode,
      rangeStr: string,
      selectedPages: number[]
    ): Promise<void> => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        setState({ status: "processing", progress: 0 });
        const buffer = await readFileAsArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const totalPages = sourcePdf.getPageCount();
        const baseName = file.name.replace(/\.pdf$/i, "");

        if (mode === "every-page") {
          const blobs: { blob: Blob; fileName: string }[] = [];
          for (let i = 0; i < totalPages; i++) {
            setState((prev) => ({ ...prev, progress: Math.round((i / totalPages) * 90) }));
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(sourcePdf, [i]);
            newPdf.addPage(page);
            const bytes = await newPdf.save();
            blobs.push({
              blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
              fileName: `${baseName}-page-${i + 1}.pdf`,
            });
          }
          setResult({ blobs, totalPages });
        } else {
          const indices =
            mode === "range"
              ? parseRange(rangeStr, totalPages)
              : selectedPages.sort((a, b) => a - b);
          if (indices.length === 0) {
            setState({ status: "error", progress: 0, error: "No pages selected" });
            return;
          }
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(sourcePdf, indices);
          pages.forEach((page) => newPdf.addPage(page));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
          setResult({
            blobs: [{ blob, fileName: `${baseName}-extracted.pdf` }],
            totalPages: indices.length,
          });
        }

        setState({ status: "complete", progress: 100 });
      } catch (err) {
        setState({
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Split failed",
        });
      } finally {
        processingRef.current = false;
      }
    },
    []
  );

  const downloadAllAsZip = useCallback(async (): Promise<void> => {
    if (result) await downloadZip(result.blobs.map((b) => ({ name: b.fileName, blob: b.blob })));
  }, [result]);

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setResult(null);
  }, []);

  return { state, split, reset, result, downloadAllAsZip };
}
