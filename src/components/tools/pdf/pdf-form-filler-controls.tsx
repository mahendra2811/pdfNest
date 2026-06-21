"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw, AlertTriangle, CheckSquare } from "lucide-react";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePdfFormFiller } from "@/hooks/use-pdf-form-filler";
import { FILE_LIMITS } from "@/lib/constants/file-limits";
import { downloadBlob } from "@/lib/utils/download-helpers";

export function PdfFormFillerControls(): React.ReactElement {
  const { state, fields, result, pageCount, loadPdf, updateField, fillAndSave, reset } =
    usePdfFormFiller();
  const [file, setFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback(
    (files: File[]): void => {
      const f = files[0];
      if (!f) return;
      setFile(f);
      void loadPdf(f);
    },
    [loadPdf]
  );

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
          <CheckSquare className="h-10 w-10 mx-auto text-primary" />
          <p className="text-sm font-medium">
            PDF form filled with {fields.length} field{fields.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Form fields have been flattened (non-editable) for safe sharing
          </p>
          <Button className="gap-2" onClick={() => downloadBlob(result, "filled-form.pdf")}>
            <Download className="h-4 w-4" /> Download Filled PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Fill Another PDF
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
          <div className="rounded-lg border border-border bg-card/50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{pageCount} pages</p>
            </div>
          </div>

          {fields.length === 0 && state.status === "idle" ? (
            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
                <p className="text-sm font-medium">No form fields detected</p>
                <p className="text-xs text-muted-foreground">
                  This PDF does not contain interactive form fields (AcroForm). Only PDFs with
                  fillable form fields can be filled using this tool.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {fields.length} form field{fields.length !== 1 ? "s" : ""} detected
                  </p>
                  {fields.map((field, index) => (
                    <div key={field.name} className="space-y-1.5">
                      <Label className="text-xs">{field.name}</Label>
                      {field.type === "text" && (
                        <Input
                          value={field.value}
                          onChange={(e) => updateField(index, e.target.value)}
                          placeholder={`Enter ${field.name}`}
                        />
                      )}
                      {field.type === "checkbox" && (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.value === "checked"}
                            onCheckedChange={(checked) =>
                              updateField(index, checked ? "checked" : "")
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {field.value === "checked" ? "Checked" : "Unchecked"}
                          </span>
                        </div>
                      )}
                      {field.type === "dropdown" && field.options && (
                        <Select
                          value={field.value}
                          onValueChange={(v) => updateField(index, v ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {field.type === "unknown" && (
                        <p className="text-xs text-muted-foreground italic">
                          Unsupported field type
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {state.status === "processing" && (
                <ProcessingIndicator
                  progress={state.progress}
                  label={`Filling form... ${state.progress}%`}
                />
              )}

              {state.status === "error" && state.error && (
                <p className="text-sm text-destructive text-center">{state.error}</p>
              )}

              {state.status !== "processing" && fields.length > 0 && (
                <Button className="w-full h-11 gap-2" onClick={() => void fillAndSave()}>
                  <FileText className="h-4 w-4" /> Fill &amp; Download PDF
                </Button>
              )}
            </>
          )}

          <Button variant="outline" className="w-full h-10 gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Upload Different PDF
          </Button>
        </motion.div>
      )}
    </div>
  );
}
