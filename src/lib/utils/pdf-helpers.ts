import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjsLib(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((lib) => {
      if (typeof window !== "undefined") {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      return lib;
    });
  }
  return pdfjsLibPromise;
}

export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjsLib = await getPdfjsLib();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
}

export async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  const doc = await loadPdfDocument(arrayBuffer);
  const count = doc.numPages;
  doc.destroy();
  return count;
}

export async function renderPdfPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2d context");
  await page
    .render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0])
    .promise;
  return canvas;
}
