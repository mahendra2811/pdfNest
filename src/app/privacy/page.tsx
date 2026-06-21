import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — pdfNest",
  description:
    "pdfNest processes all files locally in your browser. We never upload, store, or transmit your PDFs.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-sm dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: June 2026</p>

      <h2>File processing</h2>
      <p>
        All PDF processing on pdfNest happens entirely inside your web browser using client-side
        JavaScript APIs (pdf-lib, PDF.js, jsPDF, html2pdf.js, docx, JSZip). Your files are{" "}
        <strong>never uploaded to any server</strong>. We have no infrastructure to receive, store,
        or access your PDF files.
      </p>

      <h2>Data we do not collect</h2>
      <ul>
        <li>Your PDF files or their contents</li>
        <li>Your name, email, or any personal information</li>
        <li>Payment information (pdfNest is free)</li>
      </ul>

      <h2>Local storage</h2>
      <p>
        pdfNest uses your browser&apos;s localStorage to remember your favorite tools and recently
        used tools. This data never leaves your device. You can clear it by clearing your browser
        storage.
      </p>

      <h2>Analytics</h2>
      <p>
        pdfNest may optionally use privacy-respecting analytics (configurable via environment
        variable). By default, no analytics are active.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about privacy, please reach out via the GitHub repository.
      </p>
    </div>
  );
}
