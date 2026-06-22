import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pdfNest — Free PDF Tools",
    short_name: "pdfNest",
    description: "Free online PDF tools — 100% browser-based, no upload, no sign-up.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#ef4444",
    orientation: "portrait-primary",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Merge PDF",
        url: "/tools/pdf-merge",
        description: "Combine multiple PDFs into one",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Compress PDF",
        url: "/tools/pdf-compress",
        description: "Reduce PDF file size",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "PDF to JPG",
        url: "/tools/pdf-to-jpg",
        description: "Convert PDF pages to images",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Sign PDF",
        url: "/tools/pdf-sign",
        description: "Add a signature to a PDF",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
