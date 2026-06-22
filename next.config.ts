import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
const ANALYTICS_ACTIVE = Boolean(GA_ID) || Boolean(GTM_ID);
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
const ADS_ACTIVE = Boolean(ADSENSE_CLIENT) && process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
  // Exclude the 1.2MB pdf.worker from precache — it is runtime-cached on first use
  // by the explicit CacheFirst rule in sw.ts
  exclude: [/pdf\.worker/],
});

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // Required for pdfjs-dist — avoid canvas dependency issue
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow analytics/GTM scripts if env-gated IDs are present
              ANALYTICS_ACTIVE
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              ADS_ACTIVE
                ? "script-src-elem 'self' 'unsafe-inline' https://pagead2.googlesyndication.com"
                : "",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              ADS_ACTIVE
                ? "img-src 'self' data: blob: https://pagead2.googlesyndication.com"
                : "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              ANALYTICS_ACTIVE
                ? "connect-src 'self' https://www.google-analytics.com https://analytics.google.com"
                : "connect-src 'self'",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "manifest-src 'self'",
              "frame-src 'none'",
            ]
              .filter(Boolean)
              .join("; "),
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
