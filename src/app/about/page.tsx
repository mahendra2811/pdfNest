import { Shield, Zap, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About pdfNest — Free Private PDF Tools",
  description:
    "pdfNest is a 100% browser-based PDF tool hub. Your files never leave your device. Free, no sign-up, no watermark.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">About pdfNest</h1>
      <p className="text-lg text-muted-foreground mb-8">
        pdfNest is a free, privacy-first collection of PDF tools that runs entirely in your
        browser. No servers receive your files. No account required. No watermarks. Just fast,
        private PDF processing.
      </p>

      <div className="space-y-6">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold mb-1">Your PDFs never leave your device</h2>
            <p className="text-sm text-muted-foreground">
              Every single PDF operation — merging, splitting, compressing, converting — happens
              entirely inside your browser using JavaScript APIs. There is no server to upload to.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Zap className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold mb-1">Fast &amp; free</h2>
            <p className="text-sm text-muted-foreground">
              All tools are free with no usage limits. Processing is instant — no waiting for
              server uploads and responses.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Lock className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold mb-1">No account, no watermark</h2>
            <p className="text-sm text-muted-foreground">
              There is no sign-up, no paywall, and no watermarks added to your output files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
