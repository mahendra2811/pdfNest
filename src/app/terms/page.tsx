import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service — pdfNest",
  description:
    "pdfNest terms of service. Free PDF tools, no server uploads, no warranties. Read the full terms before using pdfNest.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Acceptance of terms</h2>
          <p className="text-muted-foreground">
            By using pdfNest (&quot;the Service&quot;), you agree to these terms. If you do not
            agree, please stop using the Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Description of the service</h2>
          <p className="text-muted-foreground">
            pdfNest provides browser-based PDF processing tools. All file operations occur
            client-side in your web browser. We do not receive, store, or process your files on any
            server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Use of the service</h2>
          <p className="text-muted-foreground">
            You agree to use pdfNest only for lawful purposes. You must not:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
            <li>Use the Service to process files you do not have the right to modify</li>
            <li>Attempt to circumvent any technical limitations of the Service</li>
            <li>Use automated tools to make excessive requests to the Service</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. No warranties</h2>
          <p className="text-muted-foreground">
            The Service is provided &quot;as is&quot; without warranty of any kind. We make no
            guarantees about the accuracy, reliability, or fitness for a particular purpose of any
            processing output. Always keep backups of your original files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Limitation of liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, pdfNest shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the Service,
            including but not limited to loss of data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Intellectual property</h2>
          <p className="text-muted-foreground">
            The pdfNest source code is open source. The pdfNest name, logo, and branding are
            property of the creator. Open-source libraries used by pdfNest retain their respective
            licenses.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Changes to these terms</h2>
          <p className="text-muted-foreground">
            We may update these terms from time to time. Continued use of the Service after changes
            are published constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Contact</h2>
          <p className="text-muted-foreground">
            Questions about these terms? Contact us at{" "}
            <a href="mailto:hello@pdfnest.app" className="text-primary hover:underline">
              hello@pdfnest.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
