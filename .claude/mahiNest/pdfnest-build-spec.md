# pdfNest — Build Spec (PORT)

> Mode: BRIEF/EXTRACT port of the PDF slice of FixTools (`/home/pooniya/Documents/p_project/ImagePdf-master/imagepdf-project`).
> Scope is LOCKED: port 26 LIVE PDF tools; register 12 as `soon`. Do not re-debate scope.
> pdfNest converges to mahiNest conventions: registry single-source, env no-op golden rule, per-item DoD gate, `.claude` scaffold pack. This is a PORT spec — copy working FixTools code, rewire to PDF-only, do not redesign.

---

## §1 Mission & Audience
A 100% client-side, privacy-first hub of PDF tools. Every operation runs in the browser; nothing is uploaded. Free, no accounts, no watermark. Audience: students, professionals, developers who need quick private PDF edits. Tagline: "Your PDFs never leave your device."

## §2 Stack (frozen — reuse FixTools' exact PDF libs)
| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.x |
| Runtime | React + React DOM | 19.2.x |
| Language | TypeScript strict | 5.x |
| Styling | Tailwind CSS | v4 |
| UI | shadcn/ui + @base-ui/react | latest |
| Icons | Lucide React | latest |
| State | Zustand (per mahiNest) + local useState/useReducer per tool | latest |
| **PDF manipulation** | **pdf-lib + @pdf-lib/fontkit** | 1.17.x |
| **PDF rendering** | **pdfjs-dist (PDF.js)** | 5.6.x |
| **PDF generation** | **jsPDF, html2pdf.js** | jsPDF 4.x / html2pdf 0.14.x |
| **Word export** | **docx** | 9.6.x |
| Markdown | marked + DOMPurify | 18.x / 3.x |
| ZIP | JSZip | 3.x |
| File saving | file-saver | latest |
| Animations | framer-motion | 12.x |
| Toasts | sonner | latest |
| Search | fuse.js | 7.x |
| Theme | next-themes | latest |
| PWA/SW | @serwist/next + serwist | 9.x |
| Tooling | ESLint + Prettier, Vitest, Husky/lint-staged | — |
| PM / Host | npm / Vercel | — |

Library API verified current (docx 9.x: `Document`/`Packer.toBlob`/`Paragraph`/`TextRun`/`PageBreak` — matches FixTools usage, no deviation). `pdfjs-dist` worker: `postinstall` copies `pdf.worker.min.mjs` to `public/`; set `GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`. Heavy libs (pdfjs-dist, html2pdf.js) are dynamic-imported only on their tool route — never top-level in shared code.

## §2b ENV no-op
Empty `.env` must build, lint, test, and run with every tool fully functional. All integrations (analytics, ads, Formspree, Sentry, Supabase, server-tier) are independently env-gated and OFF by default — absent key = feature silently no-ops, zero console errors. No upload paths exist anywhere.

## §3 Identity
- Default theme: **light** (FixTools was dark-default; pdfNest aligns to mahiNest light-primary; dark toggle via next-themes).
- Accent: red/crimson PDF brand `#ef4444` / `#dc2626`. Success green, warn orange, error red retained.
- Glassmorphism: subtle light touch on hero/cards.
- Typography: Inter (body/headings) + JetBrains Mono (code), via `next/font/google`, `display: swap`, latin subset.

## §4 Design System
- Max content width `max-w-5xl`; tool content `max-w-3xl`; section gap `space-y-8`; card padding `p-6`; `rounded-xl` cards / `rounded-lg` buttons.
- Every tool page structure: header (icon+title+desc) → privacy badge → dropzone/input controls → settings panel → progress indicator → output/download → HowToUse + FAQ + related tools.
- Tailwind tokens in CSS; `cn()` for conditional classes; mobile-first responsive; `dark:` variants.

## §5 Routing & Pages
- Tool route: `/tools/[slug]` (one page each). Static via `generateStaticParams` from registry.
- Top-level: `/`, `/about`, `/privacy`, `/favorites`, `/history`, `/~offline`. (Drop FixTools blog/exam/id-doc/profile/presets/share — not in PDF scope; can add later.)
- SEO-first: per-page unique title/description, one `<h1>`, JSON-LD WebApplication + BreadcrumbList + FAQPage, canonical (no trailing slash, HTTPS), auto sitemap from registry, per-page OG.

