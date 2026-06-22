# pdfNest — Project Learnings

## Phase 2: Reference Item Port Gotchas

### 1. ProcessingIndicator API differs from FixTools

- **FixTools** `<ProcessingIndicator state={state} />` — takes the entire state object
- **pdfNest** `<ProcessingIndicator progress={number} label={string} />` — takes progress directly
- **Fix:** check target project's component signature before copying controls; never assume the API matches source

### 2. `ssr: false` with `next/dynamic` cannot be used in Server Components (Next.js 16)

- Error: "`ssr: false` is not allowed with `next/dynamic` in Server Components"
- **Fix:** Either use a client wrapper component for `dynamic(ssr: false)`, OR simply import the `"use client"` controls component directly — Next.js handles the server/client boundary automatically via the `"use client"` directive
- **Applied pattern:** direct import in Server Component page.tsx — tool controls are already `"use client"` so the boundary is correct

### 3. pdfjs-dist worker src: local file, not CDN

- FixTools source used CDN: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`
- pdfNest uses: `/pdf.worker.min.mjs` (copied by `postinstall` to `public/`)
- **Fix:** Always use `/pdf.worker.min.mjs` in pdfNest; the postinstall script copies `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/` — confirmed present (1.2MB)
- **Worker setup:** `pdf-helpers.ts` has a singleton that sets `GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"` on first use; use `loadPdfDocument()` from `pdf-helpers.ts` for all pdfjs usage (don't re-import pdfjsLib directly)

### 4. Slider component missing from pdfNest Phase 1

- Installed via `npx shadcn@latest add slider`
- pdfNest uses `@base-ui/react/slider` (not Radix UI); `onValueChange` has type `(value: number | readonly number[], eventDetails) => void`
- **Fix:** Type slider `onValueChange` as `(v: number | readonly number[]) => ...` and cast array: `(v as number[])[0]`

### 5. `image-helpers.ts` not created in Phase 1

- `use-image-to-pdf.ts` requires `loadImageFromFile` from `@/lib/utils/image-helpers`
- Phase 1 did not create this helper; must be created in Phase 2 before porting image-to-pdf
- **Fix:** Create `src/lib/utils/image-helpers.ts` — port directly from FixTools; only `loadImageFromFile` + `canvasToBlob` needed for PDF tools

### 6. `PdfLivePreview` not in pdfNest

- FixTools `pdf-to-jpg-controls.tsx` imports `PdfLivePreview` for a live PDF thumbnail preview
- pdfNest does not have this component; it is optional
- **Fix:** Drop it. The controls work without it; adding it is Phase 3+ work

### 7. `<img>` with blob URLs: cannot use `next/image`

- Thumbnail previews (merge drag list) and PDF→JPG output use blob URLs
- `next/image` requires a domain whitelist and does not accept `blob:` scheme URLs
- **Fix:** Use plain `<img>` tag for blob URL images; ESLint `@next/next/no-img-element` warning is expected and acceptable here

### 8. Concurrent merge test: mock call count

- When mocking `readFileAsArrayBuffer` for the "skips bad files" test: the merge function calls it once per file (not twice); first file resolves, second rejects
- **Fix:** `.mockResolvedValueOnce(...).mockRejectedValueOnce(...)` — 2 mock values for 2 files

### 9. Phase 3 must follow for remaining 23 tools

- Pattern A (pdf-lib): hook + controls + page — reference: `pdf-merge`
- Pattern B (pdfjs-dist): controls only (inline), dynamic import, worker from /pdf.worker.min.mjs — reference: `pdf-to-jpg`
- Pattern C (jsPDF/html2pdf.js): hook + controls + page, jsPDF dynamic import — reference: `image-to-pdf`
- All tools: direct import in Server Component page (no `dynamic(ssr:false)`)
- All tools: `ProcessingIndicator progress={number}` not `state={state}`
- All tools: Slider uses `@base-ui/react` API with `(v: number | readonly number[])` callback type

## Phase 3: Port Gotchas (tools 4–26)

### 10. `react-hooks/set-state-in-effect` from `eslint-config-next` blocks synchronous setState in useEffect

