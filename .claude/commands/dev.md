# /dev — Start development server

Starts the pdfNest dev server with Turbopack.

## Command

```bash
SERWIST_SUPPRESS_TURBOPACK_WARNING=1 npm run dev
```

Or via the npm script (already includes the env var):
```bash
npm run dev
```

## Notes

- Dev server uses Turbopack (fast refresh)
- Serwist SW is disabled in development (`disable: process.env.NODE_ENV === "development"`)
- Production build uses `next build --webpack` (required for Serwist)
- PDF worker is at `/pdf.worker.min.mjs` (copied by postinstall)