## §6 Component Architecture
- Server Components by default; `"use client"` only for interactive tool controls. Lazy-load tool client components with `next/dynamic`.
- Tool UI in `src/components/tools/pdf/{slug}-controls.tsx`; logic in `src/hooks/use-{slug}.ts` (where a hook exists) or inline in the controls component (FixTools pattern — several PDF tools keep logic inline in controls).
- Named exports only (default only for page/layout). Props `{Component}Props`. Handlers `handleX`. No barrel exports. `@/` absolute imports.

## §7 State / Storage
- Per-tool `useState`/`useReducer`; Zustand for cross-cutting app state (theme, prefs, favorites, history).
- localStorage namespaced `pdfnest:*` (favorites, history, prefs). IndexedDB optional for recent-outputs (24h TTL). File contents stay in-memory only.

## §8 Registry (PDF-only Item type)
Single source of truth `src/lib/constants/tools.ts`. PDF-only — drop the `"image" | "utility"` union members.

```ts
export type ToolCategory =
  | "manipulate" | "security" | "forms-metadata" | "pdf-to-other" | "other-to-pdf";
export interface Tool {
  id: string; name: string; slug: string;
  description: string; longDescription: string;
  category: ToolCategory;
  icon: string;              // Lucide name
  features: string[];
  maxFileSize: number;       // bytes from FILE_LIMITS
  acceptedTypes: string[];   // MIME
  isNew?: boolean;
  comingSoon?: boolean;      // drives `soon` cards (disabled)
}
```
Pull `maxFileSize`/`acceptedTypes` from `src/lib/constants/file-limits.ts` (`pdf` = 50MB, `pdfMax` = 1000MB) — never hardcode. Registry feeds routing, home grid, sitemap, search, SEO, favorites. Categories map to config: manipulate, security, forms-metadata, pdf-to-other, other-to-pdf.

## §9 Engine Map (3 distinct paths + adjuncts)
| Engine | Library | Tools |
|---|---|---|
| **A. manipulate/forms/security** | **pdf-lib** (+@pdf-lib/fontkit for custom fonts/signature text) | merge, split, compress, rotate, reorder, add-blank-pages, duplicate-pages, flatten, page-numbers, watermark, unlock, sign, form-filler, metadata-editor, metadata-viewer |
| **B. PDF → render/extract** | **pdfjs-dist** (render to canvas → JPG/PNG; getTextContent → text/word; image extraction) | pdf-to-jpg, pdf-to-png, pdf-to-text, pdf-to-word (pdfjs extract → docx build), pdf-extract-images (pdfjs + JSZip), pdf-redact (pdfjs render → jsPDF rasterize) |
| **C. other → PDF** | **jsPDF / html2pdf.js** | image-to-pdf (jsPDF), text-to-pdf (jsPDF), markdown-to-pdf (marked+DOMPurify→html2pdf), html-to-pdf (html2pdf.js) |
| adjunct | docx | pdf-to-word output |
| adjunct | JSZip + file-saver | multi-file/ZIP outputs (split, extract-images, to-jpg/png) |

**Porting caveat — `pdf-password-protect`:** In FixTools this is a STUB (`pdf-password-controls.tsx` shows a "coming soon / pdf-lib has no encryption" notice — pdf-lib cannot AES/RC4 encrypt). Port it AS-IS as a live route that honestly states client-side encryption isn't available yet (matches source behavior). Do NOT invent encryption. `pdf-unlock` IS functional (loads with `ignoreEncryption`/known password via pdfjs+pdf-lib and re-saves decrypted). Note in §10.

## §10 Per-Item Port Map (the 26 LIVE)
Each line = FixTools source files to copy → pdfNest. Pattern: copy controls (+ hook if present) + page; rewire imports to PDF-only registry/types; keep shared shells. Source root = `imagepdf-project/src`.

