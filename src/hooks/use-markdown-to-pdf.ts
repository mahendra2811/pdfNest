import { useState, useCallback, useRef } from "react";
import { marked } from "marked";

interface ProcessingState {
  status: "idle" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface MarkdownToPdfReturn {
  state: ProcessingState;
  markdown: string;
  htmlPreview: string;
  result: Blob | null;
  setMarkdown: (text: string) => void;
  convert: () => Promise<void>;
  reset: () => void;
}

export function useMarkdownToPdf(): MarkdownToPdfReturn {
  const [state, setState] = useState<ProcessingState>({ status: "idle", progress: 0 });
  const [markdown, setMarkdownState] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [result, setResult] = useState<Blob | null>(null);
  const processingRef = useRef(false);

  const handleSetMarkdown = useCallback((text: string): void => {
    setMarkdownState(text);
    try {
      const html = marked.parse(text, { async: false }) as string;
      setHtmlPreview(html);
    } catch {
      setHtmlPreview("");
    }
  }, []);

  const convert = useCallback(async (): Promise<void> => {
    if (processingRef.current) return;
    if (!markdown.trim()) {
      setState({ status: "error", progress: 0, error: "Please enter some markdown content." });
      return;
    }
    processingRef.current = true;
    setState({ status: "processing", progress: 10 });

    try {
      const html = marked.parse(markdown, { async: false }) as string;
      setState({ status: "processing", progress: 30 });

      const { default: jsPDF } = await import("jspdf");
      setState({ status: "processing", progress: 50 });

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const container = document.createElement("div");
      container.innerHTML = html;
      container.style.width = "170mm";
      container.style.padding = "0";
      container.style.fontFamily = "Helvetica, Arial, sans-serif";
      container.style.fontSize = "12px";
      container.style.lineHeight = "1.6";
      container.style.color = "#000000";

      const applyStyle = (selector: string, styles: Partial<CSSStyleDeclaration>): void => {
        container.querySelectorAll(selector).forEach((el) => {
          Object.assign((el as HTMLElement).style, styles);
        });
      };

      applyStyle("h1", {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "8px",
        marginTop: "16px",
      });
      applyStyle("h2", {
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "6px",
        marginTop: "12px",
      });
      applyStyle("h3", {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "4px",
        marginTop: "10px",
      });
      applyStyle("code", {
        fontFamily: "monospace",
        backgroundColor: "#f4f4f4",
        padding: "2px 4px",
        borderRadius: "3px",
        fontSize: "11px",
      });
      applyStyle("pre", {
        backgroundColor: "#f4f4f4",
        padding: "10px",
        borderRadius: "4px",
        fontSize: "11px",
      });
      applyStyle("blockquote", {
        borderLeft: "3px solid #ccc",
        paddingLeft: "10px",
        color: "#555",
      });

      document.body.appendChild(container);
      setState({ status: "processing", progress: 70 });

      await doc.html(container, {
        callback: () => {
          /* resolved via promise */
        },
        x: 15,
        y: 15,
        width: 170,
        windowWidth: 650,
        autoPaging: "text",
      });

      document.body.removeChild(container);
      setState({ status: "processing", progress: 90 });

      const blob = doc.output("blob");
      setResult(blob);
      setState({ status: "complete", progress: 100 });
    } catch (err) {
      setState({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Failed to convert markdown to PDF",
      });
    } finally {
      processingRef.current = false;
    }
  }, [markdown]);

  const reset = useCallback((): void => {
    processingRef.current = false;
    setState({ status: "idle", progress: 0 });
    setMarkdownState("");
    setHtmlPreview("");
    setResult(null);
  }, []);

  return { state, markdown, htmlPreview, result, setMarkdown: handleSetMarkdown, convert, reset };
}
