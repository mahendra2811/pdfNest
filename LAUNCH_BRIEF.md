# pdfNest — Launch Brief

## What it is

pdfNest is a free, browser-based PDF toolkit — 26 tools (12 more coming) that run entirely
inside the browser. Merge, split, compress, rotate, sign, redact, fill forms, convert to
images or Word, create PDFs from HTML or Markdown — all without installing anything or
uploading a single file to a server.

## Who it is for

Anyone who regularly works with PDF files and does not want to:

- Upload sensitive documents to cloud services
- Pay a monthly subscription for basic operations
- Install desktop software for occasional tasks

Designers, lawyers, accountants, students, freelancers, and teams handling contracts,
invoices, or reports are the primary users.

## The privacy hook

Every tool runs 100% client-side. The PDF is processed by JavaScript in your own browser tab.
No file leaves your device — not even temporarily. There is no backend, no cloud storage,
no file retention policy to worry about. Close the tab and the data is gone.

This is the core differentiator versus iLovePDF, Smallpdf, and Adobe Acrobat Online, which
all route files through their servers.

## Tool highlights

- **PDF Merge** — combine multiple PDFs in drag-to-reorder sequence
- **PDF Sign** — draw, type, or upload a signature and embed it on any page
- **PDF Redact** — permanently burn redaction blocks into page bitmaps (not a recoverable overlay)
- **PDF to Word** — extract text and layout from a PDF into an editable .docx
- **PDF Form Filler** — detect and fill interactive PDF form fields client-side
- **HTML to PDF / Markdown to PDF** — render and export structured documents instantly
- **Image to PDF** — batch-convert images to a single PDF with one click

## PWA

pdfNest is installable as a Progressive Web App on Android and desktop Chrome.
A native Android wrapper (TWA) can be added when ready for the Play Store.

## Links

- Live URL: (set `NEXT_PUBLIC_SITE_URL` in Vercel before publishing)
- GitHub: https://github.com/mahendra2811/pdfNest
- Privacy policy: `/privacy` — review and customise before publishing
- Terms of service: `/terms` — review and customise before publishing

## What to do before going live

1. Set `NEXT_PUBLIC_SITE_URL` in the Vercel environment variables dashboard.
2. Review and edit `/src/app/privacy/page.tsx` and `/src/app/terms/page.tsx` —
   they are placeholder templates, not legal documents.
3. Replace the placeholder contact email in `/src/app/contact/page.tsx` and
   `/src/app/about/page.tsx` with a real address.
4. Optionally: add `NEXT_PUBLIC_GA_MEASUREMENT_ID` for analytics,
   `NEXT_PUBLIC_FORMSPREE_ID` for the contact form, and
   `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + `NEXT_PUBLIC_ADSENSE_ENABLED=true` for ads.
5. Trigger a Vercel production deploy (or confirm below to have it run now).