**manipulate**
1. `pdf-merge` — hook `hooks/use-pdf-merge.ts` + `components/tools/pdf/merge-controls.tsx` + page `app/tools/pdf-merge/page.tsx`. (REFERENCE: pdf-lib path)
2. `pdf-split` — `hooks/use-pdf-split.ts` + `split-controls.tsx` + page. JSZip multi-page output.
3. `pdf-compress` — `hooks/use-pdf-compress.ts` + `compress-controls.tsx` + page.
4. `pdf-rotate` — `hooks/use-pdf-rotate.ts` + `rotate-controls.tsx` + page.
5. `pdf-reorder` — `hooks/use-pdf-reorder.ts` + `reorder-controls.tsx` + page. Uses `PdfPageThumbnails`.
6. `pdf-add-blank-pages` — `pdf-add-blank-controls.tsx` (logic inline) + page.
7. `pdf-duplicate-pages` — `pdf-duplicate-controls.tsx` (inline) + page.
8. `pdf-flatten` — `pdf-flatten-controls.tsx` (inline pdf-lib) + page.
9. `pdf-page-numbers` — `hooks/use-pdf-page-numbers.ts` + `pdf-page-numbers-controls.tsx` + page.
10. `pdf-watermark` — `hooks/use-pdf-watermark.ts` + `watermark-controls.tsx` + page.
11. `pdf-redact` — `pdf-redact-controls.tsx` (inline pdfjs render + jsPDF rasterize) + page. NOTE: engine B (render) not A.

**security**
12. `pdf-password-protect` — `pdf-password-controls.tsx` + page. PORT AS STUB (see §9 caveat); honest "not yet" notice.
13. `pdf-unlock` — `pdf-unlock-controls.tsx` (inline pdfjs+pdf-lib) + page. Functional.
14. `pdf-sign` — `pdf-sign-controls.tsx` (inline pdf-lib, draw/type signature canvas, place on page) + page.

**forms-metadata**
15. `pdf-form-filler` — `hooks/use-pdf-form-filler.ts` + `pdf-form-filler-controls.tsx` + page. AcroForm via pdf-lib.
16. `pdf-metadata-editor` — `pdf-metadata-editor-controls.tsx` (inline pdf-lib setTitle/etc.) + page.
17. `pdf-metadata-viewer` — `pdf-metadata-viewer-controls.tsx` (inline) + page.

**pdf-to-other**
18. `pdf-to-jpg` — `pdf-to-jpg-controls.tsx` (inline pdfjs render→canvas→JPEG, DPI/quality) + page. (REFERENCE: pdfjs render path)
19. `pdf-to-png` — `pdf-to-png-controls.tsx` (inline, lossless PNG) + page.
20. `pdf-to-text` — `pdf-to-text-controls.tsx` (inline pdfjs getTextContent) + page.
21. `pdf-to-word` — hook `hooks/use-pdf-to-word.ts` (pdfjs extract → docx build) + `pdf-to-word-controls.tsx` + page.
22. `pdf-extract-images` — `pdf-extract-images-controls.tsx` (inline pdfjs + JSZip) + page.

