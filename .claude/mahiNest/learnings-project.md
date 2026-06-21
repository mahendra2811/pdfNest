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
