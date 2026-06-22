import Link from "next/link";
import {
  Shield,
  Cpu,
  Download,
  Upload,
  Lock,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "How pdfNest Works — Browser-Based PDF Processing",
  description:
    "Learn how pdfNest processes PDFs entirely in your browser using pdf-lib, PDF.js, and jsPDF. No upload, no server, 100% private. Your files never leave your device.",
  alternates: {
    canonical: `${siteConfig.url}/how-it-works`,
  },
  openGraph: {
    title: "How pdfNest Works — Browser-Based PDF Processing",
    description:
      "pdfNest runs entirely in your browser. Your PDFs are never uploaded to any server.",
    url: `${siteConfig.url}/how-it-works`,
  },
};

const STEPS = [
  {
    icon: Upload,
    step: "1",
    title: "Select your PDF",
    desc: "Drop a file or click to browse. The file is read directly from your device's memory — nothing is sent over the network at this point.",
  },
  {
    icon: Cpu,
    step: "2",
    title: "Process in your browser",
    desc: "pdfNest uses JavaScript libraries (pdf-lib, PDF.js, jsPDF, html2pdf.js) to process your file entirely inside your web browser. No server involved.",
  },
  {
    icon: Download,
    step: "3",
    title: "Download the result",
    desc: "The processed file is generated in-memory in your browser and offered as an immediate download. Once you close the tab, everything is gone.",
  },
];

const WHY_ITEMS = [
  {
    icon: Shield,
    title: "Zero server exposure",
    desc: "Traditional online PDF tools upload your file to a server — often a shared cloud instance. pdfNest has no file upload endpoint. There is nothing to intercept.",
  },
  {
    icon: Lock,
    title: "No account, no tracking",
    desc: "We do not know who you are, what files you processed, or how many times. pdfNest stores only your favorite tools and recent history in your own browser's localStorage.",
  },
  {
    icon: Zap,
    title: "Faster than server-based tools",
    desc: "Uploading a 10 MB PDF, waiting for server processing, then downloading the result can take 30–60 seconds over a slow connection. pdfNest processes locally — typically under 3 seconds.",
  },
  {
    icon: Globe,
    title: "Works offline",
    desc: "Once loaded, most pdfNest tools work without an active internet connection. The service worker caches the app shell so you can process PDFs even while offline.",
  },
];

const LIBRARIES = [
  {
    name: "pdf-lib",
    use: "Merge, split, compress, rotate, watermark, sign, form fill, metadata edit — any operation that modifies a PDF's structure.",
  },
  {
    name: "PDF.js",
    use: "Render PDF pages to canvas (used for PDF→JPG, PDF→PNG, redaction), extract text content (PDF→Text, PDF→Word), extract embedded images.",
  },
  {
    name: "jsPDF",
    use: "Generate new PDFs from images or plain text. Powers the Image to PDF and Text to PDF tools.",
  },
  {
    name: "html2pdf.js",
    use: "Render HTML or Markdown to PDF using html2canvas + jsPDF. Powers the HTML to PDF and Markdown to PDF tools.",
  },
  {
    name: "docx",
    use: "Build a .docx Word document from extracted text. Used by the PDF to Word converter.",
  },
  {
    name: "JSZip + file-saver",
    use: "Bundle multiple output files (e.g., split pages or converted images) into a single ZIP download.",
  },
];

export default function HowItWorksPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-14">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          <Shield className="h-3.5 w-3.5" />
          100% browser-based — no upload
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How pdfNest works</h1>
        <p className="text-lg text-muted-foreground">
          Every PDF operation on pdfNest runs entirely inside your web browser. Your files are never
          sent to a server — not even for a fraction of a second.
        </p>
      </div>

      {/* Steps */}
      <section aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="text-xl font-semibold mb-6">
          Three steps, zero uploads
        </h2>
        <ol className="space-y-6">
          {STEPS.map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="pb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Step {item.step}
                </p>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why client-side */}
      <section aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-xl font-semibold mb-6">
          Why client-side processing matters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Libraries */}
      <section aria-labelledby="libraries-heading">
        <h2 id="libraries-heading" className="text-xl font-semibold mb-2">
          Open-source libraries powering pdfNest
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          pdfNest is built on well-maintained open-source PDF libraries. All processing logic runs
          in your browser — no proprietary cloud processing.
        </p>
        <ul className="space-y-3">
          {LIBRARIES.map((lib) => (
            <li key={lib.name} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-sm font-semibold text-foreground">{lib.name}</span>
                <span className="text-sm text-muted-foreground"> — {lib.use}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy note */}
      <section className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <h2 className="font-semibold">Our privacy commitment</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          pdfNest has no server infrastructure that handles file uploads. We do not have a database
          of your documents. We cannot access your files even if we wanted to — because they never
          reach us. This is not a marketing claim; it is the technical reality of how client-side
          processing works.
        </p>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Read the full privacy policy <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* CTA */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">Ready to try it for yourself?</p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold pdf-badge rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          Browse all 26 PDF tools <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