**other-to-pdf**
23. `image-to-pdf` — hook `hooks/use-image-to-pdf.ts` (jsPDF) + control (FixTools tags it image; recreate a `pdf/image-to-pdf-controls.tsx` using the hook; reuse FixTools' image-to-pdf control as base) + page `app/tools/image-to-pdf/page.tsx`. (REFERENCE: jsPDF other→pdf path). Accepts image MIME; rewire to PDF-hub registry.
24. `html-to-pdf` — `html-to-pdf-controls.tsx` (dynamic html2pdf.js) + page.
25. `markdown-to-pdf` — hook `hooks/use-markdown-to-pdf.ts` (marked+DOMPurify→html2pdf) + `markdown-to-pdf-controls.tsx` + page.
26. `text-to-pdf` — `text-to-pdf-controls.tsx` (inline jsPDF) + page.

Rewire applied to ALL: imports point to pdfNest `@/lib/constants/tools` (new ToolCategory union), `@/lib/types`, `pdfnest:*` storage namespace, brand strings/SEO title suffix `| pdfNest`. Shared helpers `src/lib/utils/pdf-helpers.ts` (`loadPdfDocument`, `getPdfPageCount`, `renderPdfPageToCanvas`) + `file-helpers`, `download-helpers`, `image-helpers` copied as-is.

## §11 Shared Shells (copy from FixTools `components/shared` + `components/layout`)
`tool-layout.tsx` (adapt: PDF-only related tools, light-theme header, red accent), `file-dropzone.tsx`, `download-button.tsx`, `batch-processor.tsx`, `pdf-live-preview.tsx`, `pdf-page-thumbnails.tsx`, `pdf-page-zoom-modal.tsx`, `how-to-use.tsx`, `tool-faq.tsx`, `privacy-badge.tsx`, `processing-indicator.tsx`. Layout: `header.tsx`, `footer.tsx`, `bottom-nav.tsx` (Home/Favorites/History).

## §12 Processing State (discriminated union — keep FixTools `ProcessingState`)
`idle | loading | processing(progress 0-100) | complete(result) | error(message)`. UI maps per FixTools component-patterns.

## §13 Shell — ToolLayout
Adapt FixTools `<ToolLayout tool={tool}>`: icon+title+longDescription header, privacy badge ("Files processed locally — never uploaded"), children slot, 3-4 related PDF tools (from registry, same category first), JSON-LD injection. Light-theme primary, red accent ring on active.

## §14 SEO
Title: `{Tool Name} — Free Online {Action} | pdfNest`. One `<h1>` w/ primary keyword (distinct from title). Meta 150-160 chars incl. "free/online/no upload/privacy-first". JSON-LD WebApplication (price 0) + BreadcrumbList + FAQPage. Canonical every page. `src/app/sitemap.ts` reads registry. robots allows all.

## §15 PWA / Offline
Serwist SW at `src/app/sw.ts`, `<SwRegister>` + update banner, `/~offline` fallback. `postinstall` copies pdf worker — do NOT remove.

## §16 Performance
Dynamic-import heavy libs on their route only. Web Workers for >100ms ops where viable. `next/font` swap+latin. Bundle check before ship.

## §17 Security
Strict CSP in `next.config.ts`; `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. DOMPurify on every rendered HTML string (markdown, watermark text). No server, no API routes, no upload paths.

## §18 Folder Structure (canonical)
```
src/
  app/{layout,page,globals.css,sitemap.ts,robots.ts,sw.ts,not-found}.tsx
  app/tools/{layout,page}.tsx + 26 tool folders
  app/{about,privacy,favorites,history,~offline}/
  components/{ui,layout,home,shared}/ + components/tools/pdf/
  hooks/use-pdf-*.ts (+ use-image-to-pdf, use-markdown-to-pdf, use-pdf-to-word)
  lib/{constants{tools,file-limits,seo},utils{pdf-helpers,file-helpers,download-helpers,image-helpers,cn},types}/
  config/site.ts
.claude/mahiNest/ (spec, manifest, requirements, journal, learnings-project)
```

## §19 Build Order
1. Scaffold (Phase 1): Next16+TS+Tailwind v4+shadcn+Serwist+ESLint/Prettier+Vitest+Husky; site config; registry types; FILE_LIMITS; empty `.env` green.
2. Shared shells + layout + ToolLayout + dropzone + pdf-helpers.
3. **Reference items first** (one per engine path): `pdf-merge` (A), `pdf-to-jpg` (B), `image-to-pdf` (C). Prove patterns.
4. Remaining 23 tools by category. Each gated by per-item DoD.
5. Home grid + search + sitemap + SEO + PWA.
6. Register the 12 `soon` (comingSoon: true) — disabled cards, no routes required.

## §20 Definition of Done (only gate)
`npm run build` + `lint` + `test` green; empty `.env` runs with zero console errors; each of the 26 tools works E2E (upload→process→download) client-side. No upload network calls. Per-item gate before moving on. Outward actions (deploy) need user confirmation.

## §21 SOON (12 — register as comingSoon, no build this pass)
manipulate: `pdf-delete-pages`, `pdf-extract-pages`, `pdf-organize`, `pdf-crop`, `pdf-n-up`, `pdf-booklet`, `pdf-grayscale`, `pdf-header-footer`, `pdf-bates-numbering`, `pdf-repair`. pdf-to-other: `pdf-compare`, `pdf-to-csv`. All pdf-lib (manipulate) or pdfjs (compare/csv) when built next pass.
