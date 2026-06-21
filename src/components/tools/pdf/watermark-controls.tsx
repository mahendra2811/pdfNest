"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplets, Download, RefreshCw } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePdfWatermark } from "@/hooks/use-pdf-watermark";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { downloadBlob } from "@/lib/utils/download-helpers";
import { cn } from "@/lib/utils";

type WatermarkPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "top-left", label: "TL" },
  { value: "top-right", label: "TR" },
  { value: "center", label: "C" },
  { value: "bottom-left", label: "BL" },
  { value: "bottom-right", label: "BR" },
];

const COLOR_PRESETS = [
  { label: "Gray", r: 0.75, g: 0.75, b: 0.75 },
  { label: "Red", r: 0.9, g: 0.2, b: 0.2 },
  { label: "Blue", r: 0.2, g: 0.2, b: 0.9 },
];

export function WatermarkControls(): React.ReactElement {
  const { state, settings, updateSettings, applyWatermark, reset, result } = usePdfWatermark();
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback((files: File[]): void => {
    const f = files[0];
    if (!f) return;
    setFile(f);
  }, []);

  const handleApply = useCallback((): void => {
    if (file) void applyWatermark(file);
  }, [file, applyWatermark]);

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
          <p className="text-sm font-medium">Watermark added to {result.pageCount} pages</p>
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, "watermarked.pdf")}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Watermark Another
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
                <Label>Watermark text</Label>
                <Input
                  value={settings.text}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  placeholder="CONFIDENTIAL"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Font size</Label>
                  <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={2}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Opacity</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={settings.opacity}
                  onChange={(e) => updateSettings({ opacity: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Rotation</Label>
                  <span className="text-sm text-muted-foreground">{settings.rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={5}
                  value={settings.rotation}
                  onChange={(e) => updateSettings({ rotation: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSettings({ rotation: 0 })}
                  >
                    0°
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSettings({ rotation: -45 })}
                  >
                    -45°
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <div className="flex flex-wrap gap-2">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => updateSettings({ position: p.value })}
                      className={cn(
                        "w-10 h-10 rounded-lg border text-xs font-medium transition-colors",
                        settings.position === p.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <Button
                      key={c.label}
                      variant={
                        settings.color.r === c.r &&
                        settings.color.g === c.g &&
                        settings.color.b === c.b
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateSettings({ color: { r: c.r, g: c.g, b: c.b } })}
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
              label={`Adding watermark... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleApply}>
              <Droplets className="h-4 w-4" /> Add Watermark
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
            Upload Different File
          </Button>
        </motion.div>
      )}
    </div>
  );
}
