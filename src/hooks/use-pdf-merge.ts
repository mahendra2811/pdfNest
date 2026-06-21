import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface PdfFileInfo {
  file: File;
  pageCount: number;
  error?: string;
}

interface PdfMergeState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfMergeReturn {
  state: PdfMergeState;
  loadFiles: (files: File[]) => Promise<PdfFileInfo[]>;
  merge: (files: File[]) => Promise<void>;
  reset: () => void;
  result: { blob: Blob; pageCount: number; size: number; skippedFiles: string[] } | null;
}

export function usePdfMerge(): PdfMergeReturn {
  const [state, setState] = useState<PdfMergeState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<{
    blob: Blob;
    pageCount: number;
    size: number;
    skippedFiles: string[];
  } | null>(null);
  const processingRef = useRef(false);

  const loadFiles = useCallback(async (files: File[]): Promise<PdfFileInfo[]> => {
    const infos: PdfFileInfo[] = [];
    for (const file of files) {
      try {
        const buffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        infos.push({ file, pageCount: pdf.getPageCount() });
      } catch {
        infos.push({
          file,
          pageCount: 0,
          error: `"${file.name}" may be corrupted or password-protected.`,
        });
      }
    }
    return infos;
  }, []);

  const merge = useCallback(async (files: File[]): Promise<void> => {
    if (processingRef.current) return;
    if (files.length < 2) {
      setState({ status: "error", progress: 0, error: "Need at least 2 PDFs to merge" });
      return;
    }
    processingRef.current = true;
    try {
      setState({ status: "processing", progress: 0 });
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;
      const skippedFiles: string[] = [];

      for (let i = 0; i < files.length; i++) {
        setState((prev) => ({ ...prev, progress: Math.round((i / files.length) * 90) }));
        try {
          const buffer = await readFileAsArrayBuffer(files[i]);
          const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
          totalPages += pdf.getPageCount();
        } catch {
          skippedFiles.push(files[i].name);
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });

      setResult({ blob, pageCount: totalPages, size: blob.size, skippedFiles });
      setState({ status: "complete", progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Merge failed",
      });
    } finally {
      processingRef.current = false;
    }
  }, []);

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setResult(null);
  }, []);

  return { state, loadFiles, merge, reset, result };
}
