"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw, Eye } from "lucide-react";
import { ProcessingIndicator } from "@/components/shared/processing-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMarkdownToPdf } from "@/hooks/use-markdown-to-pdf";
import { downloadBlob } from "@/lib/utils/download-helpers";
import DOMPurify from "dompurify";

function sanitize(html: string): string {
  // DOMPurify's no-op stub on the server returns input unchanged; the guard keeps
  // unsanitized HTML out of any server-rendered output. Real sanitization runs in
  // the browser where window (and a real DOM) exist.
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html);
}

const SAMPLE_MARKDOWN = `# Hello World

This is a **markdown** document that will be converted to PDF.

## Features

- Headings, bold, italic
- Lists and blockquotes
- Code blocks

> This is a blockquote

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

---

*Generated with pdfNest*
`;

export function MarkdownToPdfControls(): React.ReactElement {
  const { state, markdown, htmlPreview, result, setMarkdown, convert, reset } = useMarkdownToPdf();

  const handleInsertSample = useCallback((): void => {
    setMarkdown(SAMPLE_MARKDOWN);
  }, [setMarkdown]);

  if (state.status === "complete" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <FileText className="h-10 w-10 mx-auto text-primary" />
          <p className="text-sm font-medium">PDF generated successfully</p>
          <Button className="gap-2" onClick={() => downloadBlob(result, "markdown-output.pdf")}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={reset}>
          Convert Another
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Markdown Input</Label>
            <Button variant="ghost" size="sm" onClick={handleInsertSample}>
              Insert Sample
            </Button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type or paste your markdown here..."
            className="w-full h-64 rounded-lg border border-border bg-background p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      {htmlPreview && (
        <Card>
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <Label>Preview</Label>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto rounded-lg border border-border p-4 bg-white dark:bg-zinc-900"
              dangerouslySetInnerHTML={{ __html: sanitize(htmlPreview) }}
            />
          </CardContent>
        </Card>
      )}

      {state.status === "processing" && (
        <ProcessingIndicator progress={state.progress} label={`Converting... ${state.progress}%`} />
      )}

      {state.status === "error" && state.error && (
        <p className="text-sm text-destructive text-center">{state.error}</p>
      )}

      {state.status !== "processing" && (
        <Button
          className="w-full h-11 gap-2"
          onClick={() => void convert()}
          disabled={!markdown.trim()}
        >
          <FileText className="h-4 w-4" /> Convert to PDF
        </Button>
      )}

      {markdown && (
        <Button variant="outline" className="w-full h-10 gap-2" onClick={reset}>
          <RefreshCw className="h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}
