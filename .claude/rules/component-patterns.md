# Component Patterns — pdfNest

## Tool page pattern

Every `/tools/{slug}/page.tsx` must:
1. Be a Server Component importing a client controls component
2. Have `generateStaticParams` referencing `LIVE_TOOLS`
3. Have `generateMetadata` with unique title/description per tool
4. Use `<ToolLayout tool={tool}>` wrapper
5. Inject `ComingSoonShell` until real controls exist (Phase 2 replaces it)

```tsx
// page.tsx
import { ToolLayout } from "@/components/layout/tool-layout";
import { PdfMergeControls } from "@/components/tools/pdf/merge-controls";
import { LIVE_TOOLS, TOOL_MAP } from "@/lib/constants/tools";

export async function generateStaticParams() {
  return LIVE_TOOLS.map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug)!;
  return (
    <ToolLayout tool={tool}>
      <PdfMergeControls />
    </ToolLayout>
  );
}
```

## Processing state machine

```typescript
type ProcessingState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "processing"; progress: number } // 0-100
  | { status: "complete"; result: ProcessingResult }
  | { status: "error"; message: string };
```

UI: idle → dropzone | loading → file info | processing → ProgressRing | complete → download | error → ErrorMessage + retry

## FileDropzone usage

```tsx
<FileDropzone
  accept={FILE_LIMITS.pdf.acceptString}
  acceptedTypes={FILE_LIMITS.pdf.acceptedTypes}
  maxSize={FILE_LIMITS.pdf.maxSize}
  maxSizeLabel={FILE_LIMITS.pdf.maxSizeLabel}
  onFilesSelected={handleFilesSelected}
/>
```

## DownloadButton usage

```tsx
<DownloadButton
  blob={result.blob}
  fileName={result.fileName}
  originalSize={result.originalSize}
/>
```

## Glassmorphism cards

Use `.glass` CSS class for hero/card glassmorphism. Avoid inline backdrop-filter.

## shadcn primitives

Available: Button, Badge, Card, Input, Label, Select, Separator, Tabs, Tooltip, Switch, Skeleton, Dialog, DropdownMenu, Sonner (toast).
Install others with: `npx shadcn@latest add {component}`
