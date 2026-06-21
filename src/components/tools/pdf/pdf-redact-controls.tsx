"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeOff, Loader2, X, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { downloadBlob } from "@/lib/utils/download-helpers";

interface Region {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

type PageData = { dataUrl: string; width: number; height: number };

async function renderPdfPages(file: File): Promise<PageData[]> {
  const buf = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const out: PageData[] = [];
  const max = Math.min(20, pdf.numPages);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const c = document.createElement("canvas");
    c.width = viewport.width;
    c.height = viewport.height;
    const ctx = c.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas: c } as Parameters<
      typeof page.render
    >[0]).promise;
    out.push({
      dataUrl: c.toDataURL("image/jpeg", 0.9),
      width: viewport.width,
      height: viewport.height,
    });
  }
  return out;
}

export function PdfRedactControls(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [drawing, setDrawing] = useState<{
    page: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    const run = async (): Promise<void> => {
      if (cancelled) return;
      setLoading(true);
      try {
        const out = await renderPdfPages(file);
        if (!cancelled) {
          setPages(out);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const startMark = (pageIdx: number, e: React.PointerEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDrawing({
      page: pageIdx,
      startX: (e.clientX - rect.left) / rect.width,
      startY: (e.clientY - rect.top) / rect.height,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const finishMark = useCallback(
    (pageIdx: number, e: React.PointerEvent<HTMLDivElement>): void => {
      if (!drawing || drawing.page !== pageIdx) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const endX = (e.clientX - rect.left) / rect.width;
      const endY = (e.clientY - rect.top) / rect.height;
      const x = Math.min(drawing.startX, endX);
      const y = Math.min(drawing.startY, endY);
      const w = Math.abs(endX - drawing.startX);
      const h = Math.abs(endY - drawing.startY);
      if (w > 0.005 && h > 0.005) {
        setRegions((prev) => [...prev, { page: pageIdx + 1, x, y, w, h }]);
      }
      setDrawing(null);
    },
    [drawing]
  );

  const removeRegion = useCallback((i: number): void => {
    setRegions((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const apply = useCallback(async (): Promise<void> => {
    if (!file || pages.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const first = pages[0];
      const pdf = new jsPDF({
        orientation: first.width > first.height ? "landscape" : "portrait",
        unit: "px",
        format: [first.width, first.height],
      });

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        if (i > 0) {
          pdf.addPage([p.width, p.height], p.width > p.height ? "landscape" : "portrait");
        }
        pdf.addImage(p.dataUrl, "JPEG", 0, 0, p.width, p.height);
        pdf.setFillColor(0, 0, 0);
        for (const r of regions.filter((reg) => reg.page === i + 1)) {
          pdf.rect(r.x * p.width, r.y * p.height, r.w * p.width, r.h * p.height, "F");
        }
      }
      const blob = pdf.output("blob");
      setOutput(blob);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [file, pages, regions]);

  const handleReset = useCallback((): void => {
    setFile(null);
    setPages([]);
    setRegions([]);
    setOutput(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-5">
      <FileDropzone
        accept={FILE_LIMITS.pdf.acceptString}
        acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
        maxSize={FILE_LIMITS.pdf.maxSize}
        maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
        onFilesSelected={(f) => setFile(f[0] ?? null)}
      />

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
        <p className="font-semibold">Important: Visual redaction by rasterization</p>
        <p className="text-muted-foreground">
          Output is a rasterized PDF — selectable text is destroyed (good for redaction), but the
          file becomes larger and not searchable.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Rendering PDF pages...</span>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {pages.length > 0 && (
        <>
          <p className="text-sm font-semibold">
            Click-and-drag to mark redaction regions ({regions.length} so far)
          </p>
          <div className="space-y-4 max-h-[60dvh] overflow-y-auto">
            {pages.map((p, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-muted-foreground">Page {i + 1}</p>
                <div
                  className="relative inline-block max-w-full select-none touch-none"
                  onPointerDown={(e) => startMark(i, e)}
                  onPointerUp={(e) => finishMark(i, e)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.dataUrl}
                    alt={`Page ${i + 1}`}
                    className="block max-w-full"
                    draggable={false}
                  />
                  {regions
                    .filter((r) => r.page === i + 1)
                    .map((r, idx) => (
                      <div
                        key={idx}
                        className="absolute bg-black/90 ring-2 ring-red-500"
                        style={{
                          left: `${r.x * 100}%`,
                          top: `${r.y * 100}%`,
                          width: `${r.w * 100}%`,
                          height: `${r.h * 100}%`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRegion(regions.indexOf(r));
                          }}
                          aria-label="Remove region"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {regions.length > 0 && !output && (
            <Button onClick={() => void apply()} disabled={busy} className="w-full gap-2 h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
              Apply Redaction &amp; Download
            </Button>
          )}

          {output && file && (
            <div className="space-y-3">
              <Button
                className="w-full gap-2 h-11"
                onClick={() => downloadBlob(output, file.name.replace(/\.pdf$/i, "-redacted.pdf"))}
              >
                <Download className="h-4 w-4" /> Download Redacted PDF
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleReset}>
                <RefreshCw className="h-3.5 w-3.5" /> Redact Another
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
