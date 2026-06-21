"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Code, FileDown, Eye, Loader2 } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const DEFAULT_HTML = `<h1 style="color: #333; font-family: sans-serif;">Hello World</h1>
<p style="font-size: 16px; line-height: 1.6;">
  This is a sample HTML document. Edit this content and click
  <strong>Convert to PDF</strong> to generate your PDF file.
</p>
<ul>
  <li>Supports basic HTML tags</li>
  <li>Inline styles are preserved</li>
  <li>Tables, lists, and headings work great</li>
</ul>`;

export function HtmlToPdfControls(): React.ReactElement {
  const [html, setHtml] = useState<string>(DEFAULT_HTML);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleConvert = useCallback(async (): Promise<void> => {
    if (!previewRef.current || !html.trim()) return;
    setProcessing(true);
    setError(null);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await (
        html2pdf() as {
          from: (el: HTMLElement) => {
            set: (opts: Record<string, unknown>) => { save: () => Promise<void> };
          };
        }
      )
        .from(previewRef.current)
        .set({ margin: 10, filename: "output.pdf" })
        .save();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert HTML to PDF");
    } finally {
      setProcessing(false);
    }
  }, [html]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Paste or edit your HTML code</Label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full h-48 rounded-xl border border-border bg-muted/30 p-4 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="<h1>Your HTML here...</h1>"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label>Live Preview</Label>
        </div>
        <Card>
          <CardContent className="p-6">
            <div
              ref={previewRef}
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
            />
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {processing ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating PDF...</span>
          </div>
        ) : (
          <Button
            className="w-full h-11 gap-2"
            onClick={() => void handleConvert()}
            disabled={!html.trim()}
          >
            <FileDown className="h-4 w-4" />
            <Code className="h-4 w-4" />
            Convert to PDF
          </Button>
        )}
      </motion.div>
    </div>
  );
}
