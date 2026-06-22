# pdfNest

**26 free, browser-based PDF tools. No uploads. No accounts. Complete privacy.**

pdfNest is a production-ready Next.js PWA that runs every PDF operation entirely in the browser
using pdf-lib, PDF.js, jsPDF, and html2pdf.js. Your files never leave your device.

---

## Tools (26 live, 12 coming soon)

### Manipulate

| Tool                | Status      |
| ------------------- | ----------- |
| PDF Merge           | live        |
| PDF Split           | live        |
| PDF Compress        | live        |
| PDF Rotate          | live        |
| PDF Reorder         | live        |
| PDF Add Blank Pages | live        |
| PDF Duplicate Pages | live        |
| PDF Flatten         | live        |
| PDF Page Numbers    | live        |
| PDF Watermark       | live        |
| PDF Redact          | live        |
| PDF Delete Pages    | coming soon |
| PDF Extract Pages   | coming soon |
| PDF Organize        | coming soon |
| PDF Crop            | coming soon |
| PDF N-up            | coming soon |
| PDF Booklet         | coming soon |
| PDF Grayscale       | coming soon |
| PDF Header & Footer | coming soon |
| PDF Bates Numbering | coming soon |
| PDF Repair          | coming soon |

### Security

| Tool                 | Status                                         |
| -------------------- | ---------------------------------------------- |
| PDF Password Protect | live (honest stub — pdf-lib has no encryption) |
| PDF Unlock           | live                                           |
| PDF Sign             | live                                           |

### Forms & Metadata

| Tool                | Status |
| ------------------- | ------ |
| PDF Form Filler     | live   |
| PDF Metadata Editor | live   |
| PDF Metadata Viewer | live   |

### PDF to Other

| Tool               | Status      |
| ------------------ | ----------- |
| PDF to JPG         | live        |
| PDF to PNG         | live        |
| PDF to Text        | live        |
| PDF to Word        | live        |
| PDF Extract Images | live        |
| PDF Compare        | coming soon |
| PDF to CSV/Excel   | coming soon |

### Other to PDF

| Tool            | Status |
| --------------- | ------ |
| Image to PDF    | live   |
| HTML to PDF     | live   |
| Markdown to PDF | live   |
| Text to PDF     | live   |

---

## Privacy promise

Every tool runs 100% client-side. No file is uploaded to any server — not even for a
millisecond. There is no backend. Processing happens inside the browser using JavaScript
libraries compiled to WASM or pure JS. Close the tab and the file is gone.

The `/privacy` and `/terms` pages are template documents. **The site owner must review and
customise both before publishing — they are not legal advice and must reflect the actual
jurisdiction, operator name, and contact details.**

---

## Local development

```bash
npm install
npm run dev          # Turbopack dev server on http://localhost:3000
npm run build        # Production build (--webpack flag required for Serwist)
npm run start        # Serve the production build
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run test:watch   # Vitest in watch mode
```

The `postinstall` script copies `pdfjs-dist/build/pdf.worker.min.mjs` into `public/` automatically.
If you delete `public/pdf.worker.min.mjs` the PDF.js tools (PDF to JPG/PNG/Text/Word, Redact,
Sign, Extract Images) will fail. Re-run `npm install` to restore it.

---

## Env vars

The app runs perfectly with an **empty `.env`** — every integration is independently env-gated
and silently disables when its key is absent. This is a hard requirement: running with no env
vars must produce zero console errors.

Copy `.env.example` to `.env.local` and fill in only the values you want to enable.

```env
# Analytics (all optional — app fully works without these)

# Google Analytics 4 (enables GA4 tag via @next/third-parties)
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Google Tag Manager (enables GTM container via @next/third-parties)
NEXT_PUBLIC_GTM_ID=

# Google AdSense — both must be set to enable ad slots
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_ENABLED=

# Formspree endpoint ID — enables the contact form submission
# When absent, the contact page shows a mailto: fallback link
NEXT_PUBLIC_FORMSPREE_ID=

# Production domain — used for canonical URLs, sitemap base, OG images
# When absent, Next.js falls back to relative URLs (fine for localhost)
NEXT_PUBLIC_SITE_URL=https://pdfnest.app

# Google Search Console ownership verification meta tag
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=

# Sentry DSN — enables client-side error monitoring
# No-op / no bundle impact when absent
NEXT_PUBLIC_SENTRY_DSN=
```

**No-op rule:** setting a var to an empty string is the same as not setting it. The app must not
crash, log errors, or behave differently with an empty string vs a missing key.

