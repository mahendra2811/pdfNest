import { useState, useCallback, useRef } from "react";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

interface ProcessingState {
  status: "idle" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfToWordReturn {
  state: ProcessingState;
  result: Blob | null;
  pageCount: number;
  convert: (file: File) => Promise<void>;
  reset: () => void;
}

export function usePdfToWord(): PdfToWordReturn {
  const [state, setState] = useState<ProcessingState>({ status: "idle", progress: 0 });
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const processingRef = useRef(false);

  const convert = useCallback(async (file: File): Promise<void> => {
    if (processingRef.current) return;
    processingRef.current = true;
    setState({ status: "processing", progress: 10 });

    try {
      const buffer = await readFileAsArrayBuffer(file);
      setState({ status: "processing", progress: 20 });

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdfDoc.numPages;
      setPageCount(numPages);

      setState({ status: "processing", progress: 30 });

      const pageTexts: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
        pageTexts.push(pageText);
        setState({
          status: "processing",
          progress: 30 + Math.round((i / numPages) * 40),
        });
      }

      setState({ status: "processing", progress: 75 });

      const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");

      const children: InstanceType<typeof Paragraph>[] = [];
      pageTexts.forEach((text, idx) => {
        const chunks = text.split(/\n\n+/).filter((c) => c.trim());
        if (chunks.length === 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text || "(No extractable text on this page)",
                  italics: !text,
                }),
              ],
            })
          );
        } else {
          chunks.forEach((chunk) => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: chunk.trim() })],
                spacing: { after: 200 },
              })
            );
          });
        }

        if (idx < pageTexts.length - 1) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }
      });

      const doc = new Document({ sections: [{ children }] });

      setState({ status: "processing", progress: 90 });

      const docxBlob = await Packer.toBlob(doc);
      setResult(docxBlob);
      setState({ status: "complete", progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Failed to convert PDF to Word",
      });
    } finally {
      processingRef.current = false;
    }
  }, []);

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setResult(null);
    setPageCount(0);
  }, []);

  return { state, result, pageCount, convert, reset };
}
