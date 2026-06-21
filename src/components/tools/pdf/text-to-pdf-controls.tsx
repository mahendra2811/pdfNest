"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/lib/utils/download-helpers";

type PageSize = "a4" | "letter";

const PAGE_SIZES: Record<PageSize, { width: number; height: number; label: string }> = {
  a4: { width: 210, height: 297, label: "A4 (210 × 297 mm)" },
  letter: { width: 215.9, height: 279.4, label: "Letter (8.5 × 11 in)" },
};

export function TextToPdfControls(): React.ReactElement {
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(12);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [margin, setMargin] = useState<number>(20);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(async (): Promise<void> => {
    if (!text.trim()) return;
    setProcessing(true);
    setError(null);

    try {
      const { default: jsPDF } = await import("jspdf");
      const ps = PAGE_SIZES[pageSize];
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize === "a4" ? "a4" : "letter",
      });

      doc.setFontSize(fontSize);

      const maxWidth = ps.width - 2 * margin;
      const lineHeight = fontSize * 0.5;
      const lines = doc.splitTextToSize(text, maxWidth) as string[];

      let cursorY = margin;

      for (const line of lines) {
        if (cursorY + lineHeight > ps.height - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      }

      const blob = doc.output("blob");
      downloadBlob(blob, "text-document.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PDF");
    } finally {
      setProcessing(false);
    }
  }, [text, fontSize, pageSize, margin]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Enter your text</Label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 rounded-xl border border-border bg-muted/30 p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Type or paste your text here..."
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="space-y-2">
          <Label>Font Size</Label>
          <div className="flex gap-2">
            {[10, 12, 14, 16].map((size) => (
              <Button
                key={size}
                variant={fontSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize(size)}
              >
                {size} pt
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Page Size</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(PAGE_SIZES) as [PageSize, (typeof PAGE_SIZES)[PageSize]][]).map(
              ([key, val]) => (
                <Button
                  key={key}
                  variant={pageSize === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPageSize(key)}
                >
                  {val.label}
                </Button>
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Margins</Label>
            <span className="text-sm text-muted-foreground">{margin} mm</span>
          </div>
          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </motion.div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {processing ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating PDF...</span>
        </div>
      ) : (
        <Button
          className="w-full h-11 gap-2"
          onClick={() => void handleConvert()}
          disabled={!text.trim()}
        >
          <FileText className="h-4 w-4" />
          <FileDown className="h-4 w-4" />
          Create PDF
        </Button>
      )}
    </div>
  );
}
