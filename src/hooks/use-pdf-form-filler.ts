import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/utils/file-helpers";

export interface FormField {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "unknown";
  value: string;
  options?: string[];
}

interface PdfFormFillerState {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface PdfFormFillerReturn {
  state: PdfFormFillerState;
  fields: FormField[];
  result: Blob | null;
  pageCount: number;
  loadPdf: (file: File) => Promise<void>;
  updateField: (index: number, value: string) => void;
  fillAndSave: () => Promise<void>;
  reset: () => void;
}

export function usePdfFormFiller(): PdfFormFillerReturn {
  const [state, setState] = useState<PdfFormFillerState>({ status: "idle", progress: 0 });
  const [fields, setFields] = useState<FormField[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const processingRef = useRef(false);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);

  const loadPdf = useCallback(async (file: File): Promise<void> => {
    if (processingRef.current) return;
    processingRef.current = true;
    setState({ status: "loading", progress: 10 });

    try {
      const buffer = await readFileAsArrayBuffer(file);
      pdfBytesRef.current = buffer;
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdfDoc.getPageCount());

      setState({ status: "loading", progress: 50 });

      const form = pdfDoc.getForm();
      const pdfFields = form.getFields();

      const detectedFields: FormField[] = pdfFields.map((field) => {
        const name = field.getName();
        const fieldType = field.constructor.name;

        if (fieldType === "PDFTextField") {
          const tf = form.getTextField(name);
          return { name, type: "text" as const, value: tf.getText() ?? "" };
        }
        if (fieldType === "PDFCheckBox") {
          const cb = form.getCheckBox(name);
          return { name, type: "checkbox" as const, value: cb.isChecked() ? "checked" : "" };
        }
        if (fieldType === "PDFDropdown") {
          const dd = form.getDropdown(name);
          const options = dd.getOptions();
          const selected = dd.getSelected();
          return {
            name,
            type: "dropdown" as const,
            value: selected.length > 0 ? (selected[0] ?? "") : "",
            options,
          };
        }
        return { name, type: "unknown" as const, value: "" };
      });

      setFields(detectedFields);
      setState({ status: "idle", progress: 0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load PDF";
      if (msg.includes("no form") || msg.includes("acroForm")) {
        setFields([]);
        setState({ status: "idle", progress: 0 });
      } else {
        setState({ status: "error", progress: 0, error: msg });
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  const updateField = useCallback((index: number, value: string): void => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)));
  }, []);

  const fillAndSave = useCallback(async (): Promise<void> => {
    if (processingRef.current || !pdfBytesRef.current) return;
    processingRef.current = true;
    setState({ status: "processing", progress: 20 });

    try {
      const pdfDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      setState({ status: "processing", progress: 50 });

      for (const field of fields) {
        try {
          if (field.type === "text") {
            form.getTextField(field.name).setText(field.value);
          } else if (field.type === "checkbox") {
            const cb = form.getCheckBox(field.name);
            if (field.value === "checked") {
              cb.check();
            } else {
              cb.uncheck();
            }
          } else if (field.type === "dropdown" && field.value) {
            form.getDropdown(field.name).select(field.value);
          }
        } catch {
          // Skip read-only or unsupported fields
        }
      }

      setState({ status: "processing", progress: 80 });
      form.flatten();
      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes as unknown as BlobPart], { type: "application/pdf" });

      setResult(blob);
      setState({ status: "complete", progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Failed to fill PDF form",
      });
    } finally {
      processingRef.current = false;
    }
  }, [fields]);

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setFields([]);
    setResult(null);
    setPageCount(0);
    pdfBytesRef.current = null;
  }, []);

  return { state, fields, result, pageCount, loadPdf, updateField, fillAndSave, reset };
}
