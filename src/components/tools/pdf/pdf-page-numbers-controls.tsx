"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Hash, Download, RefreshCw } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePdfPageNumbers,
  type NumberPosition,
  type NumberFormat,
} from "@/hooks/use-pdf-page-numbers";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { downloadBlob } from "@/lib/utils/download-helpers";

const POSITIONS: { value: NumberPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const FORMATS: { value: NumberFormat; label: string; example: string }[] = [
  { value: "plain", label: "Plain", example: "1, 2, 3..." },
  { value: "page-of", label: "Page X of Y", example: "Page 1 of 10" },
  { value: "dash", label: "Dashes", example: "- 1 -" },
  { value: "bracket", label: "Brackets", example: "[ 1 ]" },
];

export function PdfPageNumbersControls(): React.ReactElement {
  const { state, settings, result, updateSettings, addPageNumbers, reset } = usePdfPageNumbers();
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
  }, []);

  const handleApply = useCallback((): void => {
    if (file) void addPageNumbers(file);
  }, [file, addPageNumbers]);

  const handleReset = useCallback((): void => {
    setFile(null);
    reset();
  }, [reset]);

  if (state.status === "complete" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <Hash className="h-10 w-10 mx-auto text-primary" />
          <p className="text-sm font-medium">Page numbers added to {result.pageCount} pages</p>
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, "numbered.pdf")}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Number Another PDF
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept={FILE_LIMITS.pdf.acceptString}
          acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
          maxSize={FILE_LIMITS.pdf.maxSize}
          maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={settings.position}
                  onValueChange={(v) => updateSettings({ position: v as NumberPosition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(v) => updateSettings({ format: v as NumberFormat })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}{" "}
                        <span className="text-muted-foreground text-xs">({f.example})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Font Size</Label>
                  <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Start Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={settings.startNumber}
                  onChange={(e) =>
                    updateSettings({ startNumber: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {[
                    { label: "Black", color: { r: 0, g: 0, b: 0 } },
                    { label: "Gray", color: { r: 0.5, g: 0.5, b: 0.5 } },
                    { label: "Red", color: { r: 0.8, g: 0, b: 0 } },
                  ].map((c) => (
                    <Button
                      key={c.label}
                      variant={
                        settings.color.r === c.color.r &&
                        settings.color.g === c.color.g &&
                        settings.color.b === c.color.b
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateSettings({ color: c.color })}
                    >
                      {c.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Adding page numbers... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleApply}>
              <Hash className="h-4 w-4" /> Add Page Numbers
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Upload Different File
          </Button>
        </motion.div>
      )}
    </div>
  );
}
