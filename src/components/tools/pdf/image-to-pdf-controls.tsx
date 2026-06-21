"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FileImage, GripVertical, X, Plus, Download, RefreshCw } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useImageToPdf } from "@/hooks/use-image-to-pdf";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { formatFileSize } from "@/lib/utils/file-helpers";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function ImageToPdfControls(): React.ReactElement {
  const { state, settings, updateSettings, processFiles, reset, result } = useImageToPdf();
  const [files, setFiles] = useState<File[]>([]);
  const dragIdx = useRef<number | null>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = useCallback((selected: File[]): void => {
    setFiles((prev) => [...prev, ...selected].slice(0, 20));
  }, []);

  const removeFile = useCallback((idx: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleDragStart = useCallback((idx: number): void => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number): void => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  }, []);

  const handleCreate = useCallback((): void => {
    if (files.length > 0) processFiles(files);
  }, [files, processFiles]);

  const handleReset = useCallback((): void => {
    setFiles([]);
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
          <p className="text-sm font-medium">
            PDF Created — {result.pageCount} page{result.pageCount !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">{formatFileSize(result.size)}</p>
          <Button className="gap-2" onClick={() => downloadBlob(result.blob, result.fileName)}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Create Another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <FileDropzone
          accept={FILE_LIMITS.image.acceptString}
          acceptedTypes={FILE_LIMITS.image.acceptedTypes}
          maxSize={FILE_LIMITS.image.maxSize}
          maxSizeLabel={FILE_LIMITS.image.maxSizeLabel}
          multiple
          maxFiles={80}
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* File list with drag reorder */}
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                className="flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing hover:bg-muted/30 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <FileImage className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{f.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {formatFileSize(f.size)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => extraInputRef.current?.click()}
          >
            <Plus className="h-4 w-4" /> Add More
          </Button>
          <input
            ref={extraInputRef}
            type="file"
            accept={FILE_LIMITS.image.acceptString}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(Array.from(e.target.files));
            }}
          />

          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Page size</Label>
                <div className="flex gap-2 flex-wrap">
                  {(["a4", "letter", "legal", "fit"] as const).map((ps) => (
                    <Button
                      key={ps}
                      variant={settings.pageSize === ps ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ pageSize: ps })}
                    >
                      {ps === "fit" ? "Fit to Image" : ps.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Orientation</Label>
                <div className="flex gap-2">
                  {(["portrait", "landscape", "auto"] as const).map((o) => (
                    <Button
                      key={o}
                      variant={settings.orientation === o ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ orientation: o })}
                      className="capitalize"
                    >
                      {o}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Margin</Label>
                  <span className="text-sm text-muted-foreground">{settings.margin}mm</span>
                </div>
                <Slider
                  value={[settings.margin]}
                  onValueChange={(v: number | readonly number[]) =>
                    updateSettings({
                      margin: Array.isArray(v) ? (v as number[])[0] : (v as number),
                    })
                  }
                  min={0}
                  max={50}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Image fit</Label>
                <div className="flex gap-2">
                  {(["contain", "cover", "stretch"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={settings.imageFit === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ imageFit: f })}
                      className="capitalize"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Quality</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.quality * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.quality]}
                  onValueChange={(v: number | readonly number[]) =>
                    updateSettings({
                      quality: Array.isArray(v) ? (v as number[])[0] : (v as number),
                    })
                  }
                  min={0.5}
                  max={1}
                  step={0.05}
                />
              </div>

              <p className="text-sm text-muted-foreground">Will create {files.length}-page PDF</p>
            </CardContent>
          </Card>

          {state.status === "processing" && (
            <ProcessingIndicator
              progress={state.progress}
              label={`Creating PDF... ${state.progress}%`}
            />
          )}

          {state.status === "error" && state.error && (
            <p className="text-sm text-destructive text-center">{state.error}</p>
          )}

          {state.status !== "processing" && (
            <Button className="w-full h-11 gap-2" onClick={handleCreate}>
              <FileImage className="h-4 w-4" /> Create PDF
            </Button>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Start Over
          </Button>
        </motion.div>
      )}
    </div>
  );
}
