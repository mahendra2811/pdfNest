# pdfNest — Agent Instructions

> IMPORTANT: This version of Next.js has breaking changes. Read `node_modules/next/dist/docs/`
> before applying any App Router / metadata / caching patterns. Your training data may differ
> from the installed version.

## Project quick reference

- **Stack:** Next.js 16 (App Router, Turbopack) + React 19 + TS strict + Tailwind v4 + shadcn/ui
- **Build:** `npm run build` (uses `--webpack` flag required for Serwist)
- **Dev:** `npm run dev` (Turbopack + `SERWIST_SUPPRESS_TURBOPACK_WARNING=1`)
- **Lint:** `npm run lint`
- **Test:** `npm test`
- **Registry:** `src/lib/constants/tools.ts` — single source of truth for all 38 tools

## PDF libraries — dynamic-import only

Heavy libs must NEVER be top-level imported in shared code:
- `pdfjs-dist` → dynamic import in tool controls; worker at `/pdf.worker.min.mjs`
- `html2pdf.js` → dynamic import in html-to-pdf and markdown-to-pdf controls only
- `jsPDF` → dynamic import in image-to-pdf and text-to-pdf controls only

## Env no-op rule

Empty `.env` MUST work perfectly — build, lint, test, run, zero console errors.
All integrations are independently env-gated; absent key = silently disabled.

## Adding a tool (Phase 2/3)

1. Tool is already in `src/lib/constants/tools.ts` (all 38 registered in Phase 1)
2. Create `src/components/tools/pdf/{slug}-controls.tsx` (client component, `"use client"`)
3. Create `src/hooks/use-{slug}.ts` if processing logic is complex
4. Create `src/app/tools/{slug}/page.tsx` with `generateStaticParams` (or extend dynamic route)
5. Replace `<ComingSoonShell />` with the real controls component
6. Gate: `npm run build` passes; tool works E2E; empty `.env` works

## Namespace

localStorage keys: `pdfnest:*` (e.g. `pdfnest:favourites:v1`)