---

## Special configuration notes

### Build command: `--webpack`

The `npm run build` script uses `next build --webpack` (not the default Turbopack build).
This is required because `@serwist/next` (the PWA plugin) uses webpack hooks that are not
yet supported by Turbopack. Turbopack is used in dev (`npm run dev`) but not in the production
build. **Do not remove the `--webpack` flag** — doing so breaks the service worker generation
and the app will not be installable as a PWA.

### Serwist service worker

- Service worker source: `src/app/sw.ts`
- Built output: `public/sw.js` (generated by Serwist on every production build)
- `pdf.worker.min.mjs` is explicitly excluded from the Serwist precache list because it is 1.2 MB.
  It is runtime-cached (CacheFirst) on first use instead.
- The service worker is disabled in `development` (`NODE_ENV === "development"`) to avoid
  caching issues during local iteration. `SERWIST_SUPPRESS_TURBOPACK_WARNING=1` suppresses
  the expected dev-mode warning.

### Security headers (next.config.ts)

The following headers are applied to every route:

| Header                    | Value                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `X-Frame-Options`         | `DENY`                                                                                                                       |
| `X-Content-Type-Options`  | `nosniff`                                                                                                                    |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`                                                                                            |
| `Permissions-Policy`      | camera=(self), microphone=(), geolocation=()                                                                                 |
| `Content-Security-Policy` | Collapses to `'self'`-only when env vars are absent; expands to include Google domains when GA4/GTM/AdSense env vars are set |

No COOP/COEP headers are required because pdfNest does not use SharedArrayBuffer or
cross-origin isolation (pdf.worker.min.mjs is served from the same origin).

### PDF.js worker

`pdf.worker.min.mjs` (1.2 MB) is served from `/public/` (same origin). The `postinstall`
script keeps it in sync with the installed `pdfjs-dist` version. If you upgrade `pdfjs-dist`,
run `npm install` again to refresh the worker file.

---

## Vercel deployment

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mahendra2811/pdfNest)

### Manual steps

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `next build --webpack` (Vercel will use the `package.json` `build` script automatically — no override needed).
4. Output directory: `.next` (default).
5. Install command: `npm install` (default; runs `postinstall` which copies the PDF.js worker).
6. Add environment variables in the Vercel dashboard (Settings > Environment Variables).
   All are optional — the app deploys and runs with zero env vars set.
7. Deploy.

### Environment variables to set in the Vercel dashboard

| Variable                               | Purpose                                         | Required?   |
| -------------------------------------- | ----------------------------------------------- | ----------- |
| `NEXT_PUBLIC_SITE_URL`                 | Canonical base URL (e.g. `https://pdfnest.app`) | Recommended |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`        | Google Analytics 4                              | Optional    |
| `NEXT_PUBLIC_GTM_ID`                   | Google Tag Manager                              | Optional    |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`        | AdSense publisher ID                            | Optional    |
| `NEXT_PUBLIC_ADSENSE_ENABLED`          | Set `true` to activate ad slots                 | Optional    |
| `NEXT_PUBLIC_FORMSPREE_ID`             | Contact form endpoint                           | Optional    |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | GSC ownership meta                              | Optional    |
| `NEXT_PUBLIC_SENTRY_DSN`               | Sentry error monitoring DSN                     | Optional    |

### `vercel.json`

A `vercel.json` is included in the project root. It sets the build command and a
`cleanUrls: true` preference. All security headers are set via `next.config.ts` headers
(not `vercel.json`) so they apply identically in both local dev and production.

---

## Android / PWA install

pdfNest is a fully installable PWA (Workbox/Serwist, Web App Manifest). Users can install it
from the browser address bar on Android and desktop Chrome without any app wrapper.

A TWA (Trusted Web Activity) Android wrapper can be added later following the same pattern
as FixTools. The PWA manifest, icons (192 and 512 maskable), and theme colour are already
in place.

---

## Stack

Next.js 16 (App Router, Turbopack dev / webpack prod) · React 19 · TypeScript strict ·
Tailwind v4 · shadcn/ui · Framer Motion · Zustand · Serwist PWA · Vitest + Testing Library ·
ESLint + Prettier · Husky + lint-staged · Vercel

PDF engines: pdf-lib 1.17 · pdfjs-dist 5.6 · jsPDF 4 · html2pdf.js 0.14 · docx 9.6 · marked

---

## Licence

Private — all rights reserved. See `/terms` for usage terms.
