import Link from "next/link";
import { Shield, Zap, Lock, Globe, Cpu, Heart, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LIVE_TOOLS, SOON_TOOLS } from "@/lib/constants/tools";

export const metadata: Metadata = {
  title: "About pdfNest — Free, Private, Browser-Based PDF Tools",
  description:
    "pdfNest is a 100% browser-based PDF tool hub. 26 free tools — merge, split, compress, convert, sign and more. Your files never leave your device. No sign-up, no watermark.",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: "About pdfNest — Free, Private, Browser-Based PDF Tools",
    description:
      "pdfNest is a 100% browser-based PDF tool hub. Your files never leave your device.",
    url: `${siteConfig.url}/about`,
  },
};

const VALUES = [
  {
    icon: Shield,
    title: "Privacy first",
    desc: "Every PDF operation — merging, splitting, compressing, converting — runs inside your browser using JavaScript APIs. There is no server to upload to. Your files are never transmitted.",
  },
  {
    icon: Globe,
    title: "Free and open",
    desc: "No sign-up, no paywall, no watermarks. All 26 tools are completely free. pdfNest is built on open-source libraries and aims to stay free.",
  },
  {
    icon: Cpu,
    title: "Client-side technology",
    desc: "Built with modern browser technologies — pdf-lib, PDF.js, jsPDF, html2pdf.js, and the File API. Processing is instant because it happens right on your device.",
  },
  {
    icon: Zap,
    title: "Fast, no waiting",
    desc: "No waiting for server uploads or queues. A typical PDF operation completes in under 3 seconds because there is no round-trip to a remote server.",
  },
  {
    icon: Lock,
    title: "No account required",
    desc: "You never need to create an account or share your email address. Your favorite tools and history are stored in your own browser's localStorage.",
  },
  {
    icon: Heart,
    title: "Built with care",
    desc: "pdfNest is designed for people who need quick, private file processing — students, professionals, developers, and anyone with sensitive documents.",
  },
];

export default function AboutPage(): React.ReactElement {
  const liveCount = LIVE_TOOLS.length;
  const soonCount = SOON_TOOLS.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">About pdfNest</h1>
        <p className="text-lg text-muted-foreground">
          pdfNest is a free, privacy-first collection of PDF tools that runs entirely in your
          browser. No servers receive your files. No account required. No watermarks. Just fast,
          private PDF processing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Free tools", value: liveCount },
          { label: "Coming soon", value: soonCount },
          { label: "Server uploads", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-muted/20 p-4 text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Our values */}
      <section aria-labelledby="values-heading">
        <h2 id="values-heading" className="text-xl font-semibold mb-6">
          What we stand for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map((item) => (
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

      {/* Mission */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Our mission</h2>
        <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            We believe file processing tools should be fast, free, and private. Too many online
            tools require uploading sensitive documents to unknown servers. pdfNest eliminates that
            risk entirely by running every operation directly in your browser.
          </p>
          <p>
            Whether you need to merge PDFs for work, compress a document before emailing it, sign a
            contract, or convert a PDF to Word — pdfNest handles it all without your files ever
            leaving your device.
          </p>
          <p>
            pdfNest is built on trusted open-source libraries: pdf-lib for structural PDF
            operations, PDF.js for rendering and text extraction, jsPDF and html2pdf.js for
            generating new PDFs. No proprietary cloud processing — everything is open and
            transparent.
          </p>
        </div>
      </section>

      {/* Links */}
      <div className="flex flex-wrap gap-4 border-t border-border pt-8">
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          How pdfNest works <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Privacy policy <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Contact us <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
