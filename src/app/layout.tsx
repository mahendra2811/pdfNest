import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NavigationProgress } from "@/components/shared/navigation-progress";
import { ServiceWorkerRegister } from "@/components/shared/sw-register";
import { SwUpdateBanner } from "@/components/shared/sw-update-banner";
import { ReducedMotionSync } from "@/components/shared/reduced-motion-sync";
import { Analytics } from "@/components/shared/analytics";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Site-wide Organization JSON-LD — static config only
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "pdfNest",
  url: "https://pdfnest.app",
  logo: "https://pdfnest.app/icons/icon-512.png",
  description:
    "Free online PDF tools — merge, split, compress, convert, sign and more. 100% browser-based, no upload, no sign-up.",
  sameAs: ["https://github.com/mahendra2811/pdfNest"],
} as const;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "pdfNest — Free Online PDF Tools",
    template: "%s | pdfNest",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "pdfNest — Free Online PDF Tools",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "pdfNest — Free Online PDF Tools",
    description: siteConfig.description,
  },
  metadataBase: new URL(siteConfig.url),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "pdfNest",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

// Splash bootstrap: runs synchronously before first paint;
// shows a loading overlay only for standalone PWA launches.
const SPLASH_BOOTSTRAP = `(function(){try{
var q=new URLSearchParams(location.search);
var standalone=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
if(q.get("splash")!=="1"&&(!standalone||sessionStorage.getItem("pdfnest:splash-shown:v1")))return;
sessionStorage.setItem("pdfnest:splash-shown:v1","1");
var d=document.createElement("div");
d.id="app-splash";d.setAttribute("aria-hidden","true");
d.innerHTML='<div id="app-splash-center"><div id="app-splash-logo" style="width:80px;height:80px;border-radius:18%;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center"><svg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'white\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><path d=\\'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\\'/><polyline points=\\'14 2 14 8 20 8\\'/></svg></div><div id="app-splash-name"><span>pdf</span>Nest</div><div id="app-splash-tag">Your PDFs never leave your device.</div></div>';
document.body.appendChild(d);
setTimeout(function(){var s=document.getElementById("app-splash");if(s){s.classList.add("splash-exit");setTimeout(function(){s.remove()},500)}},6000);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Splash bootstrap — runs before hydration */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOTSTRAP }} />
        {/* Organization JSON-LD — site-wide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        {/* Analytics — env-gated; renders null when env vars absent */}
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav />
            <Toaster />
            <ServiceWorkerRegister />
            <SwUpdateBanner />
            <ReducedMotionSync />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
