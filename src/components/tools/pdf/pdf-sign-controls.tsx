"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { PenLine, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { DownloadButton } from "@/components/shared/download-button";
import { Button } from "@/components/ui/button";
import { FILE_LIMITS } from "@/lib/constants/file-limits";

interface Placement {
  page: number;
  xPct: number;
  yPct: number;
  widthPct: number;
}

async function renderPreviewPages(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const out: string[] = [];
  const max = Math.min(5, pdf.numPages);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.8 });
    const c = document.createElement("canvas");
    c.width = viewport.width;
    c.height = viewport.height;
    const ctx = c.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas: c } as Parameters<
      typeof page.render
    >[0]).promise;
    out.push(c.toDataURL("image/png"));
  }
  return out;
}

export function PdfSignControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [signaturePng, setSignaturePng] = useState<string | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<Blob | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    const run = async (): Promise<void> => {
      if (cancelled) return;
      setLoadingPages(true);
      try {
        const pages = await renderPreviewPages(file);
        if (!cancelled) {
          setPreviewPages(pages);
          setPlacements([]);
          setOutput(null);
          setLoadingPages(false);
        }
      } catch {
        if (!cancelled) setLoadingPages(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    drawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    lastPtRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>): void => {
    if (!drawingRef.current) return;
    const c = sigCanvasRef.current;
    if (!c || !lastPtRef.current) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPtRef.current = { x, y };
  };

  const endDraw = (): void => {
    drawingRef.current = false;
    lastPtRef.current = null;
    const c = sigCanvasRef.current;
    if (c) setSignaturePng(c.toDataURL("image/png"));
  };

  const clearSig = (): void => {
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setSignaturePng(null);
  };

  const onPlace = useCallback(
    (pageIdx: number, e: React.MouseEvent<HTMLImageElement>): void => {
      if (!signaturePng) {
        toast.error("Draw a signature first");
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width;
      const yPct = (e.clientY - rect.top) / rect.height;
      setPlacements((prev) => [...prev, { page: pageIdx + 1, xPct, yPct, widthPct: 0.2 }]);
    },
    [signaturePng]
  );

  const removePlacement = useCallback((i: number): void => {
    setPlacements((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const applyAndDownload = useCallback(async (): Promise<void> => {
    if (!file || !signaturePng || placements.length === 0) return;
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const png = await doc.embedPng(signaturePng);
      const pages = doc.getPages();
      for (const p of placements) {
        const page = pages[p.page - 1];
        if (!page) continue;
        const { width, height } = page.getSize();
        const w = width * p.widthPct;
        const h = w * (png.height / png.width);
        page.drawImage(png, {
          x: width * p.xPct - w / 2,
          y: height * (1 - p.yPct) - h / 2,
          width: w,
          height: h,
        });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setOutput(blob);
      toast.success("Signature placed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [file, signaturePng, placements]);

  return (
    <div className="space-y-5">
      <FileDropzone
        accept={FILE_LIMITS.pdf.acceptString}
        acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
        maxSize={FILE_LIMITS.pdf.maxSize}
        maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
        onFilesSelected={(f) => setFile(f[0] ?? null)}
      />

      {file && (
        <>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">1. Draw your signature</p>
              <Button size="sm" variant="ghost" onClick={clearSig} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
            <canvas
              ref={sigCanvasRef}
              width={500}
              height={150}
              className="w-full aspect-[10/3] border border-dashed border-border rounded-md bg-white touch-none"
              onPointerDown={startDraw}
              onPointerMove={moveDraw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
            />
            <p className="text-xs text-muted-foreground">
              Sign with finger / stylus / mouse above.
            </p>
          </div>

          {loadingPages && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading page previews...</span>
            </div>
          )}

          {previewPages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                2. Tap on any page where you want to place the signature
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewPages.map((p, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden border border-border bg-card cursor-crosshair"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p}
                      alt={`Page ${i + 1}`}
                      className="w-full block"
                      onClick={(e) => onPlace(i, e)}
                    />
                    {placements
                      .filter((pl) => pl.page === i + 1)
                      .map((pl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => removePlacement(placements.indexOf(pl))}
                          aria-label="Remove placement"
                          className="absolute w-5 h-5 -mt-2.5 -ml-2.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center hover:bg-primary/90"
                          style={{ left: `${pl.xPct * 100}%`, top: `${pl.yPct * 100}%` }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1.5">
                      Page {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {placements.length > 0 && !output && (
            <Button
              onClick={() => void applyAndDownload()}
              disabled={busy}
              className="w-full gap-2"
              size="lg"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PenLine className="h-4 w-4" />
              )}
              Apply {placements.length} signature{placements.length === 1 ? "" : "s"} &amp; download
            </Button>
          )}

          {output && (
            <DownloadButton
              blob={output}
              fileName={file.name.replace(/\.pdf$/i, "-signed.pdf")}
              originalSize={file.size}
            />
          )}
        </>
      )}
    </div>
  );
}
