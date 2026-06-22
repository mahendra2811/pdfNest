import type { Metadata } from "next";
import { ContactPageClient } from "./client";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact — pdfNest",
  description:
    "Get in touch with the pdfNest team. Report a bug, request a feature, or ask a question about our free browser-based PDF tools.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact — pdfNest",
    description: "Get in touch with the pdfNest team.",
    url: `${siteConfig.url}/contact`,
  },
};

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@pdfnest.app";

export default function ContactPage(): React.ReactElement {
  return <ContactPageClient formspreeId={FORMSPREE_ID} contactEmail={CONTACT_EMAIL} />;
}
