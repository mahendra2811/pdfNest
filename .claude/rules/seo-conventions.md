# SEO Conventions — pdfNest

## Title format

`{Tool Name} — Free Online PDF Tool | pdfNest`

Examples:
- "PDF Merge — Combine PDF Files Free Online | pdfNest"
- "PDF to JPG — Convert PDF Pages to Images Free | pdfNest"
- "Image to PDF — Create PDF from Images Free | pdfNest"

## Meta description

- 150-160 characters
- Include primary keyword + "free", "online", "no upload"
- Include privacy benefit: "browser-based", "privacy-first", "client-side"

## H1 rules

- Exactly ONE `<h1>` per page
- Must contain the primary keyword
- Must differ from `<title>` (avoid duplication)
- ToolLayout handles the `<h1>` via `tool.name` — don't add another

## JSON-LD

ToolLayout automatically injects `WebApplication` JSON-LD for every tool page.
Additional schemas (BreadcrumbList, FAQPage) can be added per-page.

## Canonical

Set via Next.js `metadata.metadataBase` + automatic canonical generation.
No trailing slashes. Always HTTPS in production.

## Sitemap

`src/app/sitemap.ts` reads from `LIVE_TOOLS`. Adding a tool to the registry
automatically includes it in the sitemap. No manual edits needed.

## Internal linking

- Home → all tools (by category grid)
- ToolLayout → 4 related tools (same category)
- Footer → top tools per category
- BottomNav → Home / Favorites / History / All Tools
