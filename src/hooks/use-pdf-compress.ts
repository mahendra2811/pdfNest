import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface PdfCompressState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfCompressReturn {
  state: PdfCompressState;
  compress: (file: File) => Promise<void>;
  reset: () => void;
  result: { blob: Blob; originalSize: number; compressedSize: number } | null;
}

export function usePdfCompress(): PdfCompressReturn {
  const [state, setState] = useState<PdfCompressState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const processingRef = useRef(false);

  const compress = useCallback(async (file: File): Promise<void> => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      setState({ status: "processing", progress: 20 });
      const buffer = await readFileAsArrayBuffer(file);
      setState({ status: "processing", progress: 50 });
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setState({ status: "processing", progress: 80 });
      const compressedBytes = await pdfDoc.save();
      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: "application/pdf" });

      setResult({ blob, originalSize: file.size, compressedSize: blob.size });
      setState({ status: "complete", progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Compression failed",
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

  return { state, compress, reset, result };
}
