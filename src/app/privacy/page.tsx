import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy — pdfNest",
  description:
    "pdfNest processes all files locally in your browser. We never upload, store, or transmit your PDFs. Read our full privacy policy.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy — pdfNest",
    description: "pdfNest processes all files locally in your browser. No uploads, no server.",
    url: `${siteConfig.url}/privacy`,
  },
};

// Env flag: if GA4/GTM IDs are set, the analytics section is relevant
const GA4_ACTIVE = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const GTM_ACTIVE = Boolean(process.env.NEXT_PUBLIC_GTM_ID);
const ANALYTICS_ACTIVE = GA4_ACTIVE || GTM_ACTIVE;

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Owner&apos;s note:</strong> This is a template privacy policy. The site owner must
        review and update it to accurately reflect any analytics, advertising, or third-party
        services that are enabled via environment variables before publishing.
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            1. Your files stay on your device
          </h2>
          <p>
            All PDF processing on pdfNest happens entirely inside your web browser using client-side
            JavaScript libraries (pdf-lib, PDF.js, jsPDF, html2pdf.js, docx, JSZip). Your files are{" "}
            <strong className="text-foreground">never uploaded to any server</strong>. We have no
            infrastructure to receive, store, or access your PDF files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">2. Data we do not collect</h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your PDF files or their contents</li>
            <li>Your name, email, or any personal information (no sign-up required)</li>
            <li>Payment information (pdfNest is entirely free)</li>
            <li>Your IP address (no server-side logging)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">3. Local storage</h2>
          <p>
            pdfNest uses your browser&apos;s <code>localStorage</code> to remember your favorite
            tools (<code>pdfnest:favourites:v1</code>) and your recently used tools (
            <code>pdfnest:history:v1</code>). This data never leaves your device. You can clear it
            at any time by clearing your browser storage or using your browser&apos;s developer
            tools.
          </p>
        </section>

        {ANALYTICS_ACTIVE ? (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Analytics</h2>
            <p>
              pdfNest uses Google Analytics (GA4)
              {GTM_ACTIVE ? " via Google Tag Manager" : ""} to collect anonymous, aggregate usage
              data — page views, tool usage counts, and general geography (country-level). This
              helps us understand which tools are most useful and improve the service.
            </p>
            <p>
              No file content or personally identifiable information is sent to analytics. Analytics
              data is subject to Google&apos;s own privacy policy. You can opt out by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Analytics opt-out browser add-on
              </a>
              .
            </p>
          </section>
        ) : (
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Analytics</h2>
            <p>
              pdfNest does not currently use any analytics services. No tracking scripts are loaded.
              If analytics are enabled in the future, this policy will be updated.
            </p>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">5. Advertising</h2>
          <p>
            pdfNest does not currently display advertising. If ads are enabled in the future, this
            policy will be updated and appropriate consent mechanisms will be implemented.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
          <p>
            pdfNest does not set any tracking cookies. The only browser storage used is
            <code>localStorage</code> for your preferences (see section 3). No third-party cookies
            are set.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">7. Third-party services</h2>
          <p>
            pdfNest loads Google Fonts (Inter and JetBrains Mono) from Google&apos;s CDN. This may
            allow Google to log the request, but no file data is involved. The PDF.js worker is
            served from the pdfNest domain (not a CDN). No other third-party services are contacted
            during normal use.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">8. Changes to this policy</h2>
          <p>
            We may update this policy. Continued use of pdfNest after changes are posted means you
            accept the updated policy. The &quot;last updated&quot; date at the top of this page
            will reflect any changes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
          <p>
            Questions about this privacy policy? Reach out via our{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact page
            </Link>{" "}
            or via{" "}
            <a
              href="https://github.com/mahendra2811/pdfNest/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Issues
            </a>
            .
          </p>
        </section>
      </div>

      <div className="border-t border-border pt-6 flex flex-wrap gap-4">
        <Link
          href="/terms"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Terms of Service <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          How pdfNest works <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