- ANY `setState()` call that appears synchronously in a `useEffect` body (even the very first `setLoading(true)`) triggers this ESLint error
- **Fix:** Wrap ALL setState calls inside an async `run()` function declared inside the effect:
  ```tsx
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const run = async (): Promise<void> => {
      if (cancelled) return;
      setLoading(true);          // OK — inside async function, not directly in effect body
      try { ... } catch { ... }
    };
    void run();
    return () => { cancelled = true; };
  }, [file]);
  ```
- Applies to: pdf-redact, pdf-sign, pdf-to-png, pdf-extract-images, and any future tool that renders pdfjs pages on file select

### 11. `DownloadButton` API: no `processedSize` prop

- FixTools `<DownloadButton processedSize={...} />` — has `processedSize`
- pdfNest `DownloadButton` API: `{ blob, fileName, originalSize?, label?, className? }` — no `processedSize`
- **Fix:** Remove `processedSize` prop; the button derives output size from `blob.size` internally

### 12. Missing shared components from FixTools (do not attempt to import)

- `PdfLivePreview`, `PdfThumbnailStrip`, `PdfThumbnailDragGrid`, `PdfThumbnailSelectGrid`, `PdfPageZoomModal`, `BeforeAfterSize`
- **Fix:** Replace with inline alternatives: page-number button grids, drag cards, simple size display rows
- `usePdfThumbnails` hook also absent; use direct pdfjs canvas render inside the component

### 13. DOMPurify crashes during SSR (Next.js prerender)

- `import DOMPurify from "dompurify"` at the top of a `"use client"` file is evaluated server-side during prerendering
- `DOMPurify.sanitize` throws `TypeError: k.A.sanitize is not a function` on the server
- **Fix:** Never top-level import DOMPurify; use a runtime guard:
  ```ts
  function sanitize(html: string): string {
    if (typeof window === "undefined") return "";
    const DOMPurify = (require("dompurify") as typeof import("dompurify")).default;
    return DOMPurify.sanitize(html);
  }
  ```
- Applies to: html-to-pdf, markdown-to-pdf, and any tool rendering user HTML in a preview

### 14. `ProcessingState` type is not exported from pdfNest lib

- FixTools imports `import type { ProcessingState } from "@/lib/types/processing"`
- pdfNest `src/lib/types/` only has `tools.ts` — no `processing.ts`
- **Fix:** Define a local inline `ProcessingState` interface at the top of each hook that needs it

### 15. Slider from FixTools (`@/components/ui/slider`) uses different API in pdfNest

- FixTools `<Slider value={[n]} onValueChange={(v) => setN(v[0])} />`
- pdfNest has `@base-ui/react` Slider with different callback signature
- **Fix:** Use native `<input type="range" className="accent-primary">` for all range inputs — avoids API mismatch entirely and is simpler

## Phase 5: QA findings

### 16. DOMPurify `require(...).default` is undefined in v3.4.11 — use top-level ESM import

- The Phase 3 fix (gotcha #13) used `require("dompurify").default` inside a `typeof window` guard. In DOMPurify 3.4.11 this `.default` is `undefined`, so `undefined.sanitize()` throws at runtime in the browser bundle: `TypeError: Cannot read properties of undefined (reading 'sanitize')`.
- html-to-pdf threw on mount (preview rendered from DEFAULT_HTML); markdown-to-pdf had the same bug behind its preview toggle.
- **Fix applied:** `import DOMPurify from "dompurify"` (top-level ESM) + keep `if (typeof window === "undefined") return ""` inside `sanitize()`. ESM default is a ready instance; server stub is harmless so prerender stays green. Files: html-to-pdf-controls.tsx, markdown-to-pdf-controls.tsx.

### 17. ProcessingIndicator needed progressbar ARIA

- Added `role="progressbar"` + `aria-valuemin/valuemax/valuenow` + `aria-label` to the wrapper.

### 18. Non-blocking items for a future pass

- pdf-redact `renderPdfPages` caps at 20 pages (`Math.min(20, numPages)`) — pages 21+ silently dropped from output. Add a user notice or remove cap.
- `download-helpers.ts` top-level-imports JSZip (~95KB) and is imported by 23 components — convert the zip helper to a dynamic `import("jszip")` to slim shared bundles.
