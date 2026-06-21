# /add-item — Add a PDF tool implementation

Implements a tool that is already registered in `src/lib/constants/tools.ts`.

## Usage

```
/add-item pdf-merge
```

## Steps

1. Confirm the tool exists in the registry (look up by slug in `TOOL_MAP`)
2. Check `src/components/tools/pdf/{slug}-controls.tsx` — create if absent
3. Check `src/hooks/use-{slug}.ts` — create if complex logic warrants a hook
4. Check `src/app/tools/{slug}/page.tsx` — create per pattern in component-patterns.md, or
   verify the dynamic `[slug]/page.tsx` already serves this tool
5. Wire the controls into the page (replace `<ComingSoonShell />`)
6. Test: `npm run build` + manual E2E verification on a test PDF

## Engine reference

- pdf-lib path: see `src/hooks/use-pdf-merge.ts` (reference implementation)
- pdfjs path: see `src/components/tools/pdf/pdf-to-jpg-controls.tsx` (reference)
- jsPDF path: see `src/hooks/use-image-to-pdf.ts` (reference)
