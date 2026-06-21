"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, Clipboard, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatFileSize, validateFileSize, validateFileType } from "@/lib/utils/file-helpers";

interface FileDropzoneProps {
  accept: string;
  acceptedTypes: readonly string[];
  maxSize: number;
  maxSizeLabel: string;
  maxFiles?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export function FileDropzone({
  accept,
  acceptedTypes,
  maxSize,
  maxSizeLabel,
  maxFiles = 1,
  multiple = false,
  onFilesSelected,
}: FileDropzoneProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const processFiles = useCallback(
    (files: FileList | File[]): void => {
      setError(null);
      const fileArray = Array.from(files).slice(0, maxFiles);

      for (const file of fileArray) {
        if (acceptedTypes.length > 0 && !validateFileType(file, acceptedTypes)) {
          setError(`Invalid file type. Accepted: ${accept}`);
          return;
        }
        if (!validateFileSize(file, maxSize)) {
          setError(`File too large. Maximum size: ${maxSizeLabel}`);
          return;
        }
      }

      setSelectedFiles(fileArray);
      onFilesSelected(fileArray);
    },
    [accept, acceptedTypes, maxSize, maxSizeLabel, maxFiles, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    if (dropzoneRef.current && !dropzoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleClick = useCallback((): void => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleRemove = useCallback((): void => {
    setSelectedFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // Selected files state
  if (selectedFiles.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="space-y-3"
      >
        {selectedFiles.map((file, i) => (
          <motion.div
            key={`${file.name}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group/file relative rounded-xl border border-border bg-card p-3 flex items-center gap-3"
          >
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove file"
              className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity shadow-sm hover:bg-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border bg-primary/5 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                  {formatFileSize(file.size)}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 h-4 uppercase">
                  {file.name.split(".").pop()}
                </Badge>
              </div>
            </div>

            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div>
      <div
        ref={dropzoneRef}
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          "group relative rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden",
          isDragging
            ? "dropzone-drag-active"
            : isPasting
              ? "dropzone-paste-active"
              : error
                ? "border-2 border-dashed border-destructive bg-destructive/5"
                : "border-2 border-dashed border-border hover:border-primary/60"
        )}
      >
        {/* Subtle background on hover */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500",
            (isDragging || isHovering) && !error && "opacity-100"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.03]" />
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-primary/[0.06] backdrop-blur-[1px] rounded-xl"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center"
              >
                <Upload className="h-7 w-7 text-primary" />
              </motion.div>
              <p className="text-sm font-semibold text-primary">Drop to upload</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paste overlay */}
        <AnimatePresence>
          {isPasting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-green-500/[0.08] backdrop-blur-[1px] rounded-xl z-10"
            >
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Clipboard className="h-6 w-6" />
                <span className="font-semibold text-sm">Pasting...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="relative z-[1] flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -3 }}
            className="w-14 h-14 rounded-2xl pdf-badge flex items-center justify-center shadow-lg mb-4"
          >
            <FileText className="h-7 w-7 text-white" />
          </motion.div>

          <p className="text-base font-semibold text-foreground">
            Drop your {multiple ? "PDF files" : "PDF file"} here, or{" "}
            <span className="text-primary underline underline-offset-2 decoration-primary/40">
              browse
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <Badge variant="secondary" className="text-[11px] h-5 px-2 gap-1 font-normal">
              <Upload className="h-3 w-3" />
              Drag &amp; Drop
            </Badge>
            <Badge variant="secondary" className="text-[11px] h-5 px-2 gap-1 font-normal">
              <Clipboard className="h-3 w-3" />
              Paste (Ctrl+V)
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {accept} — Max {maxSizeLabel}
            {multiple && maxFiles > 1 && ` — Up to ${maxFiles} files`}
          </p>

          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground/70">
            <Shield className="h-3 w-3" />
            <span>Processed locally — files never leave your device</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center gap-2 mt-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
